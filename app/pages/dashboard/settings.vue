<template>
  <div class="min-h-screen bg-gray-100">
    <DashboardLayout>
      <h2 class="text-2xl font-bold mb-6">Additional Settings</h2>
      <div v-if="loading" class="flex justify-center items-center py-12">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
      <div v-else-if="error" class="bg-red-50 text-red-600 p-4 rounded-md mb-6">
        {{ error }}
      </div>
      <div v-else-if="successMessage" class="bg-green-50 text-green-600 p-4 rounded-md mb-6">
        {{ successMessage }}
      </div>
      <AdditionalSettings
        v-else-if="settings"
        :newsletter-url="settings.newsletterUrl"
        :upgrade-prompt="settings.upgradePrompt"
        @submit="handleSettingsSubmit"
      />
    </DashboardLayout>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import DashboardLayout from '../../components/dashboard/DashboardLayout.vue'
import AdditionalSettings from '../../components/dashboard/AdditionalSettings.vue'

const settings = ref<{ newsletterUrl: string; upgradePrompt: boolean } | null>(null)
const loading = ref(true)
const error = ref<string | null>(null)
const successMessage = ref<string | null>(null)

async function fetchSettings() {
  try {
    loading.value = true
    error.value = null
    successMessage.value = null
    const response = (await $fetch('/api/dashboard/settings')) as any
    if (response.success) {
      settings.value = response.data
    } else {
      throw new Error(response.message || 'Failed to load settings data')
    }
  } catch (err: any) {
    error.value = err.data?.message || err.message || 'Failed to load settings'
    console.error('Error fetching settings:', err)
  } finally {
    loading.value = false
  }
}

async function handleSettingsSubmit(formData: any) {
  try {
    loading.value = true
    error.value = null
    successMessage.value = null
    // Note: Backend PUT endpoint may not exist yet, but this is the correct frontend implementation
    const response = (await $fetch('/api/dashboard/settings', {
      method: 'PUT',
      body: formData
    } as any)) as any
    if (response.success) {
      successMessage.value = response.message || 'Settings saved successfully!'
      settings.value = response.data
    } else {
      throw new Error(response.message || 'Failed to save settings')
    }
  } catch (err: any) {
    // Handle case where PUT endpoint doesn't exist (404) or other errors
    if (err.status === 404) {
      error.value = 'Settings update endpoint not available yet. Please try again later.'
    } else {
      error.value = err.data?.message || err.message || 'Failed to save settings'
    }
    console.error('Error saving settings:', err)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchSettings()
})
</script>
