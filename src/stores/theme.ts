import { ref } from 'vue'
import { defineStore } from 'pinia'

export const useThemeStore = defineStore('theme', () => {
  // Initialize from localStorage or default to light
  const isDarkMode = ref(localStorage.getItem('darkMode') === 'true')

  // Toggle between light and dark
  function toggleTheme() {
    isDarkMode.value = !isDarkMode.value
    applyTheme()
  }

  // Apply theme to document and store in localStorage
  function applyTheme() {
    document.documentElement.classList.toggle('dark-mode', isDarkMode.value)
    localStorage.setItem('darkMode', isDarkMode.value.toString())
  }

  // Apply theme on initial load
  applyTheme()

  return {
    isDarkMode,
    toggleTheme,
    applyTheme,
  }
})
