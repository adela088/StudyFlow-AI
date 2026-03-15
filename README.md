# 📚 StudyFlow AI

![HTML](https://img.shields.io/badge/HTML5-orange?style=for-the-badge&logo=html5)
![CSS](https://img.shields.io/badge/CSS3-blue?style=for-the-badge&logo=css3)
![JavaScript](https://img.shields.io/badge/JavaScript-ES6-yellow?style=for-the-badge&logo=javascript)
![Firebase](https://img.shields.io/badge/Firebase-FFCA28?style=for-the-badge&logo=firebase&logoColor=black)
![Estado](https://img.shields.io/badge/Estado-En%20desarrollo-blue?style=for-the-badge)
![Plataforma](https://img.shields.io/badge/Plataforma-Web-lightgrey?style=for-the-badge)

## 📖 Descripción

> **StudyFlow AI** es una aplicación web de organización académica con asistencia inteligente, desarrollada con **HTML, CSS y JavaScript Vanilla** con backend en **Firebase**. Permite a los estudiantes gestionar sus materias, horarios, objetivos y analizar su productividad en tiempo real.

---

## ✨ Características principales

- 📊 Dashboard con métricas de productividad en tiempo real
- 📅 Horario semanal con organización automática por IA
- 📚 Gestión de materias con predicción de carga académica
- 🎯 Seguimiento de objetivos y tareas con prioridades
- 📈 Estadísticas y mapa de calor de actividad semanal
- ⚡ Modo Concentración con temporizador Pomodoro
- 🤖 Asistente IA conversacional con contexto académico
- ⚙️ Configuración de perfil, tema visual y preferencias
- 🌗 Modo claro / oscuro + colores de acento personalizables
- 🔐 Autenticación con Firebase (Email, Google, GitHub)
- ☁️ Sincronización en tiempo real con Firebase Realtime Database
- 📥 Exportación de datos en CSV y JSON

---

## 🖥️ Tecnologías utilizadas

- **HTML5**
- **CSS3**
- **JavaScript ES6 (Vanilla)**
- **Firebase Authentication**
- **Firebase Realtime Database**
- **Google Fonts** (Plus Jakarta Sans + Space Mono)

---

## ▶️ Cómo ejecutar el proyecto

### 🔹 Opción 1 – Ejecutar localmente

> 📌 Requiere tener configurado un proyecto en Firebase

1. Clona el repositorio:
```bash
git clone https://github.com/adela088/StudyFlow-AI.git
```

2. Entra al proyecto:
```bash
cd StudyFlow-AI
```

3. Configura Firebase:
```bash
cp js/firebase-config.example.js js/firebase-config.js
```

4. Edita `js/firebase-config.js` con tus credenciales de Firebase Console

5. Ejecuta con Live Server (VS Code) o cualquier servidor local:
```text
login.html
```

> ⚠️ No abrir directamente con `file://` — los módulos ES6 requieren servidor local

### 🔹 Opción 2 – Configuración Firebase

Consulta la guía completa de configuración en:

📄 **[FIREBASE_SETUP.md](./FIREBASE_SETUP.md)**

---

## 🔐 Variables de entorno

Copia `js/firebase-config.example.js` → `js/firebase-config.js` y completa:

| Variable | Descripción |
|----------|-------------|
| `apiKey` | API Key de Firebase |
| `authDomain` | Dominio de autenticación |
| `databaseURL` | URL de Realtime Database |
| `projectId` | ID del proyecto |
| `storageBucket` | Bucket de almacenamiento |
| `messagingSenderId` | ID del remitente |
| `appId` | ID de la aplicación |

> ⚠️ El archivo `firebase-config.js` está en `.gitignore` — nunca se sube al repositorio

---

## 👀 Vista previa

### 📊 Dashboard
![Dashboard](https://raw.githubusercontent.com/adela088/StudyFlow-AI/main/assets/dashboard.png)

### 📚 Materias
![Materias](https://raw.githubusercontent.com/adela088/StudyFlow-AI/main/assets/materias.png)

### 📅 Horario
![Horario](https://raw.githubusercontent.com/adela088/StudyFlow-AI/main/assets/horario.png)

### ⚙️ Configuración
![Configuración](https://raw.githubusercontent.com/adela088/StudyFlow-AI/main/assets/configuracion.png)

---

## 📁 Estructura del proyecto

```
StudyFlow-AI/
├── index.html
├── login.html
├── css/
│   ├── main.css
│   ├── sidebar.css
│   ├── login.css
│   └── settings.css
├── js/
│   ├── firebase-config.example.js
│   ├── firebase.js
│   ├── state.js
│   ├── utils.js
│   ├── navigation.js
│   ├── db-sync.js
│   ├── dashboard.js
│   ├── schedule.js
│   ├── subjects.js
│   ├── objectives.js
│   ├── stats.js
│   ├── settings.js
│   ├── chat.js
│   ├── focus.js
│   └── modals.js
├── .gitignore
├── README.md
└── FIREBASE_SETUP.md
```

---

## 👩‍💻 Autoría

Proyecto desarrollado por:

**Andrea De la Ossa**  
🎓 Estudiante de Ingeniería de Sistemas           
💻 Desarrollo Frontend (HTML, CSS, JavaScript)              
☁️ Integración con Firebase                                                    
🎯 Interfaces gráficas y herramientas web           
🌱 En constante aprendizaje         
