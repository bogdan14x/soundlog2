<script setup lang="ts">
import { ref } from 'vue'

interface Release {
  title: string
  date: string
  coverImage: string
  platformLinks: Record<string, string>
}

interface Props {
  releases: Release[]
}

defineProps<Props>()

const selectedRelease = ref<Release | null>(null)

function openModal(release: Release) {
  selectedRelease.value = release
}

function closeModal() {
  selectedRelease.value = null
}
</script>

<template>
    <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      <div
        v-for="release in releases"
        :key="release.title"
        data-testid="release-item"
        class="cursor-pointer"
        @click="openModal(release)"
      >
      <img
        :src="release.coverImage"
        :alt="release.title"
        class="w-full h-auto rounded-lg shadow-md"
      />
      <h3 class="mt-2 text-sm font-medium text-gray-900">{{ release.title }}</h3>
      <p class="text-xs text-gray-500">{{ release.date }}</p>
    </div>
  </div>

  <!-- Modal -->
  <div
    v-if="selectedRelease"
    class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
    @click="closeModal"
  >
    <div
      class="bg-white rounded-lg p-6 max-w-md w-full mx-4"
      @click.stop
    >
      <button
        @click="closeModal"
        aria-label="Close"
        class="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
      >
        ×
      </button>
      <img
        :src="selectedRelease.coverImage"
        :alt="selectedRelease.title"
        class="w-full h-auto rounded-lg mb-4"
      />
      <h3 class="text-xl font-semibold text-gray-900 mb-2">{{ selectedRelease.title }}</h3>
      <p class="text-sm text-gray-600 mb-4">{{ selectedRelease.date }}</p>
      <div class="platform-links flex flex-wrap gap-2">
        <a
          v-for="(url, platform) in selectedRelease.platformLinks"
          :key="platform"
          :href="url"
          target="_blank"
          rel="noopener noreferrer"
          class="inline-flex items-center px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors"
        >
          {{ platform }}
        </a>
      </div>
    </div>
  </div>
</template>
