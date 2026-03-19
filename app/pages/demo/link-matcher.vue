<script setup lang="ts">
type Platform = 'spotify' | 'apple_music' | 'youtube_music' | 'tidal' | 'deezer'
type MatchStatus = 'resolved' | 'pending' | 'failed' | 'unsupported'

type MatchResponse = {
  matches: Record<
    Platform,
    {
      status: MatchStatus
      score: number | null
      reason: string
      url: string | null
      matchedCandidateId: string | null
    }
  >
}

type DemoPreset = {
  label: string
  spotifyId?: string
  isrc?: string
  name: string
  artistNames: string
  albumName?: string
  platforms: Platform[]
}

type DemoFormState = {
  spotifyId: string
  isrc: string
  name: string
  artistNames: string
  albumName: string
}

const platformOptions: Array<{ value: Platform; label: string }> = [
  { value: 'spotify', label: 'Spotify' },
  { value: 'deezer', label: 'Deezer' },
  { value: 'apple_music', label: 'Apple Music' },
  { value: 'youtube_music', label: 'YouTube Music' },
  { value: 'tidal', label: 'Tidal' }
]

const presets: DemoPreset[] = [
  {
    label: 'Dua Lipa',
    spotifyId: '1vCYL3EzMpjh4e6gy7y6xM',
    isrc: 'GBAHT1600302',
    name: 'Blow Your Mind (Mwah)',
    artistNames: 'Dua Lipa',
    albumName: 'Dua Lipa',
    platforms: ['spotify', 'deezer']
  },
  {
    label: 'Adele',
    name: 'Hello',
    artistNames: 'Adele',
    albumName: '25',
    platforms: ['deezer']
  }
]

const form = reactive<DemoFormState>({
  spotifyId: presets[0].spotifyId ?? '',
  isrc: presets[0].isrc ?? '',
  name: presets[0].name,
  artistNames: presets[0].artistNames,
  albumName: presets[0].albumName ?? ''
})

const selectedPlatforms = ref<Platform[]>([...presets[0].platforms])
const pending = ref(false)
const errorMessage = ref('')
const result = ref<MatchResponse | null>(null)
const lastPayload = ref<Record<string, unknown> | null>(null)

useSeoMeta({
  title: 'Link Matcher Demo',
  description: 'Interactive route for testing the SoundLog link matcher against live providers.'
})

function applyPreset(preset: DemoPreset) {
  form.spotifyId = preset.spotifyId ?? ''
  form.isrc = preset.isrc ?? ''
  form.name = preset.name
  form.artistNames = preset.artistNames
  form.albumName = preset.albumName ?? ''
  selectedPlatforms.value = [...preset.platforms]
  errorMessage.value = ''
}

const requestPayload = computed(() => {
  const artistNames = form.artistNames
    .split(',')
    .map((artist) => artist.trim())
    .filter(Boolean)

  return {
    track: {
      ...(form.spotifyId.trim() ? { spotifyId: form.spotifyId.trim() } : {}),
      ...(form.isrc.trim() ? { isrc: form.isrc.trim() } : {}),
      name: form.name.trim(),
      artistNames,
      ...(form.albumName.trim() ? { albumName: form.albumName.trim() } : {})
    },
    platforms: selectedPlatforms.value
  }
})

const resultCards = computed(() =>
  platformOptions.map((platform) => ({
    label: platform.label,
    value: platform.value,
    match: result.value?.matches[platform.value] ?? null
  }))
)

const formattedPayload = computed(() =>
  JSON.stringify(lastPayload.value ?? requestPayload.value, null, 2)
)

const formattedResult = computed(() => JSON.stringify(result.value, null, 2))

async function runMatch() {
  const artistNames = requestPayload.value.track.artistNames

  if (!requestPayload.value.track.name || artistNames.length === 0) {
    errorMessage.value = 'Track name and at least one artist are required.'
    result.value = null
    return
  }

  pending.value = true
  errorMessage.value = ''

  try {
    lastPayload.value = requestPayload.value
    result.value = await $fetch<MatchResponse>('/api/utils/match-links', {
      method: 'POST',
      body: requestPayload.value
    })
  } catch (error) {
    result.value = null
    errorMessage.value =
      error instanceof Error ? error.message : 'The matcher request failed unexpectedly.'
  } finally {
    pending.value = false
  }
}
</script>

