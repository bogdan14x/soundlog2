<template>
  <div class="min-h-screen bg-gray-100">
    <DashboardLayout>
      <h1 class="text-3xl font-bold mb-6">Artist Dashboard</h1>
      <p>Welcome to your dashboard. Manage your profile and social links.</p>
      <nav class="mt-8">
        <ul class="space-y-2">
          <li><NuxtLink to="/dashboard/profile" class="text-blue-600 hover:underline">Edit Profile</NuxtLink></li>
          <li><NuxtLink to="/dashboard/socials" class="text-blue-600 hover:underline">Manage Social Links</NuxtLink></li>
          <li><NuxtLink to="/dashboard/settings" class="text-blue-600 hover:underline">Additional Settings</NuxtLink></li>
          <li><NuxtLink to="/dashboard/status" class="text-blue-600 hover:underline">Link Resolution Status</NuxtLink></li>
        </ul>
      </nav>
    </DashboardLayout>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  middleware: 'auth'
})

import DashboardLayout from '../../components/dashboard/DashboardLayout.vue'
</script>
