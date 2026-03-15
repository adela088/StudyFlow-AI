/* =============================================
   StudyFlow AI — js/schedule.js
   Horario semanal + sincronización Firebase
   ============================================= */

const DAY_NAMES = ['Lun','Mar','Mié','Jue','Vie','Sáb','Dom'];
const HOURS = ['07:00','08:00','09:00','10:00','11:00','12:00','13:00',
               '14:00','15:00','16:00','17:00','18:00','19:00','20:00'];

function renderSched() { renderWeekGrid(); renderTodaySched(); renderUpcomSched(); }

function chgWk(dir) { State.weekOffset+=dir; renderWeekGrid(); }

function renderWeekGrid() {
  const base=new Date();
  base.setDate(base.getDate()-State.todayIdx()+State.weekOffset*7);
  const end=new Date(base); end.setDate(end.getDate()+6);
  document.getElementById('wkLbl').textContent=`${base.getDate()}/${base.getMonth()+1} — ${end.getDate()}/${end.getMonth()+1}`;
  let html='<div class="wg"><div class="whd"></div>';
  DAY_NAMES.forEach((d,i)=>{
    const cd=new Date(base); cd.setDate(cd.getDate()+i);
    const isT=i===State.todayIdx()&&State.weekOffset===0;
    html+=`<div class="whd ${isT?'tc':''}">${d}<br><span style="font-size:9px;opacity:0.6">${cd.getDate()}/${cd.getMonth()+1}</span></div>`;
  });
  HOURS.forEach(hr=>{
    html+=`<div class="wts">${hr}</div>`;
    DAY_NAMES.forEach((_,di)=>{
      const here=State.sessions.filter(s=>s.day===di&&s.time===hr);
      let cc='';
      here.forEach(s=>{
        const subj=State.getSubject(s.sid); if(!subj)return;
        cc+=`<div class="we" style="background:${subj.color}22;border-left:3px solid ${subj.color};color:${subj.color}" onclick="quickDone(${s.id})" title="${subj.name}: ${s.type}">${subj.name.split(' ')[0]}</div>`;
      });
      html+=`<div class="wc">${cc}</div>`;
    });
  });
  html+='</div>';
  document.getElementById('weekGrid').innerHTML=html;
}

function renderTodaySched() {
  const ts=State.sessions.filter(s=>s.day===State.todayIdx()).sort((a,b)=>a.time.localeCompare(b.time));
  const c=document.getElementById('todaySched');
  c.innerHTML='';
  document.getElementById('todayEmpty').style.display=ts.length?'none':'block';
  ts.forEach(s=>{
    const subj=State.getSubject(s.sid); if(!subj)return;
    const el=document.createElement('div');
    el.className='si '+(s.done?'done':s.prio==='high'?'active':'');
    el.innerHTML=`
      <span class="st">${s.time}</span>
      <div class="sc2" style="background:${subj.color};box-shadow:0 0 5px ${subj.color}55"></div>
      <div class="si-info"><div class="sn">${subj.name}</div><div class="ss">${s.type}</div></div>
      <div class="sacts">
        <button class="bi" onclick="quickDone(${s.id})" title="${s.done?'Desmarcar':'Completar'}">${s.done?'↩':'✓'}</button>
        <button class="bi" onclick="focusOn(${s.id})">⚡</button>
        <button class="bi" style="color:var(--accent3)" onclick="delSess(${s.id})">×</button>
      </div>`;
    c.appendChild(el);
  });
}

function renderUpcomSched() {
  const ti=State.todayIdx();
  const up=State.sessions.filter(s=>s.day>ti&&!s.done).sort((a,b)=>a.day-b.day||a.time.localeCompare(b.time)).slice(0,6);
  const c=document.getElementById('upcomSched');
  c.innerHTML='';
  if(!up.length){c.innerHTML='<div style="text-align:center;color:var(--text3);font-size:12px;font-family:Space Mono,monospace;padding:20px">No hay sesiones próximas.</div>';return;}
  up.forEach(s=>{
    const subj=State.getSubject(s.sid); if(!subj)return;
    c.innerHTML+=`<div class="si"><span class="st" style="min-width:40px">${DAY_NAMES[s.day]}</span><div class="sc2" style="background:${subj.color}"></div><div class="si-info"><div class="sn">${subj.name}</div><div class="ss">${s.time} · ${s.type}</div></div><span class="stag ${s.prio==='high'?'th':s.prio==='med'?'tm':'tl'}">${s.prio==='high'?'URGENTE':s.prio==='med'?'NORMAL':'LIGERO'}</span></div>`;
  });
}

async function quickDone(id) {
  const s=State.sessions.find(x=>x.id===id); if(!s)return;
  s.done=!s.done;
  await syncUpdateSession(id, {done: s.done});   // ← Firebase
  showToast(s.done?'✅ Sesión completada':'↩ Sesión reabierta');
  renderSched(); renderWeekGrid(); refreshDash();
}

async function delSess(id) {
  State.sessions=State.sessions.filter(s=>s.id!==id);
  await syncDeleteSession(id);                   // ← Firebase
  showToast('🗑 Sesión eliminada');
  renderSched(); refreshDash();
}

function focusOn(id) {
  const s=State.sessions.find(x=>x.id===id); if(!s)return;
  const subj=State.getSubject(s.sid);
  document.getElementById('fSubLbl').textContent=subj?subj.name:'Estudio';
  startFocus(25);
}

async function autoSched() {
  const ts=State.sessions.filter(s=>s.day===State.todayIdx()&&!s.done);
  const prios=['high','high','med','med','low'];
  for(const [i,s] of ts.entries()) {
    s.prio=prios[i%5];
    await syncUpdateSession(s.id, {prio: s.prio}); // ← Firebase
  }
  renderSched();
  showToast('✦ Horario optimizado por IA ☁️');
}

function openAddSess() { populateSubjectSelects(); openMo('mSess'); }

async function saveSess() {
  const sid=parseInt(document.getElementById('sSubj').value);
  const day=parseInt(document.getElementById('sDay').value);
  const time=document.getElementById('sTime').value;
  const type=document.getElementById('sType').value||'Estudio';
  const prio=document.getElementById('sPrio').value;
  if(!sid){showToast('⚠️ Selecciona una materia');return;}
  const session={id:State.nextId(),sid,day,time,type,prio,done:false};
  State.sessions.push(session);
  await syncSaveSession(session);                // ← Firebase
  closeMo('mSess');
  showToast('✅ Sesión guardada en la nube ☁️');
  renderSched(); refreshDash();
}
