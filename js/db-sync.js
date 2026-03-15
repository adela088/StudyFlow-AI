/* =============================================
   StudyFlow AI — js/db-sync.js
   Sincronización entre State local y Firebase
   Todas las acciones pasan por aquí.
   ============================================= */

/* ── Obtiene el UID del usuario actual ────── */
function _uid() {
  return window._currentUser ? window._currentUser.uid : null;
}

/* ── Helper: llama función de Firebase si hay sesión ── */
async function _sync(action) {
  const uid = _uid();
  if (!uid) return; // Sin sesión, solo actualiza State local
  try {
    await action(uid);
  } catch (err) {
    console.error('❌ Error sincronizando con Firebase:', err.message);
    showToast('⚠️ Error al guardar en la nube');
  }
}

/* ══════════════════════════════════════════
   SUBJECTS
   ══════════════════════════════════════════ */

async function syncSaveSubject(subject) {
  await _sync(uid => window._FB.saveSubject(uid, subject));
}

async function syncDeleteSubject(id) {
  await _sync(uid => window._FB.deleteSubject(uid, id));
  // También eliminar sesiones locales de esa materia en Firebase
  const orphanSessions = State.sessions.filter(s => s.sid === id);
  for (const s of orphanSessions) {
    await _sync(uid => window._FB.deleteSession(uid, s.id));
  }
}

/* ══════════════════════════════════════════
   SESSIONS
   ══════════════════════════════════════════ */

async function syncSaveSession(session) {
  await _sync(uid => window._FB.saveSession(uid, session));
}

async function syncDeleteSession(id) {
  await _sync(uid => window._FB.deleteSession(uid, id));
}

async function syncUpdateSession(id, data) {
  await _sync(uid => window._FB.updateSession(uid, id, data));
}

/* ══════════════════════════════════════════
   OBJECTIVES
   ══════════════════════════════════════════ */

async function syncSaveObjective(obj) {
  await _sync(uid => window._FB.saveObjective(uid, obj));
}

async function syncDeleteObjective(id) {
  await _sync(uid => window._FB.deleteObjective(uid, id));
}

async function syncUpdateObjective(id, data) {
  await _sync(uid => window._FB.updateObjective(uid, id, data));
}

/* ══════════════════════════════════════════
   STREAK
   ══════════════════════════════════════════ */

async function syncStreak(value) {
  await _sync(uid => window._FB.saveStreak(uid, value));
}
