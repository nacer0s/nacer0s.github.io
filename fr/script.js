/* Nacer Eddine Bouras — FR / JS vanilla, sans framework */
(function () {
  "use strict";
  var root = document.documentElement;
  var finePointer = !!(window.matchMedia && window.matchMedia("(hover:hover) and (pointer:fine)").matches);
  var reducedMotion = !!(window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches);

  /* Loader — always finishes (failsafe timeout) */
  var loader = document.getElementById("loader");
  var loaderNum = document.getElementById("loaderNum");
  var loaderBar = document.getElementById("loaderBar");
  var loadDone = false;
  function finishLoad() {
    if (loadDone) return;
    loadDone = true;
    if (loader) loader.classList.add("is-done");
  }
  if (loader && !reducedMotion) {
    var p = 0;
    var tick = setInterval(function () {
      p = Math.min(100, p + 4 + Math.ceil(Math.random() * 12));
      if (loaderNum) loaderNum.textContent = String(p).padStart(3, "0");
      if (loaderBar) loaderBar.style.width = p + "%";
      if (p >= 100) { clearInterval(tick); setTimeout(finishLoad, 200); }
    }, 80);
    setTimeout(function () { clearInterval(tick); finishLoad(); }, 3000);
  } else {
    finishLoad();
  }

  /* Custom cursor — fine pointers only */
  var dot = document.getElementById("cursorDot");
  var ring = document.getElementById("cursorRing");
  if (finePointer && dot && ring && !reducedMotion) {
    var mx = -100, my = -100, rx = -100, ry = -100;
    window.addEventListener("mousemove", function (e) {
      mx = e.clientX; my = e.clientY;
      dot.style.transform = "translate(" + (mx - 4) + "px," + (my - 4) + "px)";
    }, { passive: true });
    (function loop() {
      rx += (mx - rx) * 0.16; ry += (my - ry) * 0.16;
      ring.style.transform = "translate(" + (rx - 16) + "px," + (ry - 16) + "px)";
      requestAnimationFrame(loop);
    })();
    document.querySelectorAll("a, button, input, textarea, .work-row").forEach(function (el) {
      el.addEventListener("mouseenter", function () { document.body.classList.add("cursor-hot"); });
      el.addEventListener("mouseleave", function () { document.body.classList.remove("cursor-hot"); });
    });
  } else {
    if (dot) dot.style.display = "none";
    if (ring) ring.style.display = "none";
  }

  /* Theme — dark / light, persisted */
  var THEME_KEY = "nb-theme";
  var toggleBtn = document.getElementById("themeToggle");
  function getPreferred() {
    try {
      var saved = localStorage.getItem(THEME_KEY);
      if (saved === "dark" || saved === "light") return saved;
    } catch (e) { /* private mode */ }
    if (window.matchMedia && window.matchMedia("(prefers-color-scheme: light)").matches) return "light";
    return "dark";
  }
  function paintIcon(theme) {
    if (!toggleBtn) return;
    toggleBtn.innerHTML = '<i class="fa-solid ' + (theme === "dark" ? "fa-sun" : "fa-moon") + ' icon"></i>';
    toggleBtn.setAttribute("aria-pressed", theme === "dark" ? "true" : "false");
    toggleBtn.setAttribute("aria-label", theme === "dark" ? "Passer en mode clair" : "Passer en mode sombre");
  }
  function setTheme(theme) {
    root.setAttribute("data-theme", theme);
    try { localStorage.setItem(THEME_KEY, theme); } catch (e) { /* ignore */ }
    paintIcon(theme);
  }
  setTheme(getPreferred());
  if (toggleBtn) {
    toggleBtn.addEventListener("click", function () {
      setTheme(root.getAttribute("data-theme") === "dark" ? "light" : "dark");
    });
  }

  /* Mobile menu */
  var menuBtn = document.getElementById("menuToggle");
  var mobileMenu = document.getElementById("mobileMenu");
  function closeMenu() {
    if (!mobileMenu || !menuBtn) return;
    mobileMenu.hidden = true;
    menuBtn.setAttribute("aria-expanded", "false");
    menuBtn.setAttribute("aria-label", "Ouvrir le menu");
    menuBtn.innerHTML = '<i class="fa-solid fa-bars icon"></i>';
  }
  if (menuBtn && mobileMenu) {
    menuBtn.addEventListener("click", function () {
      var open = mobileMenu.hidden;
      mobileMenu.hidden = !open;
      menuBtn.setAttribute("aria-expanded", String(open));
      menuBtn.setAttribute("aria-label", open ? "Fermer le menu" : "Ouvrir le menu");
      menuBtn.innerHTML = '<i class="fa-solid ' + (open ? "fa-xmark" : "fa-bars") + ' icon"></i>';
    });
    mobileMenu.querySelectorAll("a").forEach(function (a) { a.addEventListener("click", closeMenu); });
    window.addEventListener("resize", function () { if (window.innerWidth > 720) closeMenu(); });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape") closeMenu(); });
  }

  /* Typed roles */
  var typed = document.getElementById("typedRole");
  var roles = ["developpeur_", "designer_", "minimaliste_", "vanilla-only_", "rtl-ready_"];
  if (typed && !reducedMotion) {
    var ri = 0, ci = roles[0].length, del = true;
    setInterval(function () {
      var word = roles[ri];
      if (del) {
        ci -= 1;
        if (ci <= 0) { del = false; ri = (ri + 1) % roles.length; word = roles[ri]; }
      } else {
        ci += 1;
        if (ci >= word.length) del = true;
      }
      typed.textContent = word.slice(0, Math.max(1, ci));
    }, 150);
  }

  /* Casablanca clocks (GMT) */
  function tickClock() {
    try {
      var fmt = new Intl.DateTimeFormat("fr-FR", { hour: "2-digit", minute: "2-digit", timeZone: "Africa/Casablanca" });
      var fmtS = new Intl.DateTimeFormat("fr-FR", { hour: "2-digit", minute: "2-digit", second: "2-digit", timeZone: "Africa/Casablanca" });
      var t = fmt.format(new Date());
      var lt = document.getElementById("localTime"); if (lt) lt.textContent = t + " GMT";
      var fc = document.getElementById("footClock"); if (fc) fc.textContent = fmtS.format(new Date());
      var mc = document.getElementById("mobileClock"); if (mc) mc.textContent = "CASA " + t;
    } catch (e) { /* Intl unavailable */ }
  }
  tickClock();
  setInterval(tickClock, 10000);

  /* Scroll progress */
  var bar = document.getElementById("progressBar");
  function onScroll() {
    var h = document.documentElement;
    var max = h.scrollHeight - h.clientHeight;
    if (bar) bar.style.width = (max > 0 ? (h.scrollTop / max) * 100 : 0) + "%";
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* Reveal + skills */
  var revealEls = document.querySelectorAll(".reveal");
  revealEls.forEach(function (el, i) { el.style.transitionDelay = ((i % 4) * 60) + "ms"; });
  function armSkills(scope) {
    (scope || document).querySelectorAll(".skill").forEach(function (s) {
      var f = s.querySelector(".skill-fill");
      if (f && f.dataset.w) f.style.setProperty("--w", f.dataset.w);
      s.classList.add("is-on");
    });
  }
  if ("IntersectionObserver" in window && revealEls.length) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) {
          en.target.classList.add("is-visible");
          if (en.target.querySelector(".skill-fill")) armSkills(en.target);
          io.unobserve(en.target);
        }
      });
    }, { threshold: 0.12 });
    revealEls.forEach(function (el) { io.observe(el); });
    var sk = new IntersectionObserver(function (es) {
      es.forEach(function (en) { if (en.isIntersecting) { armSkills(en.target); sk.unobserve(en.target); } });
    }, { threshold: 0.3 });
    document.querySelectorAll(".skills").forEach(function (s) { sk.observe(s); });
  } else {
    revealEls.forEach(function (el) { el.classList.add("is-visible"); });
    armSkills(document);
  }

  /* Work filter */
  var filter = document.getElementById("workFilter");
  if (filter) {
    var btns = filter.querySelectorAll(".filter-btn");
    var rows = document.querySelectorAll(".work-row");
    btns.forEach(function (b) {
      b.addEventListener("click", function () {
        btns.forEach(function (x) { x.classList.remove("is-active"); });
        b.classList.add("is-active");
        var f = b.dataset.filter;
        rows.forEach(function (r) {
          r.classList.toggle("is-hidden", !(f === "all" || r.dataset.cat === f));
        });
      });
    });
  }

  /* Magnetic buttons — fine pointers only */
  if (finePointer && !reducedMotion) {
    document.querySelectorAll(".magnetic").forEach(function (el) {
      el.addEventListener("mousemove", function (e) {
        var r = el.getBoundingClientRect();
        el.style.transform = "translate(" + ((e.clientX - r.left - r.width / 2) * 0.12).toFixed(1) + "px," + ((e.clientY - r.top - r.height / 2) * 0.18).toFixed(1) + "px)";
      });
      el.addEventListener("mouseleave", function () { el.style.transform = ""; });
    });
  }

  /* Active nav link */
  var sections = ["about", "work", "certs", "contact"].map(function (id) { return document.getElementById(id); }).filter(Boolean);
  var navLinks = document.querySelectorAll(".main-nav .nav-link");
  if ("IntersectionObserver" in window && sections.length && navLinks.length) {
    var navIO = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) {
          navLinks.forEach(function (l) { l.classList.toggle("is-active", l.getAttribute("href") === "#" + en.target.id); });
        }
      });
    }, { rootMargin: "-40% 0px -55% 0px" });
    sections.forEach(function (s) { navIO.observe(s); });
  }

  /* Copy email */
  var copyBtn = document.getElementById("copyEmail");
  if (copyBtn) {
    copyBtn.addEventListener("click", function () {
      var email = "contact@nacer0s.com";
      function done(ok) {
        copyBtn.innerHTML = ok
          ? '<i class="fa-solid fa-check icon"></i>Copié ✓'
          : '<i class="fa-solid fa-copy icon"></i>Copier l’e-mail';
  /* Visionneuse : zoom au clic, flèches, Échap, clavier */
  var viewer = document.getElementById("viewer");
  var viewerImg = document.getElementById("viewerImg");
  var viewerCap = document.getElementById("viewerCap");
  var viewerClose = document.getElementById("viewerClose");
  var viewerPrev = document.getElementById("viewerPrev");
  var viewerNext = document.getElementById("viewerNext");
  var gIndex = 0;
  function visibleShots() {
    return Array.prototype.filter.call(document.querySelectorAll(".g-item img"), function (im) {
      var fig = im.closest(".g-item");
      return fig && fig.style.display !== "none";
    });
  }
  function showShot(n) {
    var list = visibleShots();
    if (!list.length || !viewerImg) return;
    gIndex = (n + list.length) % list.length;
    var im = list[gIndex];
    viewerImg.src = im.currentSrc || im.src;
    viewerImg.alt = im.alt || "";
    if (viewerCap) viewerCap.textContent = im.alt || "";
  }
  function openViewer(el) {
    if (!viewer) return;
    var list = visibleShots();
    var at = list.indexOf(el);
    gIndex = at < 0 ? 0 : at;
    showShot(gIndex);
    viewer.hidden = false;
    document.body.style.overflow = "hidden";
    if (viewerClose) viewerClose.focus();
  }
  function closeViewer() {
    if (!viewer || viewer.hidden) return;
    viewer.hidden = true;
    document.body.style.overflow = "";
  }
  document.querySelectorAll(".g-item img").forEach(function (im) {
    im.style.cursor = "zoom-in";
    im.setAttribute("tabindex", "0");
    im.addEventListener("click", function () { openViewer(im); });
    im.addEventListener("keydown", function (e) {
      if (e.key === "Enter" || e.key === " ") { e.preventDefault(); openViewer(im); }
    });
  });
  if (viewerPrev) viewerPrev.addEventListener("click", function () { showShot(gIndex - 1); });
  if (viewerNext) viewerNext.addEventListener("click", function () { showShot(gIndex + 1); });
  if (viewerClose) viewerClose.addEventListener("click", closeViewer);
  if (viewer) viewer.addEventListener("click", function (e) { if (e.target === viewer) closeViewer(); });
  document.addEventListener("keydown", function (e) {
    if (!viewer || viewer.hidden) return;
    if (e.key === "Escape") closeViewer();
    else if (e.key === "ArrowRight") showShot(gIndex + 1);
    else if (e.key === "ArrowLeft") showShot(gIndex - 1);
  });

        if (ok) {
          setTimeout(function () {
            copyBtn.innerHTML = '<i class="fa-solid fa-copy icon"></i>Copier l’e-mail';
  /* Galerie : masque les visuels manquants, masque la section si vide */
  var gallery = document.getElementById("gallery");
  if (gallery) {
    var sweepGallery = function () {
      var visible = 0;
      gallery.querySelectorAll(".g-item").forEach(function (fig) {
        var im = fig.querySelector("img");
        var ok = im && im.complete && im.naturalWidth > 0;
        fig.style.display = ok ? "" : "none";
        if (ok) visible += 1;
      });
      if (!visible) gallery.style.display = "none";
    };
    window.addEventListener("load", sweepGallery);
    gallery.querySelectorAll(".g-item img").forEach(function (im) {
      im.addEventListener("error", function () {
        var fig = im.closest(".g-item");
        if (fig) fig.style.display = "none";
        if (gallery.querySelectorAll('.g-item:not([style*="none"])').length === 0) gallery.style.display = "none";
      });
    });
  }

          }, 1600);
        }
      }
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(email).then(function () { done(true); }, function () { done(false); });
      } else {
        done(false);
      }
    });
  }

  /* Year + to-top + icons */
  var year = document.getElementById("year");
  if (year) year.textContent = String(new Date().getFullYear());
  var toTop = document.getElementById("toTop");
  if (toTop) toTop.addEventListener("click", function () { window.scrollTo({ top: 0, behavior: "smooth" }); });
})();
