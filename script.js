/* ─────────────────────────────────────────────
   HERO ARRIVAL ANIMATION
   ───────────────────────────────────────────── */
(function () {
  const style = document.createElement('style');
  style.textContent = `
    /* Base hidden states */
    .hero-sub,
    .hero-title-wrap,
    .hero-desc,
    .glow-btn {
      opacity: 0;
      transform: translateY(28px);
    }
    .hero-title-wrap { transform: translateY(40px); }

    /* Particle chips start hidden */
    .hero .p1, .hero .p2, .hero .p3 {
      opacity: 0;
      transform: scale(0.6) rotate(0deg);
    }

    /* Animated in states */
    .hero-arrive .hero-sub {
      opacity: 1;
      transform: translateY(0);
      transition: opacity 0.65s cubic-bezier(.22,.61,.36,1),
                  transform 0.65s cubic-bezier(.22,.61,.36,1);
      transition-delay: 0.05s;
    }
    .hero-arrive .hero-title-wrap {
      opacity: 1;
      transform: translateY(0);
      transition: opacity 0.8s cubic-bezier(.22,.61,.36,1),
                  transform 0.8s cubic-bezier(.22,.61,.36,1);
      transition-delay: 0.18s;
    }
    .hero-arrive .hero-desc {
      opacity: 1;
      transform: translateY(0);
      transition: opacity 0.65s cubic-bezier(.22,.61,.36,1),
                  transform 0.65s cubic-bezier(.22,.61,.36,1);
      transition-delay: 0.38s;
    }
    .hero-arrive .glow-btn {
      opacity: 1;
      transform: translateY(0);
      transition: opacity 0.6s cubic-bezier(.22,.61,.36,1),
                  transform 0.6s cubic-bezier(.22,.61,.36,1);
      transition-delay: 0.54s;
    }
    /* Particle chips float in with spin */
    .hero-arrive .hero .p1 {
      opacity: 1;
      transform: scale(1) rotate(-30deg);
      transition: opacity 0.7s ease, transform 0.9s cubic-bezier(.34,1.56,.64,1);
      transition-delay: 0.65s;
    }
    .hero-arrive .hero .p2 {
      opacity: 1;
      transform: scale(1) rotate(20deg);
      transition: opacity 0.7s ease, transform 0.9s cubic-bezier(.34,1.56,.64,1);
      transition-delay: 0.78s;
    }
    .hero-arrive .hero .p3 {
      opacity: 1;
      transform: scale(1) rotate(-15deg);
      transition: opacity 0.7s ease, transform 0.9s cubic-bezier(.34,1.56,.64,1);
      transition-delay: 0.88s;
    }
  `;
  document.head.appendChild(style);

  // Trigger on next frame so initial hidden state paints first
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      document.documentElement.classList.add('hero-arrive');

      // After arrival animation finishes, remove CSS transitions from particles
      // so the JS parallax mousemove can control them freely without lag
      setTimeout(() => {
        document.querySelectorAll('.hero .p1, .hero .p2, .hero .p3').forEach(p => {
          p.style.transition = 'none';
        });
      }, 1800); // wait for longest arrival animation to complete
    });
  });
})();


/* ─────────────────────────────────────────────
   GLOW BUTTON — SPARKLES BEHIND BUTTON, ABOVE & BELOW MOUSE X
   ───────────────────────────────────────────── */
