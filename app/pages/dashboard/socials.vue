<template>
  <div class="min-h-screen bg-gray-100">
    <DashboardLayout>
      <h2 class="text-2xl font-bold mb-6">Manage Social Links</h2>
      <div v-if="loading" class="flex justify-center items-center py-12">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
      <div v-else-if="error" class="bg-red-50 text-red-600 p-4 rounded-md mb-6">
        {{ error }}
      </div>
      <div v-else-if="successMessage" class="bg-green-50 text-green-600 p-4 rounded-md mb-6">
        {{ successMessage }}
      </div>
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
const successMessage = ref<string | null>(null)

// Fetch social links on mount
async function fetchSocialLinks() {
  try {
    loading.value = true
    error.value = null
    successMessage.value = null
    const response = (await $fetch('/api/dashboard/socials')) as any
    if (response.success) {
      socialLinks.value = response.data
    } else {
      throw new Error(response.message || 'Failed to load social links data')
    }
  } catch (err: any) {
    error.value = err.data?.message || err.message || 'Failed to load social links'
    console.error('Error fetching social links:', err)
  } finally {
    loading.value = false
  }
}

// Save social links data
async function handleSocialLinksSubmit(formData: Record<string, string>) {
  try {
    loading.value = true
    error.value = null
    successMessage.value = null
    const response = (await $fetch('/api/dashboard/socials', {
      method: 'PUT',
      body: formData
    } as any)) as any
    if (response.success) {
      successMessage.value = response.message || 'Social links saved successfully!'
      socialLinks.value = response.data
    } else {
      throw new Error(response.message || 'Failed to save social links')
    }
  } catch (err: any) {
    error.value = err.data?.message || err.message || 'Failed to save social links'
    console.error('Error saving social links:', err)
  } finally {
    loading.value = false
  }
}

// Fetch data on component mount
onMounted(() => {
  fetchSocialLinks()
})
</script>
