# 🎮 SudokuDuo - Firebase Edition

![Firebase](https://img.shields.io/badge/Firebase-FFCA28?style=for-the-badge&logo=firebase&logoColor=black)
![React](https://img.shields.io/badge/React-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)

Web app de Sudoku gamificada con estilo Duolingo, usando Firebase para multijugador en tiempo real.

## 🌟 Características

- ✅ **Juego multijugador en tiempo real** con Firestore
- ✅ **Autenticación** con Firebase Auth
- ✅ **Gamificación**: XP, niveles, rachas
- ✅ **Leaderboard global**
- ✅ **3 niveles de dificultad**
- ✅ **UI estilo Duolingo**
- ✅ **100% Gratis** (Firebase Spark Plan)
- ✅ **Responsive** para móvil y desktop

## 🚀 Demo

**URL de la App**: [Tu URL de Firebase aquí después del deploy]

## 📋 Requisitos

- Node.js 16+
- Cuenta de Google (para Firebase)
- Cuenta de GitHub (opcional)

## ⚡ Quick Start

### 1. Descargar el proyecto

Descarga todos los archivos de este repositorio.

### 2. Instalar dependencias

```bash
npm install
```

### 3. Configurar Firebase

**IMPORTANTE**: Debes configurar tu proyecto de Firebase antes de ejecutar.

1. Crea un proyecto en [Firebase Console](https://console.firebase.google.com)
2. Copia tu configuración de Firebase
3. Pégala en `src/firebase.js`

Ver [GUIA_DESPLIEGUE.md](GUIA_DESPLIEGUE.md) para instrucciones detalladas.

### 4. Ejecutar localmente

```bash
npm run dev
```

Abre http://localhost:5173

### 5. Desplegar a Firebase

```bash
npm run build
firebase deploy
```

## 📖 Documentación Completa

Lee [GUIA_DESPLIEGUE.md](GUIA_DESPLIEGUE.md) para:
- ✅ Configurar Firebase paso a paso
- ✅ Subir a GitHub
- ✅ Desplegar a producción
- ✅ Configurar Firestore
- ✅ Solución de problemas

## 🎮 Cómo Jugar

1. **Regístrate** con email y contraseña
2. **Crea una sala** eligiendo dificultad
3. **Comparte el código** con un amigo
4. **Juega en equipo** para resolver el Sudoku
5. **Gana XP** y sube de nivel

## 🏗️ Arquitectura

```
Frontend (React + Vite)
    ↓
Firebase Services:
  - Authentication (usuarios)
  - Firestore (base de datos en tiempo real)
  - Hosting (despliegue web)
```

### Diferencias vs versión Node.js:

| Característica | Versión Node.js | Versión Firebase |
|---|---|---|
| Backend | Express + Socket.io | Firestore + Auth |
| Base de datos | En memoria (Map) | Firestore (persistente) |
| Autenticación | JWT manual | Firebase Auth |
| Hosting | Render/Railway | Firebase Hosting |
| Costo | Gratis (con límites) | Gratis (más generoso) |
| Configuración | Más compleja | Más simple |
| Tiempo real | WebSockets | Firestore listeners |

## 📁 Estructura del Proyecto

```
sudoku-duo-firebase/
├── src/
│   ├── components/       # Componentes React
│   │   ├── Login.jsx     # Autenticación
│   │   ├── Dashboard.jsx # Menú principal
│   │   ├── Game.jsx      # Juego en tiempo real
│   │   └── Navbar.jsx    # Barra de navegación
│   ├── utils/
│   │   └── sudoku.js     # Generador de Sudoku
│   ├── firebase.js       # ⚠️ Configuración Firebase
│   ├── App.jsx           # Componente principal
│   └── main.jsx          # Entry point
├── firebase.json         # Config de Firebase
├── firestore.rules       # Reglas de seguridad
└── package.json
```

## 🔒 Seguridad

### Reglas de Firestore implementadas:

- ✅ Solo usuarios autenticados pueden acceder
- ✅ Los usuarios solo pueden modificar sus propios datos
- ✅ Los jugadores solo pueden actualizar sus partidas
- ✅ Validación server-side (Firestore Rules)

Ver `firestore.rules` para detalles.

## 🛠️ Tecnologías

- **Frontend**: React 18, Vite
- **Backend**: Firebase (Firestore, Auth, Hosting)
- **Animaciones**: Framer Motion
- **Iconos**: Lucide React
- **Efectos**: React Confetti
- **Estilos**: CSS + Gradientes

## 📊 Base de Datos (Firestore)

### Colecciones:

**users/**
```javascript
{
  username: string,
  email: string,
  level: number,
  xp: number,
  streak: number,
  gamesPlayed: number,
  gamesWon: number,
  lastPlayedDate: string
}
```

**games/**
```javascript
{
  id: string,
  difficulty: 'easy' | 'medium' | 'hard',
  puzzle: number[][],
  solution: number[][],
  currentBoard: number[][],
  players: Player[],
  status: 'waiting' | 'playing' | 'completed',
  moves: Move[]
}
```

## 🎯 Características Implementadas

### ✅ Versión Firebase Lite
- Autenticación de usuarios
- Juego multijugador en tiempo real
- Generación de Sudoku (3 dificultades)
- Sistema de gamificación
- Leaderboard global
- Persistencia de datos
- Actualización en tiempo real

### ❌ No Incluido (vs versión completa)
- Cloud Functions (requiere plan Blaze)
- Notificaciones push
- Analytics avanzado
- Modo offline

## 💰 Costos

**Firebase Spark Plan (Gratis)**:
- ✅ Hosting: 10 GB storage, 360 MB/día
- ✅ Firestore: 1 GB storage, 50K lecturas/día
- ✅ Authentication: Usuarios ilimitados

**Suficiente para**: ~1000 usuarios activos/mes

## 🐛 Troubleshooting

### La app no carga
```bash
# Verificar que Firebase esté configurado
cat src/firebase.js

# Reinstalar dependencias
npm install

# Rebuild
npm run build
```

### Error de autenticación
- Verifica que Email/Password esté activado en Firebase Console
- Revisa que la configuración en `src/firebase.js` sea correcta

### Firestore permission denied
- Verifica las reglas en Firebase Console > Firestore > Rules
- Asegúrate de estar autenticado

## 🤝 Contribuir

1. Fork el proyecto
2. Crea tu feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push al branch (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

MIT License - libre para usar en tus proyectos

## 🙏 Créditos

- Diseño inspirado en Duolingo
- Generador de Sudoku: Algoritmo backtracking
- Firebase: Google Cloud Platform

## 📞 Soporte

¿Problemas? Lee [GUIA_DESPLIEGUE.md](GUIA_DESPLIEGUE.md) o abre un issue en GitHub.

---

**Hecho con ❤️ usando Firebase + React**

¡Diviértete jugando Sudoku! 🎮
