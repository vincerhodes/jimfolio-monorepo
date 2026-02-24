/* ===== Route Tab Switching ===== */
document.addEventListener('DOMContentLoaded', () => {
  const cards = document.querySelectorAll('.option-card');
  const itineraries = document.querySelectorAll('.itinerary');
  const ctaBtns = document.querySelectorAll('.cta-btn[data-route]');

  function switchRoute(routeId) {
    cards.forEach(c => c.classList.toggle('active', c.dataset.route === routeId));
    itineraries.forEach(it => {
      const id = it.id.replace('route-', '');
      it.classList.toggle('visible', id === routeId);
    });
  }

  cards.forEach(card => {
    card.addEventListener('click', () => switchRoute(card.dataset.route));
  });

  ctaBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const route = btn.dataset.route;
      switchRoute(route);
      document.getElementById('route-' + route).scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });

  /* ===== Scroll-triggered fade-in ===== */
  const fadeEls = document.querySelectorAll('.fade-in');

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.15,
    rootMargin: '0px 0px -40px 0px'
  });

  fadeEls.forEach(el => observer.observe(el));

  /* ===== Smooth scroll for hero hint ===== */
  const scrollHint = document.querySelector('.hero-scroll-hint');
  if (scrollHint) {
    scrollHint.addEventListener('click', () => {
      document.getElementById('routes').scrollIntoView({ behavior: 'smooth' });
    });
  }
});
