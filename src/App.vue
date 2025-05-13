<script setup lang="ts">
import MsBoard from './components/game/MsBoard.vue'
import ThemeToggle from './components/ThemeToggle.vue'
</script>

<template>
  <div class="app">
    <ThemeToggle />
    <main>
      <MsBoard />
    </main>
  </div>
</template>
