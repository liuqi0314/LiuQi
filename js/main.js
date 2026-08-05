// ===== DOM Elements =====
const navbar = document.getElementById('navbar');
const hamburger = document.getElementById('hamburger');
const navMenu = document.getElementById('navMenu');
const langToggle = document.getElementById('langToggle');
const backToTop = document.getElementById('backToTop');
const navLinks = document.querySelectorAll('.nav-link');
const pubFilters = document.querySelectorAll('.pub-filter');

// ===== Particle Background =====
const canvas = document.getElementById('particleCanvas');
const ctx = canvas.getContext('2d');
let particles = [];
let animationId;

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}

function createParticles() {
  particles = [];
  const count = Math.floor((canvas.width * canvas.height) / 18000);
  for (let i = 0; i < count; i++) {
    particles.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.3,
      vy: (Math.random() - 0.5) * 0.3,
      r: Math.random() * 1.5 + 0.5,
      opacity: Math.random() * 0.5 + 0.1,
    });
  }
}

function drawParticles() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  for (let i = 0; i < particles.length; i++) {
    const p = particles[i];
    p.x += p.vx;
    p.y += p.vy;

    if (p.x < 0) p.x = canvas.width;
    if (p.x > canvas.width) p.x = 0;
    if (p.y < 0) p.y = canvas.height;
    if (p.y > canvas.height) p.y = 0;

    ctx.beginPath();
    ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(6, 182, 212, ${p.opacity})`;
    ctx.fill();

    // Draw connections
    for (let j = i + 1; j < particles.length; j++) {
      const p2 = particles[j];
      const dx = p.x - p2.x;
      const dy = p.y - p2.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < 120) {
        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.strokeStyle = `rgba(6, 182, 212, ${0.06 * (1 - dist / 120)})`;
        ctx.lineWidth = 0.5;
        ctx.stroke();
      }
    }
  }

  animationId = requestAnimationFrame(drawParticles);
}

resizeCanvas();
createParticles();
drawParticles();

window.addEventListener('resize', () => {
  resizeCanvas();
  createParticles();
});

// ===== Navbar scroll shadow =====
window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 20);
});

// ===== Mobile menu =====
hamburger.addEventListener('click', () => {
  hamburger.classList.toggle('active');
  navMenu.classList.toggle('open');
});

navLinks.forEach(link => {
  link.addEventListener('click', () => {
    hamburger.classList.remove('active');
    navMenu.classList.remove('open');
  });
});

// ===== Active nav link on scroll =====
const sections = document.querySelectorAll('section[id]');

function updateActiveNav() {
  const scrollY = window.scrollY + 100;
  let current = '';

  sections.forEach(section => {
    const top = section.offsetTop - 100;
    const bottom = top + section.offsetHeight;
    if (scrollY >= top && scrollY < bottom) {
      current = section.getAttribute('id');
    }
  });

  navLinks.forEach(link => {
    link.classList.remove('active');
    if (link.getAttribute('href') === '#' + current) {
      link.classList.add('active');
    }
  });
}

window.addEventListener('scroll', updateActiveNav);

// ===== Language Toggle =====
function setLanguage(lang) {
  document.documentElement.setAttribute('data-lang', lang);
  localStorage.setItem('lang', lang);
  document.title = lang === 'zh' ? '刘齐 | 学术主页' : 'Qi Liu | Academic Homepage';
}

langToggle.addEventListener('click', () => {
  const current = document.documentElement.getAttribute('data-lang');
  setLanguage(current === 'zh' ? 'en' : 'zh');
});

const savedLang = localStorage.getItem('lang');
if (savedLang) {
  setLanguage(savedLang);
}

// ===== Publication Filters =====
pubFilters.forEach(btn => {
  btn.addEventListener('click', () => {
    pubFilters.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    const filter = btn.getAttribute('data-filter');
    const items = document.querySelectorAll('.pub-item');

    items.forEach(item => {
      if (filter === 'all' || item.getAttribute('data-type') === filter) {
        item.classList.remove('hidden');
      } else {
        item.classList.add('hidden');
      }
    });

    document.querySelectorAll('.pub-year-group').forEach(group => {
      const visibleItems = group.querySelectorAll('.pub-item:not(.hidden)');
      group.classList.toggle('year-hidden', visibleItems.length === 0);
    });
  });
});

// ===== Scroll Animations =====
const animateElements = document.querySelectorAll('.animate-on-scroll');

const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
);

animateElements.forEach(el => observer.observe(el));

// ===== Back to Top =====
backToTop.addEventListener('click', () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

// ===== Hero 视觉：社会-生态系统网络 =====
(function () {
  const sesCanvas = document.getElementById('sesCanvas');
  if (!sesCanvas) return;

  const sctx = sesCanvas.getContext('2d');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const CYAN = [34, 211, 238];
  const VIOLET = [167, 139, 250];
  const rgba = (c, a) => `rgba(${c[0]}, ${c[1]}, ${c[2]}, ${a})`;

  const PRIMARY = [
    { lines: ['Ecosystem', 'Services'], color: CYAN },
    { lines: ['AI for Science'], color: VIOLET },
    { lines: ['Sustainability'], color: CYAN },
    { lines: ['Social-', 'Ecological'], color: VIOLET },
  ];
  const SECONDARY_COUNT = 12;

  let W = 0, H = 0, dpr = 1;
  let nodes = [];
  let links = [];
  let mouse = { x: -999, y: -999, on: false };
  let rafId = null;
  let running = false;

  function resize() {
    const rect = sesCanvas.getBoundingClientRect();
    if (!rect.width) return false;
    W = rect.width;
    H = rect.height;
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    sesCanvas.width = Math.round(W * dpr);
    sesCanvas.height = Math.round(H * dpr);
    sctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    return true;
  }

  function build() {
    const cx = W / 2, cy = H / 2;
    nodes = [];
    links = [];

    PRIMARY.forEach((p, i) => {
      const a = -Math.PI / 2 + (i * Math.PI) / 2 + 0.3;
      nodes.push({
        primary: true,
        lines: p.lines,
        color: p.color,
        r: 5,
        x: cx + Math.cos(a) * 60,
        y: cy + Math.sin(a) * 60,
        vx: 0, vy: 0,
      });
    });

    for (let i = 0; i < SECONDARY_COUNT; i++) {
      const a = (i / SECONDARY_COUNT) * Math.PI * 2 + 0.6;
      const d = 95 + (i % 3) * 8;
      nodes.push({
        primary: false,
        color: i % 2 ? VIOLET : CYAN,
        r: 1.8 + (i % 3) * 0.5,
        x: cx + Math.cos(a) * d,
        y: cy + Math.sin(a) * d,
        vx: 0, vy: 0,
      });
    }

    const addLink = (a, b, rest) => links.push({ a, b, rest, phase: links.length * 0.17 });

    // 四个主概念互联
    addLink(0, 1, 86); addLink(1, 2, 86); addLink(2, 3, 86); addLink(3, 0, 86);
    addLink(0, 2, 120);

    // 次级节点挂到主概念上
    for (let i = 0; i < SECONDARY_COUNT; i++) {
      const n = 4 + i;
      addLink(n, i % 4, 54);
      if (i % 3 === 0) addLink(n, (i + 1) % 4, 60);
    }
  }

  function step() {
    const cx = W / 2, cy = H / 2;
    const maxR = Math.min(W, H) / 2 - 34;

    // 节点间斥力
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const a = nodes[i], b = nodes[j];
        let dx = b.x - a.x, dy = b.y - a.y;
        let d2 = dx * dx + dy * dy;
        if (d2 < 1) d2 = 1;
        const d = Math.sqrt(d2);
        const f = Math.min(900 / d2, 0.8);
        const fx = (dx / d) * f, fy = (dy / d) * f;
        a.vx -= fx; a.vy -= fy;
        b.vx += fx; b.vy += fy;
      }
    }

    // 连线弹簧
    for (const l of links) {
      const a = nodes[l.a], b = nodes[l.b];
      const dx = b.x - a.x, dy = b.y - a.y;
      const d = Math.sqrt(dx * dx + dy * dy) || 1;
      const f = (d - l.rest) * 0.012;
      const fx = (dx / d) * f, fy = (dy / d) * f;
      a.vx += fx; a.vy += fy;
      b.vx -= fx; b.vy -= fy;
    }

    for (const n of nodes) {
      let dx = n.x - cx, dy = n.y - cy;
      const d = Math.sqrt(dx * dx + dy * dy) || 1;

      // 回中 + 缓慢公转
      n.vx -= dx * 0.0016;
      n.vy -= dy * 0.0016;
      n.vx += (-dy / d) * 0.035;
      n.vy += (dx / d) * 0.035;

      // 软边界
      if (d > maxR) {
        n.vx -= (dx / d) * (d - maxR) * 0.05;
        n.vy -= (dy / d) * (d - maxR) * 0.05;
      }

      // 鼠标轻推
      if (mouse.on) {
        const mx = n.x - mouse.x, my = n.y - mouse.y;
        const md = Math.sqrt(mx * mx + my * my) || 1;
        if (md < 70) {
          const f = (1 - md / 70) * 0.9;
          n.vx += (mx / md) * f;
          n.vy += (my / md) * f;
        }
      }

      n.vx *= 0.86;
      n.vy *= 0.86;
      n.x += n.vx;
      n.y += n.vy;
    }
  }

  function hovered() {
    if (!mouse.on) return -1;
    let best = -1, bestD = 30;
    for (let i = 0; i < nodes.length; i++) {
      if (!nodes[i].primary) continue;
      const d = Math.hypot(nodes[i].x - mouse.x, nodes[i].y - mouse.y);
      if (d < bestD) { bestD = d; best = i; }
    }
    return best;
  }

  function draw(animate) {
    sctx.clearRect(0, 0, W, H);
    const active = hovered();

    // 连线
    for (const l of links) {
      const a = nodes[l.a], b = nodes[l.b];
      const lit = active >= 0 && (l.a === active || l.b === active);
      const base = a.primary && b.primary ? 0.34 : 0.16;
      const alpha = lit ? 0.72 : base;
      const g = sctx.createLinearGradient(a.x, a.y, b.x, b.y);
      g.addColorStop(0, rgba(a.color, alpha));
      g.addColorStop(1, rgba(b.color, alpha));
      sctx.beginPath();
      sctx.moveTo(a.x, a.y);
      sctx.lineTo(b.x, b.y);
      sctx.strokeStyle = g;
      sctx.lineWidth = lit ? 1.2 : 0.7;
      sctx.stroke();

      // 流光
      if (animate) {
        l.phase += 0.0042;
        if (l.phase > 1) l.phase -= 1;
        const t = l.phase;
        const px = a.x + (b.x - a.x) * t;
        const py = a.y + (b.y - a.y) * t;
        const fade = Math.sin(t * Math.PI);
        sctx.beginPath();
        sctx.arc(px, py, 1.6, 0, Math.PI * 2);
        sctx.fillStyle = rgba(b.color, fade * (lit ? 0.95 : 0.6));
        sctx.fill();
      }
    }

    // 节点
    for (let i = 0; i < nodes.length; i++) {
      const n = nodes[i];
      const lit = i === active;
      const r = lit ? n.r * 1.5 : n.r;
      sctx.save();
      sctx.shadowColor = rgba(n.color, n.primary ? 0.9 : 0.5);
      sctx.shadowBlur = n.primary ? (lit ? 18 : 10) : 5;
      sctx.beginPath();
      sctx.arc(n.x, n.y, r, 0, Math.PI * 2);
      sctx.fillStyle = rgba(n.color, n.primary ? 0.95 : 0.55);
      sctx.fill();
      sctx.restore();

      if (n.primary) {
        sctx.beginPath();
        sctx.arc(n.x, n.y, r + 5, 0, Math.PI * 2);
        sctx.strokeStyle = rgba(n.color, lit ? 0.5 : 0.22);
        sctx.lineWidth = 1;
        sctx.stroke();
      }
    }

    // 标签
    sctx.textAlign = 'center';
    sctx.textBaseline = 'top';
    sctx.font = '500 10px Inter, system-ui, sans-serif';
    if ('letterSpacing' in sctx) sctx.letterSpacing = '0.04em';
    for (let i = 0; i < nodes.length; i++) {
      const n = nodes[i];
      if (!n.primary) continue;
      const lit = i === active;
      sctx.fillStyle = lit ? rgba(n.color, 1) : 'rgba(148, 163, 184, 0.85)';
      n.lines.forEach((line, k) => {
        sctx.fillText(line, n.x, n.y + n.r + 10 + k * 12);
      });
    }
    if ('letterSpacing' in sctx) sctx.letterSpacing = '0px';
  }

  function loop() {
    step();
    draw(true);
    rafId = requestAnimationFrame(loop);
  }

  let ready = false;
  let inView = false;

  function start() {
    if (running || reduceMotion || !ready || !inView || document.hidden) return;
    running = true;
    rafId = requestAnimationFrame(loop);
  }

  function stop() {
    running = false;
    if (rafId) cancelAnimationFrame(rafId);
    rafId = null;
  }

  // 画布在窄屏被隐藏（宽度为 0），此时不初始化，等窗口变宽再试
  function init() {
    if (!resize()) { ready = false; return false; }
    build();
    for (let i = 0; i < 260; i++) step();
    draw(!reduceMotion);
    ready = true;
    return true;
  }

  init();

  sesCanvas.addEventListener('pointermove', (e) => {
    const rect = sesCanvas.getBoundingClientRect();
    mouse.x = e.clientX - rect.left;
    mouse.y = e.clientY - rect.top;
    mouse.on = true;
  });
  sesCanvas.addEventListener('pointerleave', () => { mouse.on = false; });

  new IntersectionObserver((entries) => {
    inView = entries[0].isIntersecting;
    inView ? start() : stop();
  }, { threshold: 0 }).observe(sesCanvas);

  document.addEventListener('visibilitychange', () => {
    document.hidden ? stop() : start();
  });

  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      stop();
      if (init()) start();
    }, 200);
  });
})();
