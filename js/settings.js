/* =============================================
   StudyFlow AI — js/settings.js
   Página de configuración
   ============================================= */

const CFG_KEY = 'studyflow_settings';

// Configuración por defecto
const DEFAULT_CFG = {
  name: '',
  university: '',
  semester: '5',
  pomoDur: 25,
  pomoBreak: 5,
  pomoLong: 15,
  pomoRounds: 4,
  weeklyGoal: 30,
  studyDays: [0, 1, 2, 3, 4],
  peakHour: 'morning',
  notifSessions: true,
  notifExams: true,
  notifStreak: true,
  notifWeekly: false,
  theme: 'dark',
  accent: '#00d4ff',
  accentGlow: 'rgba(0,212,255,0.15)',
};

// Carga config guardada (localStorage como caché local)
function loadSettings() {
  try {
    const saved = localStorage.getItem(CFG_KEY);
    return saved ? { ...DEFAULT_CFG, ...JSON.parse(saved) } : { ...DEFAULT_CFG };
  } catch { return { ...DEFAULT_CFG }; }
}

// Guarda config en localStorage y Firebase
async function saveSettings(cfg) {
  localStorage.setItem(CFG_KEY, JSON.stringify(cfg));
  const uid = window._currentUser?.uid;
  if (uid && window._FB) {
    try {
      await window._FB.saveUserData?.(uid, { settings: cfg });
    } catch (e) { console.warn('No se pudo guardar config en Firebase:', e.message); }
  }
}

// Renderiza la página con los valores actuales
function renderSettings() {
  const cfg = loadSettings();

  // Perfil
  const user = window._authUser;
  const name = user?.displayName || cfg.name || '';
  const email = user?.email || '';
  const initials = name ? name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() : '??';

  document.getElementById('settingsAvatarText').textContent = initials;
  document.getElementById('settingsNameDisplay').textContent = name || 'Sin nombre';
  document.getElementById('settingsEmailDisplay').textContent = email;
  document.getElementById('cfgName').value = name;
  document.getElementById('cfgUniversity').value = cfg.university;
  document.getElementById('cfgSemester').value = cfg.semester;

  // Pomodoro
  const pd = document.getElementById('cfgPomoDur');
  pd.value = cfg.pomoDur;
  document.getElementById('cfgPomoDurVal').textContent = cfg.pomoDur + ' min';
  const pb = document.getElementById('cfgPomoBreak');
  pb.value = cfg.pomoBreak;
  document.getElementById('cfgPomoBreakVal').textContent = cfg.pomoBreak + ' min';
  const pl = document.getElementById('cfgPomoLong');
  pl.value = cfg.pomoLong;
  document.getElementById('cfgPomoLongVal').textContent = cfg.pomoLong + ' min';
  document.getElementById('cfgPomoRounds').value = cfg.pomoRounds;

  // Meta semanal
  const wg = document.getElementById('cfgWeeklyGoal');
  wg.value = cfg.weeklyGoal;
  document.getElementById('cfgWeeklyGoalVal').textContent = cfg.weeklyGoal + 'h / semana';
  document.querySelectorAll('.day-btn').forEach(btn => {
    const day = parseInt(btn.dataset.day);
    btn.classList.toggle('active', cfg.studyDays.includes(day));
  });
  document.getElementById('cfgPeakHour').value = cfg.peakHour;

  // Notificaciones
  document.getElementById('cfgNotifSessions').checked = cfg.notifSessions;
  document.getElementById('cfgNotifExams').checked = cfg.notifExams;
  document.getElementById('cfgNotifStreak').checked = cfg.notifStreak;
  document.getElementById('cfgNotifWeekly').checked = cfg.notifWeekly;

  // Tema
  setTheme(cfg.theme, false);
  document.querySelectorAll('.accent-opt').forEach(el => {
    el.style.border = el.dataset.color === cfg.accent ? '3px solid #fff' : '3px solid transparent';
    if (el.dataset.color === cfg.accent) el.classList.add('active');
    else el.classList.remove('active');
  });
}

