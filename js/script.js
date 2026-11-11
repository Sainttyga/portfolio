/* ============================================================
   LINDOKUHLE ZWANE — PORTFOLIO · script.js
   nav · typing · reveal · tilt · counters · cert viewer · github
   ============================================================ */
'use strict';

const $  = (s, c = document) => c.querySelector(s);
const $$ = (s, c = document) => [...c.querySelectorAll(s)];
const prefersReduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ---------- 0. Fit hero name to container width ---------- */
(function fitHeroName() {
  const nameEl = $('.hero-name .oneline');
  const surnameEl = $('.hero-name .outline');
  const inner = $('.hero-inner');
  if (!nameEl || !inner) return;
  function fit() {
    const target = inner.clientWidth;
    let fs = Math.min(target * 0.13, 168);            // starting guess
    nameEl.style.fontSize = fs + 'px';
    let guard = 40;
    while (guard-- > 0 && nameEl.scrollWidth > target) {
      fs *= 0.96;
      nameEl.style.fontSize = fs + 'px';
    }
    if (surnameEl) surnameEl.style.fontSize = fs + 'px'; // same size as the name
  }
  fit();
  addEventListener('resize', fit);
  if (document.fonts?.ready) document.fonts.ready.then(fit); // re-fit once Syne loads
})();

/* ---------- 1. Sticky nav + scroll progress ---------- */
const nav = $('#nav');
const progress = $('#scrollProgress');
const toTop = $('#toTop');

function onScroll() {
  const y = scrollY;
  nav.classList.toggle('scrolled', y > 24);
  toTop.classList.toggle('show', y > 600);

  const h = document.documentElement.scrollHeight - innerHeight;
  progress.style.width = (h > 0 ? (y / h) * 100 : 0) + '%';

  // in the hero zone — no nav link should stay highlighted
  const heroEnd = ($('#about')?.offsetTop || 800) - 180;
  if (y < heroEnd) $$('.nav-link').forEach(l => l.classList.remove('active'));
}
addEventListener('scroll', onScroll, { passive: true });
onScroll();

toTop.addEventListener('click', () => scrollTo({ top: 0, behavior: prefersReduced ? 'auto' : 'smooth' }));

/* ---------- 2. Mobile menu ---------- */
const navToggle = $('#navToggle');
const navLinks = $('#navLinks');

navToggle.addEventListener('click', () => {
  const open = navLinks.classList.toggle('open');
  navToggle.classList.toggle('open', open);
  navToggle.setAttribute('aria-expanded', open);
  document.body.style.overflow = open ? 'hidden' : '';
});
$$('.nav-link, .nav-cta', navLinks).forEach(a =>
  a.addEventListener('click', () => {
    navLinks.classList.remove('open');
    navToggle.classList.remove('open');
    navToggle.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  })
);

/* ---------- 3. Active section highlight ---------- */
const sections = $$('main section[id]');
const linkMap = new Map($$('.nav-link').map(a => [a.getAttribute('href').slice(1), a]));

const sectionSpy = new IntersectionObserver(entries => {
  entries.forEach(e => {
    const link = linkMap.get(e.target.id);
    if (!link) return;
    if (e.isIntersecting) {
      $$('.nav-link').forEach(l => l.classList.remove('active'));
      link.classList.add('active');
    }
  });
}, { rootMargin: '-40% 0px -55% 0px' });
sections.forEach(s => sectionSpy.observe(s));

/* ---------- 4. Typing effect ---------- */
const roles = [
  'aspiring software developer',
  'full-stack MERN developer',
  'java & c# engineer',
  'distinction IT graduate',
  'problem solver'
];
const typedEl = $('#typed');

let ri = 0, ci = 0, deleting = false;
(function tick() {
  const word = roles[ri];
  typedEl.textContent = word.slice(0, ci);
  let delay = deleting ? 35 : 75;

  if (!deleting && ci === word.length)      { delay = 1900; deleting = true; }
  else if (deleting && ci === 0)            { deleting = false; ri = (ri + 1) % roles.length; delay = 400; }
  else                                       ci += deleting ? -1 : 1;

  setTimeout(tick, delay);
})();

/* ---------- 5. Reveal on scroll — directional + staggered ---------- */
// stagger siblings that reveal together (delay cleared after anim so hovers stay snappy)
$$('.reveal').forEach(el => {
  const sibs = [...el.parentElement.children].filter(c => c.classList.contains('reveal'));
  el.style.transitionDelay = Math.min(sibs.indexOf(el), 6) * 70 + 'ms';
  el.addEventListener('transitionend', () => { el.style.transitionDelay = '0ms'; }, { once: true });
});
const revealObs = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.classList.add('visible');
      revealObs.unobserve(e.target);
    }
  });
}, { threshold: .12, rootMargin: '0px 0px -40px 0px' });
$$('.reveal').forEach(el => revealObs.observe(el));

