export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      artists: {
        Row: {
          id: string
          slug: string
          spotify_id: string
          name: string
          bio: string | null
          hero_image: string | null
          onboarding_completed: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          slug: string
          spotify_id: string
          name: string
          bio?: string | null
          hero_image?: string | null
          onboarding_completed?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          slug?: string
          spotify_id?: string
          name?: string
          bio?: string | null
          hero_image?: string | null
          onboarding_completed?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      artist_settings: {
        Row: {
          id: string
          artist_id: string
          instagram_url: string | null
          x_url: string | null
          tiktok_url: string | null
          youtube_url: string | null
          website_url: string | null
          newsletter_url: string | null
          newsletter_enabled: boolean
          upgrade_prompt: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          artist_id: string
          instagram_url?: string | null
          x_url?: string | null
          tiktok_url?: string | null
          youtube_url?: string | null
          website_url?: string | null
          newsletter_url?: string | null
          newsletter_enabled?: boolean
          upgrade_prompt?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          artist_id?: string
          instagram_url?: string | null
          x_url?: string | null
          tiktok_url?: string | null
          youtube_url?: string | null
          website_url?: string | null
          newsletter_url?: string | null
          newsletter_enabled?: boolean
          upgrade_prompt?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      artist_integrations: {
        Row: {
          id: string
          artist_id: string
          provider: 'spotify'
          access_token: string
          refresh_token: string | null
          expires_at: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          artist_id: string
          provider: 'spotify'
          access_token: string
          refresh_token?: string | null
          expires_at: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          artist_id?: string
          provider?: 'spotify'
          access_token?: string
          refresh_token?: string | null
          expires_at?: string
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: {
      provider: 'spotify'
    }
    CompositeTypes: Record<string, never>
  }
}
