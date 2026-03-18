<script setup lang="ts">
// No props required for this footer component
</script>

<template>
  <footer class="py-8 text-center border-t border-neutral-800 mt-auto">
    <div class="flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-8 text-sm">
      <div class="text-neutral-500 font-serif italic">
        Powered by SoundLog
      </div>
      <a
        href="#upgrade"
        class="text-neutral-300 hover:text-white transition-colors duration-200 uppercase tracking-widest text-xs font-medium"
      >
        Upgrade to Pro
      </a>
    </div>
  </footer>
</template>
