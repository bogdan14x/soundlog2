<template>
  <form @submit.prevent="handleSubmit" class="space-y-6">
    <div v-for="(url, platform) in form" :key="platform">
      <label :for="platform" class="block text-sm font-medium text-gray-700 capitalize">
        {{ platform.replace(/([A-Z])/g, ' $1').trim() }}
      </label>
      <input
        type="url"
        :id="platform"
        :name="platform"
        v-model="form[platform]"
        class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        placeholder="https://..."
      />
    </div>
    <button
      type="submit"
      class="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
    >
      Save Social Links
    </button>
  </form>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'

interface Props {
  links: Record<string, string>
}

const props = defineProps<Props>()
const emit = defineEmits(['submit'])

const form = ref<Record<string, string>>({})

watch(() => props.links, (newLinks) => {
  form.value = { ...newLinks }
}, { immediate: true })

function handleSubmit() {
  emit('submit', form.value)
}
</script>
