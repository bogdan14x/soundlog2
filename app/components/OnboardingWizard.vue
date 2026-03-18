<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Progress Bar -->
    <div class="bg-white border-b">
      <div class="max-w-4xl mx-auto px-4 py-4">
        <div class="flex items-center justify-between">
          <div class="flex items-center space-x-4">
            <span class="text-sm font-medium text-gray-500">Step {{ currentStep }} of {{ totalSteps }}</span>
            <div class="flex-1 w-32 bg-gray-200 rounded-full h-2">
              <div
                class="bg-blue-600 h-2 rounded-full transition-all duration-300"
                :style="{ width: `${(currentStep / totalSteps) * 100}%` }"
              ></div>
            </div>
          </div>
          <div class="flex items-center space-x-2">
            <button
              v-if="canGoBack"
              @click="goBack"
              class="text-gray-500 hover:text-gray-700 text-sm font-medium"
            >
              Back
            </button>
            <button
              v-if="!hideSkip"
              @click="skipOnboarding"
              class="text-gray-400 hover:text-gray-600 text-sm"
            >
              Skip for now
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Content Area -->
    <div class="max-w-2xl mx-auto px-4 py-12">
      <slot />
    </div>

    <!-- Navigation Buttons -->
    <div class="fixed bottom-0 left-0 right-0 bg-white border-t py-4 px-4">
      <div class="max-w-4xl mx-auto flex justify-between items-center">
        <button
          v-if="canGoBack"
          @click="goBack"
          class="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
        >
          Back
        </button>
        <div v-else></div>

        <button
          v-if="canContinue"
          @click="goNext"
          class="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          {{ nextButtonText }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  currentStep: {
    type: Number,
    required: true
  },
  totalSteps: {
    type: Number,
    default: 4
  },
  canGoBack: {
    type: Boolean,
    default: true
  },
  canContinue: {
    type: Boolean,
    default: true
  },
  nextButtonText: {
    type: String,
    default: 'Continue'
  },
  hideSkip: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['back', 'next', 'skip'])

const goBack = () => emit('back')
const goNext = () => emit('next')
const skipOnboarding = () => emit('skip')
</script>
