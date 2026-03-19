<script setup lang="ts">
interface Props {
  url?: string
}

defineProps<Props>()
</script>

<template>
  <section class="newsletter-cta p-6 bg-indigo-50 rounded-lg">
    <h2 class="text-xl font-semibold mb-4 text-center">Stay Updated</h2>
    <form :action="url" method="POST" class="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
      <input
        type="email"
        name="email"
        placeholder="Enter your email"
        required
        class="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
      />
      <button
        type="submit"
        class="px-6 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors"
      >
        Subscribe
      </button>
    </form>
  </section>
</template>
