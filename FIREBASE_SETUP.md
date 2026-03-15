# 🔥 Guía de Configuración — Firebase + StudyFlow AI

## Paso 1 — Crear el proyecto en Firebase

1. Ve a **https://console.firebase.google.com**
2. Haz clic en **"Agregar proyecto"**
3. Nombre: `studyflow-ai`
4. Desactiva Google Analytics (opcional)
5. Clic en **"Crear proyecto"**

---

## Paso 2 — Registrar la app Web

1. En la pantalla principal del proyecto, haz clic en el ícono **`</>`** (Web)
2. Nombre de la app: `StudyFlow Web`
3. Clic en **"Registrar app"**
4. Copia el objeto `firebaseConfig` que aparece, se ve así:

```js
const firebaseConfig = {
  apiKey:            "AIzaSy...",
  authDomain:        "studyflow-ai.firebaseapp.com",
  databaseURL:       "https://studyflow-ai-default-rtdb.firebaseio.com",
  projectId:         "studyflow-ai",
  storageBucket:     "studyflow-ai.appspot.com",
  messagingSenderId: "123456789",
  appId:             "1:123456789:web:abc123"
};
```

5. Pega esos valores en **`js/firebase-config.js`**

---

## Paso 3 — Activar Authentication

1. En el menú izquierdo → **Authentication** → **"Comenzar"**
2. Pestaña **"Sign-in method"**

### Email/Contraseña
- Clic en **"Correo electrónico/contraseña"** → Activar → Guardar

### Google
- Clic en **"Google"** → Activar
- Elige tu correo como soporte
- Guardar

### GitHub
- Ve a **https://github.com/settings/developers**
- Clic en **"New OAuth App"**
  - Application name: `StudyFlow AI`
  - Homepage URL: `http://localhost` (o tu dominio)
  - Authorization callback URL: cópiala desde Firebase (aparece en el panel de GitHub)
- Copia el **Client ID** y genera un **Client Secret**
- Pégalos en Firebase → Authentication → GitHub → Guardar

---

## Paso 4 — Crear la Realtime Database

1. Menú izquierdo → **Realtime Database** → **"Crear base de datos"**
2. Ubicación: **Estados Unidos (us-central1)** (recomendado)
3. Modo de seguridad: **"Iniciar en modo de prueba"** ✅
   *(después cambiaremos las reglas para producción)*
4. Clic en **"Listo"**

### Reglas de seguridad (cópialas en la pestaña "Reglas"):

```json
{
  "rules": {
    "users": {
      "$uid": {
        ".read":  "$uid === auth.uid",
        ".write": "$uid === auth.uid"
      }
    }
  }
}
```

Esto asegura que **cada usuario solo puede leer/escribir sus propios datos**.

---

## Paso 5 — Estructura de datos en Firebase

Así quedará tu base de datos por usuario:

```
📦 Realtime Database
└── users/
    └── {uid}/
        ├── profile/
        │   ├── name:         "Alejandro López"
        │   ├── email:        "ale@uni.edu"
        │   ├── streak:       12
        │   └── createdAt:    1710000000000
        ├── subjects/
        │   └── {id}/
        │       ├── name:     "Cálculo Diferencial"
        │       ├── teacher:  "Dr. García"
        │       ├── credits:  4
        │       ├── grade:    3.5
        │       ├── color:    "#00d4ff"
        │       └── progress: 72
        ├── sessions/
        │   └── {id}/
        │       ├── sid:   1          (subject id)
        │       ├── day:   0          (0=Lun...6=Dom)
        │       ├── time:  "07:00"
        │       ├── type:  "Estudio"
        │       ├── prio:  "high"
        │       └── done:  false
        ├── objectives/
        │   └── {id}/
        │       ├── title:    "Completar Cap. 5"
        │       ├── sid:      1
        │       ├── deadline: "2026-03-20"
        │       ├── prio:     "high"
        │       └── done:     false
        └── productivity/
            ├── L: 3.5
            ├── M: 5.2
            ├── X: 2.8
            ├── J: 6.0
            ├── V: 4.5
            ├── S: 3.0
            └── D: 1.5
```

---

## Paso 6 — Correr la aplicación localmente

Los módulos ES6 (`import/export`) **no funcionan abriendo el HTML directamente**.
Necesitas un servidor local. Las opciones más fáciles:

### Opción A — VS Code (recomendado)
1. Instala la extensión **"Live Server"**
2. Clic derecho en `login.html` → **"Open with Live Server"**

### Opción B — Python
```bash
cd studyflow/
python3 -m http.server 3000
# Abre http://localhost:3000/login.html
```

### Opción C — Node.js
```bash
npx serve studyflow/
# Abre http://localhost:3000/login.html
```

---

## Paso 7 — Deploy a producción (opcional)

Firebase Hosting lo despliega gratis:

```bash
npm install -g firebase-tools
firebase login
firebase init hosting
# Carpeta pública: studyflow
# SPA: No
firebase deploy
```

Tu app quedará en: `https://studyflow-ai.web.app`

---

## ✅ Checklist final

- [ ] Credenciales copiadas en `js/firebase-config.js`
- [ ] Authentication: Email/Contraseña activado
- [ ] Authentication: Google activado
- [ ] Authentication: GitHub activado (con Client ID y Secret)
- [ ] Realtime Database creada en modo test
- [ ] Reglas de seguridad actualizadas
- [ ] App corriendo con Live Server o servidor local

---

## 🆘 Problemas comunes

| Error | Solución |
|-------|----------|
| `auth/api-key-not-valid` | Verifica que copiaste bien las credenciales en `firebase-config.js` |
| `auth/unauthorized-domain` | Ve a Authentication → Dominios autorizados → agrega `localhost` |
| `permission-denied` en DB | Verifica las reglas de Realtime Database |
| Popup bloqueado (OAuth) | Permite popups en el navegador para `localhost` |
| `CORS error` | Estás abriendo el HTML sin servidor, usa Live Server |
