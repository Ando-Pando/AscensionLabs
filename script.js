/* =========================================
   ASCENSION LABS — Script v2
   ========================================= */

// ---- NAV SCROLL BEHAVIOUR ----
const nav = document.getElementById('nav');

window.addEventListener('scroll', () => {
  nav.classList.toggle('scrolled', window.scrollY > 60);
}, { passive: true });


// ---- MOBILE MENU ----
const burger = document.getElementById('burger');

const mobileMenu = document.createElement('div');
mobileMenu.className = 'mobile-menu';
mobileMenu.innerHTML = `
  <a href="#science"   class="mm-link">Science</a>
  <a href="#protocols" class="mm-link">Protocols</a>
  <a href="#products"  class="mm-link">Compounds</a>
  <a href="#about"     class="mm-link">About</a>
  <a href="#consult"   class="mm-link">Consult</a>
`;
document.body.appendChild(mobileMenu);

function closeMobileMenu() {
  mobileMenu.classList.remove('open');
  document.body.style.overflow = '';
  burger.querySelectorAll('span')[0].style.transform = '';
  burger.querySelectorAll('span')[1].style.transform = '';
}

burger.addEventListener('click', () => {
  const isOpen = mobileMenu.classList.toggle('open');
  document.body.style.overflow = isOpen ? 'hidden' : '';
  burger.querySelectorAll('span')[0].style.transform = isOpen ? 'rotate(45deg) translateY(7px)' : '';
  burger.querySelectorAll('span')[1].style.transform = isOpen ? 'rotate(-45deg) translateY(-7px)' : '';
});

mobileMenu.querySelectorAll('.mm-link').forEach(l => l.addEventListener('click', closeMobileMenu));


// ---- INTERSECTION OBSERVER — REVEAL ----
const revealEls = document.querySelectorAll('.reveal');

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

revealEls.forEach((el) => {
  const siblings = Array.from(el.parentElement.querySelectorAll(':scope > .reveal'));
  const index = siblings.indexOf(el);
  el.style.transitionDelay = `${index * 0.07}s`;
  revealObserver.observe(el);
});


// ---- PARTICLE CANVAS (dark hero) ----
const canvas = document.getElementById('particleCanvas');
const ctx    = canvas.getContext('2d');
let particles = [];
let animId;

function resizeCanvas() {
  canvas.width  = canvas.offsetWidth;
  canvas.height = canvas.offsetHeight;
}

function buildParticles() {
  particles = [];
  const count = Math.floor((canvas.width * canvas.height) / 14000);
  for (let i = 0; i < count; i++) {
    particles.push({
      x:     Math.random() * canvas.width,
      y:     Math.random() * canvas.height,
      r:     Math.random() * 1.2 + 0.3,
      vx:    (Math.random() - 0.5) * 0.2,
      vy:    (Math.random() - 0.5) * 0.2,
      alpha: Math.random() * 0.35 + 0.08
    });
  }
}

