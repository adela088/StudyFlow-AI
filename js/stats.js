/* =============================================
   StudyFlow AI — js/stats.js
   Página de estadísticas y análisis
   ============================================= */

function renderStats() {
  const period = document.getElementById('stPer').value;
  const mult = { week: 1, month: 4.3, semester: 18 }[period];

  _updateStatsSummary(period, mult);
  renderBarChart('stChart', State.productivity, 110);
  _renderSubjectBreakdown();
  _renderHeatmap();
  _renderKPIs();
}

function _updateStatsSummary(period, mult) {
  const totalHrs = State.productivity.reduce((a, b) => a + b.hrs, 0) * mult;
  const days = { week: 7, month: 30, semester: 120 }[period];
  const avg = totalHrs / days;
  const objDone = Math.round(State.objectives.filter(o => o.done).length * (mult > 1 ? mult / 2 : 1));
  const label = { week: 'Esta semana', month: 'Este mes', semester: 'Semestre' }[period];

  document.getElementById('stHrs').textContent = totalHrs.toFixed(0);
  document.getElementById('stHrsC').textContent = label;
  document.getElementById('stAvg').textContent = avg.toFixed(1);
  document.getElementById('stObj').textContent = objDone;
  document.getElementById('stObjC').textContent = label;
  document.getElementById('stStrk').textContent = State.streak;
}

function _renderSubjectBreakdown() {
  const sb = document.getElementById('subjBreak');
  sb.innerHTML = '';

  if (!State.subjects.length) {
    sb.innerHTML = '<div style="color:var(--text3);font-family:Space Mono,monospace;font-size:12px;padding:12px;text-align:center">Sin materias aún</div>';
    return;
  }

  // Cuenta sesiones completadas por materia
  const sessPerSubj = {};
  State.sessions.filter(s => s.done).forEach(s => {
    sessPerSubj[s.sid] = (sessPerSubj[s.sid] || 0) + 1;
  });

  const maxSess = Math.max(...State.subjects.map(s => sessPerSubj[s.id] || 0), 1);

  State.subjects.forEach(s => {
    const sess = sessPerSubj[s.id] || 0;
    const hrs = (sess * 1.5).toFixed(1);
    const pct = Math.round(sess / maxSess * 100);
    sb.innerHTML += `
      <div>
        <div style="display:flex;justify-content:space-between;margin-bottom:5px">
          <span style="font-size:12px;font-weight:700">${s.name}</span>
          <span style="font-family:Space Mono,monospace;font-size:11px;color:var(--text3)">${hrs}h</span>
        </div>
        <div class="pt">
          <div class="pf" style="width:0%;background:linear-gradient(90deg,${s.color},${s.color}66)" data-w="${pct}"></div>
        </div>
      </div>`;
  });
  animateProgress('#subjBreak');
}

function _renderHeatmap() {
  const dn = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];
  document.getElementById('hmLbl').innerHTML = dn.map(d => `<div class="hl">${d}</div>`).join('');

  const hm = document.getElementById('hmap');
  hm.innerHTML = '';
  Array.from({ length: 28 }, (_, i) => {
    const hrs = Math.random() < 0.15 ? 0 : +(Math.random() * 5 + 0.5).toFixed(1);
    const date = new Date(Date.now() - (27 - i) * 86400000)
      .toLocaleDateString('es', { day: 'numeric', month: 'short' });
    const op = hrs === 0 ? 0.04 : Math.min(0.1 + hrs / 5 * 0.9, 1);

    const cell = document.createElement('div');
    cell.className = 'hc';
    cell.style.background = hrs === 0
      ? 'rgba(255,255,255,0.03)'
      : `rgba(0,212,255,${op})`;
    cell.innerHTML = `<div class="ht">${date}: ${hrs}h</div>`;
    hm.appendChild(cell);
  });
}

function _renderKPIs() {
  const DAY_NAMES = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
  const prod = State.productivity; // [{ day, hrs }, ...]

  // ── Mejor día ──
  const bestDay = prod.reduce((a, b) => b.hrs > a.hrs ? b : a, prod[0]);
  const totalHrs = prod.reduce((a, b) => a + b.hrs, 0);
  const bestVal = bestDay.hrs > 0 ? bestDay.day : '—';
  const bestSub = totalHrs > 0
    ? `Promedio ${(totalHrs / 7).toFixed(1)}h/día`
    : 'Sin datos aún';

  // ── Hora pico (basada en sesiones completadas) ──
  const doneSess = State.sessions.filter(s => s.done && s.time);
  let peakLabel = '—';
  let peakSub = 'Sin sesiones completadas';
  if (doneSess.length > 0) {
    const hourCount = {};
    doneSess.forEach(s => {
      const h = parseInt(s.time.split(':')[0]);
      const block = h < 12 ? '7–12am' : h < 17 ? '12–5pm' : '5–10pm';
      hourCount[block] = (hourCount[block] || 0) + 1;
    });
    peakLabel = Object.entries(hourCount).sort((a, b) => b[1] - a[1])[0][0];
    peakSub = `${doneSess.length} sesión${doneSess.length > 1 ? 'es' : ''} completada${doneSess.length > 1 ? 's' : ''}`;
  }

  // ── Meta semanal ──
  const cfg = (() => { try { return JSON.parse(localStorage.getItem('studyflow_settings') || '{}'); } catch { return {}; } })();
  const weeklyGoal = cfg.weeklyGoal || 30;
  const weekPct = weeklyGoal > 0 ? Math.min(Math.round(totalHrs / weeklyGoal * 100), 100) : 0;
  const metaVal = weekPct + '%';
  const metaSub = totalHrs > 0
    ? `${totalHrs.toFixed(1)}h / ${weeklyGoal}h objetivo`
    : `0h / ${weeklyGoal}h objetivo`;

  // ── Eficiencia ──
  const totalSess = State.sessions.length;
  const compSess = State.sessions.filter(s => s.done).length;
  const effPct = totalSess > 0 ? Math.round(compSess / totalSess * 100) : 0;
  const effVal = effPct + '%';
  const effSub = totalSess > 0
    ? `${compSess} de ${totalSess} sesiones hechas`
    : 'Sin sesiones aún';

  const kpis = [
    { l: 'Mejor día', v: bestVal, s: bestSub, c: 'var(--accent)', i: '🏆' },
    { l: 'Hora pico', v: peakLabel, s: peakSub, c: 'var(--accent4)', i: '⏰' },
    { l: 'Meta semanal', v: metaVal, s: metaSub, c: 'var(--accent2)', i: '🎯' },
    { l: 'Eficiencia', v: effVal, s: effSub, c: 'var(--accent3)', i: '📊' },
  ];

  document.getElementById('kpiList').innerHTML = kpis.map(k => `
    <div class="rs">
      <div class="rs-icon">${k.i}</div>
      <div>
        <div class="rs-lbl">${k.l}</div>
        <div class="rs-val" style="color:${k.c}">${k.v}</div>
        <div style="font-size:10px;color:var(--text3);font-family:Space Mono,monospace">${k.s}</div>
      </div>
    </div>`).join('');
}