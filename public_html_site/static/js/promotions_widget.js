// /static/js/promotions_widget.js  (v5.0 – Carousel + Lightbox)
(function () {
  const WIDGET_ID = 'promotions-widget';
  let currentIndex = 0;
  let promotionsData = [];

  // Endpoints avec fallback local
  const ENDPOINTS = [
    '/uploads/promotions.json',                 // fallback local
    '/api/promotions.php?flat=1&lang=fr',
    '/api/promotions.php?lang=fr',
    '/api/promotions.php?flat=1',
    '/api/promotions.php'
  ];

  // Récupère / crée le conteneur
  let widget = document.getElementById(WIDGET_ID);
  if (!widget) {
    widget = document.createElement('section');
    widget.id = WIDGET_ID;
    document.body.appendChild(widget);
  }

  // Style minimal par défaut (au cas où)
  Object.assign(widget.style, { background: 'transparent', color: '#fff', margin: '0', padding: '0' });

  // === Injection d’un petit CSS (cadre + fond section) ===
  if (!document.getElementById('promo-skin')) {
    const s = document.createElement('style');
    s.id = 'promo-skin';
    s.textContent = `
      /* Section avec fond sombre */
      #${WIDGET_ID} .promo-section {
        padding: 56px 0;
        background: linear-gradient(180deg,#0b0e13 0%, #111827 100%);
      }
      
      /* Titre principal de la section */
      #${WIDGET_ID} .section-title {
        text-align: center;
        font-size: 48px;
        font-weight: 800;
        color: #fff;
        margin: 0 0 16px 0;
        text-transform: uppercase;
        letter-spacing: 1px;
      }
      
      /* Badge statut centré */
      #${WIDGET_ID} .promo-status-top {
        text-align: center;
        margin-bottom: 32px;
      }
      #${WIDGET_ID} .promo-status {
        display: inline-block;
        padding: 8px 20px;
        border-radius: 999px;
        font-weight: 800;
        font-size: 14px;
        color: #0b0f14;
        background: #10b981;
        text-transform: uppercase;
      }
      #${WIDGET_ID} .promo-status.upcoming { background:#f59e0b; }
      
      /* Conteneur du carousel */
      #${WIDGET_ID} .carousel-container {
        position: relative;
        max-width: 1200px;
        margin: 0 auto;
        padding: 0 60px;
      }
      
      /* Cadre visible */
      #${WIDGET_ID} .promo-frame {
        padding: 24px;
        border: 2px solid rgba(234,179,8,.28);
        border-radius: 24px;
        background: rgba(255,255,255,.03);
        box-shadow: 0 20px 60px rgba(0,0,0,.55);
      }
      
      /* Grille contenu */
      #${WIDGET_ID} .promo-grid {
        display: grid;
        grid-template-columns: 1.2fr 1fr;
        gap: 28px;
        align-items: center;
      }
      
      /* Image cliquable */
      #${WIDGET_ID} .promo-img {
        width: 100%;
        height: 460px;
        border-radius: 16px;
        object-fit: cover;
        background: #0b0e13;
        cursor: pointer;
        transition: transform 0.3s ease, box-shadow 0.3s ease;
      }
      #${WIDGET_ID} .promo-img:hover {
        transform: scale(1.02);
        box-shadow: 0 8px 30px rgba(234,179,8,.4);
      }
      
      /* Flèches de navigation */
      #${WIDGET_ID} .carousel-arrow {
        position: absolute;
        top: 50%;
        transform: translateY(-50%);
        background: rgba(234,179,8,.9);
        border: none;
        width: 50px;
        height: 50px;
        border-radius: 50%;
        color: #0b0e13;
        font-size: 24px;
        font-weight: bold;
        cursor: pointer;
        z-index: 10;
        transition: all 0.3s ease;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      #${WIDGET_ID} .carousel-arrow:hover {
        background: rgba(234,179,8,1);
        transform: translateY(-50%) scale(1.1);
      }
      #${WIDGET_ID} .carousel-arrow.prev { left: 0; }
      #${WIDGET_ID} .carousel-arrow.next { right: 0; }
      
      /* Indicateurs de pagination */
      #${WIDGET_ID} .carousel-dots {
        display: flex;
        justify-content: center;
        gap: 10px;
        margin-top: 24px;
      }
      #${WIDGET_ID} .carousel-dot {
        width: 12px;
        height: 12px;
        border-radius: 50%;
        background: rgba(255,255,255,.3);
        cursor: pointer;
        transition: all 0.3s ease;
      }
      #${WIDGET_ID} .carousel-dot.active {
        background: rgba(234,179,8,1);
        width: 32px;
        border-radius: 6px;
      }
      
      /* Contenu texte */
      #${WIDGET_ID} .promo-title {
        margin: 0 0 12px 0;
        font-size: 32px;
        line-height: 1.15;
        color: #fff;
        font-weight: 700;
      }
      #${WIDGET_ID} .promo-dates { 
        opacity: .85; 
        margin: 0 0 6px 0; 
        color: #ffe08a;
      }
      #${WIDGET_ID} .promo-desc  { 
        opacity: .9;  
        margin: 0 0 16px 0; 
        line-height: 1.6;
      }
      #${WIDGET_ID} .promo-cta {
        background: linear-gradient(135deg,#e11d48,#ef4444);
        border: none; 
        border-radius: 10px; 
        color: #fff; 
        font-weight: 800;
        padding: 14px 28px; 
        cursor: pointer;
        font-size: 16px;
        transition: all 0.3s ease;
        text-decoration: none;
        display: inline-block;
      }
      #${WIDGET_ID} .promo-cta:hover {
        transform: translateY(-2px);
        box-shadow: 0 8px 20px rgba(225,29,72,.4);
      }
      
      /* Lightbox */
      #${WIDGET_ID} .lightbox {
        display: none;
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,.95);
        z-index: 9999;
        align-items: center;
        justify-content: center;
        padding: 20px;
      }
      #${WIDGET_ID} .lightbox.active { display: flex; }
      #${WIDGET_ID} .lightbox-img {
        max-width: 90%;
        max-height: 90%;
        object-fit: contain;
        border-radius: 12px;
      }
      #${WIDGET_ID} .lightbox-close {
        position: absolute;
        top: 20px;
        right: 30px;
        font-size: 40px;
        color: #fff;
        cursor: pointer;
        background: rgba(234,179,8,.8);
        width: 50px;
        height: 50px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: bold;
        transition: all 0.3s ease;
      }
      #${WIDGET_ID} .lightbox-close:hover {
        background: rgba(234,179,8,1);
        transform: rotate(90deg);
      }
      
      /* Loading & erreur */
      #${WIDGET_ID} .promo-loading,
      #${WIDGET_ID} .promo-error {
        max-width: 1100px; margin: 0 auto; padding: 24px 16px; text-align: center;
      }
      #${WIDGET_ID} .promo-error-box {
        background: rgba(239,68,68,.12); border: 1px solid rgba(239,68,68,.35);
        border-radius: 12px; padding: 16px;
      }
      
      /* Responsive Mobile */
      @media (max-width: 1000px) {
        #${WIDGET_ID} .section-title {
          font-size: 36px;
        }
        #${WIDGET_ID} .carousel-container {
          padding: 0 20px;
        }
        #${WIDGET_ID} .promo-grid { 
          grid-template-columns: 1fr;
          text-align: center;
        }
        #${WIDGET_ID} .promo-img { height: 300px; }
        #${WIDGET_ID} .promo-title { font-size: 24px; }
        #${WIDGET_ID} .carousel-arrow {
          width: 40px;
          height: 40px;
          font-size: 20px;
        }
        #${WIDGET_ID} .carousel-arrow.prev { left: -10px; }
        #${WIDGET_ID} .carousel-arrow.next { right: -10px; }
      }
    `;
    document.head.appendChild(s);
  }

  // Helpers
  const html = (s, ...v) => s.reduce((a, b, i) => a + b + (v[i] ?? ''), '');
  const normalizeArray = (data) => (Array.isArray(data) ? data : (data && Array.isArray(data.promotions) ? data.promotions : []));
  const pick = (row, keys) => { for (const k of keys) { const v = row && row[k]; if (typeof v === 'string' && v.trim()) return v; } return ''; };
  const normalizeStatus = (s) => {
    const v = String(s ?? '').toLowerCase();
    if (!v) return 'ongoing';
    if (['active','ongoing','1','true','yes'].includes(v)) return 'ongoing';
    if (v.includes('upcoming')) return 'upcoming';
    return 'ongoing';
  };

  function showLoading() {
    widget.innerHTML = `
      <div class="promo-loading">
        <div style="display:inline-flex;align-items:center;gap:12px;padding:10px 16px;border-radius:12px;background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.15)">
          <span style="width:12px;height:12px;border-radius:50%;background:#e11d48;display:inline-block;animation: pulse 1s infinite"></span>
          <span>Chargement des promotions…</span>
        </div>
      </div>
      <style>@keyframes pulse{0%{opacity:.2}50%{opacity:1}100%{opacity:.2}}</style>
    `;
  }

  function renderError(msg='Erreur de chargement') {
    widget.innerHTML = `
      <section class="promo-section">
        <div class="promo-error">
          <div class="promo-error-box">
            <strong style="color:#fecaca">Promotions</strong><br/>
            <span style="color:#fecaca;opacity:.95">${msg}</span>
          </div>
        </div>
      </section>
    `;
  }

  function renderPromotions(promos) {
    if (!promos || !promos.length) {
      renderError('Aucune promotion active pour le moment.');
      return;
    }
    const p = promos[0]; // on affiche la première
    const title = pick(p, ['title_fr','title','name']) || 'Promotion';
    const desc  = pick(p, ['description_fr','description','desc','text']);
    const statusKey = normalizeStatus(p.status || p.state || p.isActive || p.active);
    const statusTxt = statusKey === 'upcoming' ? 'À venir' : 'En cours';
    const dates = (p.start_date && p.end_date) ? `${p.start_date} — ${p.end_date}` : '';
    const img   = pick(p, ['image_url','image','photo']);
    const cta   = pick(p, ['cta_text_fr','cta_text']) || 'Participer maintenant';

    widget.innerHTML = html`
      <section class="promo-section">
        <div class="promo-frame">
          <div class="promo-grid">
            <div>
              ${img ? `<img class="promo-img" src="${img}" alt="">` : ''}
            </div>
            <div>
              <div class="promo-badges">
                <span class="promo-badge">Promotions & Concours</span>
                <span class="promo-status ${statusKey==='upcoming' ? 'upcoming':''}">${statusTxt}</span>
              </div>
              <h2 class="promo-title">${title}</h2>
              ${dates ? `<div class="promo-dates">${dates}</div>` : ''}
              ${desc ? `<p class="promo-desc">${desc}</p>` : ''}
              <button class="promo-cta">${cta}</button>
            </div>
          </div>
        </div>
      </section>
    `;
  }

  // Placement après le Hero (fallback après #root)
  function placeAfterHeroOrRoot() {
    const hero = document.querySelector('#hero, section#hero, [data-hero="true"]');
    if (hero && !widget.__placed) {
      hero.insertAdjacentElement('afterend', widget);
      widget.__placed = true;
      return true;
    }
    return false;
  }
  function placeAfterRoot() {
    const root = document.getElementById('root');
    if (root && root.parentNode && !widget.__placed) {
      root.insertAdjacentElement('afterend', widget);
      widget.__placed = true;
      return true;
    }
    return false;
  }
  const observer = new MutationObserver(() => { if (placeAfterHeroOrRoot()) observer.disconnect(); });
  observer.observe(document.body, { childList: true, subtree: true });
  setTimeout(() => { if (!widget.__placed) { if (!placeAfterHeroOrRoot()) placeAfterRoot(); observer.disconnect(); } }, 2000);

  // Fetch avec fallback
  async function fetchFirstWorking() {
    for (const url of ENDPOINTS) {
      try {
        const r = await fetch(url, { credentials: 'same-origin' });
        if (!r.ok) continue;
        const data = await r.json();
        const arr = normalizeArray(data);
        if (url === ENDPOINTS[0]) return arr; // JSON local — même vide accepté
        if (arr.length) return arr;
      } catch (_) {}
    }
    throw new Error('Aucun endpoint disponible');
  }

  showLoading();
  fetchFirstWorking()
    .then(renderPromotions)
    .catch(() => renderError('Impossible de charger les promotions.'));
})();