(function () {
  const glowBtn   = document.querySelector('.glow-btn');
  const glowInner = document.querySelector('.glow-btn-inner');
  const starsEl   = glowBtn ? glowBtn.querySelector('.stars') : null;
  const arrowSvg  = glowInner ? glowInner.querySelector('svg') : null;

  if (!glowBtn || !glowInner || !starsEl || !arrowSvg) return;

  // ── Push stars BEHIND the button visually ──
  // .glow-btn-outer already has z-index:1, so z-index:0 on .stars sits behind it
  starsEl.style.zIndex = '0';

  // ── Snow-only colour palette ──
  const COLORS = [
    '#ffffff',
    'rgba(255,255,255,0.9)',
    'rgba(220,240,255,0.95)',
    'rgba(200,230,255,0.85)',
    '#f0f8ff',
    '#e8f4ff',
  ];

  // Build stars: half burst upward, half burst downward
  function makeStars() {
    starsEl.innerHTML = '';
    const COUNT = 14;
    for (let i = 0; i < COUNT; i++) {
      const goUp = i < COUNT / 2;
      const star = document.createElement('span');
      star.className = 'star';

      const sz    = (3.5 + Math.random() * 6).toFixed(1) + 'px';
      const clr   = COLORS[Math.floor(Math.random() * COLORS.length)];
      const dur   = (1.3 + Math.random() * 1.1).toFixed(2) + 's';
      const delay = (Math.random() * 1.0).toFixed(2) + 's';
      // Very tight horizontal spread — sparkles stay directly above/below
      const spreadX = (Math.random() * 14 - 7).toFixed(1);

      if (goUp) {
        const r1 = (16 + Math.random() * 12).toFixed(1);
        const r2 = (32 + Math.random() * 18).toFixed(1);
        const r3 = (50 + Math.random() * 22).toFixed(1);
        star.style.cssText = `
          --sz:${sz};--clr:${clr};--dur:${dur};--delay:${delay};
          --tx:${spreadX}px;  --ty:-${r1}px;
          --tx2:${spreadX}px; --ty2:-${r2}px;
          --tx3:${spreadX}px; --ty3:-${r3}px;
        `;
      } else {
        const d1 = (16 + Math.random() * 12).toFixed(1);
        const d2 = (32 + Math.random() * 18).toFixed(1);
        const d3 = (50 + Math.random() * 22).toFixed(1);
        star.style.cssText = `
          --sz:${sz};--clr:${clr};--dur:${dur};--delay:${delay};
          --tx:${spreadX}px;  --ty:${d1}px;
          --tx2:${spreadX}px; --ty2:${d2}px;
          --tx3:${spreadX}px; --ty3:${d3}px;
        `;
      }
      starsEl.appendChild(star);
    }
  }

  makeStars();

  // ── Smooth mouse-X tracking across full button width ──
  let targetX  = 0;
  let currentX = 0;
  let centreY  = 0;
  let trackRaf = null;
  let isHovered = false;

  function trackLoop() {
    if (!isHovered) return;
    currentX += (targetX - currentX) * 0.12;
    starsEl.style.left = currentX + 'px';
    trackRaf = requestAnimationFrame(trackLoop);
  }

  function initPosition(e) {
    const rect   = glowBtn.getBoundingClientRect();
    centreY      = rect.height / 2;
    starsEl.style.top       = centreY + 'px';
    starsEl.style.transform = 'none';

    // Seed at mouse X so there's no snap on enter
    const mouseX = e ? e.clientX - rect.left : rect.width / 2;
    currentX     = mouseX;
    targetX      = mouseX;
    starsEl.style.left = currentX + 'px';
  }

  glowBtn.addEventListener('mouseenter', (e) => {
    isHovered = true;
    glowInner.style.background  = '#b4dbff';
    glowInner.style.borderColor = '#b4dbff';
    arrowSvg.style.transform    = 'translateX(5px)';

    initPosition(e);
    if (trackRaf) cancelAnimationFrame(trackRaf);
    trackRaf = requestAnimationFrame(trackLoop);
  });

  glowBtn.addEventListener('mousemove', (e) => {
    const rect = glowBtn.getBoundingClientRect();
    // Directly follow mouse X — full left-to-right range
    targetX = e.clientX - rect.left;
  });

  glowBtn.addEventListener('mouseleave', () => {
    isHovered = false;
    glowInner.style.background  = '#c6ff7c';
    glowInner.style.borderColor = 'transparent';
    arrowSvg.style.transform    = 'translateX(0)';
    if (trackRaf) cancelAnimationFrame(trackRaf);
  });

  window.addEventListener('resize', () => { makeStars(); });
  window.addEventListener('load',   () => { initPosition(null); });
})();

/* ─────────────────────────────────────────────
   GLOW BUTTON — SMALL SOFT SNOW LIGHT
   ───────────────────────────────────────────── */
