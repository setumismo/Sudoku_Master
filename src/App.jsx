import { useState, useEffect } from 'react'
import { onAuthStateChanged, signOut } from 'firebase/auth'
import { auth } from './firebase'
import Login from './components/Login'
import Dashboard from './components/Dashboard'
import Game from './components/Game'
import Navbar from './components/Navbar'

function App() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [currentView, setCurrentView] = useState('dashboard')
  const [gameId, setGameId] = useState(null)

  useEffect(() => {
    // Escuchar cambios de autenticación
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user)
      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  const handleLogin = (user) => {
    setUser(user)
  }

  const handleLogout = async () => {
    try {
      await signOut(auth)
      setUser(null)
      setCurrentView('dashboard')
    } catch (error) {
      console.error('Error al cerrar sesión:', error)
    }
  }

  const startGame = (id) => {
    setGameId(id)
    setCurrentView('game')
  }

  const backToDashboard = () => {
    setGameId(null)
    setCurrentView('dashboard')
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center" style={{ minHeight: '100vh' }}>
        <div style={{
          width: '60px',
          height: '60px',
          border: '6px solid #e5e5e5',
          borderTop: '6px solid #58cc02',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }} />
      </div>
    )
  }

  if (!user) {
    return <Login onLogin={handleLogin} />
  }

  return (
    <div style={{ minHeight: '100vh', paddingBottom: '20px' }}>
      <Navbar user={user} onLogout={handleLogout} onNavigate={backToDashboard} />
      
      {currentView === 'dashboard' && (
        <Dashboard user={user} onStartGame={startGame} />
      )}
      
      {currentView === 'game' && gameId && (
        <Game 
          gameId={gameId} 
          user={user}
          onExit={backToDashboard}
        />
      )}
    </div>
  )
}

export default App
