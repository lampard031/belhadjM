(function(){
  const API="/api/promotions.php";
  const state={ row:null, step:640 };

  const ico = {
    calendar:'📅', time:'⏱️', pin:'📍', ticket:'🎫'
  };

  function findHero(){
    return document.querySelector("#hero")
        || document.querySelector('[data-section="hero"]')
        || document.querySelector("section");
  }

  const fmt = (iso)=>{
    if(!iso) return "";
    const d = new Date(iso);
    return d.toLocaleDateString("fr-CA",{day:"numeric",month:"short"}).replace(".","");
  };

  function computeStep(){
    if(!state.row) return;
    const card = state.row.querySelector(".promo-card");
    if(card){
      const gap = parseFloat(getComputedStyle(state.row).gap || 16);
      state.step = card.getBoundingClientRect().width + (isNaN(gap)?16:gap);
    }
    updateArrows();
  }
  function atStart(){ return state.row ? state.row.scrollLeft <= 2 : true; }
  function atEnd(){
    if(!state.row) return false;
    const {scrollLeft,scrollWidth,clientWidth} = state.row;
    return scrollLeft + clientWidth >= scrollWidth - 2;
  }
  function updateArrows(){
    const prev=document.querySelector(".promotions-section .promo-prev");
    const next=document.querySelector(".promotions-section .promo-next");
    if(!prev||!next) return;
    prev.disabled = atStart();
    next.disabled = atEnd();
  }

  function attachNav(section){
    const row=section.querySelector(".promo-row");
    const prev=section.querySelector(".promo-prev");
    const next=section.querySelector(".promo-next");
    state.row=row;
    computeStep();
    const ro=new ResizeObserver(computeStep); ro.observe(row);

    prev.addEventListener("click", ()=>{ row.scrollLeft -= state.step; setTimeout(updateArrows,60); });
    next.addEventListener("click", ()=>{ row.scrollLeft += state.step; setTimeout(updateArrows,60); });

    // drag/touch
    let down=false, sx=0, sl=0;
    row.addEventListener("pointerdown", e=>{down=true;sx=e.clientX;sl=row.scrollLeft;row.setPointerCapture(e.pointerId)});
    row.addEventListener("pointermove", e=>{if(!down) return;row.scrollLeft=sl-(e.clientX-sx);updateArrows();});
    row.addEventListener("pointerup", ()=>{down=false;});
    row.addEventListener("scroll", updateArrows, {passive:true});
    window.addEventListener("resize", ()=>{computeStep();updateArrows();});
  }

  function cardHTML(p){
    const start=fmt(p.start_date), end=fmt(p.end_date);
    const dates = start && end ? `${start} – ${end}` : (start || end || "");
    const img   = p.image_url || p.image || "";
    const coin  = (p.badge || p.coin || p.amount_label || "");
    const city  = p.location || "Casino TRIPLE 7, Oka";
    const strip = p.highlight || p.strip || ""; // ex: "4 gagnants par jour…"
    const times = p.times || p.time_text || ""; // ex: "13h, 15h, 17h, 19h"

    return `
    <article class="promo-card" aria-label="${(p.title||'Promotion').replace(/"/g,'&quot;')}">
      <div class="promo-media">
        <img src="${img}" alt="${(p.title||'Promotion').replace(/"/g,'&quot;')}" loading="lazy">
        ${coin?`<div class="promo-coin">💰 ${coin}</div>`:''}
      </div>

      <div class="promo-body">
        <div class="promo-chip">${ico.ticket}&nbsp; Promos & Contests</div>

        <div class="promo-h3">
          <i>🎟️</i>
          <div class="promo-title-text">${p.title||""}</div>
        </div>

        ${p.description?`<p class="promo-desc">${p.description}</p>`:''}

        <ul class="promo-meta">
          ${dates?`<li><span class="ic">${ico.calendar}</span><span>${dates}</span></li>`:''}
          ${times?`<li><span class="ic">${ico.time}</span><span>${times}</span></li>`:''}
          <li><span class="ic">${ico.pin}</span><span>${city}</span></li>
        </ul>

        ${strip?`<div class="promo-strip">${strip}</div>`:''}

        <a class="promo-cta" href="${p.cta_url||'#contact'}">${p.cta_text||'PARTICIPER MAINTENANT'} 🎉</a>
      </div>
    </article>`;
  }

  function sectionHTML(items){
    return `
    <section id="promotions-section" class="promotions-section">
      <div class="wrap edge-fade">
        <header class="promo-head">
          <h2 class="promo-title">Promotions & Contests</h2>
          <div class="promo-underline"></div>
          <p class="promo-sub">Don't miss any of our exceptional promotions and exclusive events</p>
        </header>

        <div class="promo-filter">
          <div class="promo-pill">✅ Ongoing</div>
        </div>

        <div class="promo-row">
          ${items.map(cardHTML).join("")}
        </div>

        <div class="promo-nav" aria-hidden="false">
          <button class="promo-prev" aria-label="Previous">‹</button>
          <button class="promo-next" aria-label="Next">›</button>
        </div>
      </div>
    </section>`;
  }

  async function init(){
    try{
      const r=await fetch(API+"?v="+Date.now(),{cache:"no-store"});
      if(!r.ok) return;
      const j=await r.json();
      const items=j.promotions||j||[];
      if(!items.length) return;
      if(document.getElementById("promotions-section")) return;

      // mapping léger pour coller au visuel du site : si la DB fournit un champ "info_bar"
      items.forEach(p=>{
        p.highlight = p.highlight || p.info_bar || "";
        p.times     = p.times     || p.hours || p.schedule || "";
        // exemple: "20 000$" -> coin
        if(!p.coin && (p.fixed_amount || p.amount)){
          const amt = (p.fixed_amount||p.amount);
          p.coin = `${Number(amt).toLocaleString('fr-CA')} $`;
        }
      });

      const hero=findHero(); if(!hero||!hero.parentNode) return;
      const container=document.createElement("div");
      container.innerHTML = sectionHTML(items);
      const section = container.firstElementChild;
      hero.parentNode.insertBefore(section, hero.nextSibling);
      attachNav(section);
    }catch(e){ console.warn("[promotions] error", e); }
  }

  let tries=0; const t=setInterval(()=>{ if(findHero()){ clearInterval(t); init(); } if(++tries>15) clearInterval(t); },300);
})();
