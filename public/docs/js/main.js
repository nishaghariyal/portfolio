/* -------------------------
   Config
   ------------------------- */
const FORMSPREE_ENDPOINT = 'https://formspree.io/f/xqarwdbk'; // <-- replace

/* -------------------------
   DOM helpers & elements
   ------------------------- */
const yearEl = document.getElementById('year');
if (yearEl) yearEl.textContent = new Date().getFullYear();

const ham = document.getElementById('hamburger');
const navMenu = document.getElementById('navMenu');
const themeToggle = document.getElementById('themeToggle');
const backBtn = document.getElementById('backToTop');
const siteHeader = document.getElementById('siteHeader');
const modal = document.getElementById('modal');
const modalTitle = document.getElementById('modalTitle');
const modalDesc = document.getElementById('modalDesc');
const modalClose = document.getElementById('modalClose');
const projectsGrid = document.getElementById('projectsGrid');

/* -------------------------
   Mobile nav + accessible toggles
   ------------------------- */
if (ham && navMenu) {
  ham.addEventListener('click', () => {
    const open = navMenu.classList.toggle('open');
    ham.setAttribute('aria-expanded', open ? 'true' : 'false');
  });
  // close nav on link click (mobile)
  navMenu.addEventListener('click', (e) => {
    if (e.target.tagName === 'A') navMenu.classList.remove('open');
  });
}

