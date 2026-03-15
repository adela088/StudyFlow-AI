/* =============================================
   StudyFlow AI — js/stats.js
   Página de estadísticas y análisis
   ============================================= */

function renderStats() {
  const period = document.getElementById('stPer').value;
  const mult   = { week:1, month:4.3, semester:18 }[period];

  _updateStatsSummary(period, mult);
  renderBarChart('stChart', State.productivity, 110);
  _renderSubjectBreakdown();
  _renderHeatmap();
  _renderKPIs();
}

function _updateStatsSummary(period, mult) {
  const totalHrs = State.productivity.reduce((a,b) => a+b.hrs, 0) * mult;
  const days     = { week:7, month:30, semester:120 }[period];
  const avg      = totalHrs / days;
  const objDone  = Math.round(State.objectives.filter(o=>o.done).length * (mult>1 ? mult/2 : 1));
  const label    = { week:'Esta semana', month:'Este mes', semester:'Semestre' }[period];

  document.getElementById('stHrs').textContent   = totalHrs.toFixed(0);
  document.getElementById('stHrsC').textContent  = label;
  document.getElementById('stAvg').textContent   = avg.toFixed(1);
  document.getElementById('stObj').textContent   = objDone;
  document.getElementById('stObjC').textContent  = label;
  document.getElementById('stStrk').textContent  = State.streak;
}

function _renderSubjectBreakdown() {
  const sb   = document.getElementById('subjBreak');
  const totH = State.productivity.reduce((a,b) => a+b.hrs, 0);
  sb.innerHTML = '';
  State.subjects.forEach((s, i) => {
    const hrs = (totH * (0.15 + Math.sin(i)*0.05 + s.progress/1000)).toFixed(1);
    const pct = Math.round(hrs / totH * 100);
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
  const dn = ['L','M','X','J','V','S','D'];
  document.getElementById('hmLbl').innerHTML = dn.map(d => `<div class="hl">${d}</div>`).join('');

  const hm = document.getElementById('hmap');
  hm.innerHTML = '';
  Array.from({ length: 28 }, (_, i) => {
    const hrs  = Math.random() < 0.15 ? 0 : +(Math.random() * 5 + 0.5).toFixed(1);
    const date = new Date(Date.now() - (27-i)*86400000)
      .toLocaleDateString('es', { day:'numeric', month:'short' });
    const op   = hrs === 0 ? 0.04 : Math.min(0.1 + hrs/5*0.9, 1);

    const cell = document.createElement('div');
    cell.className   = 'hc';
    cell.style.background = hrs === 0
      ? 'rgba(255,255,255,0.03)'
      : `rgba(0,212,255,${op})`;
    cell.innerHTML = `<div class="ht">${date}: ${hrs}h</div>`;
    hm.appendChild(cell);
  });
}

function _renderKPIs() {
  const kpis = [
    { l:'Mejor día',      v:'Jueves', s:'Promedio 6h/semana',       c:'var(--accent)',  i:'🏆' },
    { l:'Hora pico',      v:'7–9am',  s:'Mayor concentración',      c:'var(--accent4)', i:'⏰' },
    { l:'Meta semanal',   v:'82%',    s:'24.5h / 30h objetivo',     c:'var(--accent2)', i:'🎯' },
    { l:'Eficiencia IA',  v:'+15%',   s:'vs promedio estudiantes',  c:'var(--accent3)', i:'🤖' },
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
