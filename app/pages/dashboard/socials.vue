<template>
  <div class="min-h-screen bg-gray-100">
    <DashboardLayout>
      <h2 class="text-2xl font-bold mb-6">Manage Social Links</h2>
      <div v-if="loading" class="text-gray-500">Loading...</div>
      <div v-else-if="error" class="text-red-500">{{ error }}</div>
      <SocialLinksForm
        v-else-if="socialLinks"
        :links="socialLinks"
        @submit="handleSocialLinksSubmit"
      />
    </DashboardLayout>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import DashboardLayout from '../../components/dashboard/DashboardLayout.vue'
import SocialLinksForm from '../../components/dashboard/SocialLinksForm.vue'

const socialLinks = ref<Record<string, string> | null>(null)
const loading = ref(true)
const error = ref<string | null>(null)

// Fetch social links on mount
async function fetchSocialLinks() {
  try {
    loading.value = true
    error.value = null
    const response = await $fetch('/api/dashboard/socials')
    socialLinks.value = response.data
  } catch (err: any) {
    error.value = err.data?.message || 'Failed to load social links'
    console.error('Error fetching social links:', err)
  } finally {
    loading.value = false
  }
}

// Save social links data
async function handleSocialLinksSubmit(formData: any) {
  try {
    loading.value = true
    error.value = null
    await $fetch('/api/dashboard/socials', {
      method: 'PUT',
      body: formData
    })
    alert('Social links saved successfully!')
    // Optionally refresh data
    await fetchSocialLinks()
  } catch (err: any) {
    error.value = err.data?.message || 'Failed to save social links'
    console.error('Error saving social links:', err)
    alert('Failed to save social links')
  } finally {
    loading.value = false
  }
}

// Fetch data on component mount
onMounted(() => {
  fetchSocialLinks()
})
</script>
