import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Play, Users, Trophy, Target } from 'lucide-react'
import { collection, query, orderBy, limit, getDocs, doc, getDoc } from 'firebase/firestore'
import { db } from '../firebase'

function Dashboard({ user, onStartGame }) {
  const [difficulty, setDifficulty] = useState('medium')
  const [joinCode, setJoinCode] = useState('')
  const [leaderboard, setLeaderboard] = useState([])
  const [showLeaderboard, setShowLeaderboard] = useState(false)
  const [userStats, setUserStats] = useState(null)

  useEffect(() => {
    fetchLeaderboard()
    fetchUserStats()
  }, [user])

  const fetchUserStats = async () => {
    try {
      const userDoc = await getDoc(doc(db, 'users', user.uid))
      if (userDoc.exists()) {
        setUserStats(userDoc.data())
      }
    } catch (error) {
      console.error('Error fetching user stats:', error)
    }
  }

  const fetchLeaderboard = async () => {
    try {
      const q = query(
        collection(db, 'users'),
        orderBy('xp', 'desc'),
        limit(10)
      )
      const querySnapshot = await getDocs(q)
      const leaders = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
      setLeaderboard(leaders)
    } catch (error) {
      console.error('Error fetching leaderboard:', error)
    }
  }

  const handleCreateGame = () => {
    onStartGame('new-' + difficulty)
  }

  const handleJoinGame = () => {
    if (joinCode.trim()) {
      onStartGame(joinCode.trim())
    }
  }

  const difficultyColors = {
    easy: { bg: '#e6ffe6', border: '#58cc02', text: '#58cc02' },
    medium: { bg: '#fff4e6', border: '#ff9500', text: '#ff9500' },
    hard: { bg: '#ffe6e6', border: '#ff4b4b', text: '#ff4b4b' }
  }

  return (
    <div style={{ 
      maxWidth: '1200px', 
      margin: '0 auto', 
      padding: '0 20px'
    }}>
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-6"
      >
        <h1 style={{ 
          fontSize: '48px', 
          fontWeight: '800', 
          color: 'white',
          marginBottom: '16px',
          textShadow: '2px 2px 4px rgba(0,0,0,0.2)'
        }}>
          Ready to Play?
        </h1>
        <p style={{ 
          fontSize: '20px', 
          color: 'rgba(255,255,255,0.9)',
          textShadow: '1px 1px 2px rgba(0,0,0,0.2)'
        }}>
          Challenge yourself or play with a friend!
        </p>
      </motion.div>

      {/* Stats Banner */}
      {userStats && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="card mb-6"
          style={{
            display: 'flex',
            justifyContent: 'space-around',
            padding: '20px',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white'
          }}
        >
          <div className="text-center">
            <div style={{ fontSize: '32px', fontWeight: '800' }}>{userStats.level}</div>
            <div style={{ fontSize: '12px', opacity: 0.9 }}>NIVEL</div>
          </div>
          <div className="text-center">
            <div style={{ fontSize: '32px', fontWeight: '800' }}>{userStats.xp}</div>
            <div style={{ fontSize: '12px', opacity: 0.9 }}>XP</div>
          </div>
          <div className="text-center">
            <div style={{ fontSize: '32px', fontWeight: '800' }}>{userStats.streak}</div>
            <div style={{ fontSize: '12px', opacity: 0.9 }}>RACHA</div>
          </div>
          <div className="text-center">
            <div style={{ fontSize: '32px', fontWeight: '800' }}>{userStats.gamesWon}</div>
            <div style={{ fontSize: '12px', opacity: 0.9 }}>VICTORIAS</div>
          </div>
        </motion.div>
      )}

      {/* Main Actions */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: '24px',
        marginBottom: '32px'
      }}>
        {/* Create Game Card */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="card"
        >
          <div className="flex items-center gap-2 mb-4">
            <Play size={24} color="#58cc02" />
            <h2 style={{ fontSize: '24px', fontWeight: '700' }}>
              Crear Partida
            </h2>
          </div>

          <p style={{ color: '#777', marginBottom: '20px' }}>
            ¡Inicia un nuevo desafío de Sudoku e invita a un amigo!
          </p>

          {/* Difficulty Selector */}
          <div className="mb-4">
            <label style={{ 
              display: 'block', 
              marginBottom: '12px', 
              fontWeight: '600',
              fontSize: '14px',
              textTransform: 'uppercase',
              color: '#777'
            }}>
              Elige Dificultad
            </label>
            <div className="flex gap-2">
              {['easy', 'medium', 'hard'].map((level) => (
                <motion.button
                  key={level}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setDifficulty(level)}
                  style={{
                    flex: 1,
                    padding: '12px',
                    borderRadius: '8px',
                    border: difficulty === level 
                      ? `3px solid ${difficultyColors[level].border}` 
                      : '2px solid #e5e5e5',
                    background: difficulty === level 
                      ? difficultyColors[level].bg 
                      : 'white',
                    color: difficulty === level 
                      ? difficultyColors[level].text 
                      : '#777',
                    fontWeight: '700',
                    cursor: 'pointer',
                    textTransform: 'capitalize',
                    transition: 'all 0.2s'
                  }}
                >
                  {level === 'easy' ? 'Fácil' : level === 'medium' ? 'Medio' : 'Difícil'}
                </motion.button>
              ))}
            </div>
          </div>

          <button
            onClick={handleCreateGame}
            className="btn btn-primary"
            style={{ width: '100%' }}
          >
            Crear Sala de Juego
          </button>
        </motion.div>

        {/* Join Game Card */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="card"
        >
          <div className="flex items-center gap-2 mb-4">
            <Users size={24} color="#1cb0f6" />
            <h2 style={{ fontSize: '24px', fontWeight: '700' }}>
              Unirse a Partida
            </h2>
          </div>

          <p style={{ color: '#777', marginBottom: '20px' }}>
            ¿Tienes un código? ¡Únete a la sala de tu amigo!
          </p>

          <div className="mb-4">
            <label style={{ 
              display: 'block', 
              marginBottom: '12px', 
              fontWeight: '600',
              fontSize: '14px',
              textTransform: 'uppercase',
              color: '#777'
            }}>
              Código de Partida
            </label>
            <input
              type="text"
              value={joinCode}
              onChange={(e) => setJoinCode(e.target.value)}
              className="input"
              placeholder="Ingresa el código..."
              style={{ marginBottom: '16px' }}
            />
          </div>

          <button
            onClick={handleJoinGame}
            className="btn btn-secondary"
            style={{ width: '100%' }}
            disabled={!joinCode.trim()}
          >
            Unirse a la Sala
          </button>

          <div style={{
            marginTop: '16px',
            padding: '12px',
            background: '#f0f9ff',
            borderRadius: '8px',
            fontSize: '14px',
            color: '#0369a1'
          }}>
            💡 ¡Obtén el código del amigo que creó la sala!
          </div>
        </motion.div>
      </div>

      {/* Leaderboard Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="card"
      >
        <div 
          className="flex items-center justify-between mb-4"
          style={{ cursor: 'pointer' }}
          onClick={() => setShowLeaderboard(!showLeaderboard)}
        >
          <div className="flex items-center gap-2">
            <Trophy size={24} color="#fbbf24" />
            <h2 style={{ fontSize: '24px', fontWeight: '700' }}>
              Tabla de Posiciones
            </h2>
          </div>
          <motion.div
            animate={{ rotate: showLeaderboard ? 180 : 0 }}
            style={{ fontSize: '24px', color: '#777' }}
          >
            ▼
          </motion.div>
        </div>

        {showLeaderboard && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
          >
            {leaderboard.length === 0 ? (
              <p style={{ color: '#777', textAlign: 'center', padding: '20px' }}>
                Aún no hay jugadores. ¡Sé el primero!
              </p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {leaderboard.map((player, index) => (
                  <motion.div
                    key={player.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '16px',
                      background: index < 3 
                        ? 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)'
                        : '#f7f7f7',
                      borderRadius: '12px',
                      border: index < 3 ? '2px solid #fbbf24' : 'none'
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <div style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '50%',
                        background: index === 0 ? '#fbbf24' : index === 1 ? '#94a3b8' : index === 2 ? '#d97706' : '#e5e5e5',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: '700',
                        color: 'white'
                      }}>
                        {index + 1}
                      </div>
                      <div>
                        <div style={{ fontWeight: '700', fontSize: '16px' }}>
                          {player.username}
                        </div>
                        <div style={{ fontSize: '12px', color: '#777' }}>
                          Nivel {player.level} • {player.gamesWon} victorias
                        </div>
                      </div>
                    </div>
                    <div style={{
                      fontSize: '20px',
                      fontWeight: '700',
                      color: '#58cc02'
                    }}>
                      {player.xp} XP
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </motion.div>

      {/* Quick Stats */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        style={{
          marginTop: '32px',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '16px'
        }}
      >
        <div className="card text-center">
          <Target size={32} color="#58cc02" style={{ margin: '0 auto 8px' }} />
          <div style={{ fontSize: '14px', color: '#777', marginBottom: '4px' }}>
            Juega Diario
          </div>
          <div style={{ fontSize: '20px', fontWeight: '700' }}>
            ¡Construye Tu Racha! 🔥
          </div>
        </div>

        <div className="card text-center">
          <Users size={32} color="#1cb0f6" style={{ margin: '0 auto 8px' }} />
          <div style={{ fontSize: '14px', color: '#777', marginBottom: '4px' }}>
            En Equipo
          </div>
          <div style={{ fontSize: '20px', fontWeight: '700' }}>
            ¡Aprende Juntos! 🤝
          </div>
        </div>

        <div className="card text-center">
          <Trophy size={32} color="#fbbf24" style={{ margin: '0 auto 8px' }} />
          <div style={{ fontSize: '14px', color: '#777', marginBottom: '4px' }}>
            Compite
          </div>
          <div style={{ fontSize: '20px', fontWeight: '700' }}>
            ¡Escala Posiciones! 🏆
          </div>
        </div>
      </motion.div>
    </div>
  )
}

export default Dashboard
