/* =========================================================
   Cortex AI — interakciók
   ========================================================= */
(() => {
  "use strict";

  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  const lerp = (a, b, t) => a + (b - a) * t;

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  const isMobile = () => window.innerWidth <= 760;

  document.body.classList.add("is-loading");
  $$("[data-year]").forEach((el) => (el.textContent = new Date().getFullYear()));

  /* ---------- Szöveg darabolása betűkre ---------- */
  function splitChars(root) {
    $$(".line", root).forEach((line, li) => {
      const target = $(".split", line);
      if (!target) return;
      let ci = 0;
      const walk = (node) => {
        [...node.childNodes].forEach((child) => {
          if (child.nodeType === Node.TEXT_NODE) {
            const frag = document.createDocumentFragment();
            child.textContent.split(/(\s+)/).forEach((part) => {
              if (!part) return;
              if (/^\s+$/.test(part)) { frag.append(document.createTextNode(" ")); return; }
              const word = document.createElement("span");
              word.className = "word";
              [...part].forEach((ch) => {
                const c = document.createElement("span");
                c.className = "char";
                c.textContent = ch;
                c.style.setProperty("--ci", ci++);
                c.style.setProperty("--li", li);
                word.append(c);
              });
              frag.append(word);
            });
            child.replaceWith(frag);
          } else if (child.nodeType === Node.ELEMENT_NODE) {
            walk(child);
          }
        });
      };
      walk(target);
    });
  }
  splitChars($(".hero__title"));
  splitChars($(".contact__title"));

  /* ---------- Manifesto szavak ---------- */
  const manifesto = $("[data-words]");
  const accent = ["kreativitás", "termékekké", "játékossággal."];
  let words = [];
  if (manifesto) {
    const text = manifesto.textContent.trim().split(/\s+/);
    manifesto.innerHTML = text
      .map((w) => `<span class="w${accent.includes(w.replace(/[,—]/g, "")) || accent.includes(w) ? " is-accent" : ""}">${w}</span>`)
      .join(" ");
    words = $$(".w", manifesto);
  }

  /* ---------- Loader ---------- */
  const loader = $(".loader");
  const loaderCount = $("[data-loader-count]");
  const loaderBar = $(".loader__bar i");
  const hero = $(".hero");
  let pageLoaded = false;
  window.addEventListener("load", () => (pageLoaded = true));

  function runLoader() {
    if (reduceMotion) return finishLoader();
    const start = performance.now();
    const minDur = 1100, maxDur = 3500;
    const tick = (now) => {
      const t = now - start;
      let p = clamp(t / minDur);
      if (!pageLoaded && t < maxDur) p = Math.min(p, 0.9);
      const eased = 1 - Math.pow(1 - p, 3);
      loaderCount.textContent = Math.round(eased * 100);
      loaderBar.style.setProperty("--p", eased);
      if (p < 1) requestAnimationFrame(tick);
      else setTimeout(finishLoader, 150);
    };
    requestAnimationFrame(tick);
  }
  function finishLoader() {
    loader.classList.add("is-done");
    document.body.classList.remove("is-loading");
    setTimeout(() => {
      hero.classList.add("is-in");
      $$(".hero__title .char").forEach((c) => c.classList.add("is-in"));
    }, reduceMotion ? 0 : 350);
  }
  runLoader();

  /* ---------- Reveal görgetésre ---------- */
  const revealIO = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        e.target.classList.add("is-in");
        if (e.target.classList.contains("contact__title")) {
          $$(".char", e.target).forEach((c) => c.classList.add("is-in"));
        }
        revealIO.unobserve(e.target);
      });
    },
    { threshold: 0.15, rootMargin: "0px 0px -8% 0px" }
  );
  $$("[data-reveal], .contact__title").forEach((el) => revealIO.observe(el));

  /* ---------- Számlálók ---------- */
  const countIO = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        const el = e.target;
        const to = +el.dataset.count;
        const dur = reduceMotion ? 1 : 1800;
        const t0 = performance.now();
        const step = (now) => {
          const p = clamp((now - t0) / dur);
          el.textContent = Math.round(to * (1 - Math.pow(1 - p, 4)));
          if (p < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
        countIO.unobserve(el);
      });
    },
    { threshold: 0.6 }
  );
  $$("[data-count]").forEach((el) => countIO.observe(el));

  /* ---------- Navigáció ---------- */
  const nav = $(".nav");
  const burger = $(".nav__burger");
  const mobileMenu = $("#mobile-menu");
  const setMenu = (open) => {
    document.documentElement.classList.toggle("menu-open", open);
    burger.setAttribute("aria-expanded", open);
    burger.setAttribute("aria-label", open ? "Menü bezárása" : "Menü megnyitása");
    mobileMenu.setAttribute("aria-hidden", !open);
  };
  burger.addEventListener("click", () => setMenu(!document.documentElement.classList.contains("menu-open")));
  $$("a", mobileMenu).forEach((a) => a.addEventListener("click", () => setMenu(false)));
  window.addEventListener("keydown", (e) => e.key === "Escape" && setMenu(false));

  // Sima görgetés horgonyokhoz
  if (!reduceMotion) document.documentElement.classList.add("smooth");

  // Aktív menüpont
  const navLinks = $$(".nav__links a");
  const sectionIO = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        navLinks.forEach((a) => a.classList.toggle("is-active", a.getAttribute("href") === "#" + e.target.id));
      });
    },
    { rootMargin: "-45% 0px -50% 0px" }
  );
  navLinks.forEach((a) => {
    const s = $(a.getAttribute("href"));
    if (s) sectionIO.observe(s);
  });

  /* ---------- Görgetés-vezérelt animációk ---------- */
  const progressBar = $(".progress i");
  const parallaxEls = $$("[data-speed]");
  const services = $(".services");
  const servicesSticky = $(".services__sticky");
  const servicesTrack = $(".services__track");
  const servicesBar = $(".services__bar");
  const steps = $(".steps");
  const stepItems = $$(".step");
  const marqueeTrack = $(".marquee__track");

  let scrollY = window.scrollY;
  let lastScrollY = scrollY;
  let velocity = 0;
  let hDistance = 0;

  // Marquee: tartalom duplikálása a végtelen futáshoz
  if (marqueeTrack) marqueeTrack.innerHTML += marqueeTrack.innerHTML;
  let marqueeX = 0;
  let marqueeDir = 1;

  function layoutServices() {
    if (!services) return;
    if (isMobile() || reduceMotion) {
      services.style.height = "";
      servicesTrack.style.transform = "";
      hDistance = 0;
      return;
    }
    hDistance = Math.max(0, servicesTrack.scrollWidth - window.innerWidth);
    services.style.height = servicesSticky.offsetHeight + hDistance + "px";
  }

  function onScrollFrame() {
    const vh = window.innerHeight;
    const docH = document.documentElement.scrollHeight - vh;

    // Folyamatjelző
    progressBar.style.transform = `scaleX(${docH > 0 ? scrollY / docH : 0})`;

    // Nav elrejtése lefelé görgetéskor
    nav.classList.toggle("is-scrolled", scrollY > 40);
    if (!document.documentElement.classList.contains("menu-open")) {
      const delta = scrollY - lastScrollY;
      if (scrollY > 400 && delta > 4) nav.classList.add("is-hidden");
      else if (delta < -4 || scrollY < 400) nav.classList.remove("is-hidden");
    }

    if (reduceMotion) return;

    // Parallax
    parallaxEls.forEach((el) => {
      const r = el.parentElement.getBoundingClientRect();
      if (r.bottom < -200 || r.top > vh + 200) return;
      const center = r.top + r.height / 2 - vh / 2;
      el.style.transform = `translate3d(0, ${(-center * +el.dataset.speed).toFixed(1)}px, 0)`;
    });

    // Vízszintes szolgáltatás sáv
    if (hDistance > 0) {
      const r = services.getBoundingClientRect();
      const total = services.offsetHeight - servicesSticky.offsetHeight;
      const p = clamp(-r.top / total);
      servicesTrack.style.transform = `translate3d(${-p * hDistance}px, 0, 0)`;
      servicesBar.style.setProperty("--p", p);
      servicesBar.querySelector("i").style.setProperty("--p", p);
    }

    // Manifesto szavak felvillanása
    if (words.length) {
      const r = manifesto.getBoundingClientRect();
      const p = clamp((vh * 0.85 - r.top) / (r.height + vh * 0.35));
      const lit = Math.floor(p * words.length * 1.05);
      words.forEach((w, i) => w.classList.toggle("is-lit", i < lit));
    }

    // Folyamat idővonal
    if (steps) {
      const r = steps.getBoundingClientRect();
      const p = clamp((vh * 0.6 - r.top) / r.height);
      steps.style.setProperty("--p", p.toFixed(3));
      stepItems.forEach((s) => {
        const sr = s.getBoundingClientRect();
        s.classList.toggle("is-active", sr.top < vh * 0.6);
      });
    }
  }

  window.addEventListener("scroll", () => (scrollY = window.scrollY), { passive: true });

  function loop() {
    velocity = lerp(velocity, scrollY - lastScrollY, 0.2);
    if (Math.abs(scrollY - lastScrollY) > 0.5) marqueeDir = scrollY > lastScrollY ? 1 : -1;
    onScrollFrame();
    lastScrollY = scrollY;

    // Marquee — a görgetés sebessége gyorsítja
    if (marqueeTrack && !reduceMotion) {
      const half = marqueeTrack.scrollWidth / 2;
      marqueeX -= (0.6 + Math.min(Math.abs(velocity) * 0.35, 14)) * marqueeDir;
      if (marqueeX <= -half) marqueeX += half;
      if (marqueeX > 0) marqueeX -= half;
      marqueeTrack.style.transform = `translate3d(${marqueeX}px,0,0) skewX(${clamp(-velocity * 0.3, -10, 10)}deg)`;
    }
    requestAnimationFrame(loop);
  }

  window.addEventListener("resize", () => {
    layoutServices();
    resizeHero();
  });
  window.addEventListener("load", layoutServices);
  if (document.fonts) document.fonts.ready.then(layoutServices);
  layoutServices();
  requestAnimationFrame(loop);

  /* ---------- Hero neurális háló (canvas) ---------- */
  const heroCanvas = $(".hero__canvas");
  const hctx = heroCanvas.getContext("2d");
  let hw = 0, hh = 0, dpr = 1, particles = [];
  let heroVisible = true;
  const mouse = { x: -9999, y: -9999, active: false };
  const COLORS = ["198,255,61", "124,92,255", "92,200,255", "255,92,168"];

  function resizeHero() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    hw = heroCanvas.clientWidth;
    hh = heroCanvas.clientHeight;
    heroCanvas.width = hw * dpr;
    heroCanvas.height = hh * dpr;
    hctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const count = Math.round(clamp((hw * hh) / 15000, 30, 110));
    particles = Array.from({ length: count }, () => ({
      x: Math.random() * hw,
      y: Math.random() * hh,
      vx: (Math.random() - 0.5) * 0.35,
      vy: (Math.random() - 0.5) * 0.35,
      r: Math.random() * 1.8 + 0.8,
      c: COLORS[(Math.random() * COLORS.length) | 0],
    }));
    if (reduceMotion) drawHero();
  }

  function drawHero() {
    hctx.clearRect(0, 0, hw, hh);
    const maxD = Math.min(150, hw / 7);
    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];
      if (!reduceMotion) {
        // egér taszítás
        const dx = p.x - mouse.x, dy = p.y - mouse.y;
        const d2 = dx * dx + dy * dy;
        if (mouse.active && d2 < 160 * 160) {
          const f = (1 - Math.sqrt(d2) / 160) * 0.6;
          p.vx += (dx / (Math.sqrt(d2) + 0.1)) * f;
          p.vy += (dy / (Math.sqrt(d2) + 0.1)) * f;
        }
        p.vx *= 0.96; p.vy *= 0.96;
        p.vx += (Math.random() - 0.5) * 0.03;
        p.vy += (Math.random() - 0.5) * 0.03;
        p.x += p.vx + Math.sign(p.vx) * 0.15;
        p.y += p.vy + Math.sign(p.vy) * 0.15;
        if (p.x < -20) p.x = hw + 20; else if (p.x > hw + 20) p.x = -20;
        if (p.y < -20) p.y = hh + 20; else if (p.y > hh + 20) p.y = -20;
      }
      for (let j = i + 1; j < particles.length; j++) {
        const q = particles[j];
        const dx = p.x - q.x, dy = p.y - q.y;
        const d = Math.hypot(dx, dy);
        if (d < maxD) {
          hctx.strokeStyle = `rgba(${p.c},${(1 - d / maxD) * 0.35})`;
          hctx.lineWidth = 1;
          hctx.beginPath();
          hctx.moveTo(p.x, p.y);
          hctx.lineTo(q.x, q.y);
          hctx.stroke();
        }
      }
      if (mouse.active) {
        const d = Math.hypot(p.x - mouse.x, p.y - mouse.y);
        if (d < 220) {
          hctx.strokeStyle = `rgba(198,255,61,${(1 - d / 220) * 0.5})`;
          hctx.beginPath();
          hctx.moveTo(p.x, p.y);
          hctx.lineTo(mouse.x, mouse.y);
          hctx.stroke();
        }
      }
      hctx.fillStyle = `rgba(${p.c},0.9)`;
      hctx.beginPath();
      hctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      hctx.fill();
    }
  }

  function heroLoop() {
    if (heroVisible) drawHero();
    requestAnimationFrame(heroLoop);
  }
  new IntersectionObserver(([e]) => (heroVisible = e.isIntersecting)).observe(hero);
  hero.addEventListener("pointermove", (e) => {
    const r = heroCanvas.getBoundingClientRect();
    mouse.x = e.clientX - r.left;
    mouse.y = e.clientY - r.top;
    mouse.active = true;
  });
  hero.addEventListener("pointerleave", () => (mouse.active = false));
  resizeHero();
  if (!reduceMotion) requestAnimationFrame(heroLoop);

  /* ---------- Egyedi kurzor, mágneses gombok, döntés ---------- */
  if (finePointer && !reduceMotion) {
    document.documentElement.classList.add("has-cursor");
    const cursor = $(".cursor");
    const dot = $(".cursor__dot");
    const ring = $(".cursor__ring");
    let cx = -100, cy = -100, rx = -100, ry = -100;

    window.addEventListener("pointermove", (e) => {
      cx = e.clientX; cy = e.clientY;
      cursor.classList.remove("is-hidden");
    }, { passive: true });
    document.addEventListener("pointerleave", () => cursor.classList.add("is-hidden"));
    document.addEventListener("pointerover", (e) => {
      const hit = e.target.closest("a, button, summary, label, .chip, .card, input, textarea");
      cursor.classList.toggle("is-hover", !!hit);
    });
    (function cursorLoop() {
      rx = lerp(rx, cx, 0.18); ry = lerp(ry, cy, 0.18);
      dot.style.transform = `translate3d(${cx}px,${cy}px,0)`;
      ring.style.transform = `translate3d(${rx}px,${ry}px,0)`;
      requestAnimationFrame(cursorLoop);
    })();

    $$(".magnetic").forEach((el) => {
      el.addEventListener("pointermove", (e) => {
        const r = el.getBoundingClientRect();
        const x = e.clientX - r.left - r.width / 2;
        const y = e.clientY - r.top - r.height / 2;
        el.style.transform = `translate(${x * 0.3}px, ${y * 0.4}px)`;
      });
      el.addEventListener("pointerleave", () => (el.style.transform = ""));
    });

    $$(".tilt").forEach((card) => {
      card.addEventListener("pointermove", (e) => {
        const r = card.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width;
        const py = (e.clientY - r.top) / r.height;
        card.style.setProperty("--mx", px * 100 + "%");
        card.style.setProperty("--my", py * 100 + "%");
        card.style.transform = `perspective(900px) rotateX(${(0.5 - py) * 10}deg) rotateY(${(px - 0.5) * 12}deg) translateY(-6px)`;
      });
      card.addEventListener("pointerleave", () => (card.style.transform = ""));
    });
  }

  /* ---------- GYIK: sima nyitás/zárás ---------- */
  $$("details").forEach((d) => {
    const summary = $("summary", d);
    const body = $("div", d);
    summary.addEventListener("click", (e) => {
      if (reduceMotion) return;
      e.preventDefault();
      if (d.open) {
        const anim = body.animate([{ height: body.offsetHeight + "px", opacity: 1 }, { height: "0px", opacity: 0 }], { duration: 380, easing: "cubic-bezier(.65,0,.35,1)" });
        d.classList.add("is-closing");
        anim.onfinish = () => { d.open = false; d.classList.remove("is-closing"); };
      } else {
        // a többit bezárjuk
        $$("details[open]").forEach((o) => o !== d && (o.open = false));
        d.open = true;
        const h = body.offsetHeight;
        body.animate([{ height: "0px", opacity: 0 }, { height: h + "px", opacity: 1 }], { duration: 480, easing: "cubic-bezier(.22,1,.36,1)" });
      }
    });
  });

  /* ---------- Élő demó: generatív kép ---------- */
  const demoCanvas = $(".demo__canvas");
  const dctx = demoCanvas.getContext("2d");
  const demoWindow = $(".demo__window");
  const statusEl = $("[data-demo-status]");
  const captionEl = $("[data-demo-caption]");
  const off = document.createElement("canvas");
  off.width = off.height = 800;
  const octx = off.getContext("2d");

  const hash = (str) => {
    let h = 2166136261;
    for (let i = 0; i < str.length; i++) h = Math.imul(h ^ str.charCodeAt(i), 16777619);
    return h >>> 0;
  };
  const rng = (seed) => () => {
    seed |= 0; seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };

  const PALETTES = [
    { k: ["neon", "város", "cyber", "éj"], c: ["#0a0420", "#ff2fa0", "#38e1ff", "#7c5cff", "#ffe45c"] },
    { k: ["óceán", "tenger", "víz", "naplemente", "pasztell"], c: ["#1b2a5a", "#ff9a8b", "#ffd3a5", "#5cc8ff", "#a28bff"] },
    { k: ["kozm", "csillag", "űr", "lila", "köd"], c: ["#07041a", "#7c5cff", "#ff5ca8", "#3a1c71", "#5cc8ff"] },
    { k: ["erdő", "zöld", "fa", "termész"], c: ["#06170f", "#3dffb4", "#c6ff3d", "#1f6f4a", "#fff2b0"] },
    { k: ["lime", "absztrakt", "geometr", "sav"], c: ["#0b0b10", "#c6ff3d", "#f2f0ff", "#7c5cff", "#3dffb4"] },
    { k: ["tűz", "láva", "nap", "narancs"], c: ["#1a0500", "#ff5a1f", "#ffd35c", "#ff2f6d", "#7a1cff"] },
  ];

  function pickPalette(prompt, rand) {
    const p = prompt.toLowerCase();
    const found = PALETTES.find((pal) => pal.k.some((k) => p.includes(k)));
    if (found) return found.c;
    const h = Math.floor(rand() * 360);
    return [
      `hsl(${h},60%,6%)`, `hsl(${h},95%,62%)`, `hsl(${(h + 40) % 360},95%,65%)`,
      `hsl(${(h + 180) % 360},90%,60%)`, `hsl(${(h + 220) % 360},85%,70%)`,
    ];
  }

  function paint(prompt, seed) {
    const r = rng(seed);
    const pal = pickPalette(prompt, r);
    const S = 800;
    octx.globalCompositeOperation = "source-over";
    const bg = octx.createLinearGradient(0, 0, S, S);
    bg.addColorStop(0, pal[0]);
    bg.addColorStop(1, "#000");
    octx.fillStyle = bg;
    octx.fillRect(0, 0, S, S);

    // Fényfoltok
    octx.globalCompositeOperation = "lighter";
    for (let i = 0; i < 9; i++) {
      const x = r() * S, y = r() * S, rad = 120 + r() * 320;
      const g = octx.createRadialGradient(x, y, 0, x, y, rad);
      const col = pal[1 + ((r() * 4) | 0)];
      g.addColorStop(0, col);
      g.addColorStop(1, "transparent");
      octx.globalAlpha = 0.25 + r() * 0.35;
      octx.fillStyle = g;
      octx.fillRect(0, 0, S, S);
    }

    // Áramlási mező vonalai
    octx.globalCompositeOperation = "screen";
    const f1 = 0.002 + r() * 0.006, f2 = 0.002 + r() * 0.006, twist = 1 + r() * 3;
    for (let i = 0; i < 420; i++) {
      let x = r() * S, y = r() * S;
      octx.strokeStyle = pal[1 + ((r() * 4) | 0)];
      octx.globalAlpha = 0.08 + r() * 0.25;
      octx.lineWidth = 0.6 + r() * 1.8;
      octx.beginPath();
      octx.moveTo(x, y);
      for (let s = 0; s < 60; s++) {
        const a = (Math.sin(x * f1) + Math.cos(y * f2)) * twist;
        x += Math.cos(a) * 4;
        y += Math.sin(a) * 4;
        octx.lineTo(x, y);
      }
      octx.stroke();
    }

    // Geometria
    octx.globalCompositeOperation = "source-over";
    const cx = S * (0.3 + r() * 0.4), cy = S * (0.3 + r() * 0.4);
    for (let i = 0; i < 5; i++) {
      octx.globalAlpha = 0.25 - i * 0.04;
      octx.strokeStyle = "#ffffff";
      octx.lineWidth = 1.2;
      octx.beginPath();
      octx.arc(cx, cy, 60 + i * 38 + r() * 10, 0, Math.PI * 2);
      octx.stroke();
    }
    octx.globalAlpha = 0.9;
    const sun = octx.createRadialGradient(cx, cy, 0, cx, cy, 60);
    sun.addColorStop(0, "#ffffff");
    sun.addColorStop(0.4, pal[2]);
    sun.addColorStop(1, "transparent");
    octx.fillStyle = sun;
    octx.beginPath();
    octx.arc(cx, cy, 60, 0, Math.PI * 2);
    octx.fill();

    // Szemcse
    octx.globalAlpha = 1;
    const img = octx.getImageData(0, 0, S, S);
    const d = img.data;
    for (let i = 0; i < d.length; i += 4) {
      const n = (r() - 0.5) * 22;
      d[i] += n; d[i + 1] += n; d[i + 2] += n;
    }
    octx.putImageData(img, 0, 0);
  }

  let typingTimer = null;
  function typeCaption(text) {
    clearInterval(typingTimer);
    captionEl.textContent = "";
    let i = 0;
    typingTimer = setInterval(() => {
      captionEl.textContent = text.slice(0, ++i);
      if (i >= text.length) clearInterval(typingTimer);
    }, 18);
  }

  let genToken = 0;
  function generate(prompt) {
    const token = ++genToken;
    const seed = hash(prompt + Date.now());
    const t0 = performance.now();
    paint(prompt, seed);
    demoWindow.classList.add("is-generating");
    statusEl.textContent = "Generálás… 0%";
    typeCaption(`„${prompt}”`);

    const dur = reduceMotion ? 1 : 1700;
    const small = document.createElement("canvas");
    const sctx = small.getContext("2d");
    const step = (now) => {
      if (token !== genToken) return;
      const p = clamp((now - t0) / dur);
      const eased = 1 - Math.pow(1 - p, 2.4);
      // „diffúziós” zajmentesítés: pixeles → éles
      const res = Math.max(6, Math.round(lerp(6, 800, eased * eased)));
      small.width = small.height = res;
      sctx.drawImage(off, 0, 0, res, res);
      dctx.imageSmoothingEnabled = p > 0.85;
      dctx.clearRect(0, 0, 800, 800);
      dctx.filter = `blur(${(1 - eased) * 12}px) saturate(${0.4 + eased * 0.6})`;
      dctx.drawImage(small, 0, 0, 800, 800);
      dctx.filter = "none";
      statusEl.textContent = p < 1 ? `Generálás… ${Math.round(p * 100)}%` : "Kész ✓";
      if (p < 1) requestAnimationFrame(step);
      else {
        dctx.imageSmoothingEnabled = true;
        dctx.drawImage(off, 0, 0);
        demoWindow.classList.remove("is-generating");
        typeCaption(`„${prompt}” · seed ${seed % 100000} · ${((performance.now() - t0) / 1000).toFixed(1)}s`);
      }
    };
    requestAnimationFrame(step);
  }

  const chips = $$(".chip");
  chips.forEach((chip) =>
    chip.addEventListener("click", () => {
      chips.forEach((c) => c.classList.toggle("is-active", c === chip));
      generate(chip.dataset.prompt);
    })
  );
  $(".prompt").addEventListener("submit", (e) => {
    e.preventDefault();
    const input = $("#prompt-input");
    const val = input.value.trim();
    if (!val) { input.focus(); return; }
    chips.forEach((c) => c.classList.remove("is-active"));
    generate(val);
  });

  // Első generálás, amikor a demó láthatóvá válik
  const demoIO = new IntersectionObserver(([e]) => {
    if (!e.isIntersecting) return;
    generate(chips[0].dataset.prompt);
    demoIO.disconnect();
  }, { threshold: 0.3 });
  demoIO.observe(demoWindow);

  /* ---------- Kapcsolati űrlap ---------- */
  const form = $(".form");
  const note = $(".form__note");
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    let ok = true;
    $$(".field", form).forEach((f) => {
      const input = $("input, textarea", f);
      const valid = input.checkValidity() && input.value.trim() !== "";
      f.classList.toggle("is-invalid", !valid);
      if (!valid) ok = false;
    });
    note.classList.toggle("is-error", !ok);
    if (!ok) {
      note.textContent = "Kérlek, töltsd ki a pirossal jelölt mezőket.";
      return;
    }
    const btn = $("button[type=submit] span", form);
    const data = new FormData(form);
    const needs = data.getAll("need").join(", ");
    const done = () => {
      btn.textContent = "Elküldve ✓";
      note.textContent = "Köszönjük! Hamarosan jelentkezünk. 🚀";
      form.reset();
      setTimeout(() => (btn.textContent = "Küldés"), 3000);
    };

    // Ha van beállított űrlapkezelő (pl. Formspree), oda küldjük;
    // különben a látogató levelezőjében nyílik meg az előre kitöltött e-mail.
    const endpoint = form.dataset.endpoint;
    if (!endpoint) {
      const body = `Név: ${data.get("name")}\nE-mail: ${data.get("email")}\nIgény: ${needs || "-"}\n\n${data.get("message")}`;
      window.location.href = `mailto:${form.dataset.mailto}?subject=${encodeURIComponent("Ajánlatkérés – " + data.get("name"))}&body=${encodeURIComponent(body)}`;
      note.textContent = "Megnyitottuk a leveleződ — csak nyomj a Küldésre! ✉️";
      return;
    }
    btn.textContent = "Küldés…";
    fetch(endpoint, { method: "POST", body: data, headers: { Accept: "application/json" } })
      .then((res) => {
        if (!res.ok) throw new Error(res.status);
        done();
      })
      .catch(() => {
        btn.textContent = "Küldés";
        note.classList.add("is-error");
        note.textContent = `Hoppá, valami hiba történt. Írj nekünk közvetlenül: ${form.dataset.mailto}`;
      });
  });
  $$(".field input, .field textarea", form).forEach((i) =>
    i.addEventListener("input", () => i.closest(".field").classList.remove("is-invalid"))
  );
})();
