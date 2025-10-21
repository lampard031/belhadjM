// admin-bridge.js
// Branche l’admin vers l’API PHP (/api) sans toucher au bundle minifié.

(function () {
  if (!/\/admin(?:\/|$)/.test(location.pathname)) return;

  const API = window.API_BASE || '/api';
  const TOKEN = window.ADMIN_TOKEN || '';

  // -------- util --------
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
  const sleep = (ms) => new Promise(r => setTimeout(r, ms));

  // Insère une alerte simple
  function toast(msg, type = 'info') {
    console.log(`[admin-bridge:${type}]`, msg);
    let box = $('#admin-bridge-toast');
    if (!box) {
      box = document.createElement('div');
      box.id = 'admin-bridge-toast';
      box.style.cssText = 'position:fixed;right:16px;bottom:16px;z-index:9999;max-width:420px;font-family:sans-serif';
      document.body.appendChild(box);
    }
    const el = document.createElement('div');
    el.textContent = msg;
    el.style.cssText = `margin-top:8px;padding:10px 12px;border-radius:8px;background:${type==='error'?'#8b0000':'#0a662e'};color:#fff;box-shadow:0 6px 20px rgba(0,0,0,.2)`;
    box.appendChild(el);
    setTimeout(()=> el.remove(), 3500);
  }

  // force Authorization partout au cas où admin-auth.js serait absent
  async function apiFetch(url, options = {}) {
    const headers = new Headers(options.headers || {});
    if (!headers.has('Authorization') && TOKEN) {
      headers.set('Authorization', `Bearer ${TOKEN}`);
    }
    // NE PAS fixer Content-Type si body est FormData
    const isFormData = options.body && (typeof FormData !== 'undefined') && (options.body instanceof FormData);
    if (isFormData && headers.has('Content-Type')) headers.delete('Content-Type');
    return fetch(url, { ...options, headers });
  }

  // --------- GAGNANTS ---------
  async function uploadPhoto(file) {
    const fd = new FormData();
    fd.append('file', file);
    const res = await apiFetch(`${API}/upload`, { method: 'POST', body: fd });
    const ct = res.headers.get('content-type') || '';
    const txt = await res.text();
    if (!ct.includes('application/json')) throw new Error(`Upload a renvoyé du HTML: ${txt.slice(0,180)}`);
    const data = JSON.parse(txt);
    if (!res.ok || !data.success) throw new Error(data.error || 'Upload échoué');
    return data.url; // URL /uploads/xxx.ext
  }

  async function createWinner({ game, amount, dateISO, photoUrl }) {
    const payload = {
      game: String(game || '').trim(),
      amount: Number(amount || 0),
      date: dateISO,          // YYYY-MM-DD
      photo: photoUrl
    };
    const res = await apiFetch(`${API}/winners`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await res.json().catch(()=> ({}));
    if (!res.ok || data.error) throw new Error(data.error || 'Création gagnant échouée');
    return data;
  }

  async function loadWinners() {
    const res = await fetch(`${API}/winners`);
    const data = await res.json().catch(()=>({winners:[]}));
    const list = data.winners || [];
    // Essaie de trouver la section "Liste des gagnants"
    const sectionTitle = $$('*').find(n => /liste des gagnants/i.test(n.textContent || ''));
    const section = sectionTitle ? (sectionTitle.closest('section') || sectionTitle.parentElement) : null;
    if (!section) return;
    // Cherche un conteneur de liste dessous, sinon crée-le
    let container = section.querySelector('[data-admin-bridge="winners-list"]');
    if (!container) {
      container = document.createElement('div');
      container.setAttribute('data-admin-bridge','winners-list');
      container.style.margin = '10px 12px';
      section.appendChild(container);
    }
    container.innerHTML = list.length === 0
      ? '<div style="opacity:.7">Aucun gagnant pour le moment</div>'
      : list.map(w => `
          <div style="display:flex;align-items:center;gap:10px;padding:8px 0;border-bottom:1px solid rgba(255,255,255,.1)">
            <img src="${w.photo}" alt="" style="width:56px;height:56px;object-fit:cover;border-radius:8px"/>
            <div style="flex:1">
              <div><b>${w.game}</b> – ${Number(w.amount).toFixed(2)} $</div>
              <div style="opacity:.7">${w.date?.slice(0,10) || ''}</div>
            </div>
            <button data-del="${w.id}" style="padding:6px 10px;border-radius:6px;border:0;background:#7a1111;color:#fff;cursor:pointer">Supprimer</button>
          </div>
        `).join('');

    // suppression
    container.querySelectorAll('button[data-del]').forEach(btn=>{
      btn.onclick = async () => {
        if (!confirm('Supprimer ce gagnant ?')) return;
        const id = btn.getAttribute('data-del');
        const res = await apiFetch(`${API}/winners/${encodeURIComponent(id)}`, { method:'DELETE' });
        const out = await res.json().catch(()=>({success:false}));
        if (out.success) { toast('Gagnant supprimé'); loadWinners(); }
        else toast('Suppression échouée','error');
      };
    });
  }

  // Câblage du **premier** formulaire “Ajouter un gagnant”
  function wireWinnerForm() {
    // On cible la première section “Ajouter un gagnant”
    const titleNode = $$('*').find(n => /ajouter un gagnant$/i.test((n.textContent || '').trim()));
    const section = titleNode ? (titleNode.closest('section') || titleNode.parentElement) : null;
    if (!section) return false;

    // champs
    const inputGame   = $$('input,textarea', section).find(el => /lightning link|jeu/i.test(el.placeholder || el.ariaLabel || '')) || $$('input', section)[0];
    const inputAmount = $$('input', section).find(el => /montant/i.test(el.placeholder || el.ariaLabel || ''));
    const inputDate   = $$('input', section).find(el => el.type === 'date') || $$('input', section).find(el => /\d{2}\/\d{2}\/\d{4}/.test(el.placeholder||'')) || $$('input',section)[2];
    const inputFile   = $$('input[type="file"]', section)[0];
    const btnUpload   = $$('button', section).find(b => /upload/i.test(b.textContent||'')) || null;
    const btnSubmit   = $$('button', section).find(b => /ajouter le gagnant/i.test(b.textContent||'')) || null;

    if (!inputGame || !inputAmount || !inputDate || !inputFile || !btnUpload || !btnSubmit) return false;

    // état local
    let photoUrl = '';

    // Upload
    btnUpload.addEventListener('click', async (e) => {
      e.preventDefault();
      const f = inputFile.files && inputFile.files[0];
      if (!f) return toast('Choisis d’abord une photo','error');
      try {
        btnUpload.disabled = true;
        const url = await uploadPhoto(f);
        photoUrl = url;
        toast('Photo uploadée ✅');
      } catch (err) {
        console.error(err); toast(err.message || 'Upload échoué','error');
      } finally {
        btnUpload.disabled = false;
      }
    });

    // Submit
    btnSubmit.addEventListener('click', async (e) => {
      e.preventDefault();
      try {
        if (!photoUrl) return toast('Upload la photo d’abord','error');
        const game = inputGame.value;
        const amount = inputAmount.value;
        // normalise date en YYYY-MM-DD
        let dateISO = inputDate.value;
        if (/^\d{2}\/\d{2}\/\d{4}$/.test(dateISO)) { // mm/dd/yyyy
          const [mm,dd,yyyy] = dateISO.split('/');
          dateISO = `${yyyy}-${mm}-${dd}`;
        }
        await createWinner({ game, amount, dateISO, photoUrl });
        toast('Gagnant ajouté ✅');
        inputGame.value = ''; inputAmount.value=''; inputDate.value=''; inputFile.value=''; photoUrl='';
        loadWinners();
      } catch (err) {
        console.error(err); toast(err.message || 'Ajout échoué','error');
      }
    });

    return true;
  }

  // Masquer le doublon “Ajouter un nouveau gagnant”
  function hideDuplicateWinnerForm() {
    const nodes = $$('*').filter(n => /ajouter un nouveau gagnant/i.test(n.textContent || ''));
    nodes.forEach(n => {
      const box = n.closest('section') || n.closest('div');
      if (box) box.style.display = 'none';
    });
  }

  async function init() {
    // essaie plusieurs fois (la SPA rend après chargement)
    for (let i=0;i<20;i++) {
      hideDuplicateWinnerForm();
      const wired = wireWinnerForm();
      if (wired) break;
      await sleep(250);
    }
    loadWinners();

    // observe les re-renders
    const mo = new MutationObserver(() => {
      hideDuplicateWinnerForm();
    });
    mo.observe(document.body, { childList:true, subtree:true });
  }

  init();
})();
