<template>
  <div class="min-h-screen bg-gray-100">
    <DashboardLayout>
      <h2 class="text-2xl font-bold mb-6">Edit Profile</h2>
      <div v-if="loading" class="flex justify-center items-center py-12">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
      <div v-else-if="error" class="bg-red-50 text-red-600 p-4 rounded-md mb-6">
        {{ error }}
      </div>
      <div v-else-if="successMessage" class="bg-green-50 text-green-600 p-4 rounded-md mb-6">
        {{ successMessage }}
      </div>
      <ProfileForm
        v-else-if="artist"
        :artist="artist"
        @submit="handleProfileSubmit"
      />
    </DashboardLayout>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import DashboardLayout from '../../components/dashboard/DashboardLayout.vue'
import ProfileForm from '../../components/dashboard/ProfileForm.vue'

interface Artist {
  name: string
  bio: string
  heroImage: string
}

const artist = ref<Artist | null>(null)
const loading = ref(true)
const error = ref<string | null>(null)
const successMessage = ref<string | null>(null)

// Fetch artist data on mount
async function fetchArtist() {
  try {
    loading.value = true
    error.value = null
    successMessage.value = null
    const response = (await $fetch('/api/dashboard/profile')) as any
    if (response.success) {
      artist.value = response.data
    } else {
      throw new Error(response.message || 'Failed to load profile data')
    }
  } catch (err: any) {
    error.value = err.data?.message || err.message || 'Failed to load profile'
    console.error('Error fetching profile:', err)
  } finally {
    loading.value = false
  }
}

// Save profile data
async function handleProfileSubmit(formData: any) {
  try {
    loading.value = true
    error.value = null
    successMessage.value = null
    const response = (await $fetch('/api/dashboard/profile', {
      method: 'PUT',
      body: formData
    } as any)) as any
    if (response.success) {
      successMessage.value = response.message || 'Profile saved successfully!'
      artist.value = response.data
    } else {
      throw new Error(response.message || 'Failed to save profile')
    }
  } catch (err: any) {
    error.value = err.data?.message || err.message || 'Failed to save profile'
    console.error('Error saving profile:', err)
  } finally {
    loading.value = false
  }
}

// Fetch data on component mount
onMounted(() => {
  fetchArtist()
})
</script>