/* ---------- 6. Animated counters + skill bars ---------- */
const counterObs = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (!e.isIntersecting) return;
    counterObs.unobserve(e.target);

    if (e.target.dataset.count) {
      const target = +e.target.dataset.count;
      const dur = 1200, t0 = performance.now();
      (function step(t) {
        const p = Math.min((t - t0) / dur, 1);
        e.target.textContent = Math.round(target * (1 - Math.pow(1 - p, 3)));
        if (p < 1) requestAnimationFrame(step);
      })(t0);
    }
    if (e.target.classList.contains('bar')) {
      $('.bar-fill', e.target).style.width = e.target.dataset.level + '%';
    }
  });
}, { threshold: .5 });
$$('[data-count]').forEach(el => counterObs.observe(el));
$$('.bar').forEach(el => counterObs.observe(el));

/* ---------- 7. Cursor glow (desktop) ---------- */
const glow = $('#cursorGlow');
if (matchMedia('(pointer: fine)').matches && !prefersReduced) {
  let gx = innerWidth / 2, gy = innerHeight / 2, tx = gx, ty = gy;
  addEventListener('mousemove', e => { tx = e.clientX; ty = e.clientY; }, { passive: true });
  (function follow() {
    gx += (tx - gx) * .08;
    gy += (ty - gy) * .08;
    glow.style.left = gx + 'px';
    glow.style.top = gy + 'px';
    requestAnimationFrame(follow);
  })();
} else {
  glow.style.display = 'none';
}

/* ---------- 8. Subtle 3D tilt ---------- */
if (matchMedia('(pointer: fine)').matches && !prefersReduced) {
  $$('[data-tilt]').forEach(el => {
    el.addEventListener('mousemove', e => {
      const r = el.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - .5;
      const y = (e.clientY - r.top) / r.height - .5;
      el.style.transform = `perspective(900px) rotateY(${x * 7}deg) rotateX(${-y * 7}deg)`;
    });
    el.addEventListener('mouseleave', () => { el.style.transform = ''; });
  });
}

/* ---------- 9. Certificate modal (view-only) ---------- */
const modal = $('#certModal');
const certBody = $('#certBody');
const certTitle = $('#certTitle');
let lastFocus = null;

function openCert(src, title) {
  lastFocus = document.activeElement;
  certTitle.textContent = title;
  certBody.innerHTML = '';

  if (/\.(png|jpe?g|webp)$/i.test(src)) {
    const img = document.createElement('img');
    img.src = src;
    img.alt = title;
    img.draggable = false;
    certBody.appendChild(img);
  } else {
    const frame = document.createElement('iframe');
    // #toolbar=0 hides the built-in download/print controls in Chromium viewers
    frame.src = src + '#toolbar=0&navpanes=0&scrollbar=1';
    frame.title = title;
    certBody.appendChild(frame);
  }
  modal.hidden = false;
  document.body.style.overflow = 'hidden';
  $('.cert-close', modal).focus();
}
function closeCert() {
  modal.hidden = true;
  certBody.innerHTML = '';
  document.body.style.overflow = '';
  if (lastFocus) lastFocus.focus();
}

$$('.cert-card[data-cert]').forEach(btn =>
  btn.addEventListener('click', () => openCert(btn.dataset.cert, btn.dataset.title))
);
$$('[data-close]', modal).forEach(el => el.addEventListener('click', closeCert));
addEventListener('keydown', e => { if (e.key === 'Escape' && !modal.hidden) closeCert(); });

// certificates are view-only: discourage saving/printing inside the viewer
certBody.addEventListener('contextmenu', e => e.preventDefault());
addEventListener('keydown', e => {
  if (!modal.hidden && (e.ctrlKey || e.metaKey) && ['s', 'p'].includes(e.key.toLowerCase())) {
    e.preventDefault();
  }
});

