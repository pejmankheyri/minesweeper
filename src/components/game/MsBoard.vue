<script setup lang="ts">
import { gsap } from 'gsap'
import { computed, ref, watch, onMounted, onUnmounted } from 'vue'
import MsCell from './MsCell.vue'
import MsControls from './MsControls.vue'
import { useGameStore } from '@/stores/game'

const gameStore = useGameStore()

const msBoardRef = ref<HTMLElement | null>(null)
const previousDifficulty = ref(gameStore.difficulty)

// Create a CSS grid template based on the number of columns
const gridTemplateColumns = computed(() => {
  return `repeat(${gameStore.cols}, 1fr)`
})

// Reset the game board with animation
function resetGameWithAnimation() {
  if (msBoardRef.value) {
    gsap.to(msBoardRef.value, {
      scale: 0.95,
      opacity: 0.5,
      duration: 0.2,
      onComplete: () => {
        gameStore.initializeGridView()
        gsap.to(msBoardRef.value, {
          scale: 1,
          opacity: 1,
          duration: 0.3,
        })
      },
    })
  } else {
    gameStore.initializeGridView()
  }
}

// Setup resize listener
onMounted(() => {
  window.addEventListener('resize', gameStore.handleResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', gameStore.handleResize)
})

// Handle right-click for flagging cells (prevent context menu)
function handleRightClickAction(event: MouseEvent) {
  event.preventDefault()
}

// Watch for difficulty changes and animate transitions
watch(
  () => gameStore.difficulty,
  (newDifficulty, oldDifficulty) => {
    if (msBoardRef.value && oldDifficulty !== newDifficulty) {
      // Store the previous difficulty for direction-aware animation
      previousDifficulty.value = oldDifficulty

      // Define scaling direction based on relative board sizes
      const growingBoard = getSizeRank(newDifficulty) > getSizeRank(oldDifficulty)

      // First stage: shrink/fade out current board
      gsap.to(msBoardRef.value, {
        scale: growingBoard ? 0.8 : 1.2,
        opacity: 0.2,
        duration: 0.25,
        ease: 'power2.in',
      })
    }
  },
)

// Animation to show the new board after difficulty change
watch(
  () => [gameStore.rows, gameStore.cols],
  () => {
    if (msBoardRef.value) {
      // Second stage: expand/fade in the new board
      gsap.fromTo(
        msBoardRef.value,
        {
          scale:
            getSizeRank(gameStore.difficulty) > getSizeRank(previousDifficulty.value) ? 0.8 : 1.2,
          opacity: 0.2,
        },
        {
          scale: 1,
          opacity: 1,
          duration: 0.35,
          ease: 'power2.out',
          delay: 0.05, // Small delay for smoother transition
        },
      )
    }
  },
)

// Helper function to determine relative board size
function getSizeRank(diff: string): number {
  switch (diff) {
    case 'beginner':
      return 1
    case 'intermediate':
      return 2
    case 'expert':
      return 3
    case 'fullscreen':
      return 4
    default:
      return 2 // 'custom' defaults to intermediate rank
  }
}

// Animate board on game end
watch(
  () => gameStore.gameOver,
  (newValue) => {
    if (newValue && msBoardRef.value) {
      gsap.to(msBoardRef.value, {
        x: [-5, 5, -5, 5, -5, 5, 0] as unknown as gsap.TweenValue,
        duration: 0.4,
        ease: 'power2.inOut',
      })
    }
  },
)

watch(
  () => gameStore.gameWon,
  (newValue) => {
    if (newValue && msBoardRef.value) {
      gsap.to(msBoardRef.value, {
        scale: 1.05,
        duration: 0.3,
        yoyo: true,
        repeat: 1,
      })
    }
  },
)
</script>

<template>
  <div class="ms-game">
    <MsControls @reset="resetGameWithAnimation" />

    <div
      ref="msBoardRef"
      class="ms-board-container"
      @contextmenu="handleRightClickAction"
      :class="{
        'ms-game-over': gameStore.gameOver,
        'ms-game-won': gameStore.gameWon,
      }"
    >
      <div
        class="ms-board"
        :style="{
          gridTemplateColumns,
          maxWidth: `${gameStore.cols * 32}px`,
        }"
      >
        <template v-for="(row, y) in gameStore.grid" :key="y">
          <MsCell
            v-for="(cell, x) in row"
            :key="`${x}-${y}`"
            :cell="cell"
            @reveal="gameStore.revealCell(x, y)"
            @flag="gameStore.toggleFlag(x, y)"
            @chord-action="gameStore.chordAction(x, y)"
          />
        </template>
      </div>
    </div>
  </div>
</template>
