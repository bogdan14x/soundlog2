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
          <div v-if="statusData.length > 0" class="space-y-4">
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
          <div v-else class="text-gray-500">Loading status...</div>
        </div>
      </div>
    </DashboardLayout>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import DashboardLayout from '../../components/dashboard/DashboardLayout.vue'

// Mock status data - in real implementation, fetch from API
const statusData = ref([
  { platform: 'spotify', status: 'resolved' },
  { platform: 'appleMusic', status: 'resolved' },
  { platform: 'youtube', status: 'resolved' },
  { platform: 'tidal', status: 'pending' },
  { platform: 'deezer', status: 'failed' }
])
</script>
