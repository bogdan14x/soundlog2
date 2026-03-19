<template>
  <main class="landing-shell">
    <section class="landing-grid">
      <div class="landing-copy">
        <p class="eyebrow">SoundLog Lab</p>
        <h1>Internal tools for testing the artist page stack.</h1>
        <p class="lede">
          The link matcher now has a dedicated demo route so you can test provider-backed matching without
          posting JSON by hand.
        </p>
        <div class="cta-row">
          <NuxtLink class="primary-link" to="/demo/link-matcher">Open Link Matcher Demo</NuxtLink>
        </div>
      </div>

      <aside class="landing-note" aria-label="Current status">
        <p class="note-label">Current coverage</p>
        <ul class="note-list">
          <li>Spotify links are constructed directly from `spotifyId`.</li>
          <li>Deezer lookup is live via metadata search.</li>
          <li>MusicBrainz enriches metadata when `isrc` is present.</li>
          <li>Apple Music, YouTube Music, and Tidal adapters still need implementation.</li>
        </ul>
      </aside>
    </section>
  </main>
</template>

<script setup lang="ts">
useSeoMeta({
  title: 'SoundLog Lab',
  description: 'Internal tooling entrypoint for testing SoundLog services.'
})
</script>

<style scoped>
.landing-shell {
  min-height: 100vh;
  padding: 2rem;
  background:
    radial-gradient(circle at top left, rgba(29, 211, 176, 0.2), transparent 35%),
    radial-gradient(circle at bottom right, rgba(255, 140, 66, 0.18), transparent 30%),
    #0d1117;
  color: #f3efe6;
  font-family: "Iowan Old Style", "Palatino Linotype", "Book Antiqua", Georgia, serif;
}

.landing-grid {
  display: grid;
  gap: 1.5rem;
  max-width: 1040px;
  margin: 0 auto;
  min-height: calc(100vh - 4rem);
  align-items: center;
}

.landing-copy,
.landing-note {
  border: 1px solid rgba(243, 239, 230, 0.12);
  border-radius: 1.5rem;
  background: rgba(8, 12, 18, 0.72);
  backdrop-filter: blur(14px);
  box-shadow: 0 30px 80px rgba(0, 0, 0, 0.35);
}

.landing-copy {
  padding: 2rem;
}

.landing-note {
  padding: 1.5rem;
}

.eyebrow,
.note-label {
  margin: 0 0 1rem;
  color: #1dd3b0;
  font-family: "SFMono-Regular", "IBM Plex Mono", Consolas, monospace;
  font-size: 0.8rem;
  letter-spacing: 0.18em;
  text-transform: uppercase;
}

h1 {
  margin: 0;
  font-size: clamp(2.5rem, 6vw, 5rem);
  line-height: 0.94;
  letter-spacing: -0.05em;
}

.lede {
  max-width: 40rem;
  margin: 1.25rem 0 0;
  color: rgba(243, 239, 230, 0.78);
  font-size: 1.1rem;
  line-height: 1.65;
}

.cta-row {
  margin-top: 1.75rem;
}

.primary-link {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.95rem 1.35rem;
  border-radius: 999px;
  background: linear-gradient(135deg, #1dd3b0, #ff8c42);
  color: #041116;
  font-family: "SFMono-Regular", "IBM Plex Mono", Consolas, monospace;
  font-size: 0.92rem;
  text-decoration: none;
  transition:
    transform 180ms ease,
    box-shadow 180ms ease;
  box-shadow: 0 16px 40px rgba(29, 211, 176, 0.2);
}

.primary-link:hover,
.primary-link:focus-visible {
  transform: translateY(-2px);
  box-shadow: 0 22px 46px rgba(29, 211, 176, 0.28);
}

.note-list {
  margin: 0;
  padding-left: 1rem;
  color: rgba(243, 239, 230, 0.84);
  line-height: 1.7;
}

@media (min-width: 900px) {
  .landing-grid {
    grid-template-columns: minmax(0, 2fr) minmax(300px, 1fr);
  }
}
</style>
