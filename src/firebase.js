import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'
import { getAnalytics } from 'firebase/analytics'

// Tu configuración de Firebase
const firebaseConfig = {
  apiKey: "AIzaSyDfM_e8ixa7EhvgFJgiMWmLV6bi6ET_zdE",
  authDomain: "sudokumaster-cfec3.firebaseapp.com",
  projectId: "sudokumaster-cfec3",
  storageBucket: "sudokumaster-cfec3.firebasestorage.app",
  messagingSenderId: "818536673292",
  appId: "1:818536673292:web:56b0d43ccb9c825f68fe29",
  measurementId: "G-FEMREKGJ3J"
}

// Inicializar Firebase
const app = initializeApp(firebaseConfig)

// Servicios de Firebase
export const auth = getAuth(app)
export const db = getFirestore(app)
export const analytics = getAnalytics(app)

export default app
