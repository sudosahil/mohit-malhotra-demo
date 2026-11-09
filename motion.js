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
      gsap.to(".hero-collage", { yPercent: 7, ease: "none", scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: true } });
      gsap.to(".hero-copy", { yPercent: -30, opacity: 0, ease: "none", scrollTrigger: { trigger: ".hero", start: "top top", end: "70% top", scrub: true } });

      // Pin a section (centred on screen when it fits) and play a timeline across the scroll distance.
      const hold = (section, screens, build) => {
        if (!section) return null;
        const tl = gsap.timeline({
          defaults: { ease: "none" },
          scrollTrigger: {
            trigger: section, pin: true, scrub: 0.6, anticipatePin: 1, invalidateOnRefresh: true,
            start: () => (section.offsetHeight < innerHeight - 40 ? "center center" : "top top"),
            end: () => "+=" + Math.round(innerHeight * screens)
          }
        });
        build(tl);
        return tl;
      };

      const mm = gsap.matchMedia();
      // On any screen that is tall enough, each section holds the page while its pieces arrive in order, then lets go.
      // (Very short landscape screens keep the plain, static layouts from the CSS.)
      mm.add("(min-height: 560px)", () => {
        // 1. The statement: held until every word has lit, then the paragraph beside it arrives.
        hold($(".intro"), 1.2, (tl) => {
          const words = splitWords($("#intro-statement"));
          const step = 0.12;
          tl.fromTo(words, { opacity: 0.14 }, { opacity: 1, stagger: step, duration: 0.5 }, 0)
            .fromTo(".intro .side", { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 0.8 }, words.length * step + 0.2);
        });

        // 2. "Frames I keep going back to": the framed layout stays as it is. Scrolling grows a full-screen copy of the
        //    strip out of the first frame; every photograph then runs edge to edge with no gap; after the last one it
        //    shrinks back into the last frame and the page carries on.
        const reelSection = $(".reel"), reelTrack = $("#reel"), full = $(".reel-full"), clip = $(".reel-full-clip"), strip = $(".reel-full-track");
        if (reelSection && full) {
          const frames = $$(".reel-item .reel-img"), slides = $$(".rf-slide", full), N = slides.length;
          let G = null;
          const rel = (el) => { const r = el.getBoundingClientRect(), s = reelSection.getBoundingClientRect(); return { x: r.left - s.left, y: r.top - s.top, w: r.width, h: r.height }; };
          const measure = () => {
            const vw = reelSection.clientWidth, vh = reelSection.clientHeight;
            gsap.set(reelTrack, { x: 0 });
            const first = rel(frames[0]);
            const xEnd = -(reelTrack.scrollWidth - vw + 8);       // where the framed row ends up, once the zoom has covered it
            gsap.set(reelTrack, { x: xEnd });
            const last = rel(frames[N - 1]);
            gsap.set(reelTrack, { x: 0 });
            const radius = parseFloat(getComputedStyle(frames[0]).borderTopLeftRadius) || 0;
            slides.forEach((s) => {
              s.style.width = vw + "px";
              const ratio = parseFloat(s.dataset.ar) / (vw / vh);   // photo shape relative to screen shape
              s.classList.toggle("ambient", ratio < 0.66 || ratio > 1.55);
            });
            const gap = parseFloat(getComputedStyle(strip).columnGap) || 0;
            G = { vw, vh, gap, first, last, xEnd, radius, whole: { x: 0, y: 0, w: vw, h: vh } };
          };
          // place the full-screen copy so that it exactly covers `from` -> `to` rectangles at progress z
          const place = (from, to, z, r0, r1) => {
            const l = (a, b) => a + (b - a) * z;
            const R = { x: l(from.x, to.x), y: l(from.y, to.y), w: l(from.w, to.w), h: l(from.h, to.h) };
            const s = Math.max(R.w / G.vw, R.h / G.vh);
            gsap.set(clip, { x: R.x + R.w / 2 - G.vw / 2, y: R.y + R.h / 2 - G.vh / 2, scale: s });
            const ix = (G.vw - R.w / s) / 2, iy = (G.vh - R.h / s) / 2;
            clip.style.clipPath = `inset(${iy}px ${ix}px ${iy}px ${ix}px round ${l(r0, r1) / s}px)`;
          };
          measure();
          full.classList.add("on");
          const onRefresh = () => measure();
          ScrollTrigger.addEventListener("refreshInit", onRefresh);

          const zoomIn = 0.9, zoomOut = 0.9, across = N - 1, total = zoomIn + across + zoomOut;
          const inState = { z: 0 }, outState = { z: 0 };
          const tl = gsap.timeline({
            defaults: { ease: "none" },
            scrollTrigger: {
              trigger: reelSection, start: "top top", pin: true, scrub: 0.6, anticipatePin: 1, invalidateOnRefresh: true,
              end: () => "+=" + Math.round(innerHeight * 0.85 * total),
              // the header steps aside while the photographs fill the screen
              onUpdate: (self) => document.body.classList.toggle("immersive", self.progress > (zoomIn * 0.6) / total && self.progress < (total - zoomOut * 0.6) / total),
              onLeave: () => document.body.classList.remove("immersive"),
              onLeaveBack: () => document.body.classList.remove("immersive")
            }
          });
          tl.set(clip, { opacity: 0 }, 0)
            .to(clip, { opacity: 1, duration: 0.04 }, 0)
            .to(inState, { z: 1, duration: zoomIn, ease: "power2.inOut", onUpdate: () => place(G.first, G.whole, inState.z, G.radius, 0) }, 0)
            .set(reelTrack, { x: () => G.xEnd }, zoomIn)                // hidden behind the full-screen copy
            .fromTo(strip, { x: 0 }, { x: () => -(N - 1) * (G.vw + G.gap), duration: across }, zoomIn)
            .to(outState, { z: 1, duration: zoomOut, ease: "power2.inOut", onUpdate: () => place(G.whole, G.last, outState.z, 0, G.radius) }, zoomIn + across)
            .to(clip, { opacity: 0, duration: 0.04 }, total - 0.04);

          return () => { ScrollTrigger.removeEventListener("refreshInit", onRefresh); full.classList.remove("on"); document.body.classList.remove("immersive"); };
        }
      });

      // "Recent weddings": the mosaic's frames open one after another as they come into view
      $$(".spread .tile .frame").forEach((f) => revealImage(f));

      mm.add("(min-height: 560px)", () => {
        // 3. The proof row: the three lines arrive one by one.
        hold($('[aria-label="Recognition"]'), 0.9, (tl) => {
          tl.fromTo(".proof p", { opacity: 0.16, y: 20 }, { opacity: 1, y: 0, stagger: 0.55, duration: 0.6 }, 0);
        });

        // 4. "What I photograph": zoom out into the section with a photograph big behind it,
        //    then scroll steps through each service, swapping the photograph. After the last one the page carries on.
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

        // 5. The process: held while the heading arrives, the line draws and each step lights in turn.
        hold($(".process"), 1.6, (tl) => {
          tl.fromTo(".process .statement", { opacity: 0.2, y: 22 }, { opacity: 1, y: 0, duration: 0.6 }, 0)
            .fromTo(".process-line i", { scaleX: 0 }, { scaleX: 1, duration: 2.4 }, 0.5);
          $$(".step").forEach((s, i) => tl.fromTo(s, { opacity: 0.15, y: 26 }, { opacity: 1, y: 0, duration: 0.6 }, 0.6 + i * 0.6));
        });

        // 6. The closing statement: held while it wipes in, then the line beneath it and the link.
        hold($(".closer"), 1.1, (tl) => {
          tl.fromTo(".closer .statement", { opacity: 0.16, y: 26 }, { opacity: 1, y: 0, duration: 0.9 }, 0)
            .fromTo(".closer p", { opacity: 0.16, y: 16 }, { opacity: 1, y: 0, duration: 0.5 }, 0.6)
            .fromTo(".closer .textlink", { opacity: 0.16, y: 16 }, { opacity: 1, y: 0, duration: 0.5 }, 0.95);
        });
      });

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
