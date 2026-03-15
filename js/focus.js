/* =============================================
   StudyFlow AI — js/focus.js
   Modo concentración (Pomodoro timer)
   ============================================= */

let _focusInterval = null;
let _focusSecs     = 0;
let _focusPaused   = false;

/* ---- Modal selector ---- */
function openFocusSel() {
  populateSubjectSelects();
  openMo('mFocus');
}

function startFocusMo() {
  const sel  = document.getElementById('fSubSel');
  const dur  = parseInt(document.getElementById('fDur').value);
  const subj = State.getSubject(parseInt(sel.value));
  document.getElementById('fSubLbl').textContent = subj ? subj.name : 'Estudio libre';
  closeMo('mFocus');
  startFocus(dur);
}

/* ---- Core timer ---- */
function startFocus(minutes) {
  _focusSecs   = (minutes || 25) * 60;
  _focusPaused = false;

  document.getElementById('fPauseBtn').textContent = '⏸ Pausar';
  document.getElementById('fMode').textContent     = `POMODORO ${minutes}MIN`;
  _updateTimer();

  clearInterval(_focusInterval);
  _focusInterval = setInterval(() => {
    if (!_focusPaused) {
      _focusSecs--;
      if (_focusSecs <= 0) { clearInterval(_focusInterval); _completeFocus(); return; }
      _updateTimer();
    }
  }, 1000);

  _spawnParticles();
  document.getElementById('focusOv').classList.add('active');
}

function togglePause() {
  _focusPaused = !_focusPaused;
  document.getElementById('fPauseBtn').textContent = _focusPaused ? '▶ Continuar' : '⏸ Pausar';
}

function endFocus() {
  clearInterval(_focusInterval);
  document.getElementById('focusOv').classList.remove('active');
}

function _completeFocus() {
  endFocus();
  State.streak++;
  showToast('🎉 ¡Pomodoro completo! Racha: ' + State.streak + ' 🔥');
  refreshDash();
}

function _updateTimer() {
  const m = Math.floor(_focusSecs / 60).toString().padStart(2, '0');
  const s = (_focusSecs % 60).toString().padStart(2, '0');
  document.getElementById('fTimer').textContent = `${m}:${s}`;
}

/* ---- Particle effect ---- */
function _spawnParticles() {
  const c = document.getElementById('fparts');
  c.innerHTML = '';
  for (let i = 0; i < 24; i++) {
    const p = document.createElement('div');
    p.className = 'part';
    p.style.cssText = `
      left: ${Math.random() * 100}%;
      --dr:  ${(Math.random() - 0.5) * 80}px;
      --dur: ${4 + Math.random() * 6}s;
      animation-delay: ${Math.random() * 5}s;
      background: ${Math.random() > 0.5 ? 'var(--accent)' : 'var(--accent2)'};
    `;
    c.appendChild(p);
  }
}

/* Close on ESC */
document.addEventListener('keydown', e => { if (e.key === 'Escape') endFocus(); });
