<script setup lang="ts">
import { useGameStore } from '@/stores/game'
import { computed } from 'vue'

const gameStore = useGameStore()

const formattedTime = computed(() => {
  return gameStore.elapsedTime.toString().padStart(3, '0')
})
</script>

<template>
  <div class="timer">
    {{ formattedTime }}
  </div>
</template>