/* ---- subtle hero 3D tilt (mouse + device) ---- */
(function() {
  const hero = document.getElementById('hero3d');
  if (!hero) return;

  const card = hero.querySelector('.layer-card');
  const bg = hero.querySelector('.layer-bg');
  const accent = hero.querySelector('.layer-accent');

  let width = hero.offsetWidth;
  let height = hero.offsetHeight;
  let bounds = hero.getBoundingClientRect();

  let mouseX = 0, mouseY = 0;
  let rx = 0, ry = 0;
  let rafId = null;

  function updateBounds() {
    bounds = hero.getBoundingClientRect();
    width = bounds.width;
    height = bounds.height;
  }

  // convert pointer to rotation values
  function pointerToRotation(x, y) {
    const px = (x - bounds.left) / width - 0.5;  // -0.5 .. 0.5
    const py = (y - bounds.top) / height - 0.5;
    // scale rotations (degrees)
    return {
      ry: px * 8,       // rotateY
      rx: -py * 8,      // rotateX
      tx: px * -12,     // translateX for bg/accent subtle parallax
      ty: py * -10
    };
  }
// 3D tilt for hero circle (lightweight, performant)
(function() {
  const hero = document.getElementById('heroCircle');
  if (!hero) return;

  // disable on touch devices for UX & perf
  const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  if (isTouch) return;

  const img = hero.querySelector('img');
  let raf = null;
  let targetX = 0, targetY = 0;
  let curX = 0, curY = 0;

  const rectUpdate = () => hero._rect = hero.getBoundingClientRect();
  rectUpdate();
  window.addEventListener('resize', rectUpdate);

  function onMove(e) {
    const r = hero._rect || hero.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width;   // 0..1
    const y = (e.clientY - r.top) / r.height;   // 0..1
    // center offset -0.5..0.5
    targetX = (x - 0.5);
    targetY = (y - 0.5);
    hero.classList.add('hover');
    requestTick();
  }

  function onLeave() {
    targetX = 0;
    targetY = 0;
    hero.classList.remove('hover');
    requestTick();
  }

  function render() {
    // gentle lerp
    curX += (targetX - curX) * 0.14;
    curY += (targetY - curY) * 0.14;

    // map to rotation degrees (tweak multiplier if you want more/less)
    const rotY = curX * 12;   // rotateY (left-right)
    const rotX = -curY * 10;  // rotateX (up-down)
    const translateZ = 10 + (Math.abs(curX) + Math.abs(curY)) * 6; // small pop

    // apply transforms
    hero.style.transform = `rotateX(${rotX}deg) rotateY(${rotY}deg) translateZ(0)`;
    // image pops a bit more
    img.style.transform = `translateZ(${translateZ}px) scale(0.96)`;

    raf = null;
  }

  function requestTick() {
    if (!raf) raf = requestAnimationFrame(render);
  }

  hero.addEventListener('pointermove', onMove);
  hero.addEventListener('pointerleave', onLeave);
  hero.addEventListener('pointercancel', onLeave);

  // optional: small tilt reset if user stops moving pointer for a while
  let idleTimer;
  hero.addEventListener('pointermove', () => {
    clearTimeout(idleTimer);
    idleTimer = setTimeout(() => {
      targetX = 0; targetY = 0;
      hero.classList.remove('hover');
      requestTick();
    }, 1200);
  });
})();

  function onMove(e) {
    const x = e.touches ? e.touches[0].clientX : e.clientX;
    const y = e.touches ? e.touches[0].clientY : e.clientY;
    const rot = pointerToRotation(x, y);
    mouseX = rot.ry;
    mouseY = rot.rx;
    // store target transforms
    rx = rot.rx;
    ry = rot.ry;
    // also apply parallax offsets
    hero._tx = rot.tx;
    hero._ty = rot.ty;
    requestTick();
  }

  function onLeave() {
    // reset
    rx = 0; ry = 0;
    hero._tx = 0; hero._ty = 0;
    requestTick();
  }

  function render() {
    // smooth lerp
    const currentTransform = card._t || { rx:0, ry:0 };
    currentTransform.rx += (rx - currentTransform.rx) * 0.12;
    currentTransform.ry += (ry - currentTransform.ry) * 0.12;
    card._t = currentTransform;

    // apply transforms
    const t = `rotateX(${currentTransform.rx}deg) rotateY(${currentTransform.ry}deg) translateZ(0)`;
    card.style.transform = t;

    // background and accent parallax smaller factor
    const bgTx = (hero._tx || 0) * 0.18;
    const bgTy = (hero._ty || 0) * 0.12;
    bg.style.transform = `translate3d(${bgTx}px, ${bgTy}px, -40px) scale(1.06)`;
    accent.style.transform = `translate3d(${(hero._tx||0)*-0.3}px, ${(hero._ty||0)*-0.22}px, 12px) rotate(-6deg)`;

    rafId = null;
  }

  function requestTick() {
    if (!rafId) rafId = requestAnimationFrame(render);
  }

  // mouse + touch events only on non-touch large screens for performance
  const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  if (!isTouch) {
    hero.addEventListener('mousemove', onMove);
    hero.addEventListener('mouseleave', onLeave);
    window.addEventListener('resize', updateBounds);
  } else {
    // for touch devices, provide small parallax on device tilt if available
    window.addEventListener('deviceorientation', (ev) => {
      // ev.beta (x), ev.gamma (y)
      if (ev.gamma == null) return;
      // gamma roughly -90..90, beta -180..180 - scale them
      const ry = (ev.gamma || 0) / 10; // sides
      const rx = -(ev.beta || 0) / 12; // up/down
      rx = Math.max(Math.min(rx, 12), -12);
      ry = Math.max(Math.min(ry, 12), -12);
      rx = rx || 0;
      ry = ry || 0;
      rx = rx;
      ry = ry;
      // update targets
      window.requestAnimationFrame(()=> {
        card.style.transform = `rotateX(${rx}deg) rotateY(${ry}deg)`;
        bg.style.transform = `translate3d(${ry*-1.8}px, ${rx*-1.2}px, -40px) scale(1.06)`;
      });
    }, { passive:true });
  }
})();

/* -------------------------
   Smooth scroll for anchor links
   ------------------------- */
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', function (e) {
    const href = this.getAttribute('href');
    if (href === '#' || href === '') return;
    const el = document.querySelector(decodeURIComponent(href));
    if (el) {
      e.preventDefault();
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});

/* -------------------------
   Theme toggle (persist)
   ------------------------- */