<template>
  <main class="demo-shell">
    <div class="backdrop-orb backdrop-orb-left" aria-hidden="true" />
    <div class="backdrop-orb backdrop-orb-right" aria-hidden="true" />

    <section class="hero-panel">
      <div>
        <p class="eyebrow">Internal route</p>
        <h1>Link Matcher Demo</h1>
      </div>

      <p class="hero-copy">
        Test the live matcher against the current provider stack. Spotify URLs resolve from `spotifyId`,
        Deezer uses metadata search, and MusicBrainz enriches queries when an `isrc` is supplied.
      </p>

      <div class="hero-actions">
        <NuxtLink class="ghost-link" to="/">Back to Lab</NuxtLink>
        <span class="status-note">Only Deezer is fully provider-backed right now.</span>
      </div>
    </section>

    <section class="demo-grid">
      <form class="surface-card form-card" @submit.prevent="runMatch">
        <div class="section-heading">
          <h2>Request Builder</h2>
          <p>Fill the track metadata you want the matcher to resolve.</p>
        </div>

        <div class="preset-row">
          <button
            v-for="preset in presets"
            :key="preset.label"
            class="preset-chip"
            type="button"
            @click="applyPreset(preset)"
          >
            Load {{ preset.label }}
          </button>
        </div>

        <div class="field-grid">
          <label class="field">
            <span>Track Name</span>
            <input v-model="form.name" type="text" autocomplete="off" />
          </label>

          <label class="field">
            <span>Artists</span>
            <input v-model="form.artistNames" type="text" autocomplete="off" placeholder="Adele, Example Artist" />
          </label>

          <label class="field">
            <span>Album</span>
            <input v-model="form.albumName" type="text" autocomplete="off" />
          </label>

          <label class="field">
            <span>ISRC</span>
            <input v-model="form.isrc" type="text" autocomplete="off" />
          </label>

          <label class="field">
            <span>Spotify ID</span>
            <input v-model="form.spotifyId" type="text" autocomplete="off" />
          </label>
        </div>

        <fieldset class="platforms">
          <legend>Platforms</legend>
          <div class="platform-grid">
            <label v-for="platform in platformOptions" :key="platform.value" class="platform-pill">
              <input v-model="selectedPlatforms" :value="platform.value" type="checkbox" />
              <span>{{ platform.label }}</span>
            </label>
          </div>
        </fieldset>

        <div class="action-row">
          <button class="run-button" type="submit" :disabled="pending">
            {{ pending ? 'Running matcher...' : 'Run Match' }}
          </button>
          <p class="helper-copy">The route posts to `/api/utils/match-links` and shows the raw response below.</p>
        </div>

        <p v-if="errorMessage" class="error-banner" role="alert">{{ errorMessage }}</p>
      </form>

      <section class="surface-card results-card" aria-live="polite">
        <div class="section-heading">
          <h2>Match Results</h2>
          <p>Status cards reflect the current provider coverage.</p>
        </div>

        <div class="result-grid">
          <article
            v-for="card in resultCards"
            :key="card.value"
            :class="['match-card', card.match?.status ?? 'unsupported']"
          >
            <div class="match-header">
              <h3>{{ card.label }}</h3>
              <span class="status-pill">{{ card.match?.status ?? 'unsupported' }}</span>
            </div>

            <p class="match-reason">{{ card.match?.reason ?? 'No match run yet.' }}</p>

            <dl v-if="card.match" class="match-meta">
              <div>
                <dt>Score</dt>
                <dd>{{ card.match.score ?? 'n/a' }}</dd>
              </div>
              <div>
                <dt>Candidate</dt>
                <dd>{{ card.match.matchedCandidateId ?? 'n/a' }}</dd>
              </div>
            </dl>

            <a
              v-if="card.match?.url"
              class="result-link"
              :href="card.match.url"
              target="_blank"
              rel="noreferrer"
            >
              Open resolved link
            </a>
          </article>
        </div>

        <div class="debug-grid">
          <section class="debug-panel">
            <div class="debug-header">
              <h3>Last Request</h3>
              <span>What the page sent</span>
            </div>
            <pre>{{ formattedPayload }}</pre>
          </section>

          <section class="debug-panel">
            <div class="debug-header">
              <h3>Raw Response</h3>
              <span>Current matcher output</span>
            </div>
            <pre>{{ formattedResult }}</pre>
          </section>
        </div>
      </section>
    </section>
  </main>
