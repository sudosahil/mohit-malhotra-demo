/* Mohit Malhotra Photography — motion layer (GSAP + ScrollTrigger + Lenis) */
(function () {
  "use strict";
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const page = document.body.dataset.page;

  /* ---------- page transition (works without GSAP) ---------- */
  const wipe = $(".wipe");
  if (reduced) wipe.style.display = "none";
  if (!reduced) {
    if (page !== "home") {
      // arriving on a page: the ink panel (present in the markup) lifts away
      requestAnimationFrame(() => requestAnimationFrame(() => {
        wipe.classList.remove("cover"); wipe.classList.add("out");
        setTimeout(() => { wipe.style.display = "none"; wipe.classList.remove("out"); }, 600);
      }));
    }
    document.addEventListener("click", (e) => {
      const a = e.target.closest("a[href]");
      if (!a || a.target || e.metaKey || e.ctrlKey || e.shiftKey || e.button) return;
      const u = new URL(a.href, location.href);
      if (u.origin !== location.origin || (u.pathname === location.pathname && u.search === location.search)) return;
      e.preventDefault();
      wipe.style.display = ""; void wipe.offsetWidth; wipe.classList.add("in");
      setTimeout(() => { location.href = u.href; }, 300);
    });
    addEventListener("pageshow", (e) => { if (e.persisted) { wipe.classList.remove("in"); wipe.style.display = "none"; } });
  }

  if (!window.gsap || !window.ScrollTrigger || reduced) {
    // no motion: make sure nothing stays hidden
    return;
  }
  gsap.registerPlugin(ScrollTrigger);
  ScrollTrigger.config({ ignoreMobileResize: true });

  /* ---------- smooth scroll ---------- */
  let lenis = null;
  if (window.Lenis) {
    lenis = new Lenis({ lerp: 0.09, wheelMultiplier: 0.95 });
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add((t) => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
    document.addEventListener("scroll:lock", () => lenis.stop());
    document.addEventListener("scroll:unlock", () => lenis.start());
  }

  /* ---------- helpers ---------- */
  const revealImage = (frame, { scale = true } = {}) => {
    if (!frame || frame.dataset.revealed) return;
    frame.dataset.revealed = "1";
    const im = $("img", frame);
    gsap.set(frame, { clipPath: "inset(0 0 100% 0)" });
    const tl = gsap.timeline({
      scrollTrigger: { trigger: frame, start: "top 90%", once: true },
      onComplete: () => { gsap.set(frame, { clearProps: "clipPath" }); if (im && scale) gsap.set(im, { clearProps: "transform" }); }
    });
    tl.to(frame, { clipPath: "inset(0 0 0% 0)", duration: 1.25, ease: "power3.inOut" });
    if (im && scale) tl.fromTo(im, { scale: 1.2 }, { scale: 1, duration: 1.6, ease: "power3.out" }, 0);
  };

  const splitWords = (el) => {
    const words = el.textContent.trim().split(/\s+/);
    el.setAttribute("aria-label", el.textContent.trim());
    el.innerHTML = words.map((w) => `<span class="w" aria-hidden="true">${w}</span>`).join(" ");
    return $$(".w", el);
  };

  const titleWipe = () => {
    const t = $(".page-title");
    if (!t || page === "story") return;
    gsap.fromTo(t, { clipPath: "inset(-12% 100% -12% 0)" }, { clipPath: "inset(-12% -2% -12% -2%)", duration: 1.3, ease: "power3.inOut", delay: 0.55, clearProps: "clipPath" });
  };

  /* ---------- per page ---------- */
  const setup = () => {
    titleWipe();

    if (page === "home") {
      // hero drifts and the headline lifts away as you leave it
      gsap.to(".hero-slides", { yPercent: 14, ease: "none", scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: true } });
      gsap.to(".hero-copy", { yPercent: -30, opacity: 0, ease: "none", scrollTrigger: { trigger: ".hero", start: "top top", end: "70% top", scrub: true } });

      // statement lights up word by word
      const st = $("#intro-statement");
      if (st) gsap.fromTo(splitWords(st), { opacity: 0.14 }, { opacity: 1, stagger: 0.1, ease: "none", scrollTrigger: { trigger: st, start: "top 82%", end: "bottom 45%", scrub: true } });

      const mm = gsap.matchMedia();
      // the pinned scenes run on desktop and on phones alike; only very short (landscape) screens get the stacked layouts from the CSS
      mm.add("(min-height: 560px)", () => {
        // pinned horizontal reel with parallax inside each frame
        const section = $(".reel"), track = $("#reel");
        const dist = () => track.scrollWidth - innerWidth + 8;
        const tween = gsap.to(track, { x: () => -dist(), ease: "none", scrollTrigger: { trigger: section, pin: true, scrub: 0.8, start: "top top", end: () => "+=" + dist(), invalidateOnRefresh: true, anticipatePin: 1 } });
        $$(".reel-item").forEach((item) => {
          gsap.fromTo($("img", item), { x: "-9%" }, { x: "0%", ease: "none", scrollTrigger: { trigger: item, containerAnimation: tween, start: "left 100%", end: "right 0%", scrub: true } });
        });

        // "What I photograph": zoom out into the section with a photograph big behind it,
        // then scroll steps through each service, swapping the photograph. After the last one the page carries on.
        const focus = $(".focus");
        if (focus) {
          const bg = $(".focus-bg", focus), photos = $$("img", bg), items = $$(".focus-item", focus), n = items.length;
          gsap.fromTo(bg, { scale: 1.45, clipPath: "inset(16% 9% 16% 9%)" }, { scale: 1, clipPath: "inset(0% 0% 0% 0%)", ease: "none", scrollTrigger: { trigger: focus, start: "top bottom", end: "top top", scrub: true } });
          gsap.fromTo($(".focus-body", focus), { opacity: 0 }, { opacity: 1, ease: "none", scrollTrigger: { trigger: focus, start: "top 40%", end: "top top", scrub: true } });
          let cur = 0;
          const show = (i) => {
            items.forEach((it, j) => it.classList.toggle("on", j === i));
            photos.forEach((p, j) => {
              if (j === i) gsap.fromTo(p, { opacity: 0, scale: 1.14 }, { opacity: 1, scale: 1, duration: 1.6, ease: "power2.out", overwrite: true });
              else gsap.to(p, { opacity: 0, duration: 1.2, delay: 0.1, ease: "power2.out", overwrite: true });
            });
          };
          ScrollTrigger.create({
            trigger: focus, start: "top top", end: () => "+=" + Math.round(innerHeight * 0.75 * n), pin: true, anticipatePin: 1, invalidateOnRefresh: true,
            onUpdate: (self) => { const i = Math.min(n - 1, Math.floor(self.progress * n)); if (i !== cur) { cur = i; show(i); } }
          });
        }
      });

      $$(".spread .tile .frame").forEach((f) => revealImage(f));

      // process line draws as you read down it (the line is hidden on narrow screens, so the steps stay fully visible there)
      mm.add("(min-width: 861px)", () => {
        gsap.to(".process-line i", { scaleX: 1, ease: "none", scrollTrigger: { trigger: ".process", start: "top 72%", end: "bottom 72%", scrub: true } });
      });
      $$(".step").forEach((s) => gsap.fromTo(s, { opacity: 0.22 }, { opacity: 1, ease: "none", scrollTrigger: { trigger: s, start: "top 88%", end: "top 62%", scrub: true } }));

      // the filmstrip only runs while it is on screen
      const strip = $(".strip-track");
      if (strip) new IntersectionObserver(([e]) => strip.classList.toggle("is-off", !e.isIntersecting)).observe(strip);
      // closing statement
      gsap.from(".closer .statement", { clipPath: "inset(0 100% 0 0)", duration: 1.4, ease: "power3.inOut", scrollTrigger: { trigger: ".closer", start: "top 70%", once: true }, clearProps: "clipPath" });
    }

    if (page === "portfolio") $$(".wall .tile .frame").forEach((f) => revealImage(f));

    if (page === "story") {
      const wrap = $("#story-cover-btn"), cover = $("#story-cover");
      if (wrap && cover) {
        revealImage(wrap, { scale: false });
        gsap.fromTo(cover, { scale: 1.12 }, { scale: 1, ease: "none", scrollTrigger: { trigger: wrap, start: "top 90%", end: "bottom 30%", scrub: true } });
      }
    }
    if (page === "about") $$(".about-figure").forEach((f) => revealImage(f));
  };

  const galleryReveal = () => $$("#gallery figure").forEach((f) => revealImage(f, { scale: true }));

  const boot = () => { setup(); galleryReveal(); ScrollTrigger.refresh(); };
  if (document.readyState === "complete") boot(); else addEventListener("load", boot);
  document.addEventListener("content-ready", () => { galleryReveal(); ScrollTrigger.refresh(); });
  document.addEventListener("filter:change", () => requestAnimationFrame(() => ScrollTrigger.refresh()));
})();
