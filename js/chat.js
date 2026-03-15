/* =============================================
   StudyFlow AI — js/chat.js
   Asistente IA local con respuestas inteligentes
   ============================================= */

const _chatHistory = [
  {
    role: 'ai',
    text: '¡Hola! 👋 Soy tu asistente de estudio con IA. Puedo ayudarte con técnicas de estudio, gestionar tus materias, horario y objetivos. ¿En qué te ayudo hoy?',
    time: '08:00',
  },
];

const _apiHistory = [];

/* ---- Avatar del usuario ---- */
function _getUserAvatar() {
  const saved = localStorage.getItem('studyflow_avatar');
  const name = window._authUser?.displayName || '';
  const initials = name ? name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() : 'TU';
  return { saved, initials };
}

/* ---- Init con nombre ---- */
function initChatWithUser(displayName) {
  if (displayName && _chatHistory[0]?.role === 'ai') {
    const name = displayName.split(' ')[0];
    _chatHistory[0].text = `¡Hola ${name}! 👋 Soy tu asistente de estudio con IA. Puedo ayudarte con técnicas de estudio, gestionar tus materias, horario y objetivos. ¿En qué te ayudo hoy?`;
    renderChat();
  }
}

/* ---- Render ---- */
function renderChat() {
  const c = document.getElementById('chatBox');
  c.innerHTML = '';
  const { saved, initials } = _getUserAvatar();

  _chatHistory.forEach(m => {
    const div = document.createElement('div');
    div.className = 'msg ' + m.role;
    const userAv = saved
      ? `<div class="mav uv" style="background-image:url(${saved});background-size:cover;background-position:center;"></div>`
      : `<div class="mav uv">${initials}</div>`;
    div.innerHTML = `
      ${m.role === 'ai' ? '<div class="mav aiv">✦</div>' : userAv}
      <div><div class="mb">${m.text}</div><div class="mt">${m.time}</div></div>`;
    c.appendChild(div);
  });
  c.scrollTop = c.scrollHeight;
}

/* ════════════════════════════════════════════
   MOTOR DE RESPUESTAS INTELIGENTES
   ════════════════════════════════════════════ */