function drawFrame() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Update + draw particles
  particles.forEach(p => {
    p.x += p.vx;
    p.y += p.vy;
    if (p.x < 0) p.x = canvas.width;
    if (p.x > canvas.width) p.x = 0;
    if (p.y < 0) p.y = canvas.height;
    if (p.y > canvas.height) p.y = 0;

    ctx.beginPath();
    ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(142, 164, 178, ${p.alpha})`;
    ctx.fill();
  });

  // Connecting lines
  const maxDist = 90;
  for (let i = 0; i < particles.length; i++) {
    for (let j = i + 1; j < particles.length; j++) {
      const dx   = particles[i].x - particles[j].x;
      const dy   = particles[i].y - particles[j].y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < maxDist) {
        const a = (1 - dist / maxDist) * 0.12;
        ctx.beginPath();
        ctx.moveTo(particles[i].x, particles[i].y);
        ctx.lineTo(particles[j].x, particles[j].y);
        ctx.strokeStyle = `rgba(142, 164, 178, ${a * 0.7})`;
        ctx.lineWidth = 0.5;
        ctx.stroke();
      }
    }
  }

  animId = requestAnimationFrame(drawFrame);
}

function initParticles() {
  resizeCanvas();
  buildParticles();
  if (animId) cancelAnimationFrame(animId);
  drawFrame();
}

window.addEventListener('resize', () => { resizeCanvas(); buildParticles(); }, { passive: true });
initParticles();


// ---- PRODUCT FILTER ----
const filterBtns  = document.querySelectorAll('.filter-btn');
const productCards = document.querySelectorAll('.product-card');

filterBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    filterBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    const filter = btn.dataset.filter;
    let delay = 0;

    productCards.forEach(card => {
      const show = filter === 'all' || card.dataset.category === filter;
      if (show) {
        card.classList.remove('hidden');
        card.style.opacity = '0';
        card.style.transform = 'translateY(16px)';
        setTimeout(() => {
          card.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
          card.style.opacity = '1';
          card.style.transform = 'translateY(0)';
        }, delay);
        delay += 40;
      } else {
        card.classList.add('hidden');
      }
    });
  });
});


// ---- PURITY BAR ANIMATION ----
function animatePurityBars(container) {
  // Product card purity bars
  container.querySelectorAll('.purity-bar').forEach(bar => {
    const pct  = parseFloat(bar.dataset.pct);
    const fill = bar.querySelector('.purity-bar__fill');
    if (fill && fill.style.width === '') {
      setTimeout(() => { fill.style.width = pct + '%'; }, 200);
    }
  });

  // Purity percentage labels on product cards
  container.querySelectorAll('.purity-pct[data-pct]').forEach(el => {
    const target = parseFloat(el.dataset.pct);
    animateNumber(el, target, 1, '%', 1400);
  });
}

function animateNumber(el, target, decimals, suffix, duration) {
  const start = performance.now();
  function update(now) {
    const progress = Math.min((now - start) / duration, 1);
    const eased    = 1 - Math.pow(1 - progress, 3);
    const value    = eased * target;
    el.textContent = value.toFixed(decimals) + suffix;
    if (progress < 1) requestAnimationFrame(update);
    else el.textContent = target.toFixed(decimals) + suffix;
  }
  requestAnimationFrame(update);
}

const productObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      animatePurityBars(entry.target);
      productObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.2 });

document.querySelectorAll('.product-card').forEach(card => productObserver.observe(card));


// ---- ASSAY BAR ANIMATION (Lab section) ----
const assayObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;

    const bar  = entry.target.querySelector('.assay-bar');
    const fill = bar?.querySelector('.assay-bar__fill');
    const pct  = parseFloat(bar?.dataset.pct || 0);
    const label = entry.target.querySelector('.assay-row__pct');

    if (fill) {
      setTimeout(() => { fill.style.width = pct + '%'; }, 150);
    }
    if (label) {
      animateNumber(label, pct, 1, '%', 1600);
    }

    assayObserver.unobserve(entry.target);
  });
}, { threshold: 0.4 });

document.querySelectorAll('.assay-row').forEach(row => assayObserver.observe(row));


// ---- STATS COUNTER ANIMATION ----
function animateCounter(el, target, decimals) {
  animateNumber(el, target, decimals, '', 1800);
}

const statObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    const numEl = entry.target.querySelector('.stat__number');
    if (!numEl) return;
    const target   = parseFloat(numEl.dataset.target);
    const decimals = target % 1 !== 0 ? 1 : 0;
    animateCounter(numEl, target, decimals);
    statObserver.unobserve(entry.target);
  });
}, { threshold: 0.5 });

document.querySelectorAll('.stat').forEach(el => statObserver.observe(el));


// ---- CONSULT FORM ----
const consultForm = document.getElementById('consultForm');
if (consultForm) {
  consultForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const btn = consultForm.querySelector('button[type="submit"]');
    btn.textContent = 'Submitting…';
    btn.disabled = true;

    setTimeout(() => {
      consultForm.innerHTML = `
        <div class="form-success show">
          <h4>Consultation Requested</h4>
          <p>Thank you. One of our clinical advisors will be in touch within 24 hours to schedule your consultation.</p>
        </div>
      `;
    }, 1200);
  });
}


// ---- SMOOTH ANCHOR SCROLL ----
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', (e) => {
    const href   = anchor.getAttribute('href');
    if (href === '#') return;
    const target = document.querySelector(href);
    if (!target) return;
    e.preventDefault();
    const offset = nav ? nav.offsetHeight : 80;
    window.scrollTo({ top: target.getBoundingClientRect().top + window.scrollY - offset, behavior: 'smooth' });
  });
});


// ---- HELIX PARALLAX ----
const helix = document.querySelector('.helix');
if (helix) {
  window.addEventListener('scroll', () => {
    const about = document.getElementById('about');
    if (!about) return;
    const rect = about.getBoundingClientRect();
    if (rect.top < window.innerHeight && rect.bottom > 0) {
      const progress = (window.innerHeight - rect.top) / (window.innerHeight + rect.height);
      helix.style.transform = `translateY(${(progress - 0.5) * -28}px) rotate(${progress * 8}deg)`;
    }
  }, { passive: true });
}


// ---- MOLECULAR ART SUBTLE FLOAT ----
const molArt = document.querySelector('.hero__mol-art');
if (molArt) {
  window.addEventListener('scroll', () => {
    const scrolled = window.scrollY;
    molArt.style.transform = `translateY(calc(-50% + ${scrolled * 0.15}px))`;
  }, { passive: true });
}
