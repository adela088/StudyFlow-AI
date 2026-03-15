/* =============================================
   StudyFlow AI — js/state.js
   Estado global de la aplicación (store)
   Los datos reales se cargan desde Firebase
   en index.html al iniciar sesión.
   ============================================= */

const COLORS = ['#00d4ff','#7b5fff','#ff6b6b','#00ff9d','#ffb700','#ff9f43','#ee5a24','#0652dd'];

const State = {
  // Arrays vacíos — se llenan desde Firebase al hacer login
  subjects:    [],
  sessions:    [],
  objectives:  [],

  productivity: [
    { day:'L', hrs:0 }, { day:'M', hrs:0 }, { day:'X', hrs:0 },
    { day:'J', hrs:0 }, { day:'V', hrs:0 }, { day:'S', hrs:0 }, { day:'D', hrs:0 },
  ],

  streak:     0,
  weekOffset: 0,
  _nextId:    100, // Empieza en 100 para evitar colisión con IDs de Firebase

  // --- Helpers ---
  nextId()       { return ++this._nextId; },
  getSubject(id) { return this.subjects.find(s => s.id === id); },
  todayIdx()     { return (new Date().getDay() + 6) % 7; }, // Lun=0
};