function _buildResponse(msg) {
  const q = msg.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  const name = window._authUser?.displayName?.split(' ')[0] || '';

  // ── Datos del estudiante ──
  const subjects = State.subjects;
  const sessions = State.sessions;
  const objectives = State.objectives;
  const streak = State.streak;
  const todaySess = sessions.filter(s => s.day === State.todayIdx());
  const doneSess = sessions.filter(s => s.done);
  const pendingObjs = objectives.filter(o => !o.done);
  const urgentObjs = pendingObjs.filter(o => o.prio === 'high');
  const nearExams = subjects.filter(s => daysUntil(s.date) <= 5).sort((a, b) => daysUntil(a.date) - daysUntil(b.date));
  const eff = sessions.length ? Math.round(doneSess.length / sessions.length * 100) : 0;

  // ── Helpers ──
  const subjectList = () => subjects.map(s => `<strong>${s.name}</strong>`).join(', ');
  const closestExam = nearExams[0];

  // ══ SALUDOS ══
  if (/^(hola|hey|hi|buenas|buenos|saludos|ola)/.test(q)) {
    const hora = new Date().getHours();
    const saludo = hora < 12 ? 'Buenos días' : hora < 18 ? 'Buenas tardes' : 'Buenas noches';
    return `${saludo}${name ? ' ' + name : ''}! 😊 ¿En qué puedo ayudarte hoy?`;
  }

  // ══ POMODORO ══
  if (/pomodoro|cronometro|temporizador|timer/.test(q)) {
    return `⏱️ <strong>La técnica Pomodoro</strong> es un método de gestión del tiempo creado por Francesco Cirillo.<br><br>
<strong>¿Cómo funciona?</strong><br>
1️⃣ Elige una tarea a realizar<br>
2️⃣ Estudia concentrado por <strong>25 minutos</strong><br>
3️⃣ Toma un descanso de <strong>5 minutos</strong><br>
4️⃣ Cada 4 Pomodoros, descansa <strong>15-20 min</strong><br><br>
Puedes usar el <strong>⚡ Modo Concentración</strong> de StudyFlow para iniciar un Pomodoro ahora mismo. ¿Lo iniciamos?`;
  }

  // ══ TÉCNICAS DE ESTUDIO ══
  if (/tecnica|metodo|estudiar mejor|como estudiar|aprender|memorizar/.test(q)) {
    return `📚 <strong>Técnicas de estudio más efectivas:</strong><br><br>
🔹 <strong>Pomodoro</strong> — 25 min de estudio + 5 min descanso<br>
🔹 <strong>Feynman</strong> — explica el tema como si se lo enseñaras a alguien<br>
🔹 <strong>Repetición espaciada</strong> — repasa 1 día, 3 días y 7 días después<br>
🔹 <strong>Mapas mentales</strong> — conecta conceptos visualmente<br>
🔹 <strong>Active recall</strong> — cierra el libro y escribe todo lo que recuerdas<br><br>
¿Sobre cuál quieres saber más?`;
  }

  // ══ FEYNMAN ══
  if (/feynman/.test(q)) {
    return `🧠 <strong>La técnica Feynman</strong> tiene 4 pasos:<br><br>
1️⃣ <strong>Elige el concepto</strong> que quieres aprender<br>
2️⃣ <strong>Explícalo en palabras simples</strong>, como si se lo enseñaras a un niño de 12 años<br>
3️⃣ <strong>Identifica los vacíos</strong> — donde te trabas, ahí está lo que no entiendes bien<br>
4️⃣ <strong>Vuelve al material</strong> y refuerza esos puntos específicos<br><br>
Es especialmente útil para materias como ${subjects[0]?.name || 'matemáticas'} donde los conceptos se acumulan. 💡`;
  }

  // ══ CONCENTRACIÓN / DISTRACCIÓN ══
  if (/concentra|distrae|foco|enfoc|atencion/.test(q)) {
    return `🎯 <strong>Tips para concentrarte mejor:</strong><br><br>
📵 Silencia el teléfono o usa modo "No molestar"<br>
🎧 Pon música sin letra (lo fi, clásica o ruido blanco)<br>
📍 Estudia siempre en el mismo lugar<br>
⏱️ Usa el <strong>Modo Concentración</strong> de StudyFlow<br>
🥤 Hidrátate y evita el celular los primeros 30 min<br>
📝 Escribe lo que tienes que hacer <em>antes</em> de empezar<br><br>
¿Quieres que iniciemos una sesión Pomodoro ahora?`;
  }

  // ══ ESTADO GENERAL / MI SEMANA ══
  if (/semana|como voy|estado|resumen|progreso/.test(q)) {
    if (!subjects.length) return `Aún no tienes materias registradas. ¡Agrega tus materias en la sección 📚 <strong>Materias</strong> para que pueda analizar tu progreso!`;
    return `📊 <strong>Tu semana en resumen:</strong><br><br>
📚 <strong>${subjects.length} materias</strong> registradas<br>
✅ Eficiencia: <strong>${eff}%</strong> (${doneSess.length} de ${sessions.length} sesiones completadas)<br>
🎯 Objetivos pendientes: <strong>${pendingObjs.length}</strong>${urgentObjs.length ? ` (${urgentObjs.length} urgentes)` : ''}<br>
${closestExam ? `⚠️ Próxima evaluación: <strong>${closestExam.name}</strong> en ${daysUntil(closestExam.date)} días<br>` : ''}
🔥 Racha activa: <strong>${streak} días</strong><br><br>
${eff >= 70 ? '¡Vas muy bien! Sigue así 💪' : 'Puedes mejorar completando más sesiones de estudio. ¿Quieres que organice tu horario?'}`;
  }

  // ══ CUÁNTO ESTUDIAR ══
  if (/cuanto|cu\u00e1nto|horas|tiempo.*estudiar|estudiar.*hoy/.test(q)) {
    const pendingSess = todaySess.filter(s => !s.done);
    if (!pendingSess.length && !subjects.length) return `No tienes sesiones programadas para hoy. Te recomiendo agregar al menos <strong>2-3 horas</strong> de estudio desde la sección 📅 <strong>Horario</strong>.`;
    const horas = (pendingSess.length * 1.5).toFixed(1);
    return `⏰ Para hoy te recomiendo:<br><br>
${pendingSess.length ? `📋 Tienes <strong>${pendingSess.length} sesiones pendientes</strong> (~${horas}h)<br>` : ''}
${closestExam ? `⚠️ <strong>${closestExam.name}</strong> tiene evaluación en ${daysUntil(closestExam.date)} días → prioridad alta<br>` : ''}
${urgentObjs.length ? `🎯 <strong>${urgentObjs.length} objetivos urgentes</strong> pendientes<br>` : ''}<br>
En general, estudiar <strong>2-4 horas diarias</strong> con descansos es más efectivo que sesiones largas sin pausas.`;
  }

  // ══ MATERIAS / CUÁLES TENGO ══
  if (/materias?|asignatura|clase|curso/.test(q)) {
    if (!subjects.length) return `No tienes materias registradas aún. Ve a 📚 <strong>Materias</strong> y agrega tus clases del semestre.`;
    const list = subjects.map(s => {
      const du = daysUntil(s.date);
      const st = du <= 3 ? '🔴' : du <= 7 ? '🟡' : '🟢';
      return `${st} <strong>${s.name}</strong> — ${s.next} en ${du <= 0 ? '¡hoy!' : du + ' días'}`;
    }).join('<br>');
    return `📚 <strong>Tus materias este semestre:</strong><br><br>${list}<br><br>🔴 Crítico &nbsp; 🟡 Atención &nbsp; 🟢 OK`;
  }

  // ══ EXÁMENES / EVALUACIONES ══
  if (/examen|evaluacion|parcial|quiz|taller|entrega/.test(q)) {
    if (!nearExams.length && !subjects.length) return `No tienes materias registradas. ¡Agrégalas en la sección Materias!`;
    if (!nearExams.length) return `✅ No tienes evaluaciones críticas en los próximos 5 días. Buen momento para adelantar contenido.`;
    const list = nearExams.map(s => `⚠️ <strong>${s.name}</strong> — ${s.next} el ${fmtDate(s.date)} (${daysUntil(s.date) <= 0 ? '¡HOY!' : 'en ' + daysUntil(s.date) + ' días'})`).join('<br>');
    return `📅 <strong>Evaluaciones próximas:</strong><br><br>${list}<br><br>💡 Recomendación: estudia el tema más difícil primero y repasa el día anterior.`;
  }

  // ══ OBJETIVOS ══
  if (/objetivo|tarea|pendiente|meta/.test(q)) {
    if (!objectives.length) return `No tienes objetivos registrados. Ve a 🎯 <strong>Objetivos</strong> y agrega tus tareas pendientes del semestre.`;
    if (!pendingObjs.length) return `🎉 ¡Felicidades! No tienes objetivos pendientes. ¿Quieres agregar nuevas metas?`;
    const list = pendingObjs.slice(0, 4).map(o => {
      const icon = o.prio === 'high' ? '🔴' : o.prio === 'med' ? '🔵' : '🟢';
      return `${icon} ${o.title}`;
    }).join('<br>');
    return `🎯 <strong>Tienes ${pendingObjs.length} objetivos pendientes:</strong><br><br>${list}${pendingObjs.length > 4 ? `<br>... y ${pendingObjs.length - 4} más` : ''}<br><br>Completa primero los marcados en 🔴 rojo.`;
  }

  // ══ RACHA / STREAK ══
  if (/racha|streak|dias.*seguidos|consecutiv/.test(q)) {
    return `🔥 <strong>Tu racha actual: ${streak} días</strong><br><br>
${streak === 0 ? 'Empieza hoy completando al menos una sesión de estudio.' :
        streak < 7 ? 'Buen comienzo. Estudia al menos 30 min diarios para mantenerla.' :
          streak < 30 ? '¡Excelente consistencia! Estás construyendo un hábito sólido.' :
            '¡Increíble disciplina! Eres un ejemplo de constancia. 🏆'}<br><br>
La racha sube cuando completas objetivos o sesiones Pomodoro.`;
  }

  // ══ HORARIO / SESIONES ══
  if (/horario|sesion|agenda|calendario/.test(q)) {
    if (!todaySess.length) return `No tienes sesiones programadas para hoy. Ve a 📅 <strong>Horario</strong> y agrega bloques de estudio.`;
    const pendS = todaySess.filter(s => !s.done);
    const doneS = todaySess.filter(s => s.done);
    return `📅 <strong>Tu horario de hoy:</strong><br><br>
✅ Completadas: <strong>${doneS.length}</strong><br>
⏳ Pendientes: <strong>${pendS.length}</strong><br>
${pendS.slice(0, 3).map(s => { const subj = State.getSubject(s.sid); return `🕐 ${s.time} — ${subj?.name || '?'}: ${s.type}`; }).join('<br>')}<br><br>
${pendS.length > 0 ? '¡Ánimo, puedes completarlas! 💪' : '¡Todas las sesiones de hoy completadas! 🎉'}`;
  }

  // ══ ANSIEDAD / ESTRÉS ══
  if (/ansios|estres|nervios|agobiad|abrumad|no puedo|dificil|ayuda/.test(q)) {
    return `💙 Es normal sentirse así, especialmente en época de evaluaciones.<br><br>
<strong>Consejos rápidos:</strong><br>
🌬️ Respira profundo 4 segundos, aguanta 4, suelta 4<br>
📝 Escribe todo lo que tienes que hacer — sacar las cosas de la cabeza ayuda<br>
🎯 Enfócate en <em>una sola tarea</em> a la vez<br>
⏱️ Usa Pomodoros de 25 min — los bloques pequeños son menos intimidantes<br>
😴 Dormir bien es parte del estudio, no tiempo perdido<br><br>
¿Quieres que organicemos juntos tus prioridades?`;
  }

  // ══ MOTIVACIÓN ══
  if (/motivacion|motivad|desmotivad|ganas|rendirse|abandonar|no quiero/.test(q)) {
    const frases = [
      'El éxito no es el resultado de un día, sino de hábitos consistentes. Cada sesión cuenta. 💪',
      'No tienes que estudiar perfecto, solo estudiar <em>hoy</em>. Un paso a la vez. 🚶',
      'El esfuerzo de hoy es el resultado de mañana. Ya llegaste hasta aquí, no pares. 🔥',
      'Las personas exitosas no tienen más tiempo, tienen mejores hábitos. Tú los estás construyendo. ⭐',
    ];
    return `✨ ${frases[Math.floor(Math.random() * frases.length)]}<br><br>
${streak > 0 ? `Llevas <strong>${streak} días</strong> de racha — eso no es poca cosa. 🏆` : 'Empieza con 25 minutos hoy. Solo eso.'}`;
  }

  // ══ MATEMÁTICAS / CÁLCULO ══
  if (/calculo|derivada|integral|limite|matematica|algebra|ecuacion/.test(q)) {
    return `📐 Para dominar temas de matemáticas te recomiendo:<br><br>
1️⃣ <strong>Entiende el concepto</strong> antes de memorizar fórmulas<br>
2️⃣ <strong>Practica con ejemplos resueltos</strong> paso a paso<br>
3️⃣ <strong>Resuelve sin ver la solución</strong> — luego compara<br>
4️⃣ <strong>Repasa los errores</strong> — ahí está el aprendizaje real<br>
5️⃣ Usa recursos como <strong>Khan Academy</strong> o <strong>YouTube</strong> para visualizar conceptos<br><br>
${subjects.find(s => s.name.toLowerCase().includes('calc') || s.name.toLowerCase().includes('mat')) ? `Veo que tienes ${subjects.find(s => s.name.toLowerCase().includes('calc') || s.name.toLowerCase().includes('mat'))?.name} — ¿necesitas ayuda con algún tema específico?` : '¿Tienes algún tema específico de matemáticas?'}`;
  }

  // ══ PROGRAMACIÓN ══
  if (/programacion|codigo|javascript|python|java|c\+\+|algoritmo|bug|error/.test(q)) {
    return `💻 Para aprender programación más efectivamente:<br><br>
🔹 <strong>Practica a diario</strong> — aunque sea 30 min de código<br>
🔹 <strong>Lee el error</strong> con calma — el mensaje casi siempre dice qué falló<br>
🔹 Divide el problema en partes pequeñas (<strong>divide y vencerás</strong>)<br>
🔹 Usa <strong>debugging paso a paso</strong> con console.log o breakpoints<br>
🔹 Consulta <strong>Stack Overflow</strong> y la documentación oficial<br><br>
${subjects.find(s => s.name.toLowerCase().includes('program') || s.name.toLowerCase().includes('software')) ? `Para ${subjects.find(s => s.name.toLowerCase().includes('program') || s.name.toLowerCase().includes('software'))?.name}, también te recomiendo hacer un proyecto personal para aplicar lo aprendido.` : '¿Tienes algún error específico con el que necesites ayuda?'}`;
  }

  // ══ GRACIAS ══
  if (/^(gracias|thank|genial|perfecto|excelente|muy bien|buenisimo|ok gracias|listo)/.test(q)) {
    const replies = [
      '¡Con gusto! 😊 Estoy aquí cuando me necesites.',
      '¡Para eso estoy! 💪 ¿Algo más en lo que pueda ayudarte?',
      '¡Mucho éxito en tus estudios! 🎓 Cualquier cosa, aquí estoy.',
    ];
    return replies[Math.floor(Math.random() * replies.length)];
  }

  // ══ RESPUESTA GENÉRICA INTELIGENTE ══
  const contextual = [
    subjects.length ? `Basándome en tus ${subjects.length} materias, te recomiendo priorizar ${nearExams[0]?.name || subjects[0]?.name || 'la materia más urgente'} hoy.` : null,
    pendingObjs.length ? `Tienes ${pendingObjs.length} objetivos pendientes. ¿Quieres que los organicemos por prioridad?` : null,
    streak > 0 ? `Llevas ${streak} días de racha — ¡sigue así! 🔥` : null,
    'Puedo ayudarte con técnicas de estudio, organizar tu horario, repasar tus materias o motivarte. ¿Qué necesitas?',
  ].filter(Boolean);

  return contextual[Math.floor(Math.random() * Math.min(contextual.length, 3))];
}

/* ---- Send ---- */
async function sendMsg(text) {
  const inp = document.getElementById('chatIn');
  const msg = text || inp.value.trim();
  if (!msg) return;
  inp.value = '';

  _chatHistory.push({ role: 'user', text: msg, time: getNow() });
  renderChat();
  _showTyping();

  // Simula tiempo de "pensamiento"
  await new Promise(r => setTimeout(r, 600 + Math.random() * 500));
  document.getElementById('tdot')?.remove();

  const reply = _buildResponse(msg);
  _chatHistory.push({ role: 'ai', text: reply, time: getNow() });
  renderChat();
}

function sendQ(text) { sendMsg(text); }

function _showTyping() {
  const c = document.getElementById('chatBox');
  const td = document.createElement('div');
  td.className = 'msg ai'; td.id = 'tdot';
  td.innerHTML = `
    <div class="mav aiv">✦</div>
    <div><div class="mb"><div class="tdots"><span></span><span></span><span></span></div></div></div>`;
  c.appendChild(td);
  c.scrollTop = c.scrollHeight;
}