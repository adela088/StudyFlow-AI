/* =============================================
   StudyFlow AI — js/dashboard.js
   Dashboard principal — datos desde Firebase
   ============================================= */

function refreshDash() {
  _updateDateHeader();
  _updateStatCards();
  _renderDashSchedule();
  _renderProductivityChart();
  _renderDashSubjectLoad();
  _updateAIPrediction();
}

function _updateDateHeader() {
  const now = new Date();
  const dn  = ['Dom','Lun','Mar','Mié','Jue','Vie','Sáb'];
  const semana = _getWeekNumber(now);
  document.getElementById('dateDisp').textContent =
    `SEMANA ${semana} · PERÍODO 2025-II · ${dn[now.getDay()]} ${now.getDate()}/${now.getMonth()+1}`;
  document.getElementById('strkCnt').textContent = State.streak;
}

function _getWeekNumber(d) {
  const start = new Date(d.getFullYear(), 0, 1);
  return Math.ceil(((d - start) / 86400000 + start.getDay() + 1) / 7);
}

function _updateStatCards() {
  const ts         = State.sessions.filter(s => s.day === State.todayIdx());
  const done       = ts.filter(s => s.done).length;
  const objDone    = State.objectives.filter(o => o.done).length;
  const objTotal   = State.objectives.length;
  const totalSess  = State.sessions.length;
  const doneSess   = State.sessions.filter(s => s.done).length;
  const examsNear  = State.subjects.filter(s => daysUntil(s.date) <= 7).length;

  // Eficiencia = % de sesiones completadas sobre el total
  const eff = totalSess === 0 ? 0 : Math.round((doneSess / totalSess) * 100);
  document.getElementById('dEff').textContent   = eff + '%';
  document.getElementById('dEffC').textContent  = totalSess === 0
    ? 'Sin sesiones aún'
    : doneSess + ' de ' + totalSess + ' sesiones hechas';

  document.getElementById('dHours').textContent  = (done * 1.5).toFixed(1);
  document.getElementById('dHoursC').textContent = done + ' sesiones completadas';
  document.getElementById('dTasks').textContent  = objDone + '/' + objTotal;
  document.getElementById('dTasksC').textContent = objTotal === 0
    ? 'Sin objetivos aún'
    : '↑ ' + objDone + ' completados';
  document.getElementById('dExams').textContent  = examsNear;
  document.getElementById('dExamsC').textContent = examsNear > 0
    ? '↓ Esta semana'
    : '✓ Sin urgentes';
}

function _renderDashSchedule() {
  const sc = document.getElementById('dashSched');
  const ts = State.sessions
    .filter(s => s.day === State.todayIdx())
    .sort((a,b) => a.time.localeCompare(b.time));

  sc.innerHTML = '';
  if (!ts.length) {
    sc.innerHTML = `<div style="text-align:center;color:var(--text3);
      font-family:'Space Mono',monospace;font-size:12px;padding:20px">
      Sin sesiones hoy · ¡Agrega una desde Horario! 📅
    </div>`;
    return;
  }
  ts.slice(0, 5).forEach(s => {
    const subj = State.getSubject(s.sid);
    if (!subj) return;
    const el = document.createElement('div');
    el.className = 'si ' + (s.done ? 'done' : '');
    el.innerHTML = `
      <span class="st">${s.time}</span>
      <div class="sc2" style="background:${subj.color};box-shadow:0 0 5px ${subj.color}55"></div>
      <div class="si-info">
        <div class="sn">${subj.name}</div>
        <div class="ss">${s.type}</div>
      </div>
      <span class="stag ${s.done?'td':s.prio==='high'?'th':s.prio==='med'?'tm':'tl'}">
        ${s.done ? '✓ HECHO' : s.prio==='high' ? 'URGENTE' : s.prio==='med' ? 'HOY' : 'LIGERO'}
      </span>`;
    el.onclick = () => {
      if (!s.done) {
        document.getElementById('fSubLbl').textContent = subj.name;
        startFocus(25);
      }
    };
    sc.appendChild(el);
  });
}

function _renderProductivityChart() {
  renderBarChart('prodChart', State.productivity, 88);
}

function _renderDashSubjectLoad() {
  const dl = document.getElementById('dashLoad');
  dl.innerHTML = '';

  if (!State.subjects.length) {
    dl.innerHTML = `<div style="text-align:center;color:var(--text3);
      font-family:'Space Mono',monospace;font-size:12px;padding:16px">
      Sin materias aún · ¡Agrega desde Materias! 📚
    </div>`;
    return;
  }

  State.subjects.slice(0, 4).forEach(s => {
    const st = statusOf(s.progress);
    dl.innerHTML += `
      <div class="sbi">
        <div class="sbh">
          <span class="sbname">${s.name}</span>
          <div class="sbinfo">
            <span class="sbp">${s.progress}%</span>
            <span class="sbbadge ${st.k==='ok'?'bo':st.k==='warn'?'bw2':'bc2'}">${st.l}</span>
          </div>
        </div>
        <div class="pt">
          <div class="pf" style="width:0%;background:linear-gradient(90deg,${st.c},${st.c}88)" data-w="${s.progress}"></div>
        </div>
        <div class="ne">${s.next} · ${fmtDate(s.date)}</div>
      </div>`;
  });
  animateProgress('#dashLoad');
}

function _updateAIPrediction() {
  const el = document.getElementById('aiPredText');
  if (!el) return;

  const totalSubjects  = State.subjects.length;
  const totalSessions  = State.sessions.length;
  const totalObjectives = State.objectives.length;
  const pendingObjs    = State.objectives.filter(o => !o.done).length;
  const urgentObjs     = State.objectives.filter(o => !o.done && o.prio === 'high').length;
  const todaySessions  = State.sessions.filter(s => s.day === State.todayIdx()).length;
  const nearExams      = State.subjects.filter(s => daysUntil(s.date) <= 5);

  let prediction = '';

  if (totalSubjects === 0) {
    prediction = '¡Bienvenida! Empieza agregando tus <strong>materias</strong> para que pueda analizar tu carga académica.';
  } else if (nearExams.length > 0) {
    const closest = nearExams.sort((a,b) => daysUntil(a.date) - daysUntil(b.date))[0];
    const days = daysUntil(closest.date);
    prediction = `⚠️ <strong>${closest.name}</strong> tiene una evaluación en <strong>${days} día${days===1?'':'s'}</strong>. Te recomiendo priorizar esta materia hoy.`;
  } else if (urgentObjs > 0) {
    prediction = `Tienes <strong>${urgentObjs} objetivo${urgentObjs>1?'s':''} de alta prioridad</strong> pendientes. Enfócate en completarlos antes de agregar nuevas tareas.`;
  } else if (todaySessions === 0 && totalSubjects > 0) {
    prediction = `No tienes sesiones programadas para hoy. Te recomiendo agregar al menos <strong>2 bloques de estudio</strong> desde la sección Horario.`;
  } else if (pendingObjs > 0) {
    prediction = `Tienes <strong>${pendingObjs} objetivo${pendingObjs>1?'s':''} pendientes</strong>. ¡Vas bien! Completa uno hoy para mantener tu racha.`;
  } else if (totalObjectives === 0) {
    prediction = `Agrega <strong>objetivos de estudio</strong> para que pueda hacer un seguimiento de tu progreso académico.`;
  } else {
    prediction = `¡Todo bajo control! Llevas <strong>${State.streak} días</strong> de racha. Sigue así para mantener tu productividad.`;
  }

  el.innerHTML = prediction;
}
