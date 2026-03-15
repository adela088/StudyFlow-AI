/* =============================================
   StudyFlow AI — js/utils.js
   Funciones auxiliares compartidas
   ============================================= */

/** Hora actual formateada HH:MM */
function getNow() {
  const d = new Date();
  return d.getHours().toString().padStart(2,'0') + ':' + d.getMinutes().toString().padStart(2,'0');
}

/** Formatea una fecha ISO a "15 mar" */
function fmtDate(str) {
  if (!str) return '—';
  return new Date(str + 'T12:00').toLocaleDateString('es', { day:'numeric', month:'short' });
}

/** Días restantes hasta una fecha ISO */
function daysUntil(str) {
  if (!str) return 999;
  return Math.ceil((new Date(str + 'T12:00') - new Date()) / 86400000);
}

/** Devuelve estado (ok/warn/crit) según % de progreso */
function statusOf(pct) {
  if (pct >= 80) return { k:'ok',   l:'OK',      c:'#00ff9d' };
  if (pct >= 55) return { k:'warn', l:'ALERTA',  c:'#ffb700' };
  return              { k:'crit', l:'CRÍTICO', c:'#ff6b6b' };
}

/** Anima las barras de progreso (.pf[data-w]) dentro de un contenedor */
function animateProgress(containerSelector) {
  setTimeout(() => {
    document.querySelectorAll(`${containerSelector} .pf`).forEach(el => {
      el.style.width = el.dataset.w + '%';
    });
  }, 150);
}

/** Rellena todos los <select> de materias */
function populateSubjectSelects() {
  ['sSubj','ojSubj','fSubSel'].forEach(id => {
    const el = document.getElementById(id);
    if (!el) return;
    el.innerHTML = State.subjects
      .map(s => `<option value="${s.id}">${s.name}</option>`)
      .join('');
  });
}

/** Toast notification */
let _toastTimer = null;
function showToast(msg) {
  const t = document.getElementById('toast');
  document.getElementById('toastMsg').textContent = msg;
  t.classList.add('show','ok');
  clearTimeout(_toastTimer);
  _toastTimer = setTimeout(() => t.classList.remove('show'), 3000);
}

/** Dibuja gráfico de barras horizontal dentro de #containerId */
function renderBarChart(containerId, data, maxH) {
  const pc = document.getElementById(containerId);
  if (!pc) return;
  pc.innerHTML = '';
  const mx = Math.max(...data.map(d => d.hrs));
  const todayI = State.todayIdx();
  data.forEach((d, i) => {
    const h = Math.round((d.hrs / mx) * maxH);
    const isT = i === todayI;
    pc.innerHTML += `
      <div class="bw">
        <div class="bc" style="height:${h}px;
          background:${isT ? 'linear-gradient(180deg,var(--accent),rgba(0,212,255,0.3))' : 'linear-gradient(180deg,var(--surface2),var(--border)'});
          border:1px solid ${isT ? 'rgba(0,212,255,0.4)' : 'var(--border)'};
          box-shadow:${isT ? '0 0 12px var(--glow)' : 'none'}">
          <div class="btt">${d.hrs}h</div>
        </div>
        <div class="bd" style="color:${isT ? 'var(--accent)' : 'var(--text3)'}">${d.day}</div>
      </div>`;
  });
}
