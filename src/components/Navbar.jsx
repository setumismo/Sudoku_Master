import { motion } from 'framer-motion'
import { LogOut, Trophy, Flame, Star } from 'lucide-react'
import { useState, useEffect } from 'react'

function Navbar({ user, onLogout, onNavigate }) {
  const [stats, setStats] = useState(null)

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/stats', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      const data = await response.json()
      setStats(data)
    } catch (error) {
      console.error('Failed to fetch stats:', error)
    }
  }

  return (
    <nav style={{
      background: 'white',
      padding: '16px 24px',
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
      marginBottom: '24px'
    }}>
      <div style={{ 
        maxWidth: '1200px', 
        margin: '0 auto',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '16px'
      }}>
        {/* Logo */}
        <motion.div
          whileHover={{ scale: 1.05 }}
          onClick={onNavigate}
          style={{ cursor: 'pointer' }}
        >
          <h2 style={{ 
            fontSize: '24px', 
            fontWeight: '800',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>
            SudokuDuo
          </h2>
        </motion.div>

        {/* Stats */}
        {stats && (
          <div className="flex gap-4" style={{ alignItems: 'center' }}>
            {/* Streak */}
            <motion.div
              whileHover={{ scale: 1.1 }}
              className="flex items-center gap-2"
              style={{
                background: '#fff4e6',
                padding: '8px 16px',
                borderRadius: '12px',
                border: '2px solid #ff9500'
              }}
            >
              <Flame size={20} color="#ff9500" />
              <div>
                <div style={{ fontSize: '18px', fontWeight: '700', color: '#ff9500' }}>
                  {stats.streak}
                </div>
                <div style={{ fontSize: '10px', color: '#ff9500', textTransform: 'uppercase' }}>
                  Day Streak
                </div>
              </div>
            </motion.div>

            {/* Level */}
            <motion.div
              whileHover={{ scale: 1.1 }}
              className="flex items-center gap-2"
              style={{
                background: '#e6f7ff',
                padding: '8px 16px',
                borderRadius: '12px',
                border: '2px solid #1cb0f6'
              }}
            >
              <Star size={20} color="#1cb0f6" fill="#1cb0f6" />
              <div>
                <div style={{ fontSize: '18px', fontWeight: '700', color: '#1cb0f6' }}>
                  {stats.level}
                </div>
                <div style={{ fontSize: '10px', color: '#1cb0f6', textTransform: 'uppercase' }}>
                  Level
                </div>
              </div>
            </motion.div>

            {/* XP */}
            <motion.div
              whileHover={{ scale: 1.1 }}
              className="flex items-center gap-2"
              style={{
                background: '#e6ffe6',
                padding: '8px 16px',
                borderRadius: '12px',
                border: '2px solid #58cc02'
              }}
            >
              <Trophy size={20} color="#58cc02" />
              <div>
                <div style={{ fontSize: '18px', fontWeight: '700', color: '#58cc02' }}>
                  {stats.xp}
                </div>
                <div style={{ fontSize: '10px', color: '#58cc02', textTransform: 'uppercase' }}>
                  XP
                </div>
              </div>
            </motion.div>
          </div>
        )}

        {/* User */}
        <div className="flex items-center gap-4">
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontWeight: '700', fontSize: '16px' }}>
              {user?.username}
            </div>
            <div style={{ fontSize: '12px', color: '#777' }}>
              {user?.email}
            </div>
          </div>
          
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={onLogout}
            style={{
              background: '#ff4b4b',
              color: 'white',
              border: 'none',
              padding: '10px',
              borderRadius: '50%',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <LogOut size={20} />
          </motion.button>
        </div>
      </div>
    </nav>
  )
}

export default Navbar
