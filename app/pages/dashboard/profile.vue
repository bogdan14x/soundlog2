<template>
  <div class="min-h-screen bg-gray-100">
    <DashboardLayout>
      <h2 class="text-2xl font-bold mb-6">Edit Profile</h2>
      <div v-if="loading" class="text-gray-500">Loading...</div>
      <div v-else-if="error" class="text-red-500">{{ error }}</div>
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

// Fetch artist data on mount
async function fetchArtist() {
  try {
    loading.value = true
    error.value = null
    const response = await $fetch('/api/dashboard/profile')
    artist.value = response.data
  } catch (err: any) {
    error.value = err.data?.message || 'Failed to load profile'
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
    await $fetch('/api/dashboard/profile', {
      method: 'PUT',
      body: formData
    })
    alert('Profile saved successfully!')
    // Optionally refresh data
    await fetchArtist()
  } catch (err: any) {
    error.value = err.data?.message || 'Failed to save profile'
    console.error('Error saving profile:', err)
    alert('Failed to save profile')
  } finally {
    loading.value = false
  }
}

// Fetch data on component mount
onMounted(() => {
  fetchArtist()
})
</script>