/* ---------- 10. Live GitHub stats + extra repos ---------- */
(async () => {
  const CURATED = new Set([
    'MERN-Stack_Task-Manager', 'Easy-Kanban-Boards', 'socketio-chat',
    'Phambili_Ma-AfricaWeb', 'Student-Management-System',
    'COVID-19-Global-Data-Tracker-Project', 'Sainttyga'
  ]);
  const pretty = s => s.replace(/[-_]/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
  try {
    const res = await fetch('https://api.github.com/users/Sainttyga');
    if (!res.ok) throw 0;
    const u = await res.json();
    $('#ghRepos').textContent = u.public_repos;
    $('#ghFollowers').textContent = u.followers;
  } catch {
    // GitHub API rate-limits unauthenticated calls — show last known values
    $('#ghRepos').textContent = '15';
    $('#ghFollowers').textContent = '3';
  }
  try {
    const res = await fetch('https://api.github.com/users/Sainttyga/repos?per_page=100&sort=updated');
    if (!res.ok) throw 0;
    const repos = (await res.json()).filter(r => !CURATED.has(r.name) && !r.fork).slice(0, 8);
    $('#ghMore').innerHTML = repos.map(r => `
      <a class="gh-repo" href="${r.html_url}" target="_blank" rel="noopener">
        <span class="gr-name">${pretty(r.name)}<span>↗</span></span>
        <span class="gr-desc">${r.description || 'Public repository'}</span>
        <span class="gr-lang">${r.language || '—'}</span>
      </a>`).join('');
  } catch { /* extra repos are optional — fail silently */ }
})();

/* ---------- 11. Contact form → Web3Forms (falls back to mailto) ---------- */
// 1) Go to https://web3forms.com — enter londonleendouh111@gmail.com — copy the access key
// 2) Paste it below. Until then the form falls back to opening the visitor's mail app.
const WEB3FORMS_KEY = '3c6a2c54-1406-4be4-8c89-a411c47f5c08';

$('#contactForm').addEventListener('submit', async e => {
  e.preventDefault();
  const status = $('#formStatus');
  const btn = $('#cfSubmit');
  const name = $('#cfName').value.trim();
  const email = $('#cfEmail').value.trim();
  const subject = $('#cfSubject').value;
  const msg = $('#cfMsg').value.trim();
  status.className = 'mono form-note';

  // honeypot filled → silently ignore (bot)
  if ($('input[name="botcheck"]', e.target).checked) return;

  if (WEB3FORMS_KEY === 'PASTE_YOUR_ACCESS_KEY_HERE') {
    const body = encodeURIComponent(`Hi Lindokuhle,\n\n${msg}\n\n— ${name}\n${email}`);
    location.href = `mailto:londonleendouh111@gmail.com?subject=${encodeURIComponent('[Portfolio] ' + subject + ' — ' + name)}&body=${body}`;
    status.textContent = '// opened your mail client';
    return;
  }

  btn.disabled = true;
  btn.innerHTML = 'Sending…';
  status.textContent = '// sending…';
  try {
    const res = await fetch('https://api.web3forms.com/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify({
        access_key: WEB3FORMS_KEY,
        name, email,
        subject: `[Portfolio] ${subject} — ${name}`,
        message: msg
      })
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.message || 'failed');
    e.target.reset();
    status.textContent = '// message sent — I\'ll get back to you soon!';
    status.classList.add('ok');
  } catch {
    status.textContent = '// something went wrong — email me directly at londonleendouh111@gmail.com';
    status.classList.add('err');
  } finally {
    btn.disabled = false;
    btn.innerHTML = 'Send Message <span class="arrow">→</span>';
  }
});

/* ---------- 10.5 Preloader, copy email, view CV ---------- */
addEventListener('load', () => {
  setTimeout(() => $('#preloader').classList.add('done'), 700);
});
// safety: never trap the user on the preloader
setTimeout(() => $('#preloader').classList.add('done'), 4000);

$('#copyEmail').addEventListener('click', async () => {
  const btn = $('#copyEmail');
  try {
    await navigator.clipboard.writeText('londonleendouh111@gmail.com');
    btn.textContent = 'copied!';
    btn.classList.add('copied');
  } catch {
    btn.textContent = 'failed';
  }
  setTimeout(() => { btn.textContent = 'copy'; btn.classList.remove('copied'); }, 2000);
});

const openCv = e => {
  e?.preventDefault();
  openCert('assets/docs/Lindokuhle_Zwane_CV.pdf', 'CV — Lindokuhle Zwane');
};
$('#viewCv').addEventListener('click', openCv);
$('#navViewCv').addEventListener('click', openCv);

/* ---------- 11.5 Icon marquee ---------- */
(() => {
  const items = [
    ['java', 'JAVA'], ['csharp', 'C#'], ['javascript', 'JAVASCRIPT'],
    ['react', 'REACT'], ['nodedotjs', 'NODE.JS'], ['mongodb', 'MONGODB'],
    ['mysql', 'MYSQL'], ['oracle', 'ORACLE DB'], ['php', 'PHP'], ['git', 'GIT'], ['openapiinitiative', 'REST APIs']
  ];
  const half = items.map(([slug, name]) =>
    `<span class="mq"><i class="ic ic-${slug}"></i>${name}</span><span class="mq-sep">✦</span>`
  ).join('');
  $('#marqueeTrack').innerHTML = half + half; // duplicated for a seamless loop
})();

/* ---------- 12. Footer year + console easter egg ---------- */
$('#year').textContent = new Date().getFullYear();
console.log(
  '%cconst developer = { hireable: true }; %c// github.com/Sainttyga',
  'color:#01B36C;font-family:monospace;font-size:14px;',
  'color:#FEB192;font-family:monospace;'
);
