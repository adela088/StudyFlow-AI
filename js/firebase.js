/* =============================================
   StudyFlow AI — js/firebase.js
   Servicio Firebase: Auth + Realtime Database
   ============================================= */

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import {
  getAuth, onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup, signOut,
  GoogleAuthProvider,
  GithubAuthProvider,
  updateProfile
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import {
  getDatabase, ref, set, get,
  update, remove, onValue
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js";
import { FIREBASE_CONFIG } from "./firebase-config.js";

// ── Inicialización ──────────────────────────
const app  = initializeApp(FIREBASE_CONFIG);
const auth = getAuth(app);
const db   = getDatabase(app);
const googleP = new GoogleAuthProvider();
const githubP = new GithubAuthProvider();

// Flag para evitar que onAuthChange redirija mientras se está registrando
let _registering = false;

// ── Auth ────────────────────────────────────

export async function registerEmail(name, email, password) {
  _registering = true;
  try {
    console.log('1️⃣ Creando usuario en Auth...');
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    console.log('2️⃣ Usuario creado, UID:', cred.user.uid);

    await updateProfile(cred.user, { displayName: name });
    console.log('3️⃣ Perfil actualizado');

    await _initUserData(cred.user);
    console.log('4️⃣ _initUserData completado');

    return cred.user;
  } finally {
    _registering = false;
  }
}

export async function loginEmail(email, password) {
  const cred = await signInWithEmailAndPassword(auth, email, password);
  return cred.user;
}

export async function loginGoogle() {
  const cred = await signInWithPopup(auth, googleP);
  await _ensureUserData(cred.user);
  return cred.user;
}

export async function loginGithub() {
  const cred = await signInWithPopup(auth, githubP);
  await _ensureUserData(cred.user);
  return cred.user;
}

export async function logout() {
  await signOut(auth);
}

/** Elimina la cuenta del usuario y todos sus datos en Realtime Database */
export async function deleteAccount(uid) {
  const user = auth.currentUser;
  if (!user) throw new Error('No hay usuario autenticado');

  // 1. Borrar todos los datos de Realtime Database
  await remove(ref(db, `users/${uid}`));
  console.log('✅ Datos eliminados de Realtime Database');

  // 2. Eliminar el usuario de Firebase Auth
  await user.delete();
  console.log('✅ Usuario eliminado de Authentication');
}

export function onAuthChange(callback) {
  onAuthStateChanged(auth, user => {
    // No disparar el callback mientras se está registrando
    if (_registering) {
      console.log('⏳ Registro en curso, ignorando onAuthChange...');
      return;
    }
    callback(user);
  });
}

export function currentUser() {
  return auth.currentUser;
}

// ── Realtime Database ───────────────────────

const userRef = (uid, path = '') =>
  ref(db, `users/${uid}${path ? '/' + path : ''}`);

export async function loadUserData(uid) {
  const snap = await get(userRef(uid));
  return snap.exists() ? snap.val() : null;
}

export function subscribeUserData(uid, callback) {
  return onValue(userRef(uid), snap => {
    callback(snap.exists() ? snap.val() : null);
  });
}

export async function saveUserData(uid, data) {
  await update(userRef(uid), data);
}

// ── Subjects ────────────────────────────────
export async function saveSubject(uid, subject) {
  await set(userRef(uid, `subjects/${subject.id}`), subject);
}
export async function deleteSubject(uid, id) {
  await remove(userRef(uid, `subjects/${id}`));
}

// ── Sessions ────────────────────────────────
export async function saveSession(uid, session) {
  await set(userRef(uid, `sessions/${session.id}`), session);
}
export async function deleteSession(uid, id) {
  await remove(userRef(uid, `sessions/${id}`));
}
export async function updateSession(uid, id, data) {
  await update(userRef(uid, `sessions/${id}`), data);
}

// ── Objectives ──────────────────────────────
export async function saveObjective(uid, obj) {
  await set(userRef(uid, `objectives/${obj.id}`), obj);
}
export async function deleteObjective(uid, id) {
  await remove(userRef(uid, `objectives/${id}`));
}
export async function updateObjective(uid, id, data) {
  await update(userRef(uid, `objectives/${id}`), data);
}

// ── Productivity ────────────────────────────
export async function saveProductivity(uid, data) {
  await update(userRef(uid, 'productivity'), data);
}
export async function saveStreak(uid, streak) {
  await update(userRef(uid), { streak });
}

// ── Helpers internos ────────────────────────

async function _initUserData(user) {
  console.log('🔥 _initUserData para UID:', user.uid);
  const initial = {
    profile: {
      name:      user.displayName || 'Estudiante',
      email:     user.email,
      createdAt: Date.now(),
      streak:    0,
    },
    subjects:     {},
    sessions:     {},
    objectives:   {},
    productivity: { L:0, M:0, X:0, J:0, V:0, S:0, D:0 },
  };
  try {
    await set(userRef(user.uid), initial);
    console.log('✅ Estructura creada en Realtime Database');
  } catch (err) {
    console.error('❌ Error en DB:', err.code, err.message);
    throw err;
  }
}

async function _ensureUserData(user) {
  const snap = await get(userRef(user.uid));
  if (!snap.exists()) await _initUserData(user);
}
