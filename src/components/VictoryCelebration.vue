<script setup lang="ts">
import { useThemeStore } from '@/stores/theme'
import { useGameStore } from '@/stores/game'
import { computed } from 'vue'

const themeStore = useThemeStore()
const gameStore = useGameStore()

const isVisible = computed(() => themeStore.showCelebration)

const formattedTime = computed(() => {
  const mins = Math.floor(gameStore.elapsedTime / 60)
  const secs = gameStore.elapsedTime % 60
  return `${mins}:${secs.toString().padStart(2, '0')}`
})

const difficultyLabel = computed(() => {
  const diff = gameStore.difficulty
  return diff.charAt(0).toUpperCase() + diff.slice(1)
})

const achievement = computed(() => {
  const time = gameStore.elapsedTime
  if (gameStore.difficulty === 'expert' && time < 100) return 'Legendary!'
  if (time < themeStore.gameStats.bestTime) return 'New Record!'
  if (themeStore.gameStats.currentStreak > 3) return 'On Fire!'
  return 'Congratulations!'
})
</script>

<template>
  <transition name="celebration">
    <div v-if="isVisible" class="celebration-overlay">
      <div class="celebration-content">
        <h1 class="victory-title">{{ achievement }}</h1>

        <div class="stats">
          <p class="time">Time: {{ formattedTime }}</p>
          <p class="difficulty">Difficulty: {{ difficultyLabel }}</p>
          <p class="streak">Win Streak: {{ themeStore.gameStats.currentStreak }}</p>
        </div>

        <div class="medals" v-if="achievement !== 'Victory!'">
          <span class="medal">🏆</span>
        </div>

        <button class="continue-btn" @click="themeStore.showCelebration = false">Continue</button>
      </div>
    </div>
  </transition>
</template>

<style>
.celebration-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.celebration-content {
  background-color: var(--ms-board-bg);
  border: 3px solid var(--ms-board-border);
  border-radius: 8px;
  padding: 2rem;
  text-align: center;
  max-width: 400px;
  width: 90%;
  box-shadow: 0 0 20px 5px rgba(255, 215, 0, 0.3);
  animation: pulse 2s infinite;
}

.victory-title {
  font-size: 2.5rem;
  margin-bottom: 1.5rem;
  color: var(--color-text);
  text-shadow: 0 0 10px rgba(255, 215, 0, 0.5);
}

.stats {
  margin: 1.5rem 0;
  font-size: 1.2rem;
}

.stats p {
  margin: 0.5rem 0;
}

.medals {
  font-size: 3rem;
  margin: 1.5rem 0;
  animation: bounce 1s infinite alternate;
}

.medal {
  margin: 0 0.5rem;
}

.continue-btn {
  background-color: var(--ms-cell-bg);
  border: 2px outset var(--ms-cell-border);
  padding: 0.75rem 1.5rem;
  font-size: 1.1rem;
  cursor: pointer;
  border-radius: 4px;
  transition: all 0.2s;
}

.continue-btn:hover {
  background-color: var(--ms-cell-bg-hover);
  transform: scale(1.05);
}

@keyframes pulse {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.02);
  }
  100% {
    transform: scale(1);
  }
}

@keyframes bounce {
  0% {
    transform: translateY(0);
  }
  100% {
    transform: translateY(-10px);
  }
}

.celebration-enter-active,
.celebration-leave-active {
  transition: opacity 0.5s ease;
}

.celebration-enter-from,
.celebration-leave-to {
  opacity: 0;
}
</style>
