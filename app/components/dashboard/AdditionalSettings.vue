<template>
  <form @submit.prevent="handleSubmit" class="space-y-6">
    <div>
      <label for="newsletterUrl" class="block text-sm font-medium text-gray-700">Newsletter Signup URL</label>
      <input
        type="url"
        id="newsletterUrl"
        name="newsletterUrl"
        v-model="form.newsletterUrl"
        class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        placeholder="https://..."
      />
      <p class="mt-1 text-sm text-gray-500">URL for your newsletter signup form</p>
    </div>
    <div class="flex items-center">
      <input
        type="checkbox"
        id="upgradePrompt"
        name="upgradePrompt"
        v-model="form.upgradePrompt"
        class="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
      />
      <label for="upgradePrompt" class="ml-2 block text-sm text-gray-900">
        Show upgrade prompt banner
      </label>
    </div>
    <button
      type="submit"
      class="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
    >
      Save Settings
    </button>
  </form>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'

interface Props {
  newsletterUrl: string
  upgradePrompt: boolean
}

const props = defineProps<Props>()
const emit = defineEmits(['submit'])

const form = ref({
  newsletterUrl: props.newsletterUrl,
  upgradePrompt: props.upgradePrompt
})

watch(() => props, (newProps) => {
  form.value = {
    newsletterUrl: newProps.newsletterUrl,
    upgradePrompt: newProps.upgradePrompt
  }
}, { immediate: true, deep: true })

function handleSubmit() {
  emit('submit', form.value)
}
</script>
