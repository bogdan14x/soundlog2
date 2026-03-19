<script setup lang="ts">
interface Props {
  title: string
  date: string
  coverImage: string
  platformLinks: Record<string, string>
}

defineProps<Props>()
</script>

<template>
  <div class="featured-release">
    <!-- Cover Image -->
    <div class="release-cover mb-4">
      <img
        :src="coverImage"
        :alt="title"
        class="w-full h-auto rounded-lg shadow-md"
      />
    </div>

    <!-- Title and Date -->
    <div class="release-info mb-4">
      <h3 class="text-xl font-semibold text-gray-900">{{ title }}</h3>
      <p class="text-sm text-gray-600">{{ date }}</p>
    </div>

    <!-- Platform Links -->
    <div class="platform-links flex flex-wrap gap-2">
      <a
        v-for="(url, platform) in platformLinks"
        :key="platform"
        :href="url"
        target="_blank"
        rel="noopener noreferrer"
        class="inline-flex items-center px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors"
      >
        Listen Now
      </a>
    </div>
  </div>
</template>
