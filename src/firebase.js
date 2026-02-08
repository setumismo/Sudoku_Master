import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

// Tu configuración de Firebase (la obtendrás de Firebase Console)
// REEMPLAZA estos valores con los de tu proyecto
const firebaseConfig = {
  apiKey: "TU-API-KEY",
  authDomain: "TU-PROJECT-ID.firebaseapp.com",
  projectId: "TU-PROJECT-ID",
  storageBucket: "TU-PROJECT-ID.appspot.com",
  messagingSenderId: "TU-MESSAGING-SENDER-ID",
  appId: "TU-APP-ID"
}

// Inicializar Firebase
const app = initializeApp(firebaseConfig)

// Servicios de Firebase
export const auth = getAuth(app)
export const db = getFirestore(app)

export default app