(function () {
  const glowBtn   = document.querySelector('.glow-btn');
  const glowInner = document.querySelector('.glow-btn-inner');
  if (!glowBtn || !glowInner) return;

  const CW = 340, CH = 220;
  const canvas = document.createElement('canvas');
  canvas.width  = CW;
  canvas.height = CH;
  canvas.style.cssText = `
    position:absolute;
    top:50%; left:50%;
    width:${CW}px; height:${CH}px;
    margin-left:${-CW / 2}px;
    margin-top:${-CH / 2}px;
    pointer-events:none;
    z-index:0;
  `;
  glowBtn.insertBefore(canvas, glowBtn.firstChild);
  const ctx = canvas.getContext('2d');

  function drawGlow(cx, alpha) {
    ctx.clearRect(0, 0, CW, CH);
    if (alpha < 0.01) return;
    const cy = CH / 2;
    const rx = CW * 0.36, ry = CH * 0.58;
    ctx.save();
    ctx.translate(cx, cy);
    ctx.scale(1, ry / rx);
    const g = ctx.createRadialGradient(0, 0, 0, 0, 0, rx);
    g.addColorStop(0,    `rgba(255,255,255,${0.28 * alpha})`);
    g.addColorStop(0.35, `rgba(220,235,255,${0.13 * alpha})`);
    g.addColorStop(0.7,  `rgba(180,210,255,${0.04 * alpha})`);
    g.addColorStop(1,    `rgba(160,200,255,0)`);
    ctx.beginPath();
    ctx.arc(0, 0, rx, 0, Math.PI * 2);
    ctx.fillStyle = g;
    ctx.fill();
    ctx.restore();
  }

  let targetX = CW / 2, currentX = CW / 2;
  let alpha = 0, targetAlpha = 0;
  let isHovered = false, raf = null, fadeTimer = null;

  function loop() {
    currentX += (targetX     - currentX) * 0.10;
    alpha    += (targetAlpha - alpha)    * 0.08;
    ctx.clearRect(0, 0, CW, CH);
    drawGlow(currentX, alpha);
    raf = requestAnimationFrame(loop);
  }

  function initPos(e) {
    const rect = glowBtn.getBoundingClientRect();
    const mx   = e ? e.clientX - rect.left : rect.width / 2;
    currentX   = mx - rect.width / 2 + CW / 2;
    targetX    = currentX;
  }

  glowBtn.addEventListener('mouseenter', (e) => {
    isHovered = true; targetAlpha = 1;
    clearTimeout(fadeTimer);
    initPos(e);
    if (!raf) raf = requestAnimationFrame(loop);
  });
  glowBtn.addEventListener('mousemove', (e) => {
    const rect = glowBtn.getBoundingClientRect();
    targetX = e.clientX - rect.left - rect.width / 2 + CW / 2;
  });
  glowBtn.addEventListener('mouseleave', () => {
    isHovered = false; targetAlpha = 0;
    fadeTimer = setTimeout(() => {
      if (!isHovered) { cancelAnimationFrame(raf); raf = null; ctx.clearRect(0,0,CW,CH); }
    }, 800);
  });
  window.addEventListener('load', () => initPos(null));
})();



/* ─────────────────────────────────────────────
   FAQ ACCORDION
   ───────────────────────────────────────────── */
function toggleAcc(el) {
  const acc = el.parentElement;
  const wasActive = acc.classList.contains('active');
  document.querySelectorAll('.acc').forEach(a => a.classList.remove('active'));
  if (!wasActive) acc.classList.add('active');
}


/* ─────────────────────────────────────────────
   ANIMATED COUNTERS
   ───────────────────────────────────────────── */
const counters = document.querySelectorAll('[data-count]');
const counterObs = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const el = entry.target;
      const target = parseInt(el.getAttribute('data-count'));
      let current = 0;
      const step = Math.ceil(target / 60);
      const timer = setInterval(() => {
        current += step;
        if (current >= target) { current = target; clearInterval(timer); }
        el.textContent = current;
      }, 25);
      counterObs.unobserve(el);
    }
  });
}, { threshold: 0.5 });
counters.forEach(c => counterObs.observe(c));


/* ─────────────────────────────────────────────
   HERO PARTICLE PARALLAX — SMOOTH RAF LOOP
   Movement pattern:
   Mouse RIGHT  → Strategy LEFT,  Marketing RIGHT, Proven Success UP
   Mouse LEFT   → Strategy RIGHT, Marketing LEFT,  Proven Success DOWN
   Mouse UP     → Strategy DOWN,  Marketing UP,    Proven Success LEFT
   Mouse DOWN   → Strategy UP,    Marketing DOWN,  Proven Success RIGHT
   ───────────────────────────────────────────── */
