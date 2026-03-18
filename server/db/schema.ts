import { sql } from 'drizzle-orm'
import {
  boolean,
  date,
  jsonb,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
  index,
  uniqueIndex
} from 'drizzle-orm/pg-core'

export const releaseTypeEnum = pgEnum('release_type', ['single', 'album', 'ep', 'compilation'])

export type TrackPlatform = 'spotify' | 'apple_music' | 'youtube_music' | 'tidal' | 'deezer'
export type ReleaseResolutionStatus = 'resolved' | 'pending' | 'failed' | 'unsupported'

export type ReleaseTrack = {
  spotifyId: string
  name: string
  isrc: string | null
  platformLinks: Partial<Record<TrackPlatform, string>>
  resolutionStatus: Partial<Record<TrackPlatform, ReleaseResolutionStatus>>
}

export const artists = pgTable('artists', {
  id: uuid('id').defaultRandom().primaryKey(),
  slug: varchar('slug', { length: 120 }).notNull().unique(),
  spotifyId: varchar('spotify_id', { length: 120 }).notNull().unique(),
  name: varchar('name', { length: 200 }).notNull(),
  bio: text('bio'),
  heroImage: text('hero_image'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdateFn(() => sql`now()`)
})

export const artistSettings = pgTable('artist_settings', {
  id: uuid('id').defaultRandom().primaryKey(),
  artistId: uuid('artist_id')
    .notNull()
    .unique()
    .references(() => artists.id, { onDelete: 'cascade' }),
  socialFacebook: text('social_facebook'),
  socialX: text('social_x'),
  socialInstagram: text('social_instagram'),
  socialTikTok: text('social_tiktok'),
  socialYouTube: text('social_youtube'),
  socialSoundCloud: text('social_soundcloud'),
  socialAppleMusic: text('social_apple_music'),
  socialTidal: text('social_tidal'),
  newsletterUrl: text('newsletter_url'),
  upgradePrompt: boolean('upgrade_prompt').notNull().default(true),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdateFn(() => sql`now()`)
})

export const releases = pgTable('releases', {
  id: uuid('id').defaultRandom().primaryKey(),
  artistId: uuid('artist_id')
    .notNull()
    .references(() => artists.id, { onDelete: 'cascade' }),
  spotifyId: varchar('spotify_id', { length: 120 }).notNull().unique(),
  name: varchar('name', { length: 240 }).notNull(),
  type: releaseTypeEnum('type').notNull(),
  releaseDate: date('release_date'),
  coverImage: text('cover_image'),
  tracks: jsonb('tracks').$type<ReleaseTrack[]>().notNull().default(sql`'[]'::jsonb`),
  isFeatured: boolean('is_featured').notNull().default(false),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdateFn(() => sql`now()`)
})

export const sessions = pgTable('sessions', {
  id: uuid('id').defaultRandom().primaryKey(),
  artistId: uuid('artist_id')
    .notNull()
    .references(() => artists.id, { onDelete: 'cascade' }),
  tokenHash: varchar('token_hash', { length: 64 }).notNull().unique(),
  expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow()
})

export const providerEnum = pgEnum('provider', ['spotify', 'apple_music', 'tidal', 'deezer', 'youtube_music'])

export const artistIntegrations = pgTable('artist_integrations', {
  id: uuid('id').defaultRandom().primaryKey(),
  artistId: uuid('artist_id')
    .notNull()
    .references(() => artists.id, { onDelete: 'cascade' }),
  provider: providerEnum('provider').notNull(),
  accessToken: text('access_token').notNull(),
  refreshToken: text('refresh_token'),
  expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdateFn(() => sql`now()`)
}, (table) => ({
  uniqueArtistProvider: uniqueIndex('artist_integrations_artist_provider_unique')
    .on(table.artistId, table.provider)
}))

export const schema = {
  artists,
  artistSettings,
  releases,
  sessions,
  artistIntegrations
}
