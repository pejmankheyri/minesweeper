<script setup lang="ts">
import { useGameStore, type GameDifficulty } from '@/stores/game'
import { ref, computed } from 'vue'
import MsTimer from './MsTimer.vue'
import MsCustomSettings from './MsCustomSettings.vue' // Import the new component

const gameStore = useGameStore()
const emit = defineEmits<{
  reset: []
}>()

const showCustomDialog = ref(false)

const gameStatus = computed(() => {
  if (gameStore.gameWon) return '😎'
  if (gameStore.gameOver) return '😵'
  if (gameStore.gameStarted) return '🙂'
  return '😊'
})

function resetGame() {
  emit('reset')
}

function changeDifficulty(difficulty: GameDifficulty) {
  if (difficulty === 'custom') {
    showCustomDialog.value = true
  } else {
    gameStore.setGameDifficulty(difficulty)
  }
}

function applyCustomSettings(rows: number, cols: number, mines: number) {
  gameStore.setCustomDifficulty(rows, cols, mines)
  showCustomDialog.value = false
}
</script>

<template>
  <div class="game-controls">
    <div class="game-info">
      <div class="mine-counter">💣 {{ gameStore.remainingMines }}</div>

      <button
        class="reset-button"
        @click="resetGame"
        :aria-label="
          gameStore.gameOver ? 'Game Over' : gameStore.gameWon ? 'You Won' : 'Reset Game'
        "
      >
        {{ gameStatus }}
      </button>

      <MsTimer />
    </div>

    <div class="difficulty-selector">
      <button
        v-for="diff in ['beginner', 'intermediate', 'expert', 'fullscreen', 'custom']"
        :key="diff"
        @click="changeDifficulty(diff as GameDifficulty)"
        :class="{ active: gameStore.difficulty === diff }"
        class="difficulty-button"
      >
        {{ diff === 'fullscreen' ? '📺' : diff }}
      </button>
    </div>

    <!-- Use the new custom settings component -->
    <MsCustomSettings
      :show="showCustomDialog"
      :initialRows="gameStore.rows"
      :initialCols="gameStore.cols"
      :initialMines="gameStore.totalMines"
      @close="showCustomDialog = false"
      @apply="applyCustomSettings"
    />
  </div>
</template>
