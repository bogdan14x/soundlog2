<script setup lang="ts">
useHead({
  title: 'SoundLog',
  meta: [
    {
      name: 'description',
      content: 'Discover artist pages and sign in only when you want to manage your own SoundLog profile.'
    }
  ]
})
</script>

<template>
  <main class="min-h-screen bg-slate-950 text-white">
    <section class="mx-auto flex min-h-screen max-w-6xl flex-col justify-center gap-12 px-6 py-16 lg:flex-row lg:items-center lg:px-12">
      <div class="max-w-2xl space-y-6">
        <p class="text-sm font-semibold uppercase tracking-[0.3em] text-emerald-400">
          Public homepage
        </p>
        <h1 class="text-5xl font-black tracking-tight text-white sm:text-6xl">
          SoundLog artist pages should be viewable before sign-in.
        </h1>
        <p class="text-lg leading-8 text-slate-300">
          Browse the app homepage without authentication. Sign in only when you want to manage an artist profile, connect Spotify, or edit dashboard settings.
        </p>
        <div class="flex flex-col gap-4 sm:flex-row">
          <NuxtLink
            to="/login"
            class="inline-flex items-center justify-center rounded-full bg-emerald-400 px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-emerald-300"
          >
            Sign in to manage your page
          </NuxtLink>
          <NuxtLink
            to="/dashboard"
            class="inline-flex items-center justify-center rounded-full border border-white/20 px-6 py-3 text-sm font-semibold text-white transition hover:border-white/40 hover:bg-white/5"
          >
            Go to dashboard
          </NuxtLink>
          <NuxtLink
            to="/demo/link-matcher"
            class="inline-flex items-center justify-center rounded-full border border-emerald-400/40 px-6 py-3 text-sm font-semibold text-emerald-300 transition hover:border-emerald-300 hover:bg-emerald-400/10"
          >
            Open link matcher demo
          </NuxtLink>
        </div>
      </div>

      <div class="w-full max-w-xl rounded-[2rem] border border-white/10 bg-white/5 p-8 shadow-2xl shadow-slate-950/40 backdrop-blur">
        <div class="space-y-6">
          <div>
            <p class="text-sm uppercase tracking-[0.2em] text-slate-400">What changed</p>
            <h2 class="mt-3 text-2xl font-bold text-white">Homepage access no longer depends on login.</h2>
          </div>

          <div class="grid gap-4 text-sm text-slate-300 sm:grid-cols-2">
            <div class="rounded-2xl border border-white/10 bg-slate-900/60 p-4">
              <p class="font-semibold text-white">Public browsing</p>
              <p class="mt-2">Visitors can open the root route immediately.</p>
            </div>
            <div class="rounded-2xl border border-white/10 bg-slate-900/60 p-4">
              <p class="font-semibold text-white">Protected management</p>
              <p class="mt-2">Dashboard routes still redirect unauthenticated users to login.</p>
            </div>
            <div class="rounded-2xl border border-emerald-400/20 bg-emerald-400/5 p-4 sm:col-span-2">
              <p class="font-semibold text-white">Internal demo tooling</p>
              <p class="mt-2">
                The provider-backed link matcher demo remains available at <span class="font-mono text-emerald-300">/demo/link-matcher</span> for manual testing.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  </main>
</template>
