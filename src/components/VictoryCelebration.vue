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

type AchievementType = 'Legendary!' | 'New Record!' | 'On Fire!' | 'Congratulations!'

const achievement = computed<AchievementType>(() => {
  const time = gameStore.elapsedTime
  if (gameStore.difficulty === 'expert' && time < 100) return 'Legendary!'
  if (time < themeStore.gameStats.bestTime) return 'New Record!'
  if (themeStore.gameStats.currentStreak > 3) return 'On Fire!'
  return 'Congratulations!'
})

const isSpecialAchievement = computed(() => achievement.value !== 'Congratulations!')
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

        <div class="medals" v-if="isSpecialAchievement">
          <span class="medal">🏆</span>
        </div>

        <button class="continue-btn" @click="themeStore.showCelebration = false">Continue</button>
      </div>
    </div>
  </transition>
</template>