const hero      = document.querySelector('.hero');
const particles = document.querySelectorAll('.hero .p1,.hero .p2,.hero .p3');
if (hero && particles.length) {
  const STRENGTH = 0.06;
  const LERP     = 0.05;

  let targetMX = 0, targetMY = 0;
  let currentMX = 0, currentMY = 0;
  let heroRaf = null;

  function heroParallaxLoop() {
    // Smooth interpolation toward target
    currentMX += (targetMX - currentMX) * LERP;
    currentMY += (targetMY - currentMY) * LERP;

    const mx = currentMX;
    const my = currentMY;

    // p1 = Strategy: opposite direction
    if (particles[0]) particles[0].style.transform = `translate(${-mx}px,${-my}px) rotate(${-30 + mx * 0.03}deg)`;
    // p2 = Proven Success: perpendicular (mouse right → up, mouse down → right)
    if (particles[1]) particles[1].style.transform = `translate(${-my}px,${mx}px) rotate(${20 + my * 0.03}deg)`;
    // p3 = Marketing: same direction as mouse
    if (particles[2]) particles[2].style.transform = `translate(${mx}px,${my}px) rotate(${-15 + mx * 0.03}deg)`;

    heroRaf = requestAnimationFrame(heroParallaxLoop);
  }

  // Start loop immediately — always running for instant response
  heroRaf = requestAnimationFrame(heroParallaxLoop);

  hero.addEventListener('mousemove', (e) => {
    const rect = hero.getBoundingClientRect();
    targetMX = (e.clientX - rect.left - rect.width  / 2) * STRENGTH;
    targetMY = (e.clientY - rect.top  - rect.height / 2) * STRENGTH;
  });

  hero.addEventListener('mouseleave', () => {
    targetMX = 0;
    targetMY = 0;
    // RAF loop keeps running and will smoothly ease back to 0
    // No need to cancel — it auto-settles
  });
}


/* ─────────────────────────────────────────────
   ABOUT SECTION PARTICLE PARALLAX
   ───────────────────────────────────────────── */
const aboutSection    = document.querySelector('.about');
const aboutParticles  = document.querySelectorAll('.about-p1,.about-p2,.about-p3');
const aboutPhoto      = document.querySelector('.about-photo');
if (aboutSection) {
  aboutSection.addEventListener('mousemove', (e) => {
    const rect = aboutSection.getBoundingClientRect();
    const mx = (e.clientX - rect.left - rect.width  / 2) * 0.12;
    const my = (e.clientY - rect.top  - rect.height / 2) * 0.12;
    if (aboutParticles[0]) aboutParticles[0].style.transform = `translate(${mx}px,${my}px) rotate(${-20+mx*0.05}deg)`;
    if (aboutParticles[1]) aboutParticles[1].style.transform = `translate(${my}px,${mx}px) rotate(${18 +my*0.05}deg)`;
    if (aboutParticles[2]) aboutParticles[2].style.transform = `translate(${-my}px,${mx}px) rotate(${-12+mx*0.05}deg)`;
    if (aboutPhoto) aboutPhoto.style.transform = `rotate(-5deg) translate(${mx*0.3}px,${my*0.3}px)`;
  });
  aboutSection.addEventListener('mouseleave', () => {
    if (aboutParticles[0]) aboutParticles[0].style.transform = 'translate(0,0) rotate(-20deg)';
    if (aboutParticles[1]) aboutParticles[1].style.transform = 'translate(0,0) rotate(18deg)';
    if (aboutParticles[2]) aboutParticles[2].style.transform = 'translate(0,0) rotate(-12deg)';
    if (aboutPhoto) aboutPhoto.style.transform = 'rotate(-5deg) translate(0,0)';
  });
}


/* ─────────────────────────────────────────────
   SCROLL REVEAL — GENERAL ELEMENTS
   ───────────────────────────────────────────── */
const revealEls = document.querySelectorAll('.s-card,.testi-head,.center-head,.sec-head,.about-inner,.faq-inner');
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.style.opacity   = '1';
      entry.target.style.transform = 'translateY(0)';
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.1 });
revealEls.forEach(el => {
  el.style.opacity    = '0';
  el.style.transform  = 'translateY(30px)';
  el.style.transition = 'opacity .6s ease, transform .6s ease';
  revealObserver.observe(el);
});


/* ─────────────────────────────────────────────
   PROJECT CARDS REVEAL ON SCROLL
   ───────────────────────────────────────────── */
const projCards   = document.querySelectorAll('.proj-reveal');
const projObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) entry.target.classList.add('visible');
    else entry.target.classList.remove('visible');
  });
}, { threshold: 0.12 });
projCards.forEach(card => projObserver.observe(card));


/* ─────────────────────────────────────────────
   PROJECT CARD — MAGNETIC VIEW BUTTON
   ───────────────────────────────────────────── */
document.querySelectorAll('.proj-card').forEach(card => {
  const btn = card.querySelector('.view-circle');
  if (!btn) return;
  let targetX = 0, targetY = 0, currentX = 0, currentY = 0, rafId = null;
  function animate() {
    currentX += (targetX - currentX) * 0.15;
    currentY += (targetY - currentY) * 0.15;
    btn.style.transform = `translate(${currentX}px, ${currentY}px)`;
    rafId = requestAnimationFrame(animate);
  }
  card.addEventListener('mouseenter', () => { card.classList.add('grey-hover');  rafId = requestAnimationFrame(animate); });
  card.addEventListener('mousemove',  (e) => {
    const rect = card.getBoundingClientRect();
    targetX = e.clientX - rect.left  - btn.offsetWidth  / 2;
    targetY = e.clientY - rect.top   - btn.offsetHeight / 2;
  });
  card.addEventListener('mouseleave', () => { card.classList.remove('grey-hover'); if (rafId) cancelAnimationFrame(rafId); });
});


/* ─────────────────────────────────────────────
   PROJECT CARD SCALE ON SCROLL
   ───────────────────────────────────────────── */
function handleProjectScroll() {
  const cards = document.querySelectorAll('.proj-card');
  const vh = window.innerHeight;
  cards.forEach(card => {
    const rect       = card.getBoundingClientRect();
    const cardCenter = rect.top + rect.height / 2;
    const viewPos    = cardCenter / vh;
    if (viewPos < 0.5 && viewPos > -0.3) {
      const progress = Math.max(0, Math.min(1, (0.5 - viewPos) / 0.5));
      card.style.transform = `scale(${1 - progress * 0.3})`;
    } else if (viewPos >= 0.5) {
      card.style.transform = 'scale(1)';
    }
  });
  requestAnimationFrame(handleProjectScroll);
}
handleProjectScroll();


/* ─────────────────────────────────────────────
   SERVICE CARDS STAGGER
   ───────────────────────────────────────────── */
document.querySelectorAll('.s-card').forEach((card, i) => {
  card.style.transitionDelay = `${i * 0.08}s`;
});


/* ─────────────────────────────────────────────
   FOOTER PARTICLE PARALLAX
   ───────────────────────────────────────────── */
const footerSection = document.querySelector('.footer');
const ftP1 = document.querySelector('.ft-p1');
const ftP2 = document.querySelector('.ft-p2');
if (footerSection && ftP1 && ftP2) {
  footerSection.addEventListener('mousemove', (e) => {
    const rect = footerSection.getBoundingClientRect();
    const mx = (e.clientX - rect.left - rect.width  / 2) * 0.12;
    const my = (e.clientY - rect.top  - rect.height / 2) * 0.12;
    ftP1.style.transform = `translate(${mx}px,${my}px) rotate(${-25+mx*0.05}deg)`;
    ftP2.style.transform = `translate(${my}px,${mx}px) rotate(${10 +my*0.05}deg)`;
  });
  footerSection.addEventListener('mouseleave', () => {
    ftP1.style.transform = 'translate(0,0) rotate(-25deg)';
    ftP2.style.transform = 'translate(0,0) rotate(10deg)';
  });
}


/* ─────────────────────────────────────────────
   VALUE PROPS — POSTBOX SCROLL ANIMATION
   ───────────────────────────────────────────── */
