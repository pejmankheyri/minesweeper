import { ref } from 'vue'
import { defineStore } from 'pinia'
import confetti from 'canvas-confetti'

export const useThemeStore = defineStore('theme', () => {
  // Initialize from localStorage or default to light
  const isDarkMode = ref(localStorage.getItem('darkMode') === 'true')
  const showCelebration = ref(false)
  const gameStats = ref({
    gamesWon: parseInt(localStorage.getItem('gamesWon') || '0'),
    bestTime: parseInt(localStorage.getItem('bestTime') || '999'),
    currentStreak: parseInt(localStorage.getItem('currentStreak') || '0'),
  })

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

  // Celebrate victory with confetti and stats update
  function celebrateVictory(time: number, difficulty: string) {
    // Update stats
    gameStats.value.gamesWon++
    gameStats.value.currentStreak++

    // Update best time if applicable
    if (time < gameStats.value.bestTime) {
      gameStats.value.bestTime = time
      localStorage.setItem('bestTime', time.toString())
    }

    // Save stats to localStorage
    localStorage.setItem('gamesWon', gameStats.value.gamesWon.toString())
    localStorage.setItem('currentStreak', gameStats.value.currentStreak.toString())

    // Show celebration
    showCelebration.value = true

    // Trigger confetti
    launchConfetti(isDarkMode.value)

    // Hide celebration after some time
    setTimeout(() => {
      showCelebration.value = false
    }, 5000)
  }

  // Reset streak when game is lost
  function resetStreak() {
    gameStats.value.currentStreak = 0
    localStorage.setItem('currentStreak', '0')
  }

  // Launch confetti with appropriate colors
  function launchConfetti(isDark: boolean) {
    const colors = isDark
      ? ['#6ebdff', '#98e28a', '#ff9898', '#d9a66c']
      : ['#0066ff', '#00cc00', '#ff6666', '#ff9933']

    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: colors,
      disableForReducedMotion: true,
    })

    // Multiple bursts for more excitement
    setTimeout(() => {
      confetti({
        particleCount: 50,
        angle: 60,
        spread: 55,
        origin: { x: 0, y: 0.6 },
        colors: colors,
      })
    }, 250)

    setTimeout(() => {
      confetti({
        particleCount: 50,
        angle: 120,
        spread: 55,
        origin: { x: 1, y: 0.6 },
        colors: colors,
      })
    }, 400)
  }

  // Apply theme on initial load
  applyTheme()

  return {
    isDarkMode,
    toggleTheme,
    applyTheme,
    showCelebration,
    gameStats,
    celebrateVictory,
    resetStreak,
  }
})
