/* =============================================
   StudyFlow AI — js/subjects.js
   Página de materias + sincronización Firebase
   ============================================= */

const SUBJECT_EMOJIS = {
  '#00d4ff': '📐', '#7b5fff': '⚛️', '#00ff9d': '💻',
  '#ff6b6b': '📊', '#ffb700': '🌐', '#ff9f43': '🔬', '#0652dd': '📖',
};

function renderSubjs() {
  _renderSubjectCards();
  _renderSubjectLoadFull();
  _renderSubjectEvents();
}

function _renderSubjectCards() {
  const grid = document.getElementById('subjGrid');
  grid.innerHTML = '';
  if (!State.subjects.length) {
    grid.innerHTML = '<div style="grid-column:1/-1;text-align:center;color:var(--text3);font-family:Space Mono,monospace;font-size:12px;padding:32px">Sin materias aún · ¡Agrega la primera! 📚</div>';
    return;
  }
  State.subjects.forEach(s => {
    const st = statusOf(s.progress);
    const du = daysUntil(s.date);
    const card = document.createElement('div');
    card.className = 'subc';
    card.innerHTML = `
      <div class="sct">
        <div><div class="scn">${s.name}</div><div class="sct2">${s.teacher}</div></div>
        <div style="display:flex;gap:6px;align-items:flex-start">
          <div class="sci" style="background:${s.color}22;color:${s.color}">${SUBJECT_EMOJIS[s.color] || '📘'}</div>
          <button class="bi" onclick="editSubj(${s.id})" title="Editar" style="color:var(--accent2);border-color:var(--border)">✏️</button>
          <button class="bi" onclick="delSubj(${s.id})" style="color:var(--accent3);border:none">×</button>
        </div>
      </div>
      <div class="scstats">
        <div class="ssv"><div class="ssv-val" style="color:${s.color}">${s.grade.toFixed(1)}</div><div class="ssv-lbl">Nota</div></div>
        <div class="ssv"><div class="ssv-val" style="color:${st.c}">${s.progress}%</div><div class="ssv-lbl">Avance</div></div>
        <div class="ssv"><div class="ssv-val" style="color:${du <= 3 ? 'var(--accent3)' : du <= 7 ? '#ffb700' : 'var(--accent4)'}">${du <= 0 ? '¡HOY!' : du}</div><div class="ssv-lbl">Días</div></div>
        <div class="ssv"><div class="ssv-val">${s.credits}</div><div class="ssv-lbl">Créditos</div></div>
      </div>
      <div class="pt" style="margin-bottom:8px">
        <div class="pf" style="width:0%;background:linear-gradient(90deg,${s.color},${s.color}55)" data-w="${s.progress}"></div>
      </div>
      <div class="stags">
        <span class="subtag" style="background:${s.color}22;color:${s.color}">${s.next}</span>
        <span class="subtag ${st.k === 'ok' ? 'bo' : st.k === 'warn' ? 'bw2' : 'bc2'}">${st.l}</span>
        <span class="subtag" style="background:rgba(255,255,255,0.05);color:var(--text3)">${fmtDate(s.date)}</span>
      </div>`;
    grid.appendChild(card);
  });
  animateProgress('#subjGrid');
}

function _renderSubjectLoadFull() {
  const sl = document.getElementById('subjLoadFull');
  sl.innerHTML = '';
  if (!State.subjects.length) { sl.innerHTML = '<div style="color:var(--text3);font-family:Space Mono,monospace;font-size:12px;padding:16px;text-align:center">Sin materias aún</div>'; return; }
  State.subjects.forEach(s => {
    const st = statusOf(s.progress);
    sl.innerHTML += `
      <div class="sbi">
        <div class="sbh"><span class="sbname">${s.name}</span><div class="sbinfo"><span class="sbp">${s.progress}%</span><span class="sbbadge ${st.k === 'ok' ? 'bo' : st.k === 'warn' ? 'bw2' : 'bc2'}">${st.l}</span></div></div>
        <div class="pt"><div class="pf" style="width:0%;background:linear-gradient(90deg,${st.c},${st.c}66)" data-w="${s.progress}"></div></div>
        <div class="ne">${s.next} · en ${daysUntil(s.date)} días</div>
      </div>`;
  });
  animateProgress('#subjLoadFull');
}

