<template>
  <div class="min-h-screen bg-gray-100">
    <DashboardLayout>
      <h2 class="text-2xl font-bold mb-6">Link Resolution Status</h2>
      <div class="bg-white shadow rounded-lg">
        <div class="px-4 py-5 sm:p-6">
          <p class="text-sm text-gray-500 mb-4">
            View the status of platform link resolution for your tracks.
            All links are resolved automatically via our link matcher utility.
          </p>
          <!-- Loading State -->
          <div v-if="loading" class="flex justify-center items-center py-12">
            <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>

          <!-- Error State -->
          <div v-else-if="error" class="bg-red-50 text-red-600 p-4 rounded-md mb-6">
            {{ error }}
          </div>
          <div v-else-if="statusData.length > 0" class="space-y-4">
            <div
              v-for="item in statusData"
              :key="item.platform"
              class="flex items-center justify-between py-2 border-b"
            >
              <span class="font-medium capitalize">{{ item.platform }}</span>
              <span
                :class="{
                  'text-green-600': item.status === 'resolved',
                  'text-yellow-600': item.status === 'pending',
                  'text-red-600': item.status === 'failed',
                  'text-gray-500': item.status === 'unsupported'
                }"
              >
                {{ item.status }}
              </span>
            </div>
          </div>
          <div v-else class="text-gray-500">No status data available</div>
        </div>
      </div>
    </DashboardLayout>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import DashboardLayout from '../../components/dashboard/DashboardLayout.vue'

const statusData = ref<{ platform: string; status: string }[]>([])
const loading = ref(true)
const error = ref<string | null>(null)

async function fetchStatus() {
  try {
    loading.value = true
    error.value = null
    const response = (await $fetch('/api/dashboard/status')) as any
    if (response.success) {
      statusData.value = response.data
    } else {
      throw new Error(response.message || 'Failed to load status data')
    }
  } catch (err: any) {
    error.value = err.data?.message || err.message || 'Failed to load status'
    console.error('Error fetching status:', err)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchStatus()
})
</script>
