export function installMotion(root, { reduced = matchMedia('(prefers-reduced-motion: reduce)') } = {}) {
  const burst = event => {
    if (reduced.matches || !(event.detail?.target instanceof Element)) return;
    const target = event.detail.target;
    const bounds = target.getBoundingClientRect();
    const x = bounds.left + bounds.width / 2;
    const y = bounds.top + bounds.height / 2;
    for (let i = 0; i < 22; i++) {
      const dot = document.createElement('i');
      dot.className = 'burst-particle';
      const angle = Math.PI * 2 * i / 22;
      const distance = 45 + Math.random() * 100;
      dot.style.cssText = `left:${x}px;top:${y}px;--particle-color:var(--confetti-${i % 4});--dx:${Math.cos(angle) * distance}px;--dy:${Math.sin(angle) * distance}px;--rotation:${i * 31}deg;`;
      target.closest('dialog')?.open ? target.closest('dialog').append(dot) : document.body.append(dot);
      setTimeout(() => dot.remove(), 800);
    }
  };
  root.addEventListener('enjoytrip:success', burst);
  if (!reduced.matches && 'IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => entries.forEach(entry => {
      if (entry.isIntersecting) { entry.target.classList.add('revealed'); observer.unobserve(entry.target); }
    }), { threshold: .08 });
    root.querySelectorAll('.section-heading, .search-panel, .about').forEach(element => {
      element.classList.add('reveal'); observer.observe(element);
    });
  }
}
