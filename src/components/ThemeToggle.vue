<script setup lang="ts">
import { useThemeStore } from '@/stores/theme'

const themeStore = useThemeStore()
</script>

<template>
  <button
    class="theme-toggle"
    @click="themeStore.toggleTheme()"
    :aria-label="themeStore.isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'"
  >
    {{ themeStore.isDarkMode ? '☀️' : '🌙' }}
  </button>
</template>
