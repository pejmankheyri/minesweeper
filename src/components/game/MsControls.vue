<script setup lang="ts">
import { useGameStore, type GameDifficulty } from '@/stores/game'
import { ref, computed } from 'vue'
import MsTimer from './MsTimer.vue'

const gameStore = useGameStore()
const emit = defineEmits<{
  reset: []
}>()

const showCustomDialog = ref(false)
const customRows = ref(gameStore.rows)
const customCols = ref(gameStore.cols)
const customMines = ref(gameStore.totalMines)

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

function applyCustomSettings() {
  gameStore.setCustomDifficulty(customRows.value, customCols.value, customMines.value)
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

    <!-- Custom settings dialog -->
    <div v-if="showCustomDialog" class="custom-dialog">
      <div class="custom-dialog-content">
        <h3>Custom Settings</h3>

        <div class="custom-setting">
          <label for="rows">Rows:</label>
          <input id="rows" type="number" min="5" max="30" v-model.number="customRows" />
        </div>

        <div class="custom-setting">
          <label for="cols">Columns:</label>
          <input id="cols" type="number" min="5" max="30" v-model.number="customCols" />
        </div>

        <div class="custom-setting">
          <label for="mines">Mines:</label>
          <input
            id="mines"
            type="number"
            min="1"
            :max="customRows * customCols - 1"
            v-model.number="customMines"
          />
        </div>

        <div class="dialog-actions">
          <button @click="applyCustomSettings" class="apply-button">Apply</button>
          <button @click="showCustomDialog = false" class="cancel-button">Cancel</button>
        </div>
      </div>
    </div>
  </div>
</template>
