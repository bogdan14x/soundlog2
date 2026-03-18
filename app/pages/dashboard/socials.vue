<template>
  <div class="min-h-screen bg-gray-100">
    <DashboardLayout>
      <h2 class="text-2xl font-bold mb-6">Manage Social Links</h2>
      <SocialLinksForm
        v-if="socialLinks"
        :links="socialLinks"
        @submit="handleSocialLinksSubmit"
      />
      <div v-else class="text-gray-500">Loading...</div>
    </DashboardLayout>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import DashboardLayout from '../../components/dashboard/DashboardLayout.vue'
import SocialLinksForm from '../../components/dashboard/SocialLinksForm.vue'

// Mock social links data - in real implementation, fetch from API
const socialLinks = ref({
  instagram: 'https://instagram.com/testartist',
  twitter: 'https://twitter.com/testartist',
  facebook: '',
  tiktok: '',
  youtube: '',
  soundcloud: '',
  appleMusic: '',
  tidal: ''
})

async function handleSocialLinksSubmit(formData: any) {
  // TODO: Implement API call to save social links
  console.log('Saving social links:', formData)
  alert('Social links saved successfully!')
}
</script>
