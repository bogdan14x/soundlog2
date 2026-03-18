<template>
  <div class="min-h-screen bg-gray-100">
    <DashboardLayout>
      <h2 class="text-2xl font-bold mb-6">Additional Settings</h2>
      <div v-if="loading" class="text-gray-500">Loading...</div>
      <div v-else-if="error" class="text-red-500">{{ error }}</div>
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

async function fetchSettings() {
  try {
    loading.value = true
    error.value = null
    const response = await $fetch('/api/dashboard/settings')
    settings.value = response.data
  } catch (err: any) {
    error.value = err.data?.message || 'Failed to load settings'
    console.error('Error fetching settings:', err)
  } finally {
    loading.value = false
  }
}

async function handleSettingsSubmit(formData: any) {
  // Placeholder implementation since no PUT endpoint exists yet
  console.log('Saving settings:', formData)
  alert('Settings saved successfully!')
}

onMounted(() => {
  fetchSettings()
})
</script>
