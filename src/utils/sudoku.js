// Generador de Sudoku (funciona en el navegador)
export class SudokuGenerator {
  static generate(difficulty = 'medium') {
    const base = 3
    const side = base * base
    
    // Generar tablero completo válido
    const board = this.generateCompleteBoard()
    
    // Remover números según dificultad
    const cellsToRemove = {
      easy: 35,
      medium: 45,
      hard: 55
    }[difficulty] || 45
    
    return this.removeNumbers(board, cellsToRemove)
  }
  
  static generateCompleteBoard() {
    const board = Array(9).fill(null).map(() => Array(9).fill(0))
    this.fillBoard(board)
    return board
  }
  
  static fillBoard(board, row = 0, col = 0) {
    if (row === 9) return true
    if (col === 9) return this.fillBoard(board, row + 1, 0)
    
    const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9].sort(() => Math.random() - 0.5)
    
    for (let num of numbers) {
      if (this.isValid(board, row, col, num)) {
        board[row][col] = num
        if (this.fillBoard(board, row, col + 1)) return true
        board[row][col] = 0
      }
    }
    return false
  }
  
  static isValid(board, row, col, num) {
    // Verificar fila
    for (let x = 0; x < 9; x++) {
      if (board[row][x] === num) return false
    }
    
    // Verificar columna
    for (let x = 0; x < 9; x++) {
      if (board[x][col] === num) return false
    }
    
    // Verificar cuadro 3x3
    const startRow = row - row % 3
    const startCol = col - col % 3
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        if (board[i + startRow][j + startCol] === num) return false
      }
    }
    
    return true
  }
  
  static removeNumbers(board, count) {
    const puzzle = board.map(row => [...row])
    const solution = board.map(row => [...row])
    
    let removed = 0
    while (removed < count) {
      const row = Math.floor(Math.random() * 9)
      const col = Math.floor(Math.random() * 9)
      
      if (puzzle[row][col] !== 0) {
        puzzle[row][col] = 0
        removed++
      }
    }
    
    return { puzzle, solution }
  }
  
  static validateMove(solution, row, col, value) {
    return solution[row][col] === value
  }
}
