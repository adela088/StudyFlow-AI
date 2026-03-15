/* =============================================
   StudyFlow AI — js/objectives.js
   Objetivos + sincronización Firebase
   ============================================= */

function renderObjs() {
  const flt=document.getElementById('objFlt').value;
  const pending=State.objectives.filter(o=>{
    if(flt==='done') return o.done;
    if(flt==='pending') return !o.done;
    if(flt==='high') return o.prio==='high'&&!o.done;
    return !o.done;
  });
  const doneList=(flt==='all'||flt==='done')?State.objectives.filter(o=>o.done):[];
  const pl=document.getElementById('objPend');
  const dl=document.getElementById('objDone');
  pl.innerHTML=''; dl.innerHTML='';
  document.getElementById('objEmpty').style.display=pending.length?'none':'block';
  pending.forEach(o=>pl.appendChild(_buildObjItem(o)));
  doneList.forEach(o=>dl.appendChild(_buildObjItem(o)));
  const nHigh=State.objectives.filter(o=>!o.done&&o.prio==='high').length;
  document.getElementById('objDot').style.display=nHigh>0?'block':'none';
  _renderObjProgress();
}

function _buildObjItem(o) {
  const subj=State.getSubject(o.sid);
  const du=daysUntil(o.deadline);
  const el=document.createElement('div');
  el.className='oi';
  el.innerHTML=`
    <div class="och ${o.done?'done':''}" onclick="togObj(${o.id})">${o.done?'✓':''}</div>
    <div class="oin">
      <div class="otn ${o.done?'done':''}">${o.title}</div>
      <div class="om">${subj?subj.name:'Sin materia'} · ${o.deadline?(du<=0?'¡Vencido!':du+' días'):''}</div>
    </div>
    <span class="op ${o.prio==='high'?'oph':o.prio==='med'?'opm':'opl'}">${o.prio==='high'?'ALTA':o.prio==='med'?'MEDIA':'BAJA'}</span>
    <div style="display:flex;gap:4px"><button class="bi" onclick="delObj(${o.id})" style="color:var(--accent3)">×</button></div>`;
  return el;
}

function _renderObjProgress() {
  const tot=State.objectives.length;
  const td=State.objectives.filter(o=>o.done).length;
  const ht=State.objectives.filter(o=>o.prio==='high').length;
  const hd=State.objectives.filter(o=>o.done&&o.prio==='high').length;
  const pct=tot?Math.round(td/tot*100):0;
  document.getElementById('objProg').innerHTML=`
    <div class="ssv" style="background:var(--surface2);border:1px solid var(--border);border-radius:10px;padding:14px"><div class="ssv-val" style="color:var(--accent4)">${td}/${tot}</div><div class="ssv-lbl">Total</div></div>
    <div class="ssv" style="background:var(--surface2);border:1px solid var(--border);border-radius:10px;padding:14px"><div class="ssv-val" style="color:var(--accent3)">${ht-hd}</div><div class="ssv-lbl">Alta Prior.</div></div>
    <div class="ssv" style="background:var(--surface2);border:1px solid var(--border);border-radius:10px;padding:14px"><div class="ssv-val" style="color:var(--accent2)">${tot-td}</div><div class="ssv-lbl">Pendientes</div></div>
    <div class="ssv" style="background:var(--surface2);border:1px solid var(--border);border-radius:10px;padding:14px"><div class="ssv-val" style="color:var(--accent)">${pct}%</div><div class="ssv-lbl">Cumplido</div></div>`;
}

async function togObj(id) {
  const o=State.objectives.find(x=>x.id===id); if(!o)return;
  o.done=!o.done;
  if(o.done) { State.streak++; await syncStreak(State.streak); }
  await syncUpdateObjective(id, {done: o.done}); // ← Firebase
  showToast(o.done?'🎯 ¡Objetivo completado! +1 racha':'↩ Objetivo reabierto');
  renderObjs(); refreshDash();
}

async function delObj(id) {
  State.objectives=State.objectives.filter(o=>o.id!==id);
  await syncDeleteObjective(id);                 // ← Firebase
  showToast('🗑 Objetivo eliminado');
  renderObjs();
}

function openAddObj() {
  populateSubjectSelects();
  document.getElementById('ojDate').value=new Date(Date.now()+3*86400000).toISOString().split('T')[0];
  document.getElementById('ojTitle').value='';
  document.getElementById('ojDesc').value='';
  openMo('mObj');
}

async function saveObj() {
  const title=document.getElementById('ojTitle').value.trim();
  if(!title){showToast('⚠️ Escribe el título');return;}
  const obj={
    id:State.nextId(), title,
    desc:document.getElementById('ojDesc').value,
    sid:parseInt(document.getElementById('ojSubj').value),
    deadline:document.getElementById('ojDate').value,
    prio:document.getElementById('ojPrio').value,
    done:false,
  };
  State.objectives.unshift(obj);
  await syncSaveObjective(obj);                  // ← Firebase
  closeMo('mObj');
  showToast('🎯 Objetivo guardado en la nube ☁️');
  renderObjs();
}