function _renderSubjectEvents() {
  const ev = document.getElementById('subjEvents');
  ev.innerHTML = '';
  if (!State.subjects.length) { ev.innerHTML = '<div style="color:var(--text3);font-family:Space Mono,monospace;font-size:12px;padding:16px;text-align:center">Sin eventos próximos</div>'; return; }
  [...State.subjects].sort((a, b) => daysUntil(a.date) - daysUntil(b.date)).forEach(s => {
    const du = daysUntil(s.date);
    ev.innerHTML += `<div class="si"><div class="sc2" style="background:${s.color}"></div><div class="si-info"><div class="sn">${s.next}</div><div class="ss">${s.name} · ${fmtDate(s.date)}</div></div><span class="stag" style="background:${du <= 3 ? 'rgba(255,107,107,0.15)' : du <= 7 ? 'rgba(255,183,0,0.15)' : 'rgba(0,255,157,0.1)'};color:${du <= 3 ? '#ff6b6b' : du <= 7 ? '#ffb700' : 'var(--accent4)'}">${du <= 0 ? '¡HOY!' : du + ' días'}</span></div>`;
  });
}

async function delSubj(id) {
  State.subjects = State.subjects.filter(s => s.id !== id);
  State.sessions = State.sessions.filter(s => s.sid !== id);
  await syncDeleteSubject(id);
  showToast('🗑 Materia eliminada');
  renderSubjs(); populateSubjectSelects(); refreshDash();
}

let _selColor = COLORS[0];
let _editingId = null; // null = crear nuevo, número = editar existente

function editSubj(id) {
  const s = State.subjects.find(x => x.id === id);
  if (!s) return;
  _editingId = id;

  // Pre-rellenar el modal con los datos actuales
  document.getElementById('sjName').value = s.name;
  document.getElementById('sjTeach').value = s.teacher;
  document.getElementById('sjCred').value = s.credits;
  document.getElementById('sjGrade').value = s.grade;
  document.getElementById('sjNext').value = s.next;
  document.getElementById('sjDate').value = s.date;

  // Color picker
  const cp = document.getElementById('colorPick');
  cp.innerHTML = '';
  _selColor = s.color;
  COLORS.forEach(c => {
    const el = document.createElement('div');
    el.className = 'co ' + (c === _selColor ? 'sel' : '');
    el.style.background = c;
    el.onclick = () => {
      _selColor = c;
      cp.querySelectorAll('.co').forEach(x => x.classList.remove('sel'));
      el.classList.add('sel');
    };
    cp.appendChild(el);
  });

  // Cambiar título del modal
  document.querySelector('#mSubj .mtit').textContent = '✏️ Editar Materia';
  document.querySelector('#mSubj .mf .btn.bp').textContent = 'Guardar cambios';
  openMo('mSubj');
}

function openAddSubj() {
  _editingId = null;
  document.querySelector('#mSubj .mtit').textContent = 'Nueva Materia';
  document.querySelector('#mSubj .mf .btn.bp').textContent = 'Agregar';
  const cp = document.getElementById('colorPick');
  cp.innerHTML = ''; _selColor = COLORS[0];
  COLORS.forEach(c => {
    const el = document.createElement('div');
    el.className = 'co ' + (c === _selColor ? 'sel' : ''); el.style.background = c;
    el.onclick = () => { _selColor = c; cp.querySelectorAll('.co').forEach(x => x.classList.remove('sel')); el.classList.add('sel'); };
    cp.appendChild(el);
  });
  document.getElementById('sjDate').value = new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0];
  ['sjName', 'sjTeach', 'sjNext'].forEach(id => document.getElementById(id).value = '');
  document.getElementById('sjCred').value = '3';
  document.getElementById('sjGrade').value = '3.5';
  openMo('mSubj');
}

async function saveSubj() {
  const name = document.getElementById('sjName').value.trim();
  if (!name) { showToast('⚠️ Escribe el nombre'); return; }

  if (_editingId !== null) {
    // ── EDITAR materia existente ──
    const s = State.subjects.find(x => x.id === _editingId);
    if (!s) return;
    s.name = name;
    s.color = _selColor;
    s.teacher = document.getElementById('sjTeach').value || 'Sin asignar';
    s.credits = parseInt(document.getElementById('sjCred').value) || 3;
    s.grade = parseFloat(document.getElementById('sjGrade').value) || 3.5;
    s.next = document.getElementById('sjNext').value || 'Por definir';
    s.date = document.getElementById('sjDate').value;
    await syncSaveSubject(s);
    closeMo('mSubj');
    showToast('✅ Materia actualizada ☁️');
  } else {
    // ── CREAR nueva materia ──
    const subject = {
      id: State.nextId(), name, color: _selColor,
      teacher: document.getElementById('sjTeach').value || 'Sin asignar',
      credits: parseInt(document.getElementById('sjCred').value) || 3,
      grade: parseFloat(document.getElementById('sjGrade').value) || 3.5,
      next: document.getElementById('sjNext').value || 'Por definir',
      date: document.getElementById('sjDate').value,
      progress: 0,
    };
    State.subjects.push(subject);
    await syncSaveSubject(subject);
    closeMo('mSubj');
    showToast('📚 Materia guardada en la nube ☁️');
  }

  _editingId = null;
  renderSubjs(); populateSubjectSelects(); refreshDash();
}