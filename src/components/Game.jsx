import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Confetti from 'react-confetti'
import { Copy, Users, Trophy, Clock, ArrowLeft, Star } from 'lucide-react'
import { 
  doc, 
  setDoc, 
  getDoc, 
  onSnapshot, 
  updateDoc, 
  arrayUnion,
  increment,
  serverTimestamp 
} from 'firebase/firestore'
import { db } from '../firebase'
import { SudokuGenerator } from '../utils/sudoku'

function Game({ gameId, user, onExit }) {
  const [game, setGame] = useState(null)
  const [selectedCell, setSelectedCell] = useState(null)
  const [error, setError] = useState('')
  const [waitingForPlayer, setWaitingForPlayer] = useState(true)
  const [showVictory, setShowVictory] = useState(false)
  const [recentMoves, setRecentMoves] = useState([])
  const [timer, setTimer] = useState(0)
  const timerRef = useRef(null)
  const unsubscribeRef = useRef(null)

  useEffect(() => {
    let actualGameId = gameId

    const initGame = async () => {
      try {
        if (gameId.startsWith('new-')) {
          // Crear nuevo juego
          const difficulty = gameId.split('-')[1]
          actualGameId = `game_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
          
          const { puzzle, solution } = SudokuGenerator.generate(difficulty)
          
          const newGame = {
            id: actualGameId,
            difficulty,
            puzzle,
            solution,
            currentBoard: puzzle.map(row => [...row]),
            players: [{
              id: user.uid,
              username: user.displayName || user.email,
              score: 0
            }],
            status: 'waiting',
            createdAt: serverTimestamp(),
            moves: [],
            startTime: null
          }

          await setDoc(doc(db, 'games', actualGameId), newGame)
        } else {
          // Unirse a juego existente
          actualGameId = gameId
          const gameDoc = await getDoc(doc(db, 'games', actualGameId))
          
          if (!gameDoc.exists()) {
            setError('Juego no encontrado')
            return
          }

          const gameData = gameDoc.data()
          
          if (gameData.players.length >= 2) {
            setError('La sala está llena')
            return
          }

          if (gameData.players.some(p => p.id === user.uid)) {
            setError('Ya estás en esta partida')
            return
          }

          // Agregar jugador
          await updateDoc(doc(db, 'games', actualGameId), {
            players: arrayUnion({
              id: user.uid,
              username: user.displayName || user.email,
              score: 0
            }),
            status: 'playing',
            startTime: serverTimestamp()
          })

          // Iniciar timer
          timerRef.current = setInterval(() => {
            setTimer(t => t + 1)
          }, 1000)
        }

        // Escuchar cambios en tiempo real
        unsubscribeRef.current = onSnapshot(doc(db, 'games', actualGameId), (snapshot) => {
          if (snapshot.exists()) {
            const gameData = snapshot.data()
            setGame(gameData)
            
            if (gameData.status === 'playing') {
              setWaitingForPlayer(false)
              if (!timerRef.current) {
                timerRef.current = setInterval(() => {
                  setTimer(t => t + 1)
                }, 1000)
              }
            }

            if (gameData.status === 'completed') {
              setShowVictory(true)
              if (timerRef.current) {
                clearInterval(timerRef.current)
              }
              updateUserStats(gameData)
            }

            if (gameData.moves) {
              setRecentMoves(gameData.moves.slice(-5))
            }
          }
        })

      } catch (err) {
        console.error('Error iniciando juego:', err)
        setError('Error al iniciar el juego')
      }
    }

    initGame()

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
      if (unsubscribeRef.current) {
        unsubscribeRef.current()
      }
    }
  }, [gameId, user])

  const updateUserStats = async (gameData) => {
    try {
      const userRef = doc(db, 'users', user.uid)
      const userDoc = await getDoc(userRef)
      
      if (userDoc.exists()) {
        const userData = userDoc.data()
        const player = gameData.players.find(p => p.id === user.uid)
        
        const today = new Date().toDateString()
        let newStreak = userData.streak || 0
        
        if (userData.lastPlayedDate !== today) {
          const yesterday = new Date(Date.now() - 86400000).toDateString()
          if (userData.lastPlayedDate === yesterday) {
            newStreak++
          } else {
            newStreak = 1
          }
        }

        const xpGained = 100 + (player?.score || 0)
        const newXp = (userData.xp || 0) + xpGained
        const newLevel = Math.floor(newXp / 500) + 1

        await updateDoc(userRef, {
          gamesPlayed: increment(1),
          gamesWon: increment(1),
          xp: newXp,
          level: newLevel,
          streak: newStreak,
          lastPlayedDate: today
        })
      }
    } catch (err) {
      console.error('Error actualizando stats:', err)
    }
  }

  const handleCellClick = (row, col) => {
    if (!game || game.status !== 'playing') return
    if (game.puzzle[row][col] !== 0) return
    
    setSelectedCell({ row, col })
  }

  const handleNumberClick = async (number) => {
    if (!selectedCell || !game) return
    
    const { row, col } = selectedCell
    const isCorrect = SudokuGenerator.validateMove(game.solution, row, col, number)
    
    if (isCorrect) {
      const newBoard = game.currentBoard.map(r => [...r])
      newBoard[row][col] = number

      const player = game.players.find(p => p.id === user.uid)
      const newPlayers = game.players.map(p => 
        p.id === user.uid ? { ...p, score: p.score + 10 } : p
      )

      const newMove = {
        playerId: user.uid,
        username: user.displayName || user.email,
        row,
        col,
        value: number,
        timestamp: Date.now()
      }

      // Verificar si está completo
      const isComplete = newBoard.every((r, ri) =>
        r.every((cell, ci) => cell === game.solution[ri][ci])
      )

      try {
        await updateDoc(doc(db, 'games', game.id), {
          currentBoard: newBoard,
          players: newPlayers,
          moves: arrayUnion(newMove),
          status: isComplete ? 'completed' : 'playing'
        })

        setSelectedCell(null)
      } catch (err) {
        console.error('Error haciendo movimiento:', err)
        setError('Error al hacer el movimiento')
      }
    } else {
      setError('¡Número incorrecto! Intenta de nuevo.')
      setTimeout(() => setError(''), 2000)
    }
  }

  const copyGameCode = () => {
    if (game) {
      navigator.clipboard.writeText(game.id)
      setError('¡Código copiado!')
      setTimeout(() => setError(''), 2000)
    }
  }

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  if (!game) {
    return (
      <div className="flex items-center justify-center" style={{ minHeight: '70vh' }}>
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          style={{
            width: '60px',
            height: '60px',
            border: '6px solid #e5e5e5',
            borderTop: '6px solid #58cc02',
            borderRadius: '50%'
          }}
        />
      </div>
    )
  }

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px' }}>
      {showVictory && <Confetti recycle={false} numberOfPieces={500} />}

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onExit}
          className="btn"
          style={{ background: '#e5e5e5', color: '#333', boxShadow: 'none' }}
        >
          <ArrowLeft size={18} style={{ marginRight: '8px', display: 'inline' }} />
          Salir
        </motion.button>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2" style={{
            background: 'white',
            padding: '8px 16px',
            borderRadius: '12px',
            border: '2px solid #e5e5e5'
          }}>
            <Clock size={20} color="#1cb0f6" />
            <span style={{ fontWeight: '700', fontSize: '18px' }}>
              {formatTime(timer)}
            </span>
          </div>

          <div className="flex items-center gap-2" style={{
            background: 'white',
            padding: '8px 16px',
            borderRadius: '12px',
            border: '2px solid #e5e5e5'
          }}>
            <Users size={20} color="#58cc02" />
            <span style={{ fontWeight: '700' }}>
              {game.players.length}/2
            </span>
          </div>
        </div>
      </div>

      {/* Waiting for player */}
      {waitingForPlayer && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card mb-6"
          style={{ textAlign: 'center' }}
        >
          <h2 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '16px' }}>
            Esperando al Jugador 2...
          </h2>
          <p style={{ color: '#777', marginBottom: '20px' }}>
            Comparte este código con un amigo:
          </p>
          <div className="flex items-center justify-center gap-2">
            <div style={{
              background: '#f7f7f7',
              padding: '16px 24px',
              borderRadius: '12px',
              border: '2px dashed #1cb0f6',
              fontSize: '24px',
              fontWeight: '700',
              letterSpacing: '2px',
              color: '#1cb0f6'
            }}>
              {game.id}
            </div>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={copyGameCode}
              className="btn btn-secondary"
            >
              <Copy size={20} />
            </motion.button>
          </div>
        </motion.div>
      )}

      {/* Error message */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            style={{
              background: error.includes('copiado') ? '#e6ffe6' : '#ffe6e6',
              color: error.includes('copiado') ? '#58cc02' : '#ff4b4b',
              padding: '12px 20px',
              borderRadius: '12px',
              marginBottom: '16px',
              textAlign: 'center',
              fontWeight: '600'
            }}
          >
            {error}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Victory Screen */}
      <AnimatePresence>
        {showVictory && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(0,0,0,0.8)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 1000
            }}
          >
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 0.6, repeat: Infinity }}
              className="card"
              style={{ maxWidth: '500px', textAlign: 'center' }}
            >
              <Trophy size={80} color="#fbbf24" style={{ margin: '0 auto 20px' }} />
              <h1 style={{ fontSize: '48px', fontWeight: '800', marginBottom: '16px' }}>
                🎉 ¡Victoria! 🎉
              </h1>
              <p style={{ fontSize: '20px', color: '#777', marginBottom: '24px' }}>
                ¡Puzzle completado en {formatTime(timer)}!
              </p>
              
              <div style={{
                background: '#f7f7f7',
                padding: '20px',
                borderRadius: '12px',
                marginBottom: '24px'
              }}>
                <h3 style={{ marginBottom: '16px', fontWeight: '700' }}>Puntuaciones Finales:</h3>
                {game.players.map((player, idx) => (
                  <div key={idx} className="flex items-center justify-between" style={{
                    padding: '12px',
                    background: 'white',
                    borderRadius: '8px',
                    marginBottom: '8px'
                  }}>
                    <span style={{ fontWeight: '600' }}>{player.username}</span>
                    <span style={{ color: '#58cc02', fontWeight: '700', fontSize: '18px' }}>
                      {player.score} pts
                    </span>
                  </div>
                ))}
              </div>

              <button
                onClick={onExit}
                className="btn btn-primary"
                style={{ width: '100%' }}
              >
                Volver al Inicio
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '24px' }}>
        {/* Sudoku Board */}
        <div className="card" style={{ padding: '32px' }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(9, 1fr)',
            gap: '0',
            background: '#333',
            padding: '2px',
            borderRadius: '8px',
            aspectRatio: '1/1',
            maxWidth: '540px',
            margin: '0 auto'
          }}>
            {game.currentBoard.map((row, rowIndex) => (
              row.map((cell, colIndex) => {
                const isOriginal = game.puzzle[rowIndex][colIndex] !== 0
                const isSelected = selectedCell?.row === rowIndex && selectedCell?.col === colIndex
                const isSameRow = selectedCell?.row === rowIndex
                const isSameCol = selectedCell?.col === colIndex
                const isSameBlock = selectedCell && 
                  Math.floor(selectedCell.row / 3) === Math.floor(rowIndex / 3) &&
                  Math.floor(selectedCell.col / 3) === Math.floor(colIndex / 3)
                
                return (
                  <motion.button
                    key={`${rowIndex}-${colIndex}`}
                    whileHover={{ scale: isOriginal ? 1 : 1.05 }}
                    whileTap={{ scale: isOriginal ? 1 : 0.95 }}
                    onClick={() => handleCellClick(rowIndex, colIndex)}
                    disabled={isOriginal || game.status !== 'playing'}
                    style={{
                      aspectRatio: '1/1',
                      border: 'none',
                      background: isSelected ? '#1cb0f6' : 
                                 (isSameRow || isSameCol || isSameBlock) ? '#e6f7ff' :
                                 'white',
                      color: isOriginal ? '#333' : '#1cb0f6',
                      fontSize: '24px',
                      fontWeight: isOriginal ? '800' : '700',
                      cursor: isOriginal ? 'default' : 'pointer',
                      transition: 'all 0.2s',
                      borderRight: (colIndex + 1) % 3 === 0 && colIndex < 8 ? '3px solid #333' : '1px solid #ddd',
                      borderBottom: (rowIndex + 1) % 3 === 0 && rowIndex < 8 ? '3px solid #333' : '1px solid #ddd'
                    }}
                  >
                    {cell !== 0 ? cell : ''}
                  </motion.button>
                )
              })
            ))}
          </div>

          {/* Number Selector */}
          {selectedCell && game.status === 'playing' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              style={{
                marginTop: '24px',
                display: 'grid',
                gridTemplateColumns: 'repeat(9, 1fr)',
                gap: '8px',
                maxWidth: '540px',
                margin: '24px auto 0'
              }}
            >
              {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
                <motion.button
                  key={num}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => handleNumberClick(num)}
                  className="btn btn-secondary"
                  style={{
                    padding: '16px',
                    fontSize: '20px',
                    fontWeight: '700'
                  }}
                >
                  {num}
                </motion.button>
              ))}
            </motion.div>
          )}
        </div>

        {/* Sidebar */}
        <div style={{ width: '280px' }}>
          {/* Players */}
          <div className="card mb-4">
            <h3 style={{ fontWeight: '700', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Users size={20} color="#58cc02" />
              Jugadores
            </h3>
            {game.players.map((player, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
                style={{
                  padding: '12px',
                  background: '#f7f7f7',
                  borderRadius: '8px',
                  marginBottom: '8px'
                }}
              >
                <div style={{ fontWeight: '600', marginBottom: '4px' }}>
                  {player.username}
                  {player.id === user.uid && ' (Tú)'}
                </div>
                <div className="flex items-center gap-2">
                  <Star size={14} color="#fbbf24" fill="#fbbf24" />
                  <span style={{ color: '#58cc02', fontWeight: '700' }}>
                    {player.score} pts
                  </span>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Recent Moves */}
          <div className="card">
            <h3 style={{ fontWeight: '700', marginBottom: '16px' }}>
              Movimientos Recientes
            </h3>
            {recentMoves.length === 0 ? (
              <p style={{ color: '#777', fontSize: '14px', textAlign: 'center' }}>
                Aún no hay movimientos
              </p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {recentMoves.slice().reverse().map((move, idx) => (
                  <motion.div
                    key={move.timestamp}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    style={{
                      padding: '8px 12px',
                      background: '#f7f7f7',
                      borderRadius: '6px',
                      fontSize: '14px'
                    }}
                  >
                    <span style={{ fontWeight: '600', color: '#1cb0f6' }}>
                      {move.username}
                    </span>
                    {' colocó '}
                    <span style={{ fontWeight: '700', color: '#58cc02' }}>
                      {move.value}
                    </span>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Game
