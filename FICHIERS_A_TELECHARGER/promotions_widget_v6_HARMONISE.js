// /static/js/promotions_widget.js - v6.0 FINAL Harmonisé
(function () {
  const WIDGET_ID = 'promotions-widget';
  let currentIndex = 0;
  let promotionsData = [];

  // Endpoints
  const ENDPOINTS = [
    '/api/promotions_TEST.php',
    '/api/promotions.php?flat=1&lang=fr',
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

  Object.assign(widget.style, { background: 'transparent', color: '#fff', margin: '0', padding: '0' });

  // === CSS Harmonisé avec le site ===
  if (!document.getElementById('promo-skin')) {
    const s = document.createElement('style');
    s.id = 'promo-skin';
    s.textContent = `
      /* Section promotions harmonisée */
      #${WIDGET_ID} .promo-section {
        padding: 80px 0;
        background: linear-gradient(180deg, #000000 0%, #1f2937 50%, #000000 100%);
        position: relative;
      }
      
      /* Titre principal */
      #${WIDGET_ID} .section-title {
        text-align: center;
        font-size: 48px;
        font-weight: 900;
        color: transparent;
        background: linear-gradient(45deg, #fbbf24, #dc2626, #fbbf24);
        -webkit-background-clip: text;
        background-clip: text;
        margin: 0 0 48px 0;
        text-transform: uppercase;
        letter-spacing: 2px;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      }
      
      /* Conteneur carousel */
      #${WIDGET_ID} .carousel-container {
        position: relative;
        max-width: 1200px;
        margin: 0 auto;
        padding: 0 80px;
      }
      
      /* Card promotion - FORMAT VERTICAL */
      #${WIDGET_ID} .promo-card {
        background: rgba(255, 255, 255, 0.03);
        border-radius: 24px;
        overflow: hidden;
        border: 2px solid rgba(251, 191, 36, 0.2);
        box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
        transition: all 0.3s ease;
      }
      
      #${WIDGET_ID} .promo-card:hover {
        transform: translateY(-5px);
        border-color: rgba(251, 191, 36, 0.5);
        box-shadow: 0 30px 80px rgba(251, 191, 36, 0.2);
      }
      
      /* Image verticale cliquable */
      #${WIDGET_ID} .promo-img-container {
        position: relative;
        width: 100%;
        height: 500px;
        overflow: hidden;
        cursor: pointer;
      }
      
      #${WIDGET_ID} .promo-img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        transition: transform 0.3s ease;
      }
      
      #${WIDGET_ID} .promo-img-container:hover .promo-img {
        transform: scale(1.05);
      }
      
      /* Badge "En cours" sur l'image */
      #${WIDGET_ID} .promo-status-badge {
        position: absolute;
        top: 20px;
        right: 20px;
        padding: 8px 20px;
        border-radius: 999px;
        font-weight: 800;
        font-size: 14px;
        text-transform: uppercase;
        background: linear-gradient(135deg, #10b981, #059669);
        color: #000;
        box-shadow: 0 4px 12px rgba(16, 185, 129, 0.4);
      }
      
      #${WIDGET_ID} .promo-status-badge.upcoming {
        background: linear-gradient(135deg, #f59e0b, #d97706);
      }
      
      /* Contenu texte EN BAS */
      #${WIDGET_ID} .promo-content {
        padding: 32px;
        background: linear-gradient(180deg, rgba(31, 41, 55, 0.8), rgba(0, 0, 0, 0.9));
      }
      
      #${WIDGET_ID} .promo-title {
        margin: 0 0 12px 0;
        font-size: 28px;
        line-height: 1.2;
        color: #fbbf24;
        font-weight: 800;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      }
      
      #${WIDGET_ID} .promo-dates {
        margin: 0 0 16px 0;
        font-size: 14px;
        color: #facc15;
        opacity: 0.9;
        font-weight: 600;
      }
      
      #${WIDGET_ID} .promo-desc {
        margin: 0;
        color: rgba(255, 255, 255, 0.85);
        line-height: 1.6;
        font-size: 16px;
      }
      
      /* Flèches navigation */
      #${WIDGET_ID} .carousel-arrow {
        position: absolute;
        top: 250px;
        transform: translateY(-50%);
        background: linear-gradient(135deg, #fbbf24, #f59e0b);
        border: none;
        width: 56px;
        height: 56px;
        border-radius: 50%;
        color: #000;
        font-size: 28px;
        font-weight: bold;
        cursor: pointer;
        z-index: 10;
        transition: all 0.3s ease;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 8px 24px rgba(251, 191, 36, 0.4);
      }
      
      #${WIDGET_ID} .carousel-arrow:hover {
        background: linear-gradient(135deg, #f59e0b, #d97706);
        transform: translateY(-50%) scale(1.1);
        box-shadow: 0 12px 32px rgba(251, 191, 36, 0.6);
      }
      
      #${WIDGET_ID} .carousel-arrow.prev { left: 0; }
      #${WIDGET_ID} .carousel-arrow.next { right: 0; }
      
      /* Indicateurs pagination */
      #${WIDGET_ID} .carousel-dots {
        display: flex;
        justify-content: center;
        gap: 12px;
        margin-top: 40px;
      }
      
      #${WIDGET_ID} .carousel-dot {
        width: 12px;
        height: 12px;
        border-radius: 50%;
        background: rgba(255, 255, 255, 0.3);
        cursor: pointer;
        transition: all 0.3s ease;
      }
      
      #${WIDGET_ID} .carousel-dot.active {
        background: linear-gradient(135deg, #fbbf24, #f59e0b);
        width: 36px;
        border-radius: 6px;
        box-shadow: 0 4px 12px rgba(251, 191, 36, 0.5);
      }
      
      /* Lightbox */
      #${WIDGET_ID} .lightbox {
        display: none;
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.95);
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
        box-shadow: 0 20px 60px rgba(251, 191, 36, 0.3);
      }
      
      #${WIDGET_ID} .lightbox-close {
        position: absolute;
        top: 30px;
        right: 40px;
        font-size: 48px;
        color: #fff;
        cursor: pointer;
        background: linear-gradient(135deg, #fbbf24, #f59e0b);
        width: 56px;
        height: 56px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: bold;
        transition: all 0.3s ease;
        line-height: 1;
      }
      
      #${WIDGET_ID} .lightbox-close:hover {
        background: linear-gradient(135deg, #dc2626, #b91c1c);
        transform: rotate(90deg);
      }
      
      /* Loading & erreur */
      #${WIDGET_ID} .promo-loading,
      #${WIDGET_ID} .promo-error {
        max-width: 1100px;
        margin: 0 auto;
        padding: 48px 16px;
        text-align: center;
        color: #fff;
      }
      
      #${WIDGET_ID} .promo-error-box {
        background: rgba(220, 38, 38, 0.1);
        border: 2px solid rgba(220, 38, 38, 0.3);
        border-radius: 16px;
        padding: 24px;
        color: #fca5a5;
      }
      
      /* Responsive Mobile */
      @media (max-width: 1000px) {
        #${WIDGET_ID} .section-title {
          font-size: 32px;
          margin-bottom: 32px;
        }
        
        #${WIDGET_ID} .carousel-container {
          padding: 0 60px;
        }
        
        #${WIDGET_ID} .promo-img-container {
          height: 350px;
        }
        
        #${WIDGET_ID} .promo-content {
          padding: 24px;
        }
        
        #${WIDGET_ID} .promo-title {
          font-size: 22px;
        }
        
        #${WIDGET_ID} .carousel-arrow {
          width: 48px;
          height: 48px;
          font-size: 24px;
        }
        
        #${WIDGET_ID} .carousel-arrow.prev { left: -5px; }
        #${WIDGET_ID} .carousel-arrow.next { right: -5px; }
      }
    `;
    document.head.appendChild(s);
  }

  // Helper functions
  function html(arr) { return arr[0]; }
  function pick(obj, keys) {
    for (let k of keys) if (obj[k]) return obj[k];
    return null;
  }
  function normalizeStatus(val) {
    const v = String(val||'').toLowerCase();
    if (v==='' || v==='1' || v==='true' || v==='active' || v==='ongoing') return 'active';
    if (v.includes('upcoming')) return 'upcoming';
    return 'active';
  }
  function normalizeArray(data) {
    if (Array.isArray(data)) return data;
    if (data && Array.isArray(data.promotions)) return data.promotions;
    if (data && Array.isArray(data.data)) return data.data;
    if (data && typeof data === 'object') {
      const arr = [];
      for (let k in data) {
        if (data.hasOwnProperty(k) && typeof data[k] === 'object' && k !== '_debug') {
          arr.push(data[k]);
        }
      }
      if (arr.length) return arr;
    }
    return [];
  }

  // Fetch avec debug
  async function fetchFirstWorking() {
    for (const url of ENDPOINTS) {
      try {
        console.log('🔍 Essai:', url);
        const r = await fetch(url, { credentials: 'same-origin', cache: 'no-cache' });
        console.log('📡 Status:', r.status);
        
        if (!r.ok) continue;
        
        const data = await r.json();
        console.log('📦 Data:', data);
        
        const arr = normalizeArray(data);
        console.log('✅ Promotions:', arr.length);
        
        if (arr.length) return arr;
      } catch (e) {
        console.error('❌ Erreur:', url, e);
      }
    }
    throw new Error('Aucun endpoint disponible');
  }

  // Navigation
  function navigateCarousel(direction) {
    if (!promotionsData.length) return;
    
    if (direction === 'next') {
      currentIndex = (currentIndex + 1) % promotionsData.length;
    } else {
      currentIndex = (currentIndex - 1 + promotionsData.length) % promotionsData.length;
    }
    renderPromotions(promotionsData);
  }

  function goToSlide(index) {
    currentIndex = index;
    renderPromotions(promotionsData);
  }

  // Lightbox
  function openLightbox(imgSrc) {
    const lightbox = document.createElement('div');
    lightbox.className = 'lightbox active';
    lightbox.innerHTML = `
      <span class="lightbox-close">×</span>
      <img class="lightbox-img" src="${imgSrc}" alt="Promotion">
    `;
    widget.appendChild(lightbox);
    
    lightbox.querySelector('.lightbox-close').addEventListener('click', () => {
      lightbox.remove();
    });
    
    lightbox.addEventListener('click', (e) => {
      if (e.target === lightbox) lightbox.remove();
    });
  }

  // Render
  function renderPromotions(promos) {
    if (!promos || !promos.length) {
      renderError('Aucune promotion disponible.');
      return;
    }
    
    promotionsData = promos;
    const p = promos[currentIndex];
    const title = pick(p, ['title_fr','title','name']) || 'Promotion';
    const desc  = pick(p, ['description_fr','description','desc','text']) || '';
    const statusKey = normalizeStatus(p.status || p.state || p.isActive || p.active);
    const statusTxt = statusKey === 'upcoming' ? 'À venir' : 'En cours';
    const dates = (p.start_date && p.end_date) ? `${p.start_date} — ${p.end_date}` : '';
    const img   = pick(p, ['image_url','image','photo']) || '';

    const dots = promos.map((_, idx) => 
      `<span class="carousel-dot ${idx === currentIndex ? 'active' : ''}" data-index="${idx}"></span>`
    ).join('');

    widget.innerHTML = html`
      <section class="promo-section">
        <h2 class="section-title">Promotions et Jeux</h2>
        
        <div class="carousel-container">
          ${promos.length > 1 ? '<button class="carousel-arrow prev" data-dir="prev">‹</button>' : ''}
          
          <div class="promo-card">
            <div class="promo-img-container" data-lightbox="${img}">
              ${img ? `<img class="promo-img" src="${img}" alt="${title}">` : ''}
              <div class="promo-status-badge ${statusKey==='upcoming'?'upcoming':''}">${statusTxt}</div>
            </div>
            
            <div class="promo-content">
              <h3 class="promo-title">${title}</h3>
              ${dates ? `<div class="promo-dates">📅 ${dates}</div>` : ''}
              ${desc ? `<p class="promo-desc">${desc}</p>` : ''}
            </div>
          </div>
          
          ${promos.length > 1 ? '<button class="carousel-arrow next" data-dir="next">›</button>' : ''}
        </div>
        
        ${promos.length > 1 ? `<div class="carousel-dots">${dots}</div>` : ''}
      </section>
    `;
    
    // Event listeners
    widget.querySelectorAll('.carousel-arrow').forEach(arrow => {
      arrow.addEventListener('click', () => navigateCarousel(arrow.dataset.dir));
    });
    
    widget.querySelectorAll('.carousel-dot').forEach(dot => {
      dot.addEventListener('click', () => goToSlide(parseInt(dot.dataset.index)));
    });
    
    const imgContainer = widget.querySelector('.promo-img-container');
    if (imgContainer && img) {
      imgContainer.addEventListener('click', () => openLightbox(img));
    }
  }

  function showLoading() {
    widget.innerHTML = '<div class="promo-loading">⏳ Chargement des promotions...</div>';
  }

  function renderError(msg) {
    widget.innerHTML = `
      <div class="promo-error">
        <div class="promo-error-box">
          ⚠️ ${msg}
        </div>
      </div>
    `;
  }

  // Init
  showLoading();
  fetchFirstWorking()
    .then(data => {
      console.log('🎰 Promotions:', data);
      renderPromotions(data);
    })
    .catch(() => renderError('Impossible de charger les promotions.'));
})();
