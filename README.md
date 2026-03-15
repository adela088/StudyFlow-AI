# StudyFlow AI 📚

Aplicación web de organización académica con asistencia inteligente.

## Características

- 📊 Dashboard con métricas de productividad en tiempo real
- 📅 Horario semanal con organización automática por IA
- 📚 Gestión de materias con predicción de carga académica
- 🎯 Seguimiento de objetivos y tareas
- 📈 Estadísticas y mapa de calor de actividad
- ⚡ Modo Concentración (Pomodoro)
- 🤖 Asistente IA conversacional
- ⚙️ Configuración de perfil, tema y preferencias
- 🔐 Autenticación con Firebase (Email, Google, GitHub)
- ☁️ Base de datos en tiempo real con Firebase

## Tecnologías

- HTML5 / CSS3 / JavaScript (Vanilla)
- Firebase Authentication
- Firebase Realtime Database
- Google Fonts (Plus Jakarta Sans + Space Mono)

## Configuración

### 1. Clonar el repositorio

```bash
git clone https://github.com/adela088/StudyFlow-AI.git
cd studyflow-ai
```

### 2. Configurar Firebase

```bash
cp js/firebase-config.example.js js/firebase-config.js
```

Edita `js/firebase-config.js` con tus credenciales de Firebase Console.

### 3. Configurar Firebase Console

- Activa **Authentication** → Email/Contraseña + Google + GitHub
- Crea una **Realtime Database** en modo test
- Aplica las reglas de seguridad del archivo `FIREBASE_SETUP.md`

### 4. Correr localmente

```bash
# Con Live Server (VS Code)
# Clic derecho en index.html → Open with Live Server

# Con Python
python3 -m http.server 3000

# Con Node.js
npx serve .
```

Abre `http://localhost:3000/login.html`

## Estructura del proyecto

```
studyflow/
├── index.html              # App principal
├── login.html              # Pantalla de autenticación
├── css/
│   ├── main.css            # Estilos globales
│   ├── sidebar.css         # Navegación lateral
│   ├── login.css           # Estilos de login
│   └── settings.css        # Estilos de configuración
├── js/
│   ├── firebase-config.js  # ⚠️ No subir a Git
│   ├── firebase-config.example.js  # Plantilla
│   ├── firebase.js         # Servicios Firebase
│   ├── state.js            # Estado global
│   ├── utils.js            # Utilidades
│   ├── navigation.js       # Enrutador SPA
│   ├── db-sync.js          # Sincronización Firebase
│   ├── dashboard.js        # Página Dashboard
│   ├── schedule.js         # Página Horario
│   ├── subjects.js         # Página Materias
│   ├── objectives.js       # Página Objetivos
│   ├── stats.js            # Página Estadísticas
│   ├── settings.js         # Página Configuración
│   ├── chat.js             # Asistente IA
│   ├── focus.js            # Modo Concentración
│   └── modals.js           # Control de modales
└── FIREBASE_SETUP.md       # Guía de configuración
```

## Variables de entorno

Copia `js/firebase-config.example.js` a `js/firebase-config.js` y completa:

| Variable | Descripción |
|----------|-------------|
| `apiKey` | API Key de Firebase |
| `authDomain` | Dominio de autenticación |
| `databaseURL` | URL de Realtime Database |
| `projectId` | ID del proyecto |
| `storageBucket` | Bucket de almacenamiento |
| `messagingSenderId` | ID del remitente |
| `appId` | ID de la aplicación |

## Licencia

MIT