</template>

<style scoped>
.demo-shell {
  position: relative;
  min-height: 100vh;
  overflow: hidden;
  padding: 1.5rem;
  background:
    linear-gradient(160deg, rgba(255, 140, 66, 0.08), transparent 38%),
    radial-gradient(circle at top left, rgba(29, 211, 176, 0.2), transparent 34%),
    #081018;
  color: #f4efe7;
  font-family: "Iowan Old Style", "Palatino Linotype", "Book Antiqua", Georgia, serif;
}

.backdrop-orb {
  position: absolute;
  width: 26rem;
  height: 26rem;
  border-radius: 999px;
  filter: blur(80px);
  opacity: 0.42;
  pointer-events: none;
}

.backdrop-orb-left {
  top: -8rem;
  left: -4rem;
  background: rgba(29, 211, 176, 0.28);
}

.backdrop-orb-right {
  right: -8rem;
  bottom: -10rem;
  background: rgba(255, 140, 66, 0.24);
}

.hero-panel,
.surface-card {
  position: relative;
  z-index: 1;
  max-width: 1280px;
  margin: 0 auto;
  border: 1px solid rgba(244, 239, 231, 0.1);
  border-radius: 1.5rem;
  background: rgba(9, 13, 20, 0.72);
  backdrop-filter: blur(16px);
  box-shadow: 0 28px 80px rgba(0, 0, 0, 0.32);
}

.hero-panel {
  display: grid;
  gap: 1rem;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
  animation: rise-in 420ms ease-out both;
}

.eyebrow {
  margin: 0 0 0.75rem;
  color: #1dd3b0;
  font-family: "SFMono-Regular", "IBM Plex Mono", Consolas, monospace;
  font-size: 0.8rem;
  letter-spacing: 0.18em;
  text-transform: uppercase;
}

h1,
h2,
h3 {
  margin: 0;
}

h1 {
  font-size: clamp(2.3rem, 5vw, 4.6rem);
  line-height: 0.94;
  letter-spacing: -0.05em;
}

.hero-copy,
.section-heading p,
.helper-copy,
.match-reason,
.debug-header span,
.status-note {
  color: rgba(244, 239, 231, 0.72);
}

.hero-copy {
  max-width: 58rem;
  margin: 0;
  font-size: 1.05rem;
  line-height: 1.7;
}

.hero-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.85rem;
  align-items: center;
}

.ghost-link,
.preset-chip,
.run-button,
.result-link {
  transition:
    transform 160ms ease,
    box-shadow 160ms ease,
    border-color 160ms ease;
}

.ghost-link,
.preset-chip {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.8rem 1rem;
  border: 1px solid rgba(244, 239, 231, 0.12);
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.02);
  color: #f4efe7;
  font-family: "SFMono-Regular", "IBM Plex Mono", Consolas, monospace;
  font-size: 0.86rem;
  text-decoration: none;
}

.ghost-link:hover,
.ghost-link:focus-visible,
.preset-chip:hover,
.preset-chip:focus-visible,
.run-button:hover,
.run-button:focus-visible,
.result-link:hover,
.result-link:focus-visible {
  transform: translateY(-1px);
}

.demo-grid {
  position: relative;
  z-index: 1;
  display: grid;
  gap: 1.5rem;
  max-width: 1280px;
  margin: 0 auto;
}

.surface-card {
  padding: 1.5rem;
  animation: rise-in 520ms ease-out both;
}

.section-heading {
  display: grid;
  gap: 0.35rem;
  margin-bottom: 1.25rem;
}

.preset-row {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  margin-bottom: 1.25rem;
}

.field-grid {
  display: grid;
  gap: 1rem;
}

.field {
  display: grid;
  gap: 0.45rem;
}

.field span,
.platforms legend {
  font-family: "SFMono-Regular", "IBM Plex Mono", Consolas, monospace;
  font-size: 0.82rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: rgba(244, 239, 231, 0.74);
}

.field input {
  width: 100%;
  padding: 0.95rem 1rem;
  border: 1px solid rgba(244, 239, 231, 0.12);
  border-radius: 1rem;
  background: rgba(0, 0, 0, 0.18);
  color: #f4efe7;
  font: inherit;
}

