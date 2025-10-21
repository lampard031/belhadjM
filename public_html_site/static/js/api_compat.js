/* API compatibility shim for triple7casino.ca
 * - Replaces https://api.triple7casino.ca with current origin
 * - Ensures paths /winners|/events|/promotions go under /api/
 * - Works for fetch + XMLHttpRequest (Axios)
 */

(function () {
  function normalizePath(path) {
    if (!path) return path;

    // Retire le domaine api.triple7casino.ca s'il est présent
    path = path.replace(/^https?:\/\/api\.triple7casino\.ca/i, "");

    // Si on a une URL absolue externe (autre domaine), on ne touche pas
    try {
      if (/^https?:\/\//i.test(path)) {
        var u = new URL(path);
        if (u.origin !== window.location.origin) return path;
      }
    } catch (e) {}

    // Force les routes "courtes" vers /api/...
    // -> /winners, /events, /promotions  deviennent  /api/winners ...
    var short = /^\/?(winners|events|promotions)(\/?|\?|$)/i;
    if (short.test(path) && !/^\/api\//i.test(path)) {
      // Assure un slash de départ
      if (path[0] !== "/") path = "/" + path;
      path = "/api" + path;
    }

    // Si déjà /api/... on laisse tel quel
    return path;
  }

  function rewriteInput(input) {
    try {
      if (typeof input === "string") return normalizePath(input);
      if (input && input.url) {
        var newUrl = normalizePath(input.url);
        if (newUrl !== input.url) {
          // Cloner la Request avec la nouvelle URL
          return new Request(newUrl, input);
        }
      }
    } catch (e) {}
    return input;
  }

  /* ---- fetch patch ---- */
  if (typeof window.fetch === "function") {
    var _fetch = window.fetch;
    window.fetch = function (input, init) {
      var rewritten = rewriteInput(input);
      return _fetch.call(this, rewritten, init);
    };
  }

  /* ---- XMLHttpRequest (Axios) patch ---- */
  if (window.XMLHttpRequest && window.XMLHttpRequest.prototype) {
    var _open = window.XMLHttpRequest.prototype.open;
    window.XMLHttpRequest.prototype.open = function (method, url /*, async, user, pass */) {
      try {
        url = normalizePath(url);
      } catch (e) {}
      return _open.apply(this, arguments.length ? [method, url].concat([].slice.call(arguments, 2)) : arguments);
    };
  }

  /* ---- Bonus : si Axios est présent, on ajuste baseURL et intercepteur ---- */
  function patchAxios() {
    if (!window.axios) return;
    try {
      if (window.axios.defaults) {
        // Base locale (même origine)
        window.axios.defaults.baseURL = "";
      }
      // Intercepteur de requêtes
      window.axios.interceptors.request.use(function (config) {
        if (config && config.url) {
          config.url = normalizePath(config.url);
        }
        return config;
      });
    } catch (e) {}
  }

  // Patch immédiat puis réessais si axios est chargé après
  patchAxios();
  var tries = 0;
  var t = setInterval(function () {
    tries++;
    patchAxios();
    if (tries > 20) clearInterval(t);
  }, 200);
})();
