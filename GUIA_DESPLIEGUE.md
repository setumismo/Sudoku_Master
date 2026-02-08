# 🚀 GUÍA COMPLETA DE DESPLIEGUE - SudokuDuo Firebase

## 📋 Índice
1. [Preparar archivos para GitHub](#1-preparar-archivos-para-github)
2. [Subir a GitHub](#2-subir-a-github)
3. [Crear proyecto en Firebase](#3-crear-proyecto-en-firebase)
4. [Configurar Firebase en tu código](#4-configurar-firebase-en-tu-código)
5. [Configurar Firestore Database](#5-configurar-firestore-database)
6. [Configurar Authentication](#6-configurar-authentication)
7. [Desplegar la aplicación](#7-desplegar-la-aplicación)
8. [Probar tu aplicación](#8-probar-tu-aplicación)

---

## 1. Preparar Archivos para GitHub

### Estructura del proyecto:

```
sudoku-duo-firebase/
├── .gitignore
├── README.md
├── package.json
├── firebase.json
├── firestore.rules
├── vite.config.js
├── index.html
├── src/
│   ├── firebase.js          ⚠️ IMPORTANTE: Configurar aquí
│   ├── main.jsx
│   ├── App.jsx
│   ├── index.css
│   ├── utils/
│   │   └── sudoku.js
│   └── components/
│       ├── Login.jsx
│       ├── Navbar.jsx
│       ├── Dashboard.jsx
│       └── Game.jsx
```

### ✅ Archivos listos para descargar

Todos los archivos están listos arriba. Descárgalos y organízalos según la estructura.

---

## 2. Subir a GitHub

### Opción A: Desde GitHub.com (Web - MÁS FÁCIL)

1. **Ir a GitHub.com**
   - Inicia sesión en tu cuenta
   - Click en el botón **"+"** (arriba derecha)
   - Selecciona **"New repository"**

2. **Crear el repositorio**
   - Repository name: `sudoku-duo` (o el nombre que prefieras)
   - Descripción: "Gamified Sudoku app with Firebase"
   - Público o Privado (tu elección)
   - ✅ **NO** marcar "Add a README file"
   - Click **"Create repository"**

3. **Subir archivos**
   - En la página del repo nuevo, click **"uploading an existing file"**
   - Arrastra TODOS los archivos y carpetas
   - Commit message: "Initial commit: SudokuDuo Firebase"
   - Click **"Commit changes"**

### Opción B: Desde Terminal (Avanzado)

```bash
# En la carpeta donde descargaste los archivos
git init
git add .
git commit -m "Initial commit: SudokuDuo Firebase"
git branch -M main
git remote add origin https://github.com/TU-USUARIO/sudoku-duo.git
git push -u origin main
```

---

## 3. Crear Proyecto en Firebase

### Paso a paso:

1. **Ir a Firebase Console**
   - Abre https://console.firebase.google.com
   - Inicia sesión con tu cuenta de Google

2. **Crear nuevo proyecto**
   - Click en **"Agregar proyecto"** o **"Add project"**
   - Nombre del proyecto: `sudoku-duo` (o el que prefieras)
   - Click **"Continuar"**

3. **Google Analytics (Opcional)**
   - Puedes activarlo o desactivarlo
   - Si lo activas, selecciona tu cuenta de Analytics
   - Click **"Crear proyecto"**

4. **Esperar**
   - Firebase creará tu proyecto (toma 30-60 segundos)
   - Click **"Continuar"** cuando termine

---

## 4. Configurar Firebase en tu Código

### Paso 1: Obtener configuración de Firebase

1. En Firebase Console, estando en tu proyecto:
   - Click en el ícono **⚙️** (Settings) junto a "Project Overview"
   - Selecciona **"Project settings"**

2. Scroll hacia abajo hasta **"Your apps"**
   - Click en el ícono **</>** (Web)
   - App nickname: `sudoku-duo-web`
   - ✅ **NO** marcar "Firebase Hosting"
   - Click **"Register app"**

3. **Copiar la configuración**
   - Aparecerá un código con `firebaseConfig`
   - Se ve así:

```javascript
const firebaseConfig = {
  apiKey: "AIza...",
  authDomain: "sudoku-duo-xxxxx.firebaseapp.com",
  projectId: "sudoku-duo-xxxxx",
  storageBucket: "sudoku-duo-xxxxx.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef123456"
};
```

### Paso 2: Actualizar src/firebase.js

1. **Abre el archivo `src/firebase.js`**

2. **REEMPLAZA** esta sección:

```javascript
// ANTES (placeholder):
const firebaseConfig = {
  apiKey: "TU-API-KEY",
  authDomain: "TU-PROJECT-ID.firebaseapp.com",
  // ...
}
```

**POR** la configuración que copiaste de Firebase Console:

```javascript
// DESPUÉS (tu configuración real):
const firebaseConfig = {
  apiKey: "AIza...",  // Tu API Key real
  authDomain: "sudoku-duo-xxxxx.firebaseapp.com",  // Tu dominio real
  projectId: "sudoku-duo-xxxxx",  // Tu project ID real
  storageBucket: "sudoku-duo-xxxxx.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef123456"
};
```

3. **Guarda el archivo**

4. **Sube los cambios a GitHub**:
   - Opción Web: Edita `src/firebase.js` directamente en GitHub
   - Opción Terminal:
   ```bash
   git add src/firebase.js
   git commit -m "Add Firebase configuration"
   git push
   ```

---

## 5. Configurar Firestore Database

### Crear la base de datos:

1. **En Firebase Console**, en el menú lateral izquierdo:
   - Click en **"Firestore Database"**
   - Click en **"Create database"**

2. **Modo de base de datos**:
   - Selecciona **"Start in production mode"** ⚠️ (las reglas las subiremos después)
   - Click **"Next"**

3. **Ubicación**:
   - Selecciona la región más cercana a ti:
     - **España**: `europe-west1` (Bélgica) o `europe-west3` (Frankfurt)
     - **Latinoamérica**: `us-central1` o `southamerica-east1` (São Paulo)
   - Click **"Enable"**

4. **Esperar**:
   - Firestore se creará (20-30 segundos)

### Configurar reglas de seguridad:

1. **En Firestore Database**, click en la pestaña **"Rules"**

2. **Reemplaza TODO** el contenido con:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Reglas para usuarios
    match /users/{userId} {
      // Cualquiera puede leer perfiles (para leaderboard)
      allow read: if request.auth != null;
      
      // Solo el dueño puede escribir su propio perfil
      allow write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Reglas para juegos
    match /games/{gameId} {
      // Usuarios autenticados pueden leer juegos
      allow read: if request.auth != null;
      
      // Usuarios autenticados pueden crear juegos
      allow create: if request.auth != null;
      
      // Solo jugadores del juego pueden actualizar
      allow update: if request.auth != null && 
                      request.auth.uid in resource.data.players[].id;
      
      // Solo el creador puede eliminar
      allow delete: if request.auth != null && 
                      request.auth.uid == resource.data.players[0].id;
    }
  }
}
```

3. **Click en "Publish"**

---

## 6. Configurar Authentication

### Activar Email/Password:

1. **En Firebase Console**, en el menú lateral:
   - Click en **"Authentication"**
   - Click en **"Get started"**

2. **En la pestaña "Sign-in method"**:
   - Click en **"Email/Password"**
   - ✅ Activa el toggle de **"Email/Password"**
   - ❌ NO actives "Email link (passwordless sign-in)"
   - Click **"Save"**

### ✅ Listo! Authentication configurado

---

## 7. Desplegar la Aplicación

### Opción A: Desde tu Computadora (Terminal)

#### 1. Instalar Firebase CLI

```bash
# Instalar Firebase CLI globalmente
npm install -g firebase-tools

# Verificar instalación
firebase --version
```

#### 2. Login en Firebase

```bash
firebase login
```

- Se abrirá tu navegador
- Inicia sesión con tu cuenta de Google
- Autoriza Firebase CLI

#### 3. Inicializar Firebase en tu proyecto

```bash
# En la carpeta de tu proyecto
cd sudoku-duo-firebase

# Inicializar
firebase init
```

**Responde así:**:

```
? Which Firebase features? 
  ◯ Realtime Database
  ◉ Firestore         (SPACE para seleccionar)
  ◉ Hosting           (SPACE para seleccionar)
  ◯ Storage
  ◯ Functions

? Please select an option: 
  ❯ Use an existing project    (ENTER)

? Select a default Firebase project:
  ❯ sudoku-duo (sudoku-duo-xxxxx)    (ENTER - tu proyecto)

? What file should be used for Firestore Rules? 
  ❯ firestore.rules    (ENTER - ya existe)

? File firestore.rules already exists. Do you want to overwrite?
  ❯ No    (ENTER - mantener el tuyo)

? What do you want to use as your public directory? 
  ❯ dist    (ESCRIBE: dist, luego ENTER)

? Configure as a single-page app (rewrite all urls to /index.html)? 
  ❯ Yes    (ENTER)

? Set up automatic builds and deploys with GitHub? 
  ❯ No    (ENTER - lo haremos manual)
```

#### 4. Build y Deploy

```bash
# Instalar dependencias
npm install

# Compilar el proyecto
npm run build

# Desplegar a Firebase
firebase deploy
```

#### 5. ✅ ¡Listo!

Firebase te dará una URL:
```
✔  Deploy complete!

Project Console: https://console.firebase.google.com/project/sudoku-duo-xxxxx
Hosting URL: https://sudoku-duo-xxxxx.web.app
```

### Opción B: Desde GitHub Actions (Auto-deploy)

Si prefieres que se despliegue automáticamente cada vez que hagas push a GitHub:

1. En el paso de `firebase init`, responde **Yes** a GitHub Actions

2. Firebase creará automáticamente los workflows

3. Cada push a `main` desplegará automáticamente

---

## 8. Probar tu Aplicación

### 1. Abrir la URL

- Abre la Hosting URL que te dio Firebase
- Ejemplo: `https://sudoku-duo-xxxxx.web.app`

### 2. Crear cuenta

- Click en "Register"
- Ingresa:
  - Username: `test_user`
  - Email: `test@ejemplo.com`
  - Password: `123456`
- Click "Crear Cuenta"

### 3. Probar funcionalidades

✅ **Dashboard**: Deberías ver tus stats (nivel 1, 0 XP, etc.)
✅ **Crear partida**: Elige dificultad y crea una sala
✅ **Código de sala**: Copia el código
✅ **Multijugador**: Abre en otra ventana (incógnito) y únete con el código
✅ **Jugar**: Completa el Sudoku entre los dos jugadores
✅ **Leaderboard**: Verifica que apareces en la tabla

---

## 🔧 Comandos Útiles

```bash
# Ver logs
firebase deploy

# Solo hosting
firebase deploy --only hosting

# Solo reglas de Firestore
firebase deploy --only firestore:rules

# Correr localmente antes de deploy
npm run dev

# Build para producción
npm run build

# Ver info del proyecto
firebase projects:list

# Cambiar de proyecto
firebase use otro-proyecto
```

---

## 🐛 Solución de Problemas

### Error: "Firebase config not found"
- Verifica que copiaste correctamente la configuración en `src/firebase.js`

### Error: "Permission denied" en Firestore
- Revisa las reglas en Firestore Database > Rules
- Asegúrate de estar autenticado

### Error: "Module not found"
```bash
# Reinstalar dependencias
rm -rf node_modules package-lock.json
npm install
```

### La app no carga después del deploy
```bash
# Limpiar caché y rebuild
npm run build
firebase deploy --only hosting
```

### Error de autenticación
- Verifica que Email/Password esté activado en Authentication
- Revisa la consola del navegador (F12) para errores

---

## 📊 Monitoreo

### Ver usuarios registrados:
- Firebase Console > Authentication > Users

### Ver datos de Firestore:
- Firebase Console > Firestore Database > Data

### Ver analytics de hosting:
- Firebase Console > Hosting > Dashboard

---

## 🔒 Seguridad

### ⚠️ IMPORTANTE:

1. **Firestore Rules**: Ya están configuradas para permitir:
   - Solo usuarios autenticados pueden leer/escribir
   - Los usuarios solo pueden modificar sus propios datos
   - Los jugadores solo pueden actualizar sus propias partidas

2. **No expongas datos sensibles** en el código

3. **Monitorea el uso** en Firebase Console para evitar costos inesperados

---

## 💰 Límites Gratuitos de Firebase

**Spark Plan (Gratis)**:
- ✅ **Firestore**: 1 GB almacenamiento, 50K lecturas/día
- ✅ **Authentication**: Usuarios ilimitados
- ✅ **Hosting**: 10 GB almacenamiento, 360 MB/día bandwidth

**Suficiente para**:
- ~1000 usuarios activos al mes
- ~500 partidas al día

---

## 🎉 ¡Felicidades!

Tu app SudokuDuo está ahora:
- ✅ En GitHub
- ✅ Desplegada en Firebase
- ✅ Accesible desde cualquier navegador
- ✅ Con base de datos en tiempo real
- ✅ Con autenticación de usuarios

**URL de tu app**: https://sudoku-duo-xxxxx.web.app

Compártela con tus amigos y ¡a jugar! 🎮

---

## 📞 Recursos Adicionales

- [Firebase Documentation](https://firebase.google.com/docs)
- [Firestore Guide](https://firebase.google.com/docs/firestore)
- [Firebase Hosting](https://firebase.google.com/docs/hosting)
- [GitHub Repository](#) (tu repo)

---

**Creado con ❤️ usando Firebase + React + Vite**
