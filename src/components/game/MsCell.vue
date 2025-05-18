<script setup lang="ts">
import { computed, ref } from 'vue'
import type { CellState } from '@/stores/game'

const props = defineProps<{
  cell: CellState
}>()

const emit = defineEmits<{
  reveal: []
  flag: []
  chordAction: []
}>()

// Handle cell click
const handleClickAction = () => {
  emit('reveal')
}

// Handle right click for flagging
const handleRightClickAction = (e: MouseEvent) => {
  e.preventDefault()
  emit('flag')
}

// Handle double-click (chord action)
const clickCount = ref(0)
const clickTimer = ref<number | null>(null)

const handleDoubleClickAction = () => {
  clickCount.value++

  if (clickCount.value === 1) {
    clickTimer.value = window.setTimeout(() => {
      clickCount.value = 0
      clickTimer.value = null
      // Single click after timeout
      handleClickAction()
    }, 200)
  } else if (clickCount.value === 2) {
    clearTimeout(clickTimer.value!)
    clickCount.value = 0
    clickTimer.value = null

    // Double click detected
    if (props.cell.revealed && !props.cell.isMine && props.cell.value > 0) {
      emit('chordAction')
    } else {
      // Fallback to regular click for non-numbered cells
      handleClickAction()
    }
  }
}

// Handle both left and right click via long press for mobile
let longPressTimer: ReturnType<typeof setTimeout> | null = null

const handleTouchStartAction = () => {
  longPressTimer = setTimeout(() => {
    emit('flag')
    longPressTimer = null
  }, 200)
}

const handleTouchEndAction = (e: TouchEvent) => {
  e.preventDefault()
  if (longPressTimer) {
    clearTimeout(longPressTimer)
    longPressTimer = null
    emit('reveal')
  }
}

// Determine the content to display in the cell
const cellContent = computed(() => {
  if (props.cell.flagged) return '🚩'
  if (!props.cell.revealed) return ''
  if (props.cell.isMine) return '💣'
  return props.cell.value || ''
})

// CSS classes for the cell
const cellClasses = computed(() => {
  return {
    revealed: props.cell.revealed,
    mine: props.cell.revealed && props.cell.isMine,
    flagged: props.cell.flagged,
    [`value-${props.cell.value}`]:
      props.cell.revealed && !props.cell.isMine && props.cell.value > 0,
  }
})
</script>

<template>
  <div
    class="cell"
    :class="cellClasses"
    @click="handleDoubleClickAction"
    @contextmenu="handleRightClickAction"
    @touchstart="handleTouchStartAction"
    @touchend="handleTouchEndAction"
  >
    {{ cellContent }}
  </div>
</template>