// Guarda todos los cambios
async function saveAllSettings() {
  const studyDays = [];
  document.querySelectorAll('.day-btn.active').forEach(btn => {
    studyDays.push(parseInt(btn.dataset.day));
  });

  const cfg = {
    name: document.getElementById('cfgName').value.trim(),
    university: document.getElementById('cfgUniversity').value.trim(),
    semester: document.getElementById('cfgSemester').value,
    pomoDur: parseInt(document.getElementById('cfgPomoDur').value),
    pomoBreak: parseInt(document.getElementById('cfgPomoBreak').value),
    pomoLong: parseInt(document.getElementById('cfgPomoLong').value),
    pomoRounds: parseInt(document.getElementById('cfgPomoRounds').value),
    weeklyGoal: parseInt(document.getElementById('cfgWeeklyGoal').value),
    studyDays,
    peakHour: document.getElementById('cfgPeakHour').value,
    notifSessions: document.getElementById('cfgNotifSessions').checked,
    notifExams: document.getElementById('cfgNotifExams').checked,
    notifStreak: document.getElementById('cfgNotifStreak').checked,
    notifWeekly: document.getElementById('cfgNotifWeekly').checked,
    theme: loadSettings().theme,
    accent: loadSettings().accent,
    accentGlow: loadSettings().accentGlow,
  };

  // Actualizar nombre en Firebase Auth si cambió
  if (cfg.name && window._authUser && cfg.name !== window._authUser.displayName) {
    try {
      const { updateProfile, getAuth } = await import('https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js');
      await updateProfile(getAuth().currentUser, { displayName: cfg.name });
      window._authUser.displayName = cfg.name;
      // Actualizar avatar en topbar
      const initials = cfg.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
      document.getElementById('userAvatar').textContent = initials;
    } catch (e) { console.warn('No se pudo actualizar nombre:', e.message); }
  }

  await saveSettings(cfg);
  showToast('✅ Configuración guardada');

  // Actualizar duración del Pomodoro en focus.js
  window._pomoDuration = cfg.pomoDur;
  window._pomoBreak = cfg.pomoBreak;
  window._pomoLong = cfg.pomoLong;
  window._pomoRounds = cfg.pomoRounds;
}

// Toggle días de estudio
function toggleDay(btn) {
  btn.classList.toggle('active');
}

// Cambiar tema
function setTheme(theme, save = true) {
  const root = document.documentElement;
  if (theme === 'light') {
    root.style.setProperty('--bg', '#f0f4ff');
    root.style.setProperty('--surface', '#ffffff');
    root.style.setProperty('--surface2', '#e8edf8');
    root.style.setProperty('--border', '#d0d8f0');
    root.style.setProperty('--border2', '#b8c4e0');
    root.style.setProperty('--text', '#1a2040');
    root.style.setProperty('--text2', '#4a5680');
    root.style.setProperty('--text3', '#8090b8');
    document.getElementById('themeDark')?.classList.remove('active');
    document.getElementById('themeLight')?.classList.add('active');
    if (document.getElementById('themeLight')) {
      document.getElementById('themeLight').style.borderColor = 'var(--accent)';
      document.getElementById('themeDark').style.borderColor = 'transparent';
    }
  } else {
    root.style.setProperty('--bg', '#070b14');
    root.style.setProperty('--surface', '#0d1424');
    root.style.setProperty('--surface2', '#111b30');
    root.style.setProperty('--border', '#1e2d4a');
    root.style.setProperty('--border2', '#243556');
    root.style.setProperty('--text', '#e8eef8');
    root.style.setProperty('--text2', '#7a92b8');
    root.style.setProperty('--text3', '#3d5278');
    document.getElementById('themeLight')?.classList.remove('active');
    document.getElementById('themeDark')?.classList.add('active');
    if (document.getElementById('themeDark')) {
      document.getElementById('themeDark').style.borderColor = 'var(--accent)';
      document.getElementById('themeLight').style.borderColor = 'transparent';
    }
  }
  if (save) {
    const cfg = loadSettings();
    cfg.theme = theme;
    saveSettings(cfg);
  }
}

// Cambiar color de acento
function setAccent(el, color, glow) {
  document.documentElement.style.setProperty('--accent', color);
  document.documentElement.style.setProperty('--glow', glow);
  document.querySelectorAll('.accent-opt').forEach(e => {
    e.style.border = '3px solid transparent';
    e.classList.remove('active');
  });
  el.style.border = '3px solid #fff';
  el.classList.add('active');
  const cfg = loadSettings();
  cfg.accent = color;
  cfg.accentGlow = glow;
  saveSettings(cfg);
}

