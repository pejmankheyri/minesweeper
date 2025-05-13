<script setup lang="ts">
import { ref, computed, watch } from 'vue'

const props = defineProps<{
  show: boolean
  initialRows: number
  initialCols: number
  initialMines: number
}>()

const emit = defineEmits<{
  close: []
  apply: [rows: number, cols: number, mines: number]
}>()

const rows = ref(props.initialRows)
const cols = ref(props.initialCols)
const mines = ref(props.initialMines)

// Calculate maximum allowed mines and percentage
const maxMines = computed(() => Math.max(rows.value * cols.value - 1, 1))
const minePercentage = computed(() => Math.round((mines.value / (rows.value * cols.value)) * 100))

// Ensure mines value stays valid when rows/cols change
watch([rows, cols], () => {
  if (mines.value > maxMines.value) {
    mines.value = maxMines.value
  }
})

function applySettings() {
  emit('apply', rows.value, cols.value, mines.value)
}

function handleClose() {
  emit('close')
}

// Preset difficulty configurations
function applyPreset(preset: string) {
  switch (preset) {
    case 'beginner':
      rows.value = 9
      cols.value = 9
      mines.value = 10
      break
    case 'intermediate':
      rows.value = 16
      cols.value = 16
      mines.value = 40
      break
    case 'expert':
      rows.value = 16
      cols.value = 30
      mines.value = 99
      break
  }
}
</script>

<template>
  <Transition name="dialog">
    <div v-if="show" class="custom-settings-overlay" @click.self="handleClose">
      <div class="custom-settings-panel">
        <button class="close-button" @click="handleClose">×</button>
        <h2 class="settings-title">Custom Game Settings</h2>

        <div class="settings-content">
          <div class="setting-group">
            <div class="setting-row">
              <label for="rows">Rows:</label>
              <div class="control-with-value">
                <input
                  type="range"
                  id="rows"
                  v-model.number="rows"
                  min="5"
                  max="30"
                  class="slider"
                />
                <input type="number" v-model.number="rows" min="5" max="30" class="number-input" />
              </div>
            </div>

            <div class="setting-row">
              <label for="cols">Columns:</label>
              <div class="control-with-value">
                <input
                  type="range"
                  id="cols"
                  v-model.number="cols"
                  min="5"
                  max="30"
                  class="slider"
                />
                <input type="number" v-model.number="cols" min="5" max="30" class="number-input" />
              </div>
            </div>

            <div class="setting-row">
              <label for="mines">
                Mines:
                <span class="mine-percentage">{{ minePercentage }}%</span>
              </label>
              <div class="control-with-value">
                <input
                  type="range"
                  id="mines"
                  v-model.number="mines"
                  min="1"
                  :max="maxMines"
                  class="slider"
                />
                <input
                  type="number"
                  v-model.number="mines"
                  min="1"
                  :max="maxMines"
                  class="number-input"
                />
              </div>
            </div>
          </div>

          <div class="presets">
            <h3>Quick Presets</h3>
            <div class="preset-buttons">
              <button @click="applyPreset('beginner')" class="preset-button">
                <span class="preset-icon">🔰</span>
                <span>Beginner</span>
              </button>
              <button @click="applyPreset('intermediate')" class="preset-button">
                <span class="preset-icon">⚙️</span>
                <span>Intermediate</span>
              </button>
              <button @click="applyPreset('expert')" class="preset-button">
                <span class="preset-icon">⭐</span>
                <span>Expert</span>
              </button>
            </div>
          </div>

          <div class="board-preview">
            <div class="preview-container">
              <!-- Visual indicator for scaled preview -->
              <div v-if="rows > 15 || cols > 15" class="preview-scale-indicator">
                <div class="scale-box full"></div>
                <div class="scale-arrow">→</div>
                <div class="scale-box scaled"></div>
              </div>

              <div
                class="preview-grid"
                :style="{
                  'grid-template-columns': `repeat(${Math.min(cols, 15)}, 6px)`,
                  'grid-template-rows': `repeat(${Math.min(rows, 15)}, 6px)`,
                  'aspect-ratio': `${cols} / ${rows}`,
                }"
              >
                <!-- Preview cells -->
                <div
                  v-for="i in Math.min(rows, 15) * Math.min(cols, 15)"
                  :key="i"
                  class="preview-cell"
                ></div>
              </div>
            </div>

            <div class="preview-text">
              {{ rows }}×{{ cols }} board with {{ mines }} mines
              <span v-if="rows > 15 || cols > 15" class="preview-note">
                (preview shows scaled representation)
              </span>
            </div>
          </div>
        </div>

        <div class="dialog-actions">
          <button @click="handleClose" class="cancel-button">Cancel</button>
          <button @click="applySettings" class="apply-button">Apply Settings</button>
        </div>
      </div>
    </div>
  </Transition>
</template>