.field input:focus-visible {
  outline: 2px solid rgba(29, 211, 176, 0.55);
  outline-offset: 2px;
}

.platforms {
  margin: 1.5rem 0 0;
  padding: 0;
  border: 0;
}

.platform-grid {
  display: grid;
  gap: 0.75rem;
  margin-top: 0.85rem;
}

.platform-pill {
  display: flex;
  gap: 0.65rem;
  align-items: center;
  padding: 0.8rem 0.95rem;
  border: 1px solid rgba(244, 239, 231, 0.08);
  border-radius: 1rem;
  background: rgba(255, 255, 255, 0.02);
  font-family: "SFMono-Regular", "IBM Plex Mono", Consolas, monospace;
  font-size: 0.88rem;
}

.action-row {
  display: grid;
  gap: 0.85rem;
  margin-top: 1.5rem;
}

.run-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: fit-content;
  padding: 0.95rem 1.35rem;
  border: 0;
  border-radius: 999px;
  background: linear-gradient(135deg, #1dd3b0, #ff8c42);
  color: #041116;
  font-family: "SFMono-Regular", "IBM Plex Mono", Consolas, monospace;
  font-size: 0.92rem;
  cursor: pointer;
  box-shadow: 0 20px 48px rgba(29, 211, 176, 0.18);
}

.run-button:disabled {
  cursor: progress;
  opacity: 0.72;
}

.helper-copy,
.match-reason,
.debug-header span {
  margin: 0;
  line-height: 1.6;
}

.error-banner {
  margin: 1rem 0 0;
  padding: 0.9rem 1rem;
  border: 1px solid rgba(255, 110, 110, 0.28);
  border-radius: 1rem;
  background: rgba(88, 14, 14, 0.44);
  color: #ffd7d7;
}

.result-grid,
.debug-grid {
  display: grid;
  gap: 1rem;
}

.match-card {
  padding: 1rem;
  border: 1px solid rgba(244, 239, 231, 0.08);
  border-radius: 1.1rem;
  background: rgba(255, 255, 255, 0.02);
}

.match-card.resolved {
  border-color: rgba(29, 211, 176, 0.38);
}

.match-card.pending {
  border-color: rgba(255, 215, 0, 0.28);
}

.match-card.failed,
.match-card.unsupported {
  border-color: rgba(255, 140, 66, 0.22);
}

.match-header {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  align-items: center;
}

.status-pill {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 6.6rem;
  padding: 0.35rem 0.7rem;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.06);
  font-family: "SFMono-Regular", "IBM Plex Mono", Consolas, monospace;
  font-size: 0.76rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.match-meta {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.75rem;
  margin: 1rem 0 0;
}

.match-meta dt {
  margin: 0;
  font-family: "SFMono-Regular", "IBM Plex Mono", Consolas, monospace;
  font-size: 0.72rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: rgba(244, 239, 231, 0.62);
}

.match-meta dd {
  margin: 0.25rem 0 0;
}

.result-link {
  display: inline-flex;
  margin-top: 1rem;
  color: #1dd3b0;
  text-decoration: none;
}

.debug-panel {
  border: 1px solid rgba(244, 239, 231, 0.08);
  border-radius: 1.15rem;
  background: rgba(0, 0, 0, 0.22);
  overflow: hidden;
}

.debug-header {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  align-items: center;
  padding: 0.9rem 1rem;
  border-bottom: 1px solid rgba(244, 239, 231, 0.08);
}

pre {
  margin: 0;
  padding: 1rem;
  overflow: auto;
  color: #d7fff1;
  font-family: "SFMono-Regular", "IBM Plex Mono", Consolas, monospace;
  font-size: 0.82rem;
  line-height: 1.6;
}

@keyframes rise-in {
  from {
    opacity: 0;
    transform: translateY(18px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (min-width: 880px) {
  .demo-grid {
    grid-template-columns: minmax(0, 0.95fr) minmax(0, 1.2fr);
  }

  .field-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .field:first-child,
  .field:nth-child(2),
  .field:nth-child(5) {
    grid-column: 1 / -1;
  }

  .platform-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .result-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .debug-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (prefers-reduced-motion: reduce) {
  .hero-panel,
  .surface-card,
  .ghost-link,
  .preset-chip,
  .run-button,
  .result-link {
    animation: none;
    transition: none;
  }
}
</style>
