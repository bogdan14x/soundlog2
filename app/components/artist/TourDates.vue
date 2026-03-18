<script setup lang="ts">
interface TourDate {
  date: string
  venue: string
  location: string
  ticketLink?: string
}

interface Props {
  dates: TourDate[]
}

defineProps<Props>()
</script>

<template>
  <section v-if="dates.length > 0" class="tour-dates">
    <h2 class="text-xl font-semibold mb-4">Tour Dates</h2>
    <ul class="space-y-3">
      <li
        v-for="(show, index) in dates"
        :key="index"
        class="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
      >
        <div class="flex items-center space-x-4">
          <span class="text-sm font-medium text-gray-900">{{ show.date }}</span>
          <div>
            <p class="text-sm font-medium text-gray-900">{{ show.venue }}</p>
            <p class="text-sm text-gray-600">{{ show.location }}</p>
          </div>
        </div>
        <a
          v-if="show.ticketLink"
          :href="show.ticketLink"
          target="_blank"
          rel="noopener noreferrer"
          class="text-sm text-indigo-600 hover:text-indigo-800 font-medium"
        >
          Get Tickets
        </a>
      </li>
    </ul>
  </section>
</template>
