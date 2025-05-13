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

<style>
.theme-toggle {
  position: fixed;
  top: 20px;
  right: 20px;
  background-color: var(--ms-cell-bg);
  border: 2px outset var(--ms-cell-border);
  border-radius: 4px;
  width: 40px;
  height: 40px;
  font-size: 1.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background-color 0.2s;
  z-index: 100;
}

.theme-toggle:hover {
  background-color: var(--ms-cell-bg-hover);
}

.theme-toggle:active {
  border-style: inset;
}
</style>