const saved = localStorage.getItem('site-theme');
if (saved === 'light') document.documentElement.classList.add('light-theme');
if (themeToggle) {
  themeToggle.addEventListener('click', () => {
    const light = document.documentElement.classList.toggle('light-theme');
    themeToggle.textContent = light ? '☀️' : '🌙';
    localStorage.setItem('site-theme', light ? 'light' : 'dark');
  });
}

/* -------------------------
   IntersectionObserver for reveal on scroll
   ------------------------- */
const reveals = document.querySelectorAll('.reveal');
const io = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      io.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });

reveals.forEach(r => io.observe(r));

/* -------------------------
   Back to top visibility
   ------------------------- */
window.addEventListener('scroll', () => {
  backBtn.style.display = window.scrollY > 500 ? 'block' : 'none';
  // shrink header slightly on scroll
  if (window.scrollY > 30) siteHeader.classList.add('scrolled');
  else siteHeader.classList.remove('scrolled');
});
backBtn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

/* -------------------------
   Project cards -> modal
   ------------------------- */
if (projectsGrid && modal) {
  projectsGrid.addEventListener('click', (e) => {
    const card = e.target.closest('.card');
    if (!card) return;
    openModal(card);
  });
  // keyboard support (Enter on focused card)
  projectsGrid.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      const card = document.activeElement.closest('.card');
      if (card) openModal(card);
    }
  });
  function openModal(card) {
    const title = card.dataset.title || card.querySelector('h3')?.innerText || 'Project';
    const desc = card.dataset.desc || 'Project details.';
    modalTitle.textContent = title;
    modalDesc.textContent = desc;
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }
  modalClose.addEventListener('click', closeModal);
  modal.addEventListener('click', (e) => { if (e.target === modal) closeModal(); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeModal(); });

  function closeModal() {
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }
}

/* -------------------------
   Contact form handling (compact) with UI feedback
   ------------------------- */
const form = document.getElementById('contactForm');
const status = document.getElementById('formStatus');
if (form) {
  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    // small client validation
    const name = form.elements['name'].value.trim();
    const email = form.elements['email'].value.trim();
    const message = form.elements['message'].value.trim();
    if (!name || !email || !message) {
      status.textContent = 'Please complete name, email and message.';
      return;
    }

    status.textContent = 'Sending…';
    const data = new FormData(form);

    try {
      const res = await fetch(FORMSPREE_ENDPOINT, {
        method: 'POST',
        body: data,
        headers: { 'Accept': 'application/json' }
      });

      if (res.ok) {
        showToast('Message sent — thank you!');
        status.textContent = '';
        form.reset();
      } else {
        const json = await res.json().catch(()=> ({}));
        status.textContent = json?.error || 'Something went wrong — try again.';
      }
    } catch (err) {
      console.error(err);
      status.textContent = 'Network error — try again.';
    }

    // tiny UX: clear status after 4s
    setTimeout(()=> status.textContent = '', 4000);
  });
}

/* -------------------------
   Small toast notification (used after successful submit)
   ------------------------- */
function showToast(msg) {
  const t = document.createElement('div');
  t.className = 'site-toast';
  t.textContent = msg;
  Object.assign(t.style, {
    position: 'fixed', bottom: '18px', left: '50%', transform: 'translateX(-50%)',
    background: 'linear-gradient(90deg,var(--accent2),var(--accent1))', color: '#062227',
    padding: '10px 16px', borderRadius: '12px', zIndex: 140, boxShadow: '0 12px 40px rgba(0,0,0,0.6)'
  });
  document.body.appendChild(t);
  setTimeout(()=> t.style.opacity = '0', 2300);
  setTimeout(()=> t.remove(), 2600);
}

/* -------------------------
   Accessibility: focus outline for keyboard users
   ------------------------- */
document.addEventListener('keydown', (e) => {
  if (e.key === 'Tab') document.documentElement.classList.add('user-is-tabbing');
}, { once: true });
