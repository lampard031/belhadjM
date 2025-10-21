// Tabs + image preview + smooth enhancements
document.addEventListener('DOMContentLoaded', () => {
  // Tabs
  const tabs = document.querySelectorAll('.tab');
  const panes = document.querySelectorAll('.tabcontent');
  function activate(id){
    tabs.forEach(t => t.classList.toggle('active', t.dataset.tab === id));
    panes.forEach(p => p.classList.toggle('active', p.id === id));
    history.replaceState({}, '', `#${id}`);
  }
  tabs.forEach(t => t.addEventListener('click', () => activate(t.dataset.tab)));
  const initial = location.hash?.slice(1) || tabs[0]?.dataset.tab;
  if (initial) activate(initial);

  // Preview <input type="file" data-preview="#selector">
  document.querySelectorAll('input[type="file"][data-preview]').forEach(inp=>{
    const sel = inp.getAttribute('data-preview');
    const box = document.querySelector(sel);
    inp.addEventListener('change', ()=>{
      if (!box) return;
      box.innerHTML = '';
      const f = inp.files?.[0];
      if (!f) return;
      const img = new Image();
      img.onload = ()=> box.replaceChildren(img);
      img.src = URL.createObjectURL(f);
    });
  });
});