// Vista previa del avatar
function previewAvatar(input) {
  if (!input.files?.[0]) return;
  const reader = new FileReader();
  reader.onload = e => {
    const imgUrl = e.target.result;

    // Actualiza avatar en Configuración
    const av = document.getElementById('settingsAvatar');
    av.style.backgroundImage = `url(${imgUrl})`;
    av.style.backgroundSize = 'cover';
    av.style.backgroundPosition = 'center';
    document.getElementById('settingsAvatarText').style.display = 'none';

    // Actualiza avatar en el topbar del dashboard
    const topbarAv = document.getElementById('userAvatar');
    if (topbarAv) {
      topbarAv.style.backgroundImage = `url(${imgUrl})`;
      topbarAv.style.backgroundSize = 'cover';
      topbarAv.style.backgroundPosition = 'center';
      topbarAv.textContent = ''; // quita las iniciales
    }

    // Actualiza mini avatar del menú
    const miniAv = document.getElementById('menuAvatarMini');
    if (miniAv) {
      miniAv.style.backgroundImage = `url(${imgUrl})`;
      miniAv.style.backgroundSize = 'cover';
      miniAv.style.backgroundPosition = 'center';
      const mt = document.getElementById('menuAvatarText');
      if (mt) mt.style.display = 'none';
    }

    // Guarda en localStorage para persistir entre recargas
    try { localStorage.setItem('studyflow_avatar', imgUrl); } catch (e) { }

    showToast('🖼️ Foto de perfil actualizada');
  };
  reader.readAsDataURL(input.files[0]);
}

// Aplica el avatar guardado al cargar la app
function applyStoredAvatar() {
  try {
    const imgUrl = localStorage.getItem('studyflow_avatar');
    if (!imgUrl) return;

    // Topbar
    const topbarAv = document.getElementById('userAvatar');
    if (topbarAv) {
      topbarAv.style.backgroundImage = `url(${imgUrl})`;
      topbarAv.style.backgroundSize = 'cover';
      topbarAv.style.backgroundPosition = 'center';
      topbarAv.textContent = '';
    }
    // Settings
    const av = document.getElementById('settingsAvatar');
    if (av) {
      av.style.backgroundImage = `url(${imgUrl})`;
      av.style.backgroundSize = 'cover';
      av.style.backgroundPosition = 'center';
      const txt = document.getElementById('settingsAvatarText');
      if (txt) txt.style.display = 'none';
    }
    // Mini avatar del menú
    const miniAv = document.getElementById('menuAvatarMini');
    if (miniAv) {
      miniAv.style.backgroundImage = `url(${imgUrl})`;
      miniAv.style.backgroundSize = 'cover';
      miniAv.style.backgroundPosition = 'center';
      const mt = document.getElementById('menuAvatarText');
      if (mt) mt.style.display = 'none';
    }
  } catch (e) { }
}

// Exportar datos
function exportData(type) {
  const dayNames = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
  let content = '', filename = '', mime = 'text/csv';

  if (type === 'subjects') {
    content = 'Nombre,Profesor,Créditos,Nota,Progreso,Próximo evento,Fecha\n';
    State.subjects.forEach(s => {
      content += `"${s.name}","${s.teacher}",${s.credits},${s.grade},${s.progress}%,"${s.next}","${s.date}"\n`;
    });
    filename = 'studyflow_materias.csv';
  } else if (type === 'sessions') {
    content = 'Materia,Día,Hora,Actividad,Prioridad,Completada\n';
    State.sessions.forEach(s => {
      const subj = State.getSubject(s.sid);
      content += `"${subj?.name || '?'}","${dayNames[s.day]}","${s.time}","${s.type}","${s.prio}","${s.done ? 'Sí' : 'No'}"\n`;
    });
    filename = 'studyflow_sesiones.csv';
  } else if (type === 'objectives') {
    content = 'Título,Materia,Fecha límite,Prioridad,Completado\n';
    State.objectives.forEach(o => {
      const subj = State.getSubject(o.sid);
      content += `"${o.title}","${subj?.name || '?'}","${o.deadline}","${o.prio}","${o.done ? 'Sí' : 'No'}"\n`;
    });
    filename = 'studyflow_objetivos.csv';
  } else if (type === 'all') {
    mime = 'application/json';
    content = JSON.stringify({
      exportedAt: new Date().toISOString(),
      user: { name: window._authUser?.displayName, email: window._authUser?.email },
      subjects: State.subjects,
      sessions: State.sessions,
      objectives: State.objectives,
      productivity: State.productivity,
      streak: State.streak,
      settings: loadSettings(),
    }, null, 2);
    filename = 'studyflow_datos_completos.json';
  }

  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
  showToast('⬇️ Descargando ' + filename);
}

// Aplicar config guardada al iniciar
function applyStoredSettings() {
  const cfg = loadSettings();
  if (cfg.theme) setTheme(cfg.theme, false);
  if (cfg.accent) {
    document.documentElement.style.setProperty('--accent', cfg.accent);
    document.documentElement.style.setProperty('--glow', cfg.accentGlow);
  }
  window._pomoDuration = cfg.pomoDur;
  window._pomoBreak = cfg.pomoBreak;
  window._pomoLong = cfg.pomoLong;
  window._pomoRounds = cfg.pomoRounds;

  // Aplica foto de perfil guardada
  applyStoredAvatar();
}