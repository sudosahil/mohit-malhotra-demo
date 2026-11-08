/* Mohit Malhotra Photography — demo site behaviour */
(function () {
  "use strict";

  /* ---------- content ---------- */
  const STORIES = [
    {
      id: "jaydeep-takshsheela", names: "Jaydeep & Takshsheela", city: "Mumbai", style: "Traditional",
      line: "A bamboo pavilion, saffron turbans, and a family that would not stay behind the railing.",
      photos: [
        ["album01", "Family cheering from a bamboo pavilion as the couple embrace in front"],
        ["wm04", "Groom in a green turban and bride in a green saree glancing at each other"],
        ["wm08", "Couple in white and maroon standing against a red brick wall"],
        ["wm05", "Groom kisses bride on the cheek, both wearing flower garlands"],
        ["wm09", "Close detail of a bride's gold jewellery and green saree"]
      ]
    },
    {
      id: "raman-kasturi", names: "Raman & Kasturi", city: "Nagpur", style: "Traditional",
      line: "A kiss on the cheek against a wooden gate, and a haldi that left nobody clean.",
      photos: [
        ["album02", "Groom in a blue turban kisses his bride on the cheek beside a wooden fence"],
        ["wm01", "Couple laughing, covered in turmeric and colour during the haldi"],
        ["wm03", "Bride in a red lehenga standing in a bright doorway"]
      ]
    },
    {
      id: "angad-shalu", names: "Angad & Shalu", city: "Mumbai", style: "Candid",
      line: "Close frames, closed eyes, and mehendi hands held up to the camera.",
      photos: [
        ["album03", "Couple with foreheads together, her hand with mehendi on his shirt"],
        ["wm06", "Groom kisses his bride's cheek as she smiles with her eyes closed"],
        ["wm02", "Couple laughing and showing mehendi hands in front of a flower arch"]
      ]
    },
    {
      id: "richa-akarsh", names: "Richa & Akarsh", city: "Mumbai", style: "Pre-wedding",
      line: "A heart drawn in black sand, photographed from straight above.",
      photos: [
        ["album04", "Aerial view of a couple holding hands inside a heart drawn on dark sand"],
        ["wm07", "Couple in sunglasses sharing a drink, wearing flower garlands"]
      ]
    },
    {
      id: "vrushali-pallav", names: "Vrushali & Pallav", city: "Mumbai", style: "Pre-wedding",
      line: "Tall pines, a white horse, and one of them pointing at something just out of frame.",
      photos: [
        ["album05", "Couple standing with a white horse among tall dark trees in a forest"],
        ["wm10", "Man kneeling to propose under a wooden flower arch with hanging bulbs at night"]
      ]
    }
  ];
  const BY_ID = Object.fromEntries(STORIES.map(s => [s.id, s]));
  const cover = s => s.photos[0][0];

  const QUOTES = [
    ["It was an amazing experience working with Mohit & Team.", "Gopu Pillai"],
    ["Mohit bhai is a wonderful man and truly a professional in his field.", "Shiva"],
    ["Focussed, innovative and highly professional.", "Nalini Patnaik"],
    ["Very professional, kind & humble.", "Ritesh Singh"]
  ];

  const NAV = [["portfolio.html", "Portfolio"], ["services.html", "Services"], ["about.html", "About"], ["contact.html", "Contact"]];

  const $ = (sel, el = document) => el.querySelector(sel);
  const $$ = (sel, el = document) => [...el.querySelectorAll(sel)];
  // intrinsic sizes so layout is stable before images load (needed for scroll animation)
  const DIM = { album01: [1000, 666], album02: [1000, 666], album03: [920, 610], album04: [1000, 563], album05: [1000, 667],
    wm01: [1000, 666], wm02: [1000, 666], wm03: [1000, 1500], wm04: [1000, 666], wm05: [1000, 666], wm06: [1000, 1500],
    wm07: [1000, 667], wm08: [1000, 666], wm09: [1000, 1501], wm10: [1000, 761] };
  const ALT = {}; STORIES.forEach(s => s.photos.forEach(p => { ALT[p[0]] = p[1]; }));
  const img = (id, alt, extra = "") => `<img src="img/${id}.jpg" alt="${alt}" ${DIM[id] ? `width="${DIM[id][0]}" height="${DIM[id][1]}"` : ""} ${extra}>`;
  const emit = (name) => document.dispatchEvent(new Event(name));
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  // stop the page scrolling behind a full-screen layer (menu, photo viewer); motion.js pauses smooth scroll on the same events
  const lockScroll = (on) => {
    document.documentElement.style.overflow = on ? "hidden" : "";
    document.body.style.overflow = on ? "hidden" : "";
    emit(on ? "scroll:lock" : "scroll:unlock");
  };

  /* ---------- header + footer ---------- */
  function chrome() {
    const page = document.body.dataset.page;
    const header = $("#site-header");
    header.className = "site-header" + (page === "home" ? " light" : " solid");
    header.innerHTML = `
      <a class="wordmark" href="index.html">Mohit Malhotra<small>Photography</small></a>
      <button class="menu-btn" aria-expanded="false" aria-controls="nav">Menu</button>
      <nav class="nav" id="nav" aria-label="Main">
        ${NAV.map(([h, t]) => `<a href="${h}" ${page === h.replace(".html", "") ? 'aria-current="page"' : ""}>${t}</a>`).join("")}
      </nav>`;
    const btn = $(".menu-btn", header);
    const setMenu = (open) => {
      header.classList.toggle("open", open);
      btn.setAttribute("aria-expanded", open);
      btn.textContent = open ? "Close" : "Menu";
      lockScroll(open);
    };
    btn.addEventListener("click", () => setMenu(!header.classList.contains("open")));
    document.addEventListener("keydown", (e) => { if (e.key === "Escape" && header.classList.contains("open")) { setMenu(false); btn.focus(); } });
    addEventListener("resize", () => { if (innerWidth > 720 && header.classList.contains("open")) setMenu(false); });
    addEventListener("scroll", () => header.classList.toggle("scrolled", scrollY > 40), { passive: true });
    if (page === "home") {
      const hero = $(".hero");
      new IntersectionObserver(([e]) => {
        header.classList.toggle("light", e.isIntersecting && e.intersectionRatio > .15);
        header.classList.toggle("solid", !e.isIntersecting || e.intersectionRatio <= .15);
      }, { threshold: [0, .15, .5] }).observe(hero);
    }
    const f = $("#site-footer");
    f.className = "footer";
    f.innerHTML = `
      <div><span class="dev">Mohit Malhotra Photography</span><br>Chembur, Mumbai. Travels across India.</div>
      <div>Concept demo by Sahil Undale</div>`;
  }

  /* ---------- tiles ---------- */
  function tile(s, cls = "", sizes = "(max-width: 860px) 100vw, 50vw") {
    return `<a class="tile ${cls}" href="story.html?s=${s.id}">
      <div class="frame">${img(cover(s), `${s.names}, cover photograph`, `loading="lazy" decoding="async" sizes="${sizes}"`)}
        <div class="cap"><h3>${s.names}</h3><p>${s.city}, ${s.style.toLowerCase()}</p></div>
      </div>
    </a>`;
  }

  /* ---------- home ---------- */
  function home() {
    const slides = [
      // [photo, story, desktop focus, phone focus (the couple, when the frame is cropped to a tall rectangle)]
      ["album01", "jaydeep-takshsheela", "50% 45%", "52% 75%"],
      ["wm01", "raman-kasturi", "50% 30%", "68% 35%"],
      ["wm05", "jaydeep-takshsheela", "50% 35%", "46% 30%"],
      ["wm10", "angad-shalu", "50% 55%", "47% 60%"]
    ];
    const hero = $(".hero");
    const wrap = $(".hero-slides", hero);
    wrap.innerHTML = slides.map(([id, sid, pos, pm], i) =>
      `<div class="hero-slide ${i === 0 ? "on" : ""}" style="--src:url(img/${id}.jpg)"><img src="img/${id}.jpg" alt="${BY_ID[sid].names}, ${BY_ID[sid].city}" style="object-position:${pos};--pm:${pm}"${i ? 'loading="lazy"' : 'fetchpriority="high"'}></div>`).join("");
    const cap = $(".hero-cap", hero);
    const ticks = $(".ticks", hero);
    ticks.innerHTML = slides.map(() => "<i></i>").join("");
    let cur = 0, timer;
    const show = (n) => {
      cur = (n + slides.length) % slides.length;
      $$(".hero-slide", wrap).forEach((el, i) => el.classList.toggle("on", i === cur));
      const s = BY_ID[slides[cur][1]];
      cap.firstElementChild.innerHTML = `${s.names}<br><span>${s.city}</span>`;
      cap.firstElementChild.href = `story.html?s=${s.id}`;
      $$("i", ticks).forEach((t, i) => { t.classList.remove("on"); if (i === cur) { void t.offsetWidth; t.classList.add("on"); } });
    };
    const start = () => { clearInterval(timer); if (!reduced) timer = setInterval(() => show(cur + 1), 6000); };
    // the slideshow, caption and progress ticks begin once the entrance has finished
    document.addEventListener("site:ready", () => { show(0); setTimeout(start, 600); }, { once: true });
    document.addEventListener("visibilitychange", () => document.hidden ? clearInterval(timer) : start());

    const t = (id, cls) => tile(BY_ID[id], cls);
    $("#home-spread").innerHTML =
      ["jaydeep-takshsheela", "raman-kasturi", "angad-shalu", "richa-akarsh", "vrushali-pallav"].map(id => t(id, "")).join("");

    // pinned horizontal reel of selected frames
    const sidOf = (pid) => STORIES.find(s => s.photos.some(p => p[0] === pid));
    const reel = [["album01", "land"], ["wm03", "port"], ["wm01", "land"], ["wm06", "port"], ["wm04", "land"], ["album04", "land"], ["wm09", "port"], ["wm10", "land"], ["album05", "land"]];
    $("#reel").innerHTML =
      `<div class="reel-intro"><h2 class="statement">Frames I keep going back to.</h2></div>` +
      reel.map(([id, k]) => { const s = sidOf(id); return `<a class="reel-item ${k}" href="story.html?s=${s.id}"><div class="reel-img">${img(id, ALT[id], `loading="${innerWidth > 860 ? "eager" : "lazy"}" decoding="async"`)}</div><span class="reel-cap">${s.names}, ${s.city}</span></a>`; }).join("") +
      `<div class="reel-end"><a class="textlink" href="portfolio.html">See every wedding</a></div>`;

    // slow filmstrip of everything, second copy hidden from assistive tech
    const ids = ["wm08", "album02", "wm03", "wm05", "album04", "wm06", "wm01", "album03", "wm04", "wm09", "album05", "wm02", "wm10", "wm07", "album01"];
    const row = (hide) => ids.map(id => img(id, hide ? "" : ALT[id], `loading="lazy" decoding="async"`)).join("");
    $("#strip-track").innerHTML = row(false) + `<span class="strip-copy" aria-hidden="true">${row(true)}</span>`;
    quotes();
  }

  function quotes() {
    const fig = $(".quote"); if (!fig) return;
    let i = 0;
    const set = (n) => {
      i = (n + QUOTES.length) % QUOTES.length;
      fig.classList.add("swap");
      setTimeout(() => {
        $("blockquote", fig).textContent = QUOTES[i][0];
        $("figcaption", fig).textContent = QUOTES[i][1];
        fig.classList.remove("swap");
      }, reduced ? 0 : 420);
    };
    $("#q-prev").addEventListener("click", () => set(i - 1));
    $("#q-next").addEventListener("click", () => set(i + 1));
    $("blockquote", fig).textContent = QUOTES[0][0];
    $("figcaption", fig).textContent = QUOTES[0][1];
  }

  /* ---------- portfolio ---------- */
  function portfolio() {
    const wall = $("#wall");
    wall.innerHTML = STORIES.map(s => tile(s, "").replace('class="tile ', `data-city="${s.city}" data-style="${s.style}" class="tile `)).join("");
    const cities = [...new Set(STORIES.map(s => s.city))];
    const styles = [...new Set(STORIES.map(s => s.style))];
    const state = { city: "All", style: "All" };
    const group = (label, key, vals) => `<div role="group" aria-label="Filter by ${label}"><span class="lab">${label}</span>${["All", ...vals].map(v => `<button data-k="${key}" data-v="${v}" aria-pressed="${v === "All"}">${v}</button>`).join("")}</div>`;
    $("#filters").innerHTML = group("City", "city", cities) + group("Style", "style", styles);
    const apply = () => {
      let n = 0;
      $$(".tile", wall).forEach(t => {
        const ok = (state.city === "All" || t.dataset.city === state.city) && (state.style === "All" || t.dataset.style === state.style);
        t.hidden = !ok; if (ok) n++;
      });
      $("#empty").hidden = n > 0;
      // lay the visible stories out as a seamless mosaic: 7+5, then 5+7, and so on.
      // The wider tile sets the row height, the narrower one stretches to match it.
      const vis = $$(".tile", wall).filter(t => !t.hidden);
      vis.forEach((t, i) => {
        const lone = i === vis.length - 1 && vis.length % 2 === 1;
        const wide = lone || (Math.floor(i / 2) % 2 === 0 ? i % 2 === 0 : i % 2 === 1);
        t.classList.remove("w5", "w7", "w12", "fill");
        t.classList.add(lone ? "w12" : wide ? "w7" : "w5");
        if (!wide) t.classList.add("fill");
      });
      emit("filter:change");
    };
    apply();
    $("#filters").addEventListener("click", e => {
      const b = e.target.closest("button"); if (!b) return;
      state[b.dataset.k] = b.dataset.v;
      $$(`button[data-k="${b.dataset.k}"]`).forEach(x => x.setAttribute("aria-pressed", x === b));
      apply();
    });
  }

  /* ---------- story ---------- */
  function story() {
    const id = new URLSearchParams(location.search).get("s");
    const s = BY_ID[id] || STORIES[0];
    const i = STORIES.indexOf(s), next = STORIES[(i + 1) % STORIES.length];
    document.title = `${s.names}, ${s.city} wedding | Mohit Malhotra Photography`;
    $("#story-title").textContent = s.names;
    $("#story-meta").innerHTML = `<span>${s.city}</span><span>${s.style}</span><span>${s.photos.length} photographs</span>`;
    $("#story-line").textContent = s.line;
    const coverEl = $("#story-cover");
    coverEl.src = `img/${cover(s)}.jpg`; coverEl.alt = s.photos[0][1];

    const rest = s.photos.slice(1);
    // justified rows: group photos until their combined proportions fill a wide row,
    // then give each one a width that follows its own aspect ratio, so heights match and nothing is left empty.
    const ratio = (id) => DIM[id][0] / DIM[id][1];
    const rows = [];
    let cur = [], sum = 0;
    rest.forEach((p, k) => {
      cur.push(k); sum += ratio(p[0]);
      if (sum >= 2.4 || cur.length === 3) { rows.push(cur); cur = []; sum = 0; }
    });
    if (cur.length) { if (cur.length === 1 && rows.length) rows[rows.length - 1].push(cur[0]); else rows.push(cur); }
    {
      $("#gallery").innerHTML = rows.map(r => `<div class="jrow">${r.map(k => {
        const p = rest[k];
        return `<figure style="flex:${ratio(p[0]).toFixed(3)} 1 0"><button data-i="${k + 1}" aria-label="Open photograph ${k + 2} full screen">${img(p[0], p[1], `loading="lazy" decoding="async"`)}</button></figure>`;
      }).join("")}</div>`).join("");
      emit("content-ready");
    }
    $("#story-cover-btn").addEventListener("click", () => viewer(s.photos, 0));
    $("#gallery").addEventListener("click", e => { const b = e.target.closest("button"); if (b) viewer(s.photos, +b.dataset.i); });
    if (!rest.length) $("#gallery").remove();
    $("#next-story").href = `story.html?s=${next.id}`;
    $("#next-title").textContent = next.names;
    $("#next-meta").textContent = `${next.city}, ${next.style.toLowerCase()}`;
  }

  /* ---------- full-screen viewer ---------- */
  function viewer(photos, start) {
    let el = $("#viewer");
    if (!el) {
      el = document.createElement("div");
      el.id = "viewer"; el.className = "viewer"; el.setAttribute("role", "dialog"); el.setAttribute("aria-modal", "true"); el.setAttribute("aria-label", "Photograph viewer");
      el.innerHTML = `<button class="viewer-close" aria-label="Close viewer">Close</button>
        <div class="viewer-stage"><button class="viewer-btn viewer-prev" aria-label="Previous photograph">Prev</button><img alt=""><button class="viewer-btn viewer-next" aria-label="Next photograph">Next</button></div>
        <div class="viewer-bar"><span class="cap"></span><span class="count" aria-live="polite"></span></div>`;
      document.body.appendChild(el);
    }
    const im = $("img", el); let n = start, opener = document.activeElement;
    const go = (k) => {
      n = (k + photos.length) % photos.length;
      im.classList.add("out");
      setTimeout(() => {
        im.src = `img/${photos[n][0]}.jpg`; im.alt = photos[n][1];
        $(".cap", el).textContent = photos[n][1];
        $(".count", el).textContent = `${n + 1} of ${photos.length}`;
        im.classList.remove("out");
      }, reduced ? 0 : 200);
      const pre = new Image(); pre.src = `img/${photos[(n + 1) % photos.length][0]}.jpg`;
    };
    const close = () => { el.classList.remove("open"); lockScroll(false); document.removeEventListener("keydown", key); opener && opener.focus && opener.focus(); };
    const key = (e) => {
      if (e.key === "Escape") close();
      else if (e.key === "ArrowRight") go(n + 1);
      else if (e.key === "ArrowLeft") go(n - 1);
      else if (e.key === "Tab") {
        const f = $$("button", el); const first = f[0], last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    };
    $(".viewer-close", el).onclick = close;
    $(".viewer-prev", el).onclick = () => go(n - 1);
    $(".viewer-next", el).onclick = () => go(n + 1);
    let x0 = null;
    $(".viewer-stage", el).ontouchstart = e => { x0 = e.touches[0].clientX; };
    $(".viewer-stage", el).ontouchend = e => { if (x0 === null) return; const dx = e.changedTouches[0].clientX - x0; if (Math.abs(dx) > 50) go(n + (dx < 0 ? 1 : -1)); x0 = null; };
    el.classList.add("open"); lockScroll(true);
    document.addEventListener("keydown", key);
    go(start); $(".viewer-close", el).focus();
  }

  /* ---------- services ---------- */
  function services() {
    const data = [
      ["Wedding photography", "Traditional coverage of the ceremony and rituals, and candid coverage of everything between them. About 300 edited photographs for each wedding."],
      ["Wedding films", "A film cut from the same day, with the moments you did not see because you were in them."],
      ["Pre-wedding shoots", "A day with the two of you in a place that means something. Photographs, and a film if you want one."],
      ["Engagements", "The ring, the families, the evening. Photographed in the same way as the wedding, only shorter."],
      ["Albums", "Designed with you and printed in hardcover. Digital albums are available if you prefer."]
    ];
    $("#rows").innerHTML = data.map(([h, p]) => `<div class="row"><h3>${h}</h3><p>${p}</p></div>`).join("");
  }

  /* ---------- date check + enquiry ---------- */
  function contact() {
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    // Demo only: in the live site Mohit marks booked dates from his dashboard.
    const booked = (d) => { const k = d.getFullYear() * 400 + d.getMonth() * 31 + d.getDate(); const season = [10, 11, 0, 1, 3].includes(d.getMonth()); const wk = [0, 5, 6].includes(d.getDay()); return ((k * 2654435761) >>> 0) % 100 < (season ? (wk ? 62 : 22) : (wk ? 30 : 8)); };
    let view = new Date(today.getFullYear(), today.getMonth(), 1), sel = null;
    const cal = $("#cal-grid"), title = $("#cal-title"), prev = $("#cal-prev"), next = $("#cal-next"), dateIn = $("#f-date");
    const fmt = d => d.toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
    const draw = () => {
      title.textContent = `${MONTHS[view.getMonth()]} ${view.getFullYear()}`;
      prev.disabled = view <= new Date(today.getFullYear(), today.getMonth(), 1);
      const first = view.getDay(), n = new Date(view.getFullYear(), view.getMonth() + 1, 0).getDate();
      let h = ["S", "M", "T", "W", "T", "F", "S"].map(d => `<span class="dow" aria-hidden="true">${d}</span>`).join("");
      for (let i = 0; i < first; i++) h += `<span class="pad"></span>`;
      for (let d = 1; d <= n; d++) {
        const dt = new Date(view.getFullYear(), view.getMonth(), d);
        const past = dt < today, bk = !past && booked(dt), isSel = sel && +sel === +dt;
        h += `<button type="button" data-d="${+dt}" ${past || bk ? "disabled" : ""} class="${bk ? "booked" : ""} ${isSel ? "sel" : ""}" aria-pressed="${!!isSel}" aria-label="${fmt(dt)}${bk ? ", already booked" : ""}">${d}</button>`;
      }
      cal.innerHTML = h;
    };
    prev.onclick = () => { view = new Date(view.getFullYear(), view.getMonth() - 1, 1); draw(); };
    next.onclick = () => { view = new Date(view.getFullYear(), view.getMonth() + 1, 1); draw(); };
    cal.addEventListener("click", e => {
      const b = e.target.closest("button[data-d]"); if (!b) return;
      sel = new Date(+b.dataset.d); dateIn.value = fmt(sel); $("#date-note").textContent = "This date is free."; draw();
    });
    draw();

    $("#enquiry").addEventListener("submit", e => {
      e.preventDefault();
      const f = e.target;
      if (!sel) { $("#date-note").textContent = "Choose a date from the calendar first."; $("#date-note").focus(); return; }
      const names = f.names.value.trim();
      const out = $("#sent");
      out.hidden = false;
      out.innerHTML = `<h3>Thank you, ${names.replace(/[<>&"]/g, "")}.</h3><p>Your enquiry for ${fmt(sel)} in ${f.city.value} has reached Mohit. A reply will come to ${f.email.value.replace(/[<>&"]/g, "")} soon.</p>`;
      f.hidden = true; out.scrollIntoView({ behavior: reduced ? "auto" : "smooth", block: "center" });
    });
  }

  /* ---------- boot ---------- */
  /* ---------- entrance (home, first visit of a session; add ?intro to the address to replay it) ----------
     The hero's own pieces are gathered on a dark screen: a pile of the hero photographs and the name.
     When the first photograph has loaded they place themselves: the top photo grows into the hero photograph,
     the name flies up and becomes the logo, and the other photographs fan away. */
  function entrance() {
    const el = $(".loader");
    const ready = () => { if (!document.body.classList.contains("ready")) { document.body.classList.add("ready"); emit("site:ready"); } };
    const finish = () => { el && el.remove(); document.body.classList.remove("loading"); ready(); };
    let seen = null;
    try { seen = sessionStorage.getItem("mm-entered"); } catch (e) { /* storage unavailable: just show it */ }
    const replay = /[?&]intro\b/.test(location.search);
    if (!el || reduced || !window.gsap || (seen && !replay)) { finish(); return; }
    try { sessionStorage.setItem("mm-entered", "1"); } catch (e) { /* ignore */ }
    document.body.classList.add("loading");
    setTimeout(finish, 12000); // never leave anyone stuck behind the loader

    const pile = $$(".lp", el), top = $(".lp-top", el), name = $(".loader-name", el), tag = $(".loader-tag", el), bar = $(".loader-bar", el);
    const rest = pile.filter(c => c !== top);
    const tilt = [-9, 7, -3];       // back to front
    const nudge = [-26, 24, -7];    // percent of a card's width

    // 1. gather: the photographs drop into a pile, then the name and tagline arrive
    gsap.set(pile, { opacity: 0, y: 80 });
    gsap.set(name, { opacity: 0, y: 24 });
    gsap.set(tag, { opacity: 0 });
    gsap.timeline()
      .to(pile, { opacity: 1, y: 0, duration: 1.1, ease: "power3.out", stagger: 0.13 }, 0.1)
      .to(rest, { rotate: (i) => tilt[i], xPercent: (i) => nudge[i], duration: 1.2, ease: "power3.out", stagger: 0.13 }, 0.55)
      .to(name, { opacity: 1, y: 0, duration: 0.9, ease: "power3.out" }, 0.9)
      .to(tag, { opacity: 1, duration: 0.8 }, 1.2);

    // 2. place: once the hero photograph is ready (and the gathering has had its moment)
    const first = $(".hero-slide img");
    const imageReady = first && first.decode ? first.decode().catch(() => {}) : Promise.resolve();
    const minimum = new Promise(r => setTimeout(r, 2400));
    const ceiling = new Promise(r => setTimeout(r, 6500));
    const place = () => {
      try {
        const target = first.getBoundingClientRect();          // where the hero photograph really is (full screen on desktop, the framed photo on phones)
        const tr = top.getBoundingClientRect();
        $("img", top).style.objectPosition = getComputedStyle(first).objectPosition;
        const textRect = (node) => { const r = document.createRange(); r.selectNodeContents(node); return r.getBoundingClientRect(); };
        const from = textRect(name.firstChild), to = textRect($(".wordmark").firstChild);   // the real logo sits hidden under the loader
        gsap.set(top, { position: "fixed", left: tr.left, top: tr.top, right: "auto", bottom: "auto", width: tr.width, height: tr.height, x: 0, y: 0, rotate: 0 });
        gsap.timeline({ onComplete: finish })
          .to(bar, { opacity: 0, duration: 0.3 }, 0)
          .to(tag, { opacity: 0, duration: 0.35 }, 0)
          .to(rest, { opacity: 0, x: (i) => [-1, 1, -0.6][i] * innerWidth * 0.4, y: (i) => [-0.2, 0.3, -0.35][i] * innerHeight * 0.5, rotate: (i) => tilt[i] * 3, duration: 1, ease: "power3.in" }, 0)
          .to(top, { left: target.left, top: target.top, width: target.width, height: target.height, duration: 1.2, ease: "power3.inOut" }, 0.12)
          .to(el, { backgroundColor: "rgba(27,30,28,0)", duration: 0.9, ease: "power1.in" }, 0.45)
          .to(name, { x: to.left - from.left, y: to.top - from.top, scale: to.width / from.width, duration: 1.15, ease: "power3.inOut" }, 0.12)
          .add(() => { document.body.classList.remove("loading"); ready(); }, 1.1)   // the real header fades in under the landing name; the headline starts to rise
          .to([name, el], { opacity: 0, duration: 0.3 }, 1.3);
      } catch (e) { finish(); }
    };
    Promise.race([Promise.all([imageReady, minimum]), ceiling]).then(place);
  }

  chrome();
  const page = document.body.dataset.page;
  ({ home, portfolio, story, services, contact, about: quotes })[page]?.();
  if (page === "home") entrance(); else document.body.classList.add("ready");
})();
