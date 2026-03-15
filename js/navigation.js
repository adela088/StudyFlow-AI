/* =============================================
   StudyFlow AI — js/navigation.js
   Enrutamiento entre páginas (SPA)
   ============================================= */

/** Navega a una sección y dispara su render */
function nav(page) {
  document.querySelectorAll('.page').forEach(x => x.classList.remove('active'));
  document.querySelectorAll('.nav-item[data-p]').forEach(x => x.classList.remove('active'));

  document.getElementById('page-' + page).classList.add('active');
  const ni = document.querySelector(`[data-p="${page}"]`);
  if (ni) ni.classList.add('active');

  const renders = {
    dashboard:  refreshDash,
    schedule:   renderSched,
    subjects:   renderSubjs,
    objectives: renderObjs,
    stats:      renderStats,
    settings:   renderSettings,
  };
  if (renders[page]) renders[page]();
}
