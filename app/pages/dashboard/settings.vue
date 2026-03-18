<template>
  <div class="min-h-screen bg-gray-100">
    <DashboardLayout>
      <h2 class="text-2xl font-bold mb-6">Additional Settings</h2>
      <AdditionalSettings
        v-if="settings"
        :newsletter-url="settings.newsletterUrl"
        :upgrade-prompt="settings.upgradePrompt"
        @submit="handleSettingsSubmit"
      />
      <div v-else class="text-gray-500">Loading...</div>
    </DashboardLayout>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import DashboardLayout from '../../components/dashboard/DashboardLayout.vue'
import AdditionalSettings from '../../components/dashboard/AdditionalSettings.vue'

// Mock settings data - in real implementation, fetch from API
const settings = ref({
  newsletterUrl: 'https://newsletter.example.com',
  upgradePrompt: true
})

async function handleSettingsSubmit(formData: any) {
  // TODO: Implement API call to save settings
  console.log('Saving settings:', formData)
  alert('Settings saved successfully!')
}
</script>
