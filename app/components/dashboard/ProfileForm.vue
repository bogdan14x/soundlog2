<template>
  <form @submit.prevent="handleSubmit" class="space-y-6">
    <div>
      <label for="name" class="block text-sm font-medium text-gray-700">Artist Name</label>
      <input
        type="text"
        id="name"
        name="name"
        v-model="form.name"
        class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
      />
    </div>
    <div>
      <label for="bio" class="block text-sm font-medium text-gray-700">Bio</label>
      <textarea
        id="bio"
        name="bio"
        v-model="form.bio"
        rows="4"
        class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
      ></textarea>
    </div>
    <div>
      <label for="heroImage" class="block text-sm font-medium text-gray-700">Hero Image URL</label>
      <input
        type="url"
        id="heroImage"
        name="heroImage"
        v-model="form.heroImage"
        class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
      />
    </div>
    <button
      type="submit"
      class="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
    >
      Save Changes
    </button>
  </form>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'

interface Props {
  artist: {
    name: string
    bio: string
    heroImage: string
  }
}

const props = defineProps<Props>()
const emit = defineEmits(['submit'])

const form = ref({
  name: props.artist.name,
  bio: props.artist.bio,
  heroImage: props.artist.heroImage
})

watch(() => props.artist, (newArtist) => {
  form.value = {
    name: newArtist.name,
    bio: newArtist.bio,
    heroImage: newArtist.heroImage
  }
}, { immediate: true })

function handleSubmit() {
  emit('submit', form.value)
}
</script>
