// admin-fixes.js
// Masque le doublon "Ajouter un nouveau gagnant" dans la page /admin
(function () {
  if (!/\/admin(?:\/|$)/.test(location.pathname)) return;

  function hideDuplicateWinnerForm() {
    // on cherche un titre contenant "Ajouter un nouveau gagnant"
    const nodes = Array.from(document.querySelectorAll('h1,h2,h3,h4,div,span,p'))
      .filter(el => /ajouter un nouveau gagnant/i.test(el.textContent || ''));

    nodes.forEach(el => {
      const section =
        el.closest('section') ||
        el.closest('div[class*="card"], div[class*="panel"], div[class*="section"]') ||
        el.closest('div');

      if (section) {
        section.style.display = 'none';
        section.setAttribute('data-hidden-by', 'admin-fixes.js');
      }
    });
  }

  // exécute maintenant…
  hideDuplicateWinnerForm();
  // …et à chaque render React (SPA)
  const obs = new MutationObserver(hideDuplicateWinnerForm);
  obs.observe(document.body, { childList: true, subtree: true });
})();
