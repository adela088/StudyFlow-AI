/* =============================================
   StudyFlow AI — js/modals.js
   Control de modales
   ============================================= */

function openMo(id)  { document.getElementById(id).classList.add('active'); }
function closeMo(id) { document.getElementById(id).classList.remove('active'); }

/* Cierra al hacer click fuera del modal */
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.mo').forEach(m => {
    m.addEventListener('click', e => {
      if (e.target === m) m.classList.remove('active');
    });
  });
});
