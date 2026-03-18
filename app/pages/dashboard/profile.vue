<template>
  <div class="min-h-screen bg-gray-100">
    <DashboardLayout>
      <h2 class="text-2xl font-bold mb-6">Edit Profile</h2>
      <ProfileForm
        v-if="artist"
        :artist="artist"
        @submit="handleProfileSubmit"
      />
      <div v-else class="text-gray-500">Loading...</div>
    </DashboardLayout>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import DashboardLayout from '../../components/dashboard/DashboardLayout.vue'
import ProfileForm from '../../components/dashboard/ProfileForm.vue'

// Mock artist data - in real implementation, fetch from API
const artist = ref({
  name: 'Test Artist',
  bio: 'Test bio',
  heroImage: 'https://example.com/image.jpg'
})

async function handleProfileSubmit(formData: any) {
  // TODO: Implement API call to save profile
  console.log('Saving profile:', formData)
  alert('Profile saved successfully!')
}
</script>
