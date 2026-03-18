<script setup lang="ts">
interface Props {
  name: string
  bio: string
  heroImage: string
}

defineProps<Props>()
</script>

<template>
  <section class="relative h-screen w-full overflow-hidden">
    <!-- Hero Image Background -->
    <div class="absolute inset-0">
      <img
        :src="heroImage"
        :alt="name"
        class="h-full w-full object-cover"
      />
      <div class="absolute inset-0 bg-black/50" />
    </div>

    <!-- Content -->
    <div class="relative z-10 flex h-full flex-col items-center justify-center text-center text-white px-4">
      <h1 class="text-4xl md:text-6xl font-bold mb-4">{{ name }}</h1>
      <p class="text-lg md:text-xl mb-2">Your music. One link. Always up to date.</p>
      <p class="text-base md:text-lg max-w-2xl">{{ bio }}</p>
    </div>
  </section>
</template>
