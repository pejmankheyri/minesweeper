import { ref, computed } from 'vue'
import { defineStore } from 'pinia'

export type CellState = {
  revealed: boolean
  isMine: boolean
  flagged: boolean
  value: number // Number of near mines (0-8)
  x: number
  y: number
}

export type GameDifficulty = 'beginner' | 'intermediate' | 'expert' | 'custom' | 'fullscreen'

export const difficultySettings = {
  beginner: { rows: 9, cols: 9, mines: 10 },
  intermediate: { rows: 16, cols: 16, mines: 40 },
  expert: { rows: 16, cols: 30, mines: 99 },
  custom: { rows: 16, cols: 16, mines: 40 }, // Default custom settings
  fullscreen: { rows: 0, cols: 0, mines: 0 }, // These will be calculated dynamically
}

export const useGameStore = defineStore('game', () => {
  const grid = ref<CellState[][]>([])
  const gameStarted = ref(false)
  const gameOver = ref(false)
  const gameWon = ref(false)
  const flagsPlaced = ref(0)
  const difficulty = ref<GameDifficulty>('beginner')
  const rows = ref(difficultySettings.beginner.rows)
  const cols = ref(difficultySettings.beginner.cols)
  const totalMines = ref(difficultySettings.beginner.mines)
  const elapsedTime = ref(0)
  const timerInterval = ref<number | null>(null)
  const firstClick = ref(true)

  // Computed properties
  const remainingMines = computed(() => totalMines.value - flagsPlaced.value)
  const isGameActive = computed(() => gameStarted.value && !gameOver.value && !gameWon.value)

  // Create a new game board
  function initializeGridView() {
    const newGrid: CellState[][] = []

    for (let y = 0; y < rows.value; y++) {
      const row: CellState[] = []
      for (let x = 0; x < cols.value; x++) {
        row.push({
          revealed: false,
          isMine: false,
          flagged: false,
          value: 0,
          x,
          y,
        })
      }
      newGrid.push(row)
    }

    grid.value = newGrid
    gameStarted.value = false
    gameOver.value = false
    gameWon.value = false
    flagsPlaced.value = 0
    elapsedTime.value = 0
    firstClick.value = true

    if (timerInterval.value) {
      clearInterval(timerInterval.value)
      timerInterval.value = null
    }
  }

  // Place mines on the grid (avoiding the first clicked cell)
  function placeMines(clickedX: number, clickedY: number) {
    let minesPlaced = 0

    while (minesPlaced < totalMines.value) {
      const x = Math.floor(Math.random() * cols.value)
      const y = Math.floor(Math.random() * rows.value)

      // Don't place a mine on the first clicked cell or where a mine already exists
      if ((x !== clickedX || y !== clickedY) && !grid.value[y][x].isMine) {
        grid.value[y][x].isMine = true
        minesPlaced++
      }
    }

    // Calculate values for cells (number of adjacent mines)
    calculateCellValues()
  }

  // Calculate the number of adjacent mines for each cell
  function calculateCellValues() {
    for (let y = 0; y < rows.value; y++) {
      for (let x = 0; x < cols.value; x++) {
        if (!grid.value[y][x].isMine) {
          let count = 0

          // Check all 8 surrounding cells
          for (let dy = -1; dy <= 1; dy++) {
            for (let dx = -1; dx <= 1; dx++) {
              if (dx === 0 && dy === 0) continue

              const nx = x + dx
              const ny = y + dy

              if (nx >= 0 && nx < cols.value && ny >= 0 && ny < rows.value) {
                if (grid.value[ny][nx].isMine) count++
              }
            }
          }

          grid.value[y][x].value = count
        }
      }
    }
  }

  // Start the game timer
  function startTimer() {
    if (!timerInterval.value) {
      gameStarted.value = true
      timerInterval.value = setInterval(() => {
        elapsedTime.value++
      }, 1000) as unknown as number
    }
  }

  // Stop the game timer
  function stopTimer() {
    if (timerInterval.value) {
      clearInterval(timerInterval.value)
      timerInterval.value = null
    }
  }

  // Handle cell click
  function revealCell(x: number, y: number) {
    if (gameOver.value || gameWon.value) return
    if (grid.value[y][x].flagged || grid.value[y][x].revealed) return

    // First click handling - generate mines after first click
    if (firstClick.value) {
      placeMines(x, y)
      startTimer()
      firstClick.value = false
    }

    // If clicked on a mine, game over!
    if (grid.value[y][x].isMine) {
      grid.value[y][x].revealed = true
      gameOver.value = true
      revealAllMines()
      stopTimer()
      return
    }

    // Reveal the cell
    revealCellRecursive(x, y)

    // Check if the player has won
    checkWinCondition()
  }

  // Recursively reveal empty cells
  function revealCellRecursive(x: number, y: number) {
    const cell = grid.value[y][x]
    if (cell.revealed || cell.flagged) return

    cell.revealed = true

    // If this is an empty cell (value 0), reveal all surrounding cells
    if (cell.value === 0) {
      for (let dy = -1; dy <= 1; dy++) {
        for (let dx = -1; dx <= 1; dx++) {
          if (dx === 0 && dy === 0) continue

          const nx = x + dx
          const ny = y + dy

          if (nx >= 0 && nx < cols.value && ny >= 0 && ny < rows.value) {
            revealCellRecursive(nx, ny)
          }
        }
      }
    }
  }

  // Toggle flag on a cell
  function toggleFlag(x: number, y: number) {
    if (gameOver.value || gameWon.value || grid.value[y][x].revealed) return

    const cell = grid.value[y][x]

    if (cell.flagged) {
      cell.flagged = false
      flagsPlaced.value--
    } else if (flagsPlaced.value < totalMines.value) {
      cell.flagged = true
      flagsPlaced.value++
    }
  }

  // Reveal all mines when the game is over
  function revealAllMines() {
    for (let y = 0; y < rows.value; y++) {
      for (let x = 0; x < cols.value; x++) {
        if (grid.value[y][x].isMine) {
          grid.value[y][x].revealed = true
        }
      }
    }
  }

  // Check if the player has won
  function checkWinCondition() {
    // Count unrevealed cells
    let unrevealedCount = 0

    for (let y = 0; y < rows.value; y++) {
      for (let x = 0; x < cols.value; x++) {
        if (!grid.value[y][x].revealed) {
          unrevealedCount++
        }
      }
    }

    // If unrevealed cells equals total mines, player has won
    if (unrevealedCount === totalMines.value) {
      gameWon.value = true
      stopTimer()

      // Flag all remaining mines
      for (let y = 0; y < rows.value; y++) {
        for (let x = 0; x < cols.value; x++) {
          if (grid.value[y][x].isMine && !grid.value[y][x].flagged) {
            grid.value[y][x].flagged = true
            flagsPlaced.value++
          }
        }
      }
    }
  }

  // Change game difficulty
  function setGameDifficulty(newDifficulty: GameDifficulty) {
    difficulty.value = newDifficulty

    if (newDifficulty === 'fullscreen') {
      calculateFullscreenSize()
      rows.value = difficultySettings.fullscreen.rows
      cols.value = difficultySettings.fullscreen.cols
      totalMines.value = difficultySettings.fullscreen.mines
    } else if (newDifficulty !== 'custom') {
      rows.value = difficultySettings[newDifficulty].rows
      cols.value = difficultySettings[newDifficulty].cols
      totalMines.value = difficultySettings[newDifficulty].mines
    }

    initializeGridView()
  }

  // Set custom difficulty settings
  function setCustomDifficulty(customRows: number, customCols: number, customMines: number) {
    // Ensure values are within reasonable limits
    rows.value = Math.min(Math.max(customRows, 5), 30)
    cols.value = Math.min(Math.max(customCols, 5), 30)

    // Ensure mines value is valid (between 1 and rows*cols-1)
    const maxMines = rows.value * cols.value - 1
    totalMines.value = Math.min(Math.max(customMines, 1), maxMines)

    difficultySettings.custom = {
      rows: rows.value,
      cols: cols.value,
      mines: totalMines.value,
    }

    difficulty.value = 'custom'
    initializeGridView()
  }

  // Chord action - reveal adjacent cells if correct number of flags are placed
  function chordAction(x: number, y: number) {
    if (!gameStarted.value || gameOver.value || gameWon.value) return

    const cell = grid.value[y][x]

    // Only work on revealed numbered cells
    if (!cell.revealed || cell.isMine || cell.value === 0) return

    // Count adjacent flags
    let flagCount = 0
    const cellsToReveal = []

    // Check all 8 surrounding cells
    for (let dy = -1; dy <= 1; dy++) {
      for (let dx = -1; dx <= 1; dx++) {
        if (dx === 0 && dy === 0) continue

        const nx = x + dx
        const ny = y + dy

        // Check if coordinates are valid
        if (nx >= 0 && nx < cols.value && ny >= 0 && ny < rows.value) {
          if (grid.value[ny][nx].flagged) {
            flagCount++
          } else if (!grid.value[ny][nx].revealed) {
            cellsToReveal.push({ x: nx, y: ny })
          }
        }
      }
    }

    // If the number of adjacent flags equals the cell's value, reveal adjacent cells
    if (flagCount === cell.value) {
      for (const { x: nx, y: ny } of cellsToReveal) {
        // Use the existing revealCell function
        revealCell(nx, ny)

        // If game ended during revealing, stop the process
        if (gameOver.value || gameWon.value) break
      }
    }
  }

  // Handle window resize for fullscreen mode
  function handleResize() {
    if (difficulty.value === 'fullscreen') {
      const previousMines = difficultySettings.fullscreen.mines
      calculateFullscreenSize()

      // Only reinitialize if the grid size changed significantly
      if (
        rows.value !== difficultySettings.fullscreen.rows ||
        cols.value !== difficultySettings.fullscreen.cols ||
        Math.abs(totalMines.value - previousMines) > 5
      ) {
        rows.value = difficultySettings.fullscreen.rows
        cols.value = difficultySettings.fullscreen.cols
        totalMines.value = difficultySettings.fullscreen.mines
        initializeGridView()
      }
    }
  }

  // Calculate grid size based on screen dimensions
  function calculateFullscreenSize() {
    // Get window dimensions (accounting for padding/margins)
    const availableHeight = window.innerHeight - 200 // Account for header, controls, etc.
    const availableWidth = window.innerWidth - 40 // Account for padding

    // Calculate how many cells can fit (cell size is approximately 32px with margins)
    const cellSize = 32

    const calculatedRows = Math.floor(availableHeight / cellSize)
    const calculatedCols = Math.floor(availableWidth / cellSize)

    // Ensure minimum size and maximum reasonable size
    const fullscreenRows = Math.min(Math.max(calculatedRows, 10), 40)
    const fullscreenCols = Math.min(Math.max(calculatedCols, 10), 60)

    // Calculate appropriate number of mines (approximately 15% of cells)
    const totalCells = fullscreenRows * fullscreenCols
    const fullscreenMines = Math.floor(totalCells * 0.15)

    // Update the fullscreen settings
    difficultySettings.fullscreen = {
      rows: fullscreenRows,
      cols: fullscreenCols,
      mines: fullscreenMines,
    }
  }

  // Initialize the game
  initializeGridView()

  return {
    grid,
    gameStarted,
    gameOver,
    gameWon,
    difficulty,
    rows,
    cols,
    totalMines,
    elapsedTime,
    flagsPlaced,
    remainingMines,
    isGameActive,
    initializeGridView,
    revealCell,
    handleResize,
    toggleFlag,
    setGameDifficulty,
    setCustomDifficulty,
    chordAction,
  }
})
