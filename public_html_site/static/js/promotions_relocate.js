// /static/js/promotions_relocate.js
(function () {
  function findHero() {
    return document.querySelector('#hero, section[id*="hero"], [data-section="hero"], .hero, .hero-section');
  }
  function findWidget() {
    // ton widget : <section id="promotions-widget">…</section>
    const direct = document.getElementById('promotions-widget');
    if (direct) return direct;
    // fallback: si ton widget a rendu un #promos-section à l'intérieur
    const inner = document.getElementById('promos-section');
    return inner ? (inner.closest('section') || inner) : null;
  }
  function moveAfterHero() {
    const hero = findHero();
    const widget = findWidget();
    if (!hero || !widget) return false;
    if (hero.nextElementSibling === widget) return true; // déjà bien placé
    hero.parentNode.insertBefore(widget, hero.nextSibling);
    return true;
  }

  // 1) Essai immédiat après DOM ready
  function tryNow() { return moveAfterHero(); }

  // 2) Après "load" + petites tentatives (React peut monter un peu plus tard)
  window.addEventListener('load', function () {
    let tries = 0;
    const timer = setInterval(function () {
      tries++;
      if (moveAfterHero() || tries > 50) clearInterval(timer);
    }, 200);
  });

  // 3) Tentative rapide DOMContentLoaded
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', tryNow, { once: true });
  } else {
    tryNow();
  }

  // 4) Sécurité ultime : si le Hero apparaît plus tard, on observe le DOM
  const obs = new MutationObserver(() => {
    if (moveAfterHero()) obs.disconnect();
  });
  obs.observe(document.documentElement, { childList: true, subtree: true });
  // Arrêt d’observation au bout de 15s
  setTimeout(() => obs.disconnect(), 15000);
})();
