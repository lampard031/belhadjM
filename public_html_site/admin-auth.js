// admin-auth.js (universel: fetch + axios + XHR)
// Ajoute automatiquement Authorization: Bearer <token> pour TOUTES les requêtes d'écriture vers /api
(function () {
  if (!window.API_BASE || !window.ADMIN_TOKEN) return;

  const API_BASE = window.API_BASE; // '/api'
  const TOKEN = window.ADMIN_TOKEN;

  // ---- util ----
  function isApiUrl(url) {
    try {
      // normalise les vieilles routes vers la nouvelle API
      if (url.endsWith('/upload.php')) return true;
      if (url.includes('/admin-api/')) return true;
      // /api absolu ou relatif
      const abs = url.startsWith('http');
      const u = abs ? new URL(url) : new URL(url, location.origin);
      return u.pathname.startsWith(API_BASE + '/');
    } catch { return false; }
  }
  function normalizeUrl(url) {
    // /upload.php -> /api/upload
    if (url.endsWith('/upload.php')) return API_BASE + '/upload';
    // /admin-api/... -> /api/...
    if (url.includes('/admin-api/')) return url.replace('/admin-api/', API_BASE + '/');
    return url;
  }

  // ---- patch fetch ----
  const ORIG_FETCH = window.fetch;
  window.fetch = async function (input, init = {}) {
    let url = (typeof input === 'string') ? input : (input && input.url) || '';
    url = normalizeUrl(url);
    const method = (init.method || (input && input.method) || 'GET').toUpperCase();

    if (isApiUrl(url) && method !== 'GET') {
      const headers = new Headers(init.headers || (input && input.headers) || {});
      if (!headers.has('Authorization')) headers.set('Authorization', `Bearer ${TOKEN}`);

      // si body = FormData (upload), NE PAS fixer Content-Type
      const isFormData = (init.body && typeof FormData !== 'undefined' && init.body instanceof FormData);
      if (isFormData && headers.has('Content-Type')) headers.delete('Content-Type');

      init.headers = headers;
    }
    if (typeof input === 'string') input = url;
    else if (input && input.url) input = new Request(url, input);
    return
