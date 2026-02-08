import { useState } from 'react'
import { motion } from 'framer-motion'
import { LogIn, UserPlus } from 'lucide-react'
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  updateProfile 
} from 'firebase/auth'
import { doc, setDoc, serverTimestamp } from 'firebase/firestore'
import { auth, db } from '../firebase'

function Login({ onLogin }) {
  const [isLogin, setIsLogin] = useState(true)
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: ''
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      if (isLogin) {
        // Login con Firebase
        const userCredential = await signInWithEmailAndPassword(
          auth, 
          formData.email, 
          formData.password
        )
        onLogin(userCredential.user)
      } else {
        // Registro con Firebase
        if (formData.password.length < 6) {
          throw new Error('La contraseña debe tener al menos 6 caracteres')
        }

        const userCredential = await createUserWithEmailAndPassword(
          auth,
          formData.email,
          formData.password
        )

        const user = userCredential.user

        // Actualizar perfil con username
        await updateProfile(user, {
          displayName: formData.username
        })

        // Crear documento de usuario en Firestore
        await setDoc(doc(db, 'users', user.uid), {
          username: formData.username,
          email: formData.email,
          createdAt: serverTimestamp(),
          level: 1,
          xp: 0,
          streak: 0,
          gamesPlayed: 0,
          gamesWon: 0,
          lastPlayedDate: null
        })

        onLogin(user)
      }
    } catch (err) {
      console.error('Error de autenticación:', err)
      setError(err.message || 'Error de autenticación')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  return (
    <div className="flex items-center justify-center" style={{ minHeight: '100vh', padding: '20px' }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card"
        style={{ maxWidth: '440px', width: '100%' }}
      >
        {/* Logo/Title */}
        <div className="text-center mb-6">
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200 }}
          >
            <h1 style={{ 
              fontSize: '48px', 
              fontWeight: '800', 
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              marginBottom: '8px'
            }}>
              SudokuDuo
            </h1>
          </motion.div>
          <p style={{ color: '#777', fontSize: '16px' }}>
            Play together, learn together 🎮
          </p>
        </div>

        {/* Tab switcher */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => {
              setIsLogin(true)
              setError('')
            }}
            className="btn"
            style={{
              flex: 1,
              background: isLogin ? '#1cb0f6' : '#e5e5e5',
              color: isLogin ? 'white' : '#999',
              boxShadow: isLogin ? '0 4px 0 rgba(0, 0, 0, 0.2)' : 'none'
            }}
          >
            <LogIn size={18} style={{ display: 'inline', marginRight: '8px' }} />
            Login
          </button>
          <button
            onClick={() => {
              setIsLogin(false)
              setError('')
            }}
            className="btn"
            style={{
              flex: 1,
              background: !isLogin ? '#1cb0f6' : '#e5e5e5',
              color: !isLogin ? 'white' : '#999',
              boxShadow: !isLogin ? '0 4px 0 rgba(0, 0, 0, 0.2)' : 'none'
            }}
          >
            <UserPlus size={18} style={{ display: 'inline', marginRight: '8px' }} />
            Register
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          {!isLogin && (
            <div className="mb-4">
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>
                Username
              </label>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                className="input"
                placeholder="Choose a cool username"
                required={!isLogin}
              />
            </div>
          )}

          <div className="mb-4">
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>
              Email
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="input"
              placeholder="your@email.com"
              required
            />
          </div>

          <div className="mb-4">
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>
              Password
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="input"
              placeholder="••••••••"
              required
              minLength={6}
            />
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              style={{
                background: '#fee',
                color: '#c33',
                padding: '12px',
                borderRadius: '8px',
                marginBottom: '16px',
                fontSize: '14px'
              }}
            >
              {error}
            </motion.div>
          )}

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%' }}
            disabled={loading}
          >
            {loading ? 'Cargando...' : (isLogin ? 'Iniciar Sesión' : 'Crear Cuenta')}
          </button>
        </form>

        <div className="mt-4 text-center" style={{ color: '#777', fontSize: '14px' }}>
          {isLogin ? "¿No tienes cuenta? " : "¿Ya tienes cuenta? "}
          <button
            onClick={() => {
              setIsLogin(!isLogin)
              setError('')
            }}
            style={{
              background: 'none',
              border: 'none',
              color: '#1cb0f6',
              fontWeight: '600',
              cursor: 'pointer',
              textDecoration: 'underline'
            }}
          >
            {isLogin ? 'Regístrate' : 'Inicia sesión'}
          </button>
        </div>
      </motion.div>
    </div>
  )
}

export default Login
