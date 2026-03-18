<script setup lang="ts">
interface RadioShow {
  title: string
  episode: string
  playLink: string
}

interface Props {
  shows: RadioShow[]
}

defineProps<Props>()
</script>

<template>
  <section v-if="shows.length > 0" class="radio-shows">
    <h2 class="text-xl font-semibold mb-4">Radio Shows</h2>
    <ul class="space-y-2">
      <li
        v-for="(show, index) in shows"
        :key="index"
        class="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
      >
        <div>
          <p class="text-sm font-medium text-gray-900">{{ show.title }}</p>
          <p class="text-xs text-gray-600">{{ show.episode }}</p>
        </div>
        <a
          :href="show.playLink"
          target="_blank"
          rel="noopener noreferrer"
          class="inline-flex items-center px-3 py-1 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors"
        >
          Play
        </a>
      </li>
    </ul>
  </section>
</template>
