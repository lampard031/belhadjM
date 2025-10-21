(function () {
  // Associe les titres aux images
  const MAP = {
    "machines a sous": "/uploads/home/slots.jpg",
    "poker": "/uploads/home/poker.jpg",
    "evenements": "/uploads/home/events.jpg",
    "événements": "/uploads/home/events.jpg" // au cas où
  };

  // util pour normaliser (supprime accents)
  const normalize = (s) =>
    (s || "")
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .trim();

  function apply() {
    const section = document.querySelector("#services");
    if (!section) return false;

    // chaque carte de la grille
    const cards = section.querySelectorAll(".grid > div");
    if (!cards.length) return false;

    cards.forEach((card) => {
      const titleEl = card.querySelector("h2, h3, [class*='CardTitle'], .text-2xl, .text-3xl");
      const img = card.querySelector("img");
      if (!titleEl || !img) return;

      const key = normalize(titleEl.textContent);
      const wanted = MAP[key];
      if (!wanted) return;

      // enlève srcset/lazy pour forcer l’image
      img.removeAttribute("srcset");
      img.removeAttribute("data-src");
      img.loading = "eager";

      const url = wanted + "?v=" + Date.now(); // casse le cache
      if (img.src !== url) img.src = url;

      // garde la mise en forme
      img.style.objectFit = "cover";
      img.style.objectPosition = "center";
      img.style.width = "100%";
      img.style.height = "100%";

      // petit log de debug si l’image échoue
      img.onerror = () => console.warn("[swap] échec chargement:", url);
    });
    return true;
  }

  // lance plusieurs fois pour couvrir React/hydratation
  let tries = 0;
  const t = setInterval(() => {
    if (apply() || ++tries > 10) clearInterval(t);
  }, 400);
  document.addEventListener("DOMContentLoaded", apply);
  window.addEventListener("load", apply);
})();