(function () {
  const SLOT_Y_FRAC  = 0.4069;
  const SLOT_H_FRAC  = 0.424;
  const SLOT_LX_FRAC = 0.02;

  const scene  = document.getElementById('postbox-scene');
  const track  = document.getElementById('val-track');
  const fill   = document.getElementById('mailbox-fill');
  if (!scene || !track) return;

  const wrapEl  = scene.querySelector('.postbox-wrap');
  const mailbox = scene.querySelector('.mailbox');
  const mbImg   = mailbox.querySelector('.mailbox-img');
  const cards   = Array.from(track.querySelectorAll('.val-card'));

  function getRenderedImageBounds() {
    const mbR  = mailbox.getBoundingClientRect();
    const natW = mbImg.naturalWidth  || 1;
    const natH = mbImg.naturalHeight || 1;
    const natR = natW / natH;
    const cW   = mbR.width; const cH = mbR.height; const cR = cW / cH;
    let iW, iH, offX, offY;
    if (natR < cR) { iH=cH; iW=iH*natR; offX=cW-iW; offY=0; }
    else           { iW=cW; iH=iW/natR; offX=0; offY=(cH-iH)/2; }
    return { iW, iH, offX, offY, mbR };
  }

  let cardW = 350, cardH = 200;
  function applyCardSizing() {
    if (window.innerWidth < 768) return;
    const vw = window.innerWidth;
    const { iW, iH } = getRenderedImageBounds();

    // Scale cards proportionally to the rendered postbox image
    cardH = Math.round(iH * SLOT_H_FRAC);
    cardW = Math.round(cardH);

    // Responsive constraints based on actual viewport width
    let minW, minH, maxW, maxH;
    if (vw < 900) {
      // Small tablets (768–899)
      minW = 80;  minH = 80;
      maxW = 180; maxH = 220;
    } else if (vw < 1200) {
      // Large tablets / small laptops (900–1199)
      minW = 120; minH = 120;
      maxW = 260; maxH = 320;
    } else if (vw < 1440) {
      // Standard laptops (1200–1439)
      minW = 160; minH = 160;
      maxW = 360; maxH = 440;
    } else {
      // Large screens (1440+)
      minW = 180; minH = 180;
      maxW = 420; maxH = 520;
    }

    cardW = Math.max(minW, Math.min(cardW, maxW));
    cardH = Math.max(minH, Math.min(cardH, maxH));
    cards.forEach(c => { c.style.width = cardW+'px'; c.style.height = cardH+'px'; });

    const { iH: iH2, offY, mbR } = getRenderedImageBounds();
    const wrapR = wrapEl.getBoundingClientRect();
    const slotCentreAbs = mbR.top + offY + iH2 * SLOT_Y_FRAC;
    track.style.top = (slotCentreAbs - wrapR.top) + 'px';
  }

  function loop() {
    if (window.innerWidth >= 768) {
      const { iW, iH, offX, offY, mbR } = getRenderedImageBounds();
      const wrapR  = wrapEl.getBoundingClientRect();
      const sceneH = scene.offsetHeight;
      const vh     = window.innerHeight;
      const progress = Math.max(0, Math.min(1, -scene.getBoundingClientRect().top / (sceneH - vh)));
      const totalW   = cardW * cards.length;
      const slotAbsLeft = mbR.left + offX + iW * SLOT_LX_FRAC;
      const slotX  = slotAbsLeft - wrapR.left;
      const startX = slotX;
      const endX   = slotX - totalW + iW * 0.45;
      const currX  = startX + (endX - startX) * progress;
      track.style.transform = `translateY(-50%) translateX(${currX}px)`;
      if (fill) {
        const fillLeft = slotX + cardW + 20;
        fill.style.left   = fillLeft + 'px';
        fill.style.top    = (mbR.top - wrapR.top) + 'px';
        fill.style.width  = (wrapR.width - fillLeft + 40) + 'px';
        fill.style.height = mbR.height + 'px';
      }
    }
    requestAnimationFrame(loop);
  }

  function init() { applyCardSizing(); loop(); }
  if (mbImg.complete && mbImg.naturalWidth > 0) { init(); }
  else { mbImg.addEventListener('load', init); setTimeout(init, 100); }

  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(applyCardSizing, 80);
  });
})();


/* ─────────────────────────────────────────────
   FOOTER REVEAL ANIMATION
   ───────────────────────────────────────────── */
(function () {
  const footer = document.querySelector('.footer');
  if (!footer) return;
  const targets = [
    { el: footer.querySelector('.ft-top-left'),   delay: 0    },
    { el: footer.querySelector('.ft-top-right'),  delay: 0.13 },
    { el: footer.querySelector('.ft-logo-block'), delay: 0.24 },
    ...Array.from(footer.querySelectorAll('.ft-col')).map((el, i) => ({ el, delay: 0.34 + i * 0.1 })),
    { el: footer.querySelector('.ft-bottom'),     delay: 0.72 },
  ].filter(t => t.el);

  targets.forEach(({ el, delay }) => {
    el.classList.add('ft-reveal');
    el.style.transitionDelay = `${delay}s`;
  });

  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        targets.forEach(({ el }) => el.classList.add('ft-in'));
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.04 });
  io.observe(footer);
})();


/* ─────────────────────────────────────────────
   MOBILE VALUE CARDS REVEAL
   ───────────────────────────────────────────── */
(function () {
  const mobCards = document.querySelectorAll('.values-mobile .mob-reveal');
  if (!mobCards.length) return;
  const mobObs = new IntersectionObserver((entries) => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        setTimeout(() => entry.target.classList.add('mob-in'), i * 120);
        mobObs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });
  mobCards.forEach(c => mobObs.observe(c));
})();

/* ─────────────────────────────────────────────
   SERVICES MOBILE — SCROLL-DRIVEN CARD STACK
   Paste at the bottom of script.js
   ───────────────────────────────────────────── */
(function () {

  /* ── Only on mobile ── */
  if (window.innerWidth > 767) return;

  const section = document.querySelector('.services');
  const grid    = section && section.querySelector('.s-grid');
  if (!section || !grid) return;

  const cards = Array.from(grid.querySelectorAll('.s-card'));
  const n = cards.length;
  if (n < 2) return;

  /* ── 1. Wrap the section so we can add scroll budget ── */
  const wrapper = document.createElement('div');
  wrapper.id = 'services-sticky-wrapper';
  section.parentNode.insertBefore(wrapper, section);
  wrapper.appendChild(section);

  /* ── 2. Measure after layout ── */
  function measure() {
    const gridStyle  = getComputedStyle(grid);
    const gap        = parseFloat(gridStyle.rowGap) || 16;
    const cardH      = cards[0].offsetHeight;
    const perCard    = cardH + gap;          // scroll pixels per card transition
    const budget     = (n - 1) * perCard;   // total extra scroll budget

    /* Natural section height (before adding budget) */
    const naturalH = section.offsetHeight;

    /* Wrapper must be tall enough to hold natural section + stacking budget */
    wrapper.style.height = (naturalH + budget) + 'px';

    /* Set z-indices: later cards sit on top of earlier ones */
    cards.forEach((c, i) => { c.style.zIndex = i + 1; });

    return { perCard, budget, cardH };
  }

  let dims = measure();

  /* ── 3. Drive transforms from scroll position ── */
  function update() {
    const wrapperTop = wrapper.getBoundingClientRect().top;

    /*
     * progress = how far we've scrolled PAST the point where the section
     * sticks (wrapperTop crosses 0).
     * 0      → nothing stacked yet
     * budget → all cards fully stacked
     */
    const progress = Math.max(0, Math.min(-wrapperTop, dims.budget));

    cards.forEach((card, i) => {
      if (i === 0) return; // first card never moves — it's the anchor

      /*
       * Card i animates in the scroll range:
       *   start = (i - 1) * perCard
       *   end   =  i      * perCard
       *
       * When fully stacked, card i needs to have moved UP by
       * (i * perCard) so it sits exactly on top of card 0.
       */
      const start    = (i - 1) * dims.perCard;
      const end      =  i      * dims.perCard;
      const local    = Math.max(0, Math.min(progress - start, dims.perCard));
      const ratio    = local / dims.perCard;            // 0 → 1
      const totalUp  = i * dims.perCard;

      card.style.transform = `translateY(${-totalUp * ratio}px)`;

      /* Visual helpers */
      const inFlight = local > 0 && local < dims.perCard;
      const done     = local >= dims.perCard;

      card.classList.toggle('stacking', inFlight);
      card.classList.toggle('buried',   false);           // reset

      /* Cards below the one in flight get buried */
      if (inFlight) {
        for (let j = 0; j < i; j++) cards[j].classList.add('buried');
      }
      if (done) {
        card.classList.remove('stacking');
      }
    });
  }

  window.addEventListener('scroll', update, { passive: true });
  update(); // initial paint

  /* ── 4. Teardown on resize to desktop ── */
  window.addEventListener('resize', () => {
    if (window.innerWidth > 767) {
      /* Restore DOM: move section back out of wrapper */
      wrapper.parentNode.insertBefore(section, wrapper);
      wrapper.parentNode.removeChild(wrapper);
      section.style.position = '';
      section.style.top      = '';
      cards.forEach(c => {
        c.style.transform = '';
        c.style.zIndex    = '';
        c.classList.remove('stacking', 'buried');
      });
      window.removeEventListener('scroll', update);
    } else {
      /* Re-measure if layout changed on mobile (orientation flip) */
      dims = measure();
      update();
    }
  });

})();