// Minimal progressive enhancement
(function () {
  // ── Mobile menu ────────────────────────────────────────────────────────
  var toggle   = document.querySelector(".menu-toggle");
  var nav      = document.querySelector(".nav");
  var backdrop = document.getElementById("navBackdrop");
  var closeBtn = document.querySelector(".nav-drawer-close");

  function openMenu() {
    nav.classList.add("open");
    backdrop.classList.add("open");
    toggle.setAttribute("aria-expanded", "true");
    toggle.setAttribute("aria-label", "Close menu");
    document.body.style.overflow = "hidden";
    // Focus the close button inside the drawer for keyboard/screen-reader users
    if (closeBtn) setTimeout(function () { closeBtn.focus(); }, 50);
  }

  function closeMenu() {
    nav.classList.remove("open");
    backdrop.classList.remove("open");
    toggle.setAttribute("aria-expanded", "false");
    toggle.setAttribute("aria-label", "Open menu");
    document.body.style.overflow = "";
    toggle.focus();
  }

  if (toggle && nav) {
    // Hamburger opens, close button (in drawer) closes
    toggle.addEventListener("click", function () {
      nav.classList.contains("open") ? closeMenu() : openMenu();
    });
    if (closeBtn) closeBtn.addEventListener("click", closeMenu);

    // Tapping the backdrop closes
    if (backdrop) backdrop.addEventListener("click", closeMenu);

    // Escape closes
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && nav.classList.contains("open")) closeMenu();
    });

    // Any nav link click closes the drawer
    nav.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", function () {
        if (nav.classList.contains("open")) closeMenu();
      });
    });
  }

  // Scroll reveal
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          e.target.classList.add("in");
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.12 });
    document.querySelectorAll(".reveal").forEach(function (el) { io.observe(el); });
  } else {
    document.querySelectorAll(".reveal").forEach(function (el) { el.classList.add("in"); });
  }
  // Gallery lightbox - prev/next, captions, zoom/pan, focus management (WCAG AA)
  var lightbox = document.querySelector(".lightbox");
  if (lightbox) {
    var lbImg       = lightbox.querySelector(".lightbox__img");
    var lbFrame     = lightbox.querySelector(".lightbox__frame");
    var lbCaption   = lightbox.querySelector(".lightbox__caption");
    var lbCounter   = lightbox.querySelector(".lightbox__counter");
    var lbStatus    = lightbox.querySelector("#lightbox-status");
    var closeBtn    = lightbox.querySelector(".lightbox__close");
    var prevBtn     = lightbox.querySelector(".lightbox__prev");
    var nextBtn     = lightbox.querySelector(".lightbox__next");
    var lbZoomIn    = lightbox.querySelector("[data-zoom='in']");
    var lbZoomOut   = lightbox.querySelector("[data-zoom='out']");
    var lbZoomReset = lightbox.querySelector("[data-zoom='reset']");
    var lbZoomLevel = lightbox.querySelector(".lightbox__zoom-hud .zoom-level");

    var items       = Array.prototype.slice.call(document.querySelectorAll(".gallery-item"));
    var current     = 0;
    var returnFocus = null;

    // Zoom / pan state
    var lbScale = 1, lbOx = 0, lbOy = 0;
    var lbDragging = false, lbDragX, lbDragY, lbDragOx, lbDragOy;
    var LB_MIN = 1, LB_MAX = 5;

    function lbUpdateHud() {
      if (lbZoomLevel) lbZoomLevel.textContent = Math.round(lbScale * 100) + "%";
      lbImg.classList.toggle("lightbox__img--zoomed", lbScale > 1);
    }

    function lbApplyTransform(animated) {
      if (animated) {
        lbImg.style.transition = "transform 280ms ease";
        setTimeout(function () { lbImg.style.transition = ""; }, 280);
      }
      lbImg.style.transform = "translate(" + lbOx + "px," + lbOy + "px) scale(" + lbScale + ")";
      lbUpdateHud();
    }

    function lbClamp() {
      if (!lbFrame) return;
      var fw = lbFrame.offsetWidth, fh = lbFrame.offsetHeight;
      var iw = lbImg.offsetWidth  * lbScale;
      var ih = lbImg.offsetHeight * lbScale;
      var maxX = Math.max(0, (iw - fw) / 2);
      var maxY = Math.max(0, (ih - fh) / 2);
      lbOx = Math.min(maxX, Math.max(-maxX, lbOx));
      lbOy = Math.min(maxY, Math.max(-maxY, lbOy));
    }

    function lbZoomBy(delta, cx, cy) {
      if (cx === undefined) { cx = lbFrame ? lbFrame.offsetWidth / 2 : 0; cy = lbFrame ? lbFrame.offsetHeight / 2 : 0; }
      var ns = Math.min(LB_MAX, Math.max(LB_MIN, lbScale * delta));
      lbOx = cx + (lbOx - cx) * (ns / lbScale);
      lbOy = cy + (lbOy - cy) * (ns / lbScale);
      lbScale = ns;
      lbClamp();
    }

    function lbResetZoom() {
      lbScale = 1; lbOx = 0; lbOy = 0;
      lbApplyTransform(true);
    }

    if (lbFrame) {
      lbFrame.addEventListener("wheel", function (e) {
        if (!lightbox.classList.contains("open")) return;
        e.preventDefault();
        var rect = lbFrame.getBoundingClientRect();
        lbZoomBy(e.deltaY < 0 ? 1.15 : 0.87, e.clientX - rect.left, e.clientY - rect.top);
        lbApplyTransform(false);
      }, { passive: false });

      lbFrame.addEventListener("mousedown", function (e) {
        if (lbScale <= 1) return;
        if (e.target.closest(".lightbox__zoom-hud")) return;
        lbDragging = true;
        lbDragX = e.clientX; lbDragY = e.clientY;
        lbDragOx = lbOx; lbDragOy = lbOy;
        lbImg.classList.add("lightbox__img--dragging");
        e.preventDefault();
      });

      lbFrame.addEventListener("dblclick", function (e) {
        if (e.target.closest(".lightbox__zoom-hud")) return;
        lbResetZoom();
      });
    }

    document.addEventListener("mousemove", function (e) {
      if (!lbDragging) return;
      lbOx = lbDragOx + (e.clientX - lbDragX);
      lbOy = lbDragOy + (e.clientY - lbDragY);
      lbClamp();
      lbApplyTransform(false);
    });

    document.addEventListener("mouseup", function () {
      if (!lbDragging) return;
      lbDragging = false;
      lbImg.classList.remove("lightbox__img--dragging");
    });

    if (lbZoomIn)    lbZoomIn.addEventListener("click",    function () { lbZoomBy(1.5); lbApplyTransform(true); });
    if (lbZoomOut)   lbZoomOut.addEventListener("click",   function () { lbZoomBy(0.67); lbApplyTransform(true); });
    if (lbZoomReset) lbZoomReset.addEventListener("click", lbResetZoom);

    function mod(n, m) { return ((n % m) + m) % m; }

    function show(index) {
      current = mod(index, items.length);
      var item = items[current];
      var src  = item.dataset.full || item.querySelector("img").src;
      var alt  = item.querySelector("img").alt || "";

      lbResetZoom();
      lbImg.src = src;
      lbImg.alt = alt;

      if (lbCaption) lbCaption.textContent = alt;
      if (lbCounter) lbCounter.textContent = (current + 1) + " / " + items.length;
      if (lbStatus)  lbStatus.textContent  = "Photo " + (current + 1) + " of " + items.length + ". " + alt;
      lightbox.setAttribute("aria-label", "Photo viewer: " + (current + 1) + " of " + items.length);
    }

    function openLightbox(index) {
      returnFocus = document.activeElement;
      show(index);
      lightbox.classList.add("open");
      document.body.style.overflow = "hidden";
      closeBtn.focus();
    }

    function closeLightbox() {
      lightbox.classList.remove("open");
      document.body.style.overflow = "";
      lbResetZoom();
      lbImg.src = "";
      if (lbStatus) lbStatus.textContent = "";
      if (returnFocus && typeof returnFocus.focus === "function") returnFocus.focus();
      returnFocus = null;
    }

    items.forEach(function (item, i) {
      item.addEventListener("click", function () { openLightbox(i); });
      item.addEventListener("keydown", function (e) {
        if (e.key === "Enter" || e.key === " ") { e.preventDefault(); openLightbox(i); }
      });
    });

    closeBtn.addEventListener("click", closeLightbox);
    if (prevBtn) prevBtn.addEventListener("click", function () { show(current - 1); });
    if (nextBtn) nextBtn.addEventListener("click", function () { show(current + 1); });

    lightbox.addEventListener("click", function (e) {
      if (e.target === lightbox) closeLightbox();
    });

    document.addEventListener("keydown", function (e) {
      if (!lightbox.classList.contains("open")) return;
      switch (e.key) {
        case "Escape":     closeLightbox();        break;
        case "ArrowLeft":  e.preventDefault(); show(current - 1); break;
        case "ArrowRight": e.preventDefault(); show(current + 1); break;
      }
    });

    lightbox.addEventListener("keydown", function (e) {
      if (e.key !== "Tab") return;
      var focusable = Array.prototype.slice.call(lightbox.querySelectorAll("button:not([disabled])"));
      if (!focusable.length) return;
      var first = focusable[0], last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault(); last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault(); first.focus();
      }
    });
  }

  // Active nav highlight based on path
  var here = location.pathname.replace(/\/$/, "") || "/";
  document.querySelectorAll(".nav a").forEach(function (a) {
    var p = new URL(a.href, location.origin).pathname.replace(/\/$/, "") || "/";
    if (p === here) a.classList.add("active");
  });

  // ── Nav dropdown ───────────────────────────────────────────────────────
  // Desktop: CSS :hover/:focus-within handles show/hide automatically.
  // Touch/click: JS toggles .open class on first tap; second tap navigates.
  // Keyboard: Escape closes the open dropdown.
  var dropdowns = document.querySelectorAll("[data-dropdown]");
  dropdowns.forEach(function (dd) {
    var trigger = dd.querySelector(".nav-dropdown__trigger");

    // Highlight trigger when current page is a child of this dropdown
    if (trigger) {
      dd.querySelectorAll(".nav-dropdown__panel a").forEach(function (a) {
        var p = new URL(a.href, location.origin).pathname.replace(/\/$/, "") || "/";
        if (p === here) trigger.classList.add("active");
      });
    }

    if (trigger) {
      trigger.addEventListener("click", function (e) {
        // On touch-only devices, intercept the first tap to reveal the panel
        var isTouch = window.matchMedia("(hover: none)").matches;
        if (isTouch && !dd.classList.contains("open")) {
          e.preventDefault();
          dropdowns.forEach(function (o) { if (o !== dd) o.classList.remove("open"); });
          dd.classList.add("open");
          return;
        }
        // Desktop or second touch tap — follow the link
      });
    }

    // Escape closes the panel and returns focus
    dd.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && dd.classList.contains("open")) {
        dd.classList.remove("open");
        if (trigger) trigger.focus();
      }
    });
  });

  // Click outside closes all open dropdowns
  document.addEventListener("click", function (e) {
    dropdowns.forEach(function (dd) {
      if (!dd.contains(e.target)) dd.classList.remove("open");
    });
  });

  // ------------------------------------------------------------------
  // Floor Plan Inquiry modal
  // - Opens from any [data-open-plan-modal] button
  // - Pulls plan name/type/specs from data-* attrs on the trigger
  // - Populates hidden form inputs + visible heading fields
  // - Traps focus within the panel (WCAG 2.1.2)
  // - Closes on Escape, backdrop click, X button, or Cancel
  // - Returns focus to the opening trigger on close
  // ------------------------------------------------------------------
  var planModal = document.getElementById("planModal");
  if (planModal) {
    var panel = planModal.querySelector(".modal__panel");
    var focusOpenersSelector = "[data-open-plan-modal]";
    var closerSelector = "[data-modal-close]";
    var FOCUSABLE = [
      "a[href]", "area[href]",
      "input:not([disabled]):not([type='hidden'])",
      "select:not([disabled])", "textarea:not([disabled])",
      "button:not([disabled])",
      "[tabindex]:not([tabindex='-1'])"
    ].join(",");
    var lastTrigger = null;

    function setDisplay(sel, value) {
      var el = planModal.querySelector(sel);
      if (el) el.textContent = value;
    }
    function setHidden(sel, value) {
      var el = planModal.querySelector(sel);
      if (el) el.value = value;
    }

    function openModal(trigger) {
      lastTrigger = trigger;
      var name  = trigger.getAttribute("data-plan-name")  || "our floor plans";
      var type  = trigger.getAttribute("data-plan-type")  || "";
      var specs = trigger.getAttribute("data-plan-specs") || "";

      // Visible heading
      setDisplay("[data-plan-display-name]", name);
      setDisplay("[data-plan-display-type]", type);
      setDisplay("[data-plan-display-specs]", specs);
      // Hide the " · " separator if either side is empty
      var divider = planModal.querySelector("[data-plan-display-divider]");
      if (divider) divider.style.display = (type && specs) ? "" : "none";

      // Hidden inputs that get submitted to Netlify
      setHidden("[data-plan-hidden-name]", name);
      setHidden("[data-plan-hidden-type]", type);
      setHidden("[data-plan-hidden-specs]", specs);

      planModal.hidden = false;
      document.body.classList.add("modal-open");

      // Focus first field after a tick so browsers register it
      window.setTimeout(function () {
        var first = panel.querySelector("input:not([type='hidden']):not([name='bot-field']), select, textarea");
        if (first) first.focus();
      }, 20);
    }

    function closeModal() {
      if (planModal.hidden) return;
      planModal.hidden = true;
      document.body.classList.remove("modal-open");
      if (lastTrigger && typeof lastTrigger.focus === "function") {
        lastTrigger.focus();
      }
      lastTrigger = null;
    }

    // Attach openers
    document.querySelectorAll(focusOpenersSelector).forEach(function (btn) {
      btn.addEventListener("click", function (e) {
        e.preventDefault();
        openModal(btn);
      });
    });

    // Attach closers (X, Cancel, backdrop)
    planModal.querySelectorAll(closerSelector).forEach(function (el) {
      el.addEventListener("click", function (e) {
        e.preventDefault();
        closeModal();
      });
    });

    // Escape to close, Tab to trap focus
    document.addEventListener("keydown", function (e) {
      if (planModal.hidden) return;
      if (e.key === "Escape") {
        e.preventDefault();
        closeModal();
        return;
      }
      if (e.key !== "Tab") return;
      var focusables = Array.prototype.slice.call(
        panel.querySelectorAll(FOCUSABLE)
      ).filter(function (el) { return el.offsetParent !== null; });
      if (!focusables.length) return;
      var first = focusables[0];
      var last = focusables[focusables.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault(); last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault(); first.focus();
      }
    });
  }

  // Hero video: pause/play toggle + prefers-reduced-motion respect.
  // WCAG 2.2.2 (Pause, Stop, Hide) — any auto-starting motion longer than
  // 5 seconds must be pausable.
  var heroVideo = document.querySelector(".hero__video");
  var heroBtn = document.querySelector(".hero__video-toggle");
  if (heroVideo && heroBtn) {
    var mq = window.matchMedia ? window.matchMedia("(prefers-reduced-motion: reduce)") : null;
    var label = heroBtn.querySelector(".hero__video-toggle-label");

    function applyPaused(paused) {
      heroBtn.setAttribute("data-paused", paused ? "true" : "false");
      heroBtn.setAttribute("aria-pressed", paused ? "true" : "false");
      heroBtn.setAttribute("aria-label", paused ? "Play background video" : "Pause background video");
      if (label) label.textContent = paused ? "Play" : "Pause";
    }

    function pause() { try { heroVideo.pause(); } catch (e) {} applyPaused(true); }
    function play()  {
      var p = heroVideo.play();
      if (p && typeof p.catch === "function") {
        p.catch(function () { /* Autoplay blocked — keep button offering Play */ });
      }
      applyPaused(false);
    }

    // Initial state: honor reduced-motion preference.
    if (mq && mq.matches) pause();

    heroBtn.addEventListener("click", function () {
      if (heroVideo.paused) play(); else pause();
    });

    // If playback is blocked (Safari low-power, slow net, etc.), reflect state.
    heroVideo.addEventListener("pause", function () { applyPaused(true); });
    heroVideo.addEventListener("play",  function () { applyPaused(false); });

    // React to OS-level reduced-motion toggles during the session.
    if (mq && mq.addEventListener) {
      mq.addEventListener("change", function (e) { e.matches ? pause() : play(); });
    }
  }

  // ── Page Hero Expand/Collapse ─────────────────────────────────────────────
  document.querySelectorAll(".page-hero__expand").forEach(function (btn) {
    var section = btn.closest(".page-hero");
    if (!section) return;

    btn.addEventListener("click", function () {
      var isExpanded = section.classList.contains("page-hero--expanded");
      var label = btn.querySelector(".page-hero__expand-label");

      if (!isExpanded) {
        var h = section.offsetHeight;
        section.style.setProperty("--locked-height", h + "px");
        section.classList.add("page-hero--locked");
        section.classList.add("page-hero--fading");
        setTimeout(function () {
          section.classList.add("page-hero--expanded");
          btn.setAttribute("aria-expanded", "true");
          btn.setAttribute("aria-label", "Collapse photo");
          if (label) label.textContent = "Collapse";
        }, 180);
      } else {
        section.classList.remove("page-hero--expanded");
        btn.setAttribute("aria-expanded", "false");
        btn.setAttribute("aria-label", "View full-size photo");
        if (label) label.textContent = "View full size";
        setTimeout(function () {
          section.classList.remove("page-hero--fading");
          section.classList.remove("page-hero--locked");
          section.style.removeProperty("--locked-height");
        }, 420);
      }
    });
  });

  // ── Hero Video Expand/Collapse ────────────────────────────────────────────
  var heroExpandBtn = document.getElementById("heroVideoExpand");
  var heroSection   = heroExpandBtn && heroExpandBtn.closest(".hero");

  if (heroExpandBtn && heroSection) {
    heroExpandBtn.addEventListener("click", function () {
      var isExpanded = heroSection.classList.contains("hero--expanded");
      var label = heroExpandBtn.querySelector(".hero__video-expand-label");

      if (!isExpanded) {
        // Fade content out, then expand
        heroSection.classList.add("hero--fading");
        setTimeout(function () {
          heroSection.classList.add("hero--expanded");
          heroExpandBtn.setAttribute("aria-expanded", "true");
          heroExpandBtn.setAttribute("aria-label", "Collapse video");
          if (label) label.textContent = "Collapse";
        }, 180);
      } else {
        // Collapse grid first, then fade content back in
        heroSection.classList.remove("hero--expanded");
        heroExpandBtn.setAttribute("aria-expanded", "false");
        heroExpandBtn.setAttribute("aria-label", "View full-size video");
        if (label) label.textContent = "View full size";
        setTimeout(function () {
          heroSection.classList.remove("hero--fading");
        }, 420);
      }
    });
  }

  // ── Video Modal ───────────────────────────────────────────────────────────
  // Opens any [data-video-id] thumbnail in a 16:9 modal at max 1200px.
  var videoModal   = document.getElementById("videoModal");
  var videoFrame   = document.getElementById("videoModalFrame");
  var videoClose   = document.getElementById("videoModalClose");
  var videoBackdrop = document.getElementById("videoModalBackdrop");

  if (videoModal && videoFrame) {
    function openVideoModal(id) {
      videoFrame.src = "https://www.youtube.com/embed/" + id + "?autoplay=1&rel=0";
      videoModal.hidden = false;
      document.body.style.overflow = "hidden";
      if (videoClose) videoClose.focus();
    }

    function closeVideoModal() {
      videoModal.hidden = true;
      videoFrame.src = "";
      document.body.style.overflow = "";
    }

    document.querySelectorAll("[data-video-id]").forEach(function (btn) {
      btn.addEventListener("click", function () { openVideoModal(btn.getAttribute("data-video-id")); });
    });

    if (videoClose) videoClose.addEventListener("click", closeVideoModal);
    if (videoBackdrop) videoBackdrop.addEventListener("click", closeVideoModal);

    document.addEventListener("keydown", function (e) {
      if (!videoModal.hidden && e.key === "Escape") { e.preventDefault(); closeVideoModal(); }
    });
  }

  // ── Job Application Modal ────────────────────────────────────────────────
  // Opens from any [data-open-apply-modal] button on the Careers page.
  // Reads data-position-name and injects it into the heading + hidden input.
  var applyModal = document.getElementById("applyModal");
  if (applyModal) {
    var applyPanel       = applyModal.querySelector(".modal__panel");
    var applyDisplayPos  = applyModal.querySelector("[data-apply-display-position]");
    var applyHiddenPos   = applyModal.querySelector("[data-apply-hidden-position]");
    var applyLastTrigger = null;

    var APPLY_FOCUSABLE = [
      "a[href]", "input:not([disabled]):not([type='hidden'])",
      "select:not([disabled])", "textarea:not([disabled])",
      "button:not([disabled])", "[tabindex]:not([tabindex='-1'])"
    ].join(",");

    function openApplyModal(trigger) {
      applyLastTrigger = trigger;
      var pos = trigger.getAttribute("data-position-name") || "this position";
      if (applyDisplayPos) applyDisplayPos.textContent = pos;
      if (applyHiddenPos)  applyHiddenPos.value = pos;

      applyModal.hidden = false;
      document.body.classList.add("modal-open");

      window.setTimeout(function () {
        var first = applyPanel.querySelector("input:not([type='hidden']):not([name='bot-field'])");
        if (first) first.focus();
      }, 20);
    }

    function closeApplyModal() {
      if (applyModal.hidden) return;
      applyModal.hidden = true;
      document.body.classList.remove("modal-open");
      if (applyLastTrigger) { applyLastTrigger.focus(); applyLastTrigger = null; }
    }

    // Openers
    document.querySelectorAll("[data-open-apply-modal]").forEach(function (btn) {
      btn.addEventListener("click", function () { openApplyModal(btn); });
    });

    // Closers — backdrop + X + Cancel
    applyModal.querySelectorAll("[data-apply-modal-close]").forEach(function (el) {
      el.addEventListener("click", closeApplyModal);
    });

    // Escape + focus trap
    document.addEventListener("keydown", function (e) {
      if (applyModal.hidden) return;
      if (e.key === "Escape") { e.preventDefault(); closeApplyModal(); return; }
      if (e.key !== "Tab") return;
      var focusables = Array.prototype.slice.call(
        applyPanel.querySelectorAll(APPLY_FOCUSABLE)
      ).filter(function (el) { return el.offsetParent !== null; });
      if (!focusables.length) return;
      var first = focusables[0], last = focusables[focusables.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    });
  }

  // ── PDF Viewer ────────────────────────────────────────────────────────────
  // Full-screen modal viewer for floor plan PDFs.
  // PDF.js is lazy-loaded from cdnjs on first open to keep the initial
  // page weight down — it's only needed if the user clicks "View floor plan".
  var pdfViewer = document.getElementById("pdfViewer");
  if (pdfViewer) {
    var pdfPages   = document.getElementById("pdfPages");
    var pdfTitle   = pdfViewer.querySelector(".pdfv__title");
    var pdfDl      = pdfViewer.querySelector(".pdfv__download");
    var pdfPrint   = pdfViewer.querySelector(".pdfv__print");
    var pdfClose   = pdfViewer.querySelector(".pdfv__close");
    var pdfZoomIn  = pdfViewer.querySelector(".pdfv__zoom-in");
    var pdfZoomOut = pdfViewer.querySelector(".pdfv__zoom-out");
    var pdfZoomLbl = pdfViewer.querySelector(".pdfv__zoom-label");

    var ZOOM_MIN  = 0.5, ZOOM_MAX = 3.0, ZOOM_STEP = 0.25;
    var pdfScale  = 1.0;   // default render scale — 100%
    var curPdf    = null;
    var curUrl    = null;
    var pdfJsReady   = false;
    var pdfJsLoading = false;
    var pdfJsCbs     = [];
    var pdfTrigger   = null;

    var PDFJS_VER = "3.11.174";
    var PDFJS_CDN = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/" + PDFJS_VER;

    // Keep zoom label and ± buttons in sync
    function syncZoom() {
      if (pdfZoomLbl) pdfZoomLbl.textContent = Math.round(pdfScale * 100) + "%";
      if (pdfZoomIn)  pdfZoomIn.disabled  = pdfScale >= ZOOM_MAX;
      if (pdfZoomOut) pdfZoomOut.disabled = pdfScale <= ZOOM_MIN;
    }

    // Render every page of a PDFDocumentProxy into #pdfPages
    function renderPages(pdf, sc) {
      pdfPages.innerHTML = "";
      // Create containers in document order first so pages always appear correctly
      var containers = [];
      for (var p = 0; p < pdf.numPages; p++) {
        var div = document.createElement("div");
        div.className = "pdfv__page";
        pdfPages.appendChild(div);
        containers.push(div);
      }
      // Render sequentially (each page waits for the previous canvas to draw)
      var chain = Promise.resolve();
      containers.forEach(function (container, idx) {
        chain = chain.then(function () {
          return pdf.getPage(idx + 1).then(function (page) {
            var vp  = page.getViewport({ scale: sc });
            var cvs = document.createElement("canvas");
            cvs.width  = vp.width;
            cvs.height = vp.height;
            container.appendChild(cvs);
            return page.render({ canvasContext: cvs.getContext("2d"), viewport: vp }).promise;
          });
        });
      });
      return chain;
    }

    function showMsg(html) {
      pdfPages.innerHTML = '<div class="pdfv__msg">' + html + "</div>";
    }

    // Lazy-load PDF.js, calling cb(err) when done
    function ensurePdfJs(cb) {
      if (pdfJsReady) { cb(); return; }
      pdfJsCbs.push(cb);
      if (pdfJsLoading) return;
      pdfJsLoading = true;
      var s = document.createElement("script");
      s.src = PDFJS_CDN + "/pdf.min.js";
      s.onload = function () {
        window.pdfjsLib.GlobalWorkerOptions.workerSrc = PDFJS_CDN + "/pdf.worker.min.js";
        pdfJsReady = true; pdfJsLoading = false;
        var cbs = pdfJsCbs.slice(); pdfJsCbs = [];
        cbs.forEach(function (fn) { fn(); });
      };
      s.onerror = function () {
        pdfJsLoading = false;
        var cbs = pdfJsCbs.slice(); pdfJsCbs = [];
        cbs.forEach(function (fn) { fn(true); });
      };
      document.head.appendChild(s);
    }

    function openViewer(url, title, trigger) {
      pdfTrigger = trigger || null;
      curUrl = url;

      if (pdfTitle) pdfTitle.textContent = title || "Floor Plan";
      if (pdfDl) {
        pdfDl.href = url;
        pdfDl.setAttribute("download", (title || "Floor Plan").replace(/\s+/g, "-") + ".pdf");
      }

      showMsg('<div class="pdfv__spinner"></div><span>Loading floor plan…</span>');
      pdfViewer.hidden = false;
      document.body.style.overflow = "hidden";
      if (pdfClose) pdfClose.focus();
      syncZoom();

      ensurePdfJs(function (err) {
        if (err || !window.pdfjsLib) {
          showMsg(
            '<span class="pdfv__msg--err">Could not load the PDF viewer.</span>' +
            '<a href="' + url + '" class="btn btn--outline" target="_blank" rel="noopener">Open PDF directly \u2197</a>'
          );
          return;
        }
        window.pdfjsLib.getDocument(url).promise.then(function (pdf) {
          curPdf = pdf;
          return renderPages(pdf, pdfScale);
        }).then(function () {
          syncZoom();
          var stage = pdfViewer.querySelector(".pdfv__stage");
          if (stage) stage.scrollTop = 0;
        }).catch(function () {
          showMsg(
            '<span class="pdfv__msg--err">Could not load this PDF.</span>' +
            '<a href="' + url + '" class="btn btn--outline" target="_blank" rel="noopener">Open directly \u2197</a>'
          );
        });
      });
    }

    function closeViewer() {
      pdfViewer.hidden = true;
      document.body.style.overflow = "";
      curPdf = null; curUrl = null;
      pdfPages.innerHTML = "";
      if (pdfTrigger) { pdfTrigger.focus(); pdfTrigger = null; }
    }

    // Wire up any [data-pdf-url] trigger (thumbnails, "View floor plan" links, etc.)
    document.querySelectorAll("[data-pdf-url]").forEach(function (el) {
      el.addEventListener("click", function (e) {
        e.preventDefault();
        openViewer(
          el.getAttribute("data-pdf-url"),
          el.getAttribute("data-pdf-title") || "Floor Plan",
          el
        );
      });
    });

    if (pdfClose) pdfClose.addEventListener("click", closeViewer);

    // Click outside the panel (on the backdrop) closes
    pdfViewer.addEventListener("click", function (e) {
      if (e.target === pdfViewer) closeViewer();
    });

    document.addEventListener("keydown", function (e) {
      if (!pdfViewer.hidden && e.key === "Escape") { e.preventDefault(); closeViewer(); }
    });

    if (pdfZoomIn) pdfZoomIn.addEventListener("click", function () {
      if (!curPdf || pdfScale >= ZOOM_MAX) return;
      pdfScale = Math.min(ZOOM_MAX, Math.round((pdfScale + ZOOM_STEP) * 100) / 100);
      syncZoom();
      renderPages(curPdf, pdfScale);
    });

    if (pdfZoomOut) pdfZoomOut.addEventListener("click", function () {
      if (!curPdf || pdfScale <= ZOOM_MIN) return;
      pdfScale = Math.max(ZOOM_MIN, Math.round((pdfScale - ZOOM_STEP) * 100) / 100);
      syncZoom();
      renderPages(curPdf, pdfScale);
    });

    // Print — open the PDF in a hidden iframe and trigger the browser print dialog
    if (pdfPrint) pdfPrint.addEventListener("click", function () {
      if (!curUrl) return;
      var iframe = document.createElement("iframe");
      iframe.style.cssText = "position:fixed;top:-9999px;left:-9999px;width:1px;height:1px;";
      iframe.src = curUrl;
      document.body.appendChild(iframe);
      iframe.addEventListener("load", function () {
        try { iframe.contentWindow.focus(); iframe.contentWindow.print(); }
        catch (e) { window.open(curUrl, "_blank"); }
        setTimeout(function () { if (iframe.parentNode) iframe.parentNode.removeChild(iframe); }, 3000);
      });
    });
  }

  // ── Closing Gaps flywheel — JS sticky + scroll spy + hover active states ──
  // position:sticky is broken when html/body have overflow-x:hidden, so we
  // implement sticky manually: measure the section bounds on scroll and toggle
  // position:fixed on the flywheel, with a ghost placeholder holding the column.
  var flywheelLayout  = document.querySelector(".closing-gaps-layout");
  var flywheelEl      = document.querySelector(".closing-gaps-flywheel");
  var flywheelSection = flywheelEl && flywheelEl.closest("section");

  if (flywheelLayout && flywheelEl && flywheelSection) {
    var stepCards = Array.prototype.slice.call(
      flywheelLayout.querySelectorAll(".step-card[data-step]")
    );

    // Create invisible ghost that keeps the column width while flywheel is fixed
    var ghost = document.createElement("div");
    ghost.className = "closing-gaps-flywheel-ghost";
    flywheelEl.parentNode.insertBefore(ghost, flywheelEl);
    ghost.style.display = "none";

    var NAV_H = 88; // px below nav — keep in sync with CSS .is-sticky top value
    var isSticky = false;
    var stepsEl = flywheelLayout.querySelector(".closing-gaps-steps");

    function syncSticky() {
      // Skip on mobile where layout is single-column
      if (window.innerWidth <= 780) {
        if (isSticky) unstick();
        return;
      }

      var flywheelH  = flywheelEl.offsetHeight;
      var sectionRect = flywheelSection.getBoundingClientRect();
      var naturalTop  = isSticky ? ghost.getBoundingClientRect().top : flywheelEl.getBoundingClientRect().top;

      // Section has scrolled above NAV_H — time to stick
      var shouldStick = naturalTop <= NAV_H && sectionRect.bottom > 0;

      if (shouldStick && !isSticky) {
        // Snapshot column left + width before going fixed
        var col = flywheelEl.getBoundingClientRect();
        ghost.style.width   = flywheelEl.offsetWidth + "px";
        ghost.style.height  = flywheelH + "px";
        ghost.style.display = "block";
        flywheelEl.style.width = col.width + "px";
        flywheelEl.style.left  = col.left + "px";
        flywheelEl.classList.add("is-sticky");
        isSticky = true;
      } else if (!shouldStick && isSticky) {
        unstick();
        return;
      }

      if (isSticky) {
        // Normally pinned at NAV_H, but once the section's bottom edge starts
        // passing through, ride the flywheel up with it so it exits with the section
        var idealTop = NAV_H;
        var sectionBottom = sectionRect.bottom; // viewport-relative bottom of section
        if (sectionBottom < NAV_H + flywheelH) {
          // Section bottom is above where the flywheel bottom would be — ride it up
          idealTop = sectionBottom - flywheelH;
        }
        flywheelEl.style.top = idealTop + "px";
      }
    }

    function unstick() {
      flywheelEl.classList.remove("is-sticky");
      flywheelEl.style.width = "";
      flywheelEl.style.left  = "";
      flywheelEl.style.top   = "";
      ghost.style.display = "none";
      isSticky = false;
    }

    // ── Active step ─────────────────────────────────────────────────────────
    function setActiveStep(n) {
      stepCards.forEach(function (card) {
        card.classList.toggle("is-active", card.getAttribute("data-step") === String(n));
      });
      for (var i = 1; i <= 5; i++) {
        var node = document.getElementById("flywheel-node-" + i);
        if (node) node.classList.toggle("is-active", i === n);
      }
    }

    // ── Scroll spy ──────────────────────────────────────────────────────────
    var scrollSpyActive = 0;
    var hovering = false;

    function triggerScrollSpy() {
      if (hovering) return;
      var midY = window.innerHeight / 2;
      var closest = null;
      var closestDist = Infinity;
      stepCards.forEach(function (card) {
        var rect = card.getBoundingClientRect();
        var cardMid = rect.top + rect.height / 2;
        var dist = Math.abs(cardMid - midY);
        if (dist < closestDist) { closestDist = dist; closest = card; }
      });
      if (closest) {
        var n = parseInt(closest.getAttribute("data-step"), 10);
        if (n !== scrollSpyActive) { scrollSpyActive = n; setActiveStep(n); }
      }
    }

    // ── Hover ───────────────────────────────────────────────────────────────
    stepCards.forEach(function (card) {
      card.addEventListener("mouseenter", function () {
        hovering = true;
        setActiveStep(parseInt(card.getAttribute("data-step"), 10));
      });
      card.addEventListener("mouseleave", function () {
        hovering = false;
        triggerScrollSpy();
      });
    });

    // ── Wire up scroll + resize ─────────────────────────────────────────────
    function onScroll() {
      syncSticky();
      triggerScrollSpy();
    }

    window.addEventListener("scroll",  onScroll,    { passive: true });
    window.addEventListener("resize",  function () {
      if (isSticky) unstick(); // recalculate on resize
      syncSticky();
    }, { passive: true });

    // Initialise
    setActiveStep(1);
    syncSticky();
  }

  // ── "Try It, You'll Like It" toast ───────────────────────────────────────
  // Shows once to new visitors (no prior visit in localStorage).
  // Dismissed state is persisted so it never reappears.
  var toast     = document.getElementById("tryitToast");
  var toastClose = document.getElementById("tryitClose");
  var TOAST_KEY  = "ae_tryit_dismissed";
  var TOAST_DELAY = 4000; // ms before sliding in

  if (toast && !localStorage.getItem(TOAST_KEY)) {
    // Remove `hidden` attr so it's in the layout (but still off-screen via CSS)
    toast.removeAttribute("hidden");

    var toastTimer = setTimeout(function () {
      toast.classList.add("tryit-toast--visible");
    }, TOAST_DELAY);

    function dismissToast() {
      toast.classList.remove("tryit-toast--visible");
      toast.classList.add("tryit-toast--dismissing");
      localStorage.setItem(TOAST_KEY, "1");
      clearTimeout(toastTimer);
      // Remove from DOM after transition completes
      toast.addEventListener("transitionend", function handler() {
        toast.removeEventListener("transitionend", handler);
        toast.setAttribute("hidden", "");
      });
    }

    if (toastClose) toastClose.addEventListener("click", dismissToast);

    // Dismiss if user navigates to schedule a tour or contacts us — they engaged
    toast.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", function () {
        localStorage.setItem(TOAST_KEY, "1");
      });
    });

    // Dismiss on Escape
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && toast.classList.contains("tryit-toast--visible")) {
        dismissToast();
      }
    });
  }

  // ── Cookie Consent Banner ─────────────────────────────────────────────────
  // GA4, GTM, and Meta Pixel are intentionally NOT loaded in the HTML.
  // They are only injected here after the user accepts cookies.
  // This ensures compliance with consent requirements before any tracking fires.
  //
  // To activate tracking, set your GTM container ID below:
  var GTM_CONTAINER_ID = "";   // e.g. "GTM-XXXXXXX"

  var COOKIE_KEY    = "ae_cookie_consent"; // "accepted" | "declined"
  var cookieBanner  = document.getElementById("cookieBanner");
  var cookieAccept  = document.getElementById("cookieAccept");
  var cookieDecline = document.getElementById("cookieDecline");

  function loadAnalytics() {
    if (!GTM_CONTAINER_ID) return;
    (function(w,d,s,l,i){
      w[l]=w[l]||[];
      w[l].push({"gtm.start": new Date().getTime(), event:"gtm.js"});
      var f=d.getElementsByTagName(s)[0],
          j=d.createElement(s),
          dl=l!="dataLayer"?"&l="+l:"";
      j.async=true;
      j.src="https://www.googletagmanager.com/gtm.js?id="+i+dl;
      f.parentNode.insertBefore(j,f);
    })(window,document,"script","dataLayer",GTM_CONTAINER_ID);
  }

  function clearNonConsentCookies() {
    // Wipe all cookies except the consent key itself
    var cookies = document.cookie.split(";");
    var domains = [location.hostname, "." + location.hostname];
    var paths   = ["/", location.pathname];
    cookies.forEach(function(c) {
      var name = c.split("=")[0].trim();
      if (!name) return;
      // Attempt deletion across common domain/path combinations
      domains.forEach(function(d) {
        paths.forEach(function(p) {
          document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=" + p + ";domain=" + d;
        });
      });
      // Also clear without explicit domain (catches first-party cookies)
      paths.forEach(function(p) {
        document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=" + p;
      });
    });
  }

  function hideBanner(onHidden) {
    cookieBanner.classList.remove("is-visible");
    cookieBanner.addEventListener("transitionend", function handler() {
      cookieBanner.removeEventListener("transitionend", handler);
      cookieBanner.setAttribute("hidden", "");
      if (typeof onHidden === "function") onHidden();
    });
  }

  function showBanner() {
    cookieBanner.removeAttribute("hidden");
    setTimeout(function () {
      cookieBanner.classList.add("is-visible");
    }, 50);
  }

  if (cookieBanner) {
    // Delegate clicks on accept/decline to the banner element itself,
    // so it works whether triggered on first load or via preferences button
    cookieBanner.addEventListener("click", function (e) {
      if (e.target.id === "cookieAccept") {
        localStorage.setItem(COOKIE_KEY, "accepted");
        if (cookieAccept)  cookieAccept.classList.remove("is-active");
        if (cookieDecline) cookieDecline.classList.remove("is-active");
        hideBanner(function () {
          var accBtn = document.getElementById("cookieAccept");
          if (accBtn) accBtn.textContent = "Accepted ✓";
        });
        loadAnalytics();
      } else if (e.target.id === "cookieDecline") {
        localStorage.setItem(COOKIE_KEY, "declined");
        if (cookieAccept)  cookieAccept.classList.remove("is-active");
        if (cookieDecline) cookieDecline.classList.remove("is-active");
        hideBanner(function () {
          var decBtn = document.getElementById("cookieDecline");
          if (decBtn) decBtn.textContent = "Declined";
        });
        clearNonConsentCookies();
        try { sessionStorage.removeItem("ae_attribution"); } catch (e) {}
      }
    });

    var existing = localStorage.getItem(COOKIE_KEY);
    if (existing === "accepted") {
      loadAnalytics();
    } else if (!existing) {
      setTimeout(showBanner, 800);
    }
    // If "declined", do nothing — no banner, no analytics
  }

  // "Cookie Preferences" footer button — re-shows banner with current selection indicated
  var cookiePrefBtn = document.getElementById("cookiePreferences");
  if (cookiePrefBtn && cookieBanner) {
    cookiePrefBtn.addEventListener("click", function () {
      var current = localStorage.getItem(COOKIE_KEY);
      // Re-query in case references are stale, then reset labels and mark current selection
      var accBtn = document.getElementById("cookieAccept");
      var decBtn = document.getElementById("cookieDecline");
      if (accBtn) { accBtn.textContent  = current === "accepted" ? "Accepted" : "Accept";  accBtn.classList.toggle("is-active",  current === "accepted"); }
      if (decBtn) { decBtn.textContent  = current === "declined" ? "Declined" : "Decline"; decBtn.classList.toggle("is-active",  current === "declined"); }
      showBanner();
    });
  }

  // ── Attribution capture ────────────────────────────────────────────────────
  // Reads UTM params + referrer on every page load.
  // If UTMs are present in the URL, they are written to sessionStorage so they
  // survive navigation (e.g. user lands on homepage from an ad, then navigates
  // to /schedule-a-tour/ — params are preserved).
  // On any page that contains a tracked form, hidden inputs are injected with
  // the stored values so attribution data is submitted alongside the lead.
  // ──────────────────────────────────────────────────────────────────────────
  (function () {
    var ATTR_KEY = "ae_attribution";

    // Don't capture anything if the user has declined cookie consent
    if (localStorage.getItem(COOKIE_KEY) === "declined") return;

    var TRACKED_FORMS = [
      "contact",
      "schedule-tour",
      "floor-plan-inquiry"
    ];

    // ── 1. Read UTMs from URL and persist to sessionStorage ──────────────────
    var params  = new URLSearchParams(window.location.search);
    var utmKeys = ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term"];
    var fresh   = {};
    var hasUtms = false;

    utmKeys.forEach(function (k) {
      if (params.get(k)) {
        fresh[k] = params.get(k);
        hasUtms = true;
      }
    });

    // Always capture landing page and referrer on the first touch
    var stored = {};
    try {
      stored = JSON.parse(sessionStorage.getItem(ATTR_KEY) || "{}");
    } catch (e) { stored = {}; }

    // If fresh UTMs are present, they win (new campaign click overrides session)
    // Otherwise keep whatever was stored from the first touch this session
    var attr = hasUtms ? fresh : stored;

    // Landing page: first URL seen this session wins
    if (!stored.landing_page) {
      attr.landing_page = window.location.href;
    } else {
      attr.landing_page = stored.landing_page;
    }

    // Referrer: first external referrer wins (ignore same-domain navigation)
    if (!stored.referrer && document.referrer) {
      try {
        var refHost = new URL(document.referrer).hostname;
        if (refHost !== window.location.hostname) {
          attr.referrer = document.referrer;
        }
      } catch (e) {}
    } else {
      attr.referrer = stored.referrer || "";
    }

    // Current page always updated so we know the form's page
    attr.form_page = window.location.href;

    try {
      sessionStorage.setItem(ATTR_KEY, JSON.stringify(attr));
    } catch (e) {}

    // ── 2. Inject hidden attribution fields into tracked forms ───────────────
    var fieldMap = {
      utm_source:   "cf_utm_source",
      utm_medium:   "cf_utm_medium",
      utm_campaign: "cf_utm_campaign",
      utm_content:  "cf_utm_content",
      utm_term:     "cf_utm_term",
      landing_page: "cf_landing_page",
      referrer:     "cf_referrer",
      form_page:    "cf_form_page"
    };

    function injectAttrFields(form) {
      Object.keys(fieldMap).forEach(function (attrKey) {
        var val = attr[attrKey];
        if (!val) return;
        // Don't double-inject
        if (form.querySelector('[name="' + fieldMap[attrKey] + '"]')) return;
        var inp = document.createElement("input");
        inp.type  = "hidden";
        inp.name  = fieldMap[attrKey];
        inp.value = val;
        form.appendChild(inp);
      });
    }

    TRACKED_FORMS.forEach(function (formName) {
      // Forms may be in the DOM already (contact, tour) or injected into a
      // modal later (floor-plan-inquiry). Handle both cases.
      var form = document.querySelector('form[name="' + formName + '"]');
      if (form) {
        injectAttrFields(form);
      }
    });

    // Re-run injection when the floor plan modal opens (form rendered in modal)
    var planModal = document.getElementById("planModal");
    if (planModal) {
      planModal.addEventListener("click", function () {
        var form = planModal.querySelector('form[name="floor-plan-inquiry"]');
        if (form) injectAttrFields(form);
      });
    }

  }());
  // ── End attribution capture ────────────────────────────────────────────────

  // ── Guided Tour ────────────────────────────────────────────────────────────
  // Persists across page loads via sessionStorage (key: ae_guided_tour).
  // Tour stops: url, name, hint shown on arrival.
  (function () {

    var TOUR_KEY = "ae_guided_tour";

    var STOPS = [
      {
        url: "/resident-centered-care/",
        name: "Resident-Centered Care",
        hint: "Read the page, then answer:",
        question: "What is the name of Azalea Estates’ proactive care model?",
        choices: ["Value-Based Care", "Azalea Care", "Senior Wellness Plan", "Integrated Care Path"],
        correct: 1,
        congrats: "That’s right — Azalea Care! A proactive model designed to reduce ER visits and keep families informed."
      },
      {
        url: "/living-options/",
        name: "Living Options",
        hint: "Read the page, then answer:",
        question: "How many living options are offered at Azalea Estates?",
        choices: ["Two", "Three", "Four", "Five"],
        correct: 1,
        congrats: "Correct! Independent Living, Assisted Living, and Respite Care — all on one campus."
      },
      {
        url: "/floor-plans/",
        name: "Floor Plans",
        hint: "Read the page, then answer:",
        question: "How many floor plan layouts are available?",
        choices: ["Three", "Four", "Five", "Six"],
        correct: 2,
        congrats: "Yes! Five layouts, from efficient studios to two-bedroom deluxe suites."
      },
      {
        url: "/gallery/",
        name: "Photo Tour",
        hint: "Try the virtual tour, then answer:",
        question: "How do you move between rooms in the virtual tour?",
        choices: ["Swipe left or right", "Click hotspots", "Press arrow keys", "Double-tap the screen"],
        correct: 1,
        congrats: "Nice! Click the hotspots to move between rooms — and drag or scroll to look around."
      },
      {
        url: "/schedule-a-tour/",
        name: "Schedule a Tour",
        hint: "Read the page, then answer:",
        question: "What complimentary experience is included with every tour?",
        choices: ["A gift basket", "A fitness class", "A meal", "A room upgrade"],
        correct: 2,
        congrats: "Exactly! Every tour includes a complimentary meal — the best way to experience the dining."
      }
    ];

    // ── State helpers ─────────────────────────────────────────────────────────
    function getState() {
      try { return JSON.parse(sessionStorage.getItem(TOUR_KEY)); } catch(e) { return null; }
    }
    function setState(s) {
      try { sessionStorage.setItem(TOUR_KEY, JSON.stringify(s)); } catch(e) {}
    }
    function clearState() {
      try { sessionStorage.removeItem(TOUR_KEY); } catch(e) {}
    }

    // ── DOM refs ──────────────────────────────────────────────────────────────
    var ribbon    = document.getElementById("tourRibbon");
    var stopName  = document.getElementById("tourStopName");
    var stepsEl   = document.getElementById("tourSteps");
    var counterEl = document.getElementById("tourCounter");
    var prevBtn   = document.getElementById("tourPrev");
    var nextBtn   = document.getElementById("tourNext");
    var exitBtn   = document.getElementById("tourExit");
    var progress  = document.getElementById("tourProgress");
    var startBtn  = document.getElementById("startGuidedTour");

    if (!ribbon) return;

    // ── Render ribbon for a given stop index ──────────────────────────────────
    function render(idx) {
      var stop = STOPS[idx];
      if (!stop) return;

      // Step dots
      if (stepsEl) {
        stepsEl.innerHTML = "";
        STOPS.forEach(function (s, i) {
          var dot = document.createElement("span");
          dot.className = "tour-dot" + (i < idx ? " is-done" : "") + (i === idx ? " is-active" : "");
          dot.setAttribute("aria-hidden", "true");
          stepsEl.appendChild(dot);
        });
      }

      // Name and link
      if (stopName) stopName.textContent = stop.name;
      if (counterEl) counterEl.textContent = "Stop " + (idx + 1) + " of " + STOPS.length;

      // Prev/next
      // Next is locked until the quiz is answered correctly on the current stop page.
      // Check if we're currently on this stop's page — if so, lock next.
      var curPathNow = window.location.pathname;
      var stopPathNow = stop.url;
      var onThisStop = curPathNow === stopPathNow ||
                       curPathNow.replace(/\/$/, "") === stopPathNow.replace(/\/$/, "");
      if (prevBtn) prevBtn.disabled = idx === 0;
      if (nextBtn) {
        nextBtn.innerHTML = idx === STOPS.length - 1
          ? '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="20 6 9 17 4 12"/></svg>'
          : '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="9 18 15 12 9 6"/></svg>';
        nextBtn.setAttribute("aria-label", idx === STOPS.length - 1 ? "Finish tour" : "Next stop");
        // Lock next until quiz answered — use data-locked so clicks still fire
        if (onThisStop) {
          nextBtn.setAttribute("data-locked", "true");
          nextBtn.setAttribute("aria-disabled", "true");
        } else {
          nextBtn.removeAttribute("data-locked");
          nextBtn.removeAttribute("aria-disabled");
        }
      }

      // Progress bar
      var pct = Math.round(((idx + 1) / STOPS.length) * 100);
      if (progress) progress.style.setProperty("--tour-progress", pct + "%");

      // Show ribbon
      ribbon.hidden = false;
      ribbon.offsetHeight; // reflow
      ribbon.classList.add("is-visible");
    }

    // ── Fireworks burst on correct answer ─────────────────────────────────────
    function launchFireworks(anchorEl) {
      var canvas = document.createElement("canvas");
      canvas.className = "tour-fireworks";
      canvas.setAttribute("aria-hidden", "true");
      document.body.appendChild(canvas);

      var rect = anchorEl.getBoundingClientRect();
      var cx = rect.left + rect.width / 2;
      var cy = rect.top + rect.height / 2;

      canvas.width  = window.innerWidth;
      canvas.height = window.innerHeight;
      canvas.style.cssText = "position:fixed;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:9999;";

      var ctx = canvas.getContext("2d");
      var particles = [];
      var colors = ["#faf6f1","#c5d4bd","#d89eab","#8a3a52","#213b14","#fff9c4","#ffd97d"];

      for (var i = 0; i < 80; i++) {
        var angle = (Math.random() * Math.PI * 2);
        var speed = 3 + Math.random() * 6;
        particles.push({
          x: cx, y: cy,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed - 2,
          alpha: 1,
          color: colors[Math.floor(Math.random() * colors.length)],
          r: 3 + Math.random() * 4,
          gravity: 0.12 + Math.random() * 0.08
        });
      }

      var start = null;
      function frame(ts) {
        if (!start) start = ts;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        particles.forEach(function (p) {
          p.x  += p.vx;
          p.y  += p.vy;
          p.vy += p.gravity;
          p.alpha -= 0.018;
          if (p.alpha <= 0) return;
          ctx.globalAlpha = p.alpha;
          ctx.fillStyle   = p.color;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
          ctx.fill();
        });
        ctx.globalAlpha = 1;
        if (ts - start < 1800) {
          requestAnimationFrame(frame);
        } else {
          canvas.remove();
        }
      }
      requestAnimationFrame(frame);
    }

    // ── Show persistent arrival hint with quiz ─────────────────────────────────
    function showArrivalHint(stop) {
      var existing = document.getElementById("tourStopIndicator");
      if (existing) existing.remove();

      var stopIdx = STOPS.indexOf(stop);

      var el = document.createElement("div");
      el.className = "tour-stop-indicator";
      el.id = "tourStopIndicator";
      el.setAttribute("role", "complementary");
      el.setAttribute("aria-label", "Tour stop " + (stopIdx + 1));

      // Build choices HTML
      var choicesHTML = '<div class="tour-hint__choices" role="group" aria-label="Answer choices">';
      stop.choices.forEach(function (choice, i) {
        choicesHTML += '<button class="tour-hint__choice" data-idx="' + i + '">' + choice + '</button>';
      });
      choicesHTML += '</div>';

      el.innerHTML =
        '<div class="tour-hint__header">' +
          '<span class="tour-stop-indicator__icon">📍</span>' +
          '<span class="tour-stop-indicator__text">' +
            '<span class="tour-stop-indicator__label">Stop ' + (stopIdx + 1) + ' of ' + STOPS.length + '</span>' +
            '<strong class="tour-hint__name">' + stop.name + '</strong>' +
          '</span>' +
          '<button class="tour-hint__dismiss" aria-label="Dismiss hint">✕</button>' +
        '</div>' +
        '<p class="tour-hint__prompt">' + stop.hint + '</p>' +
        '<p class="tour-hint__question">' + stop.question + '</p>' +
        choicesHTML +
        '<p class="tour-hint__feedback" aria-live="polite"></p>';
      // Nav row is injected only after correct answer — not present in initial markup

      document.body.appendChild(el);

      var dismissBtn  = el.querySelector(".tour-hint__dismiss");
      var feedback    = el.querySelector(".tour-hint__feedback");
      var choiceBtns  = Array.prototype.slice.call(el.querySelectorAll(".tour-hint__choice"));
      var answered    = false;

      dismissBtn.addEventListener("click", function () {
        el.classList.remove("is-visible");
        setTimeout(function () { el.remove(); }, 350);
      });

      choiceBtns.forEach(function (btn) {
        btn.addEventListener("click", function () {
          if (answered) return;
          var chosen = parseInt(btn.getAttribute("data-idx"), 10);
          answered = true;

          // Disable all buttons
          choiceBtns.forEach(function (b) { b.disabled = true; });

          if (chosen === stop.correct) {
            btn.classList.add("is-correct");
            el.classList.add("is-answered");
            feedback.textContent = "🎉 " + stop.congrats;
            feedback.className = "tour-hint__feedback tour-hint__feedback--correct";
            launchFireworks(el);

            // Unlock ribbon next button
            if (nextBtn) {
              nextBtn.removeAttribute("data-locked");
              nextBtn.removeAttribute("aria-disabled");
            }

            // Build and inject nav row dynamically (only after correct answer)
            var navRow = document.createElement("div");
            navRow.className = "tour-hint__nav";

            var isFirst  = stopIdx === 0;
            var isLast   = stopIdx === STOPS.length - 1;

            if (!isFirst) {
              var prevNavBtn = document.createElement("button");
              prevNavBtn.type = "button";
              prevNavBtn.className = "tour-hint__nav-btn tour-hint__nav-btn--prev";
              prevNavBtn.textContent = "← Previous";
              prevNavBtn.addEventListener("click", function () {
                var prev = stopIdx - 1;
                setState({ index: prev });
                window.location.href = STOPS[prev].url;
              });
              navRow.appendChild(prevNavBtn);
            }

            if (isLast) {
              var finishNavBtn = document.createElement("button");
              finishNavBtn.type = "button";
              finishNavBtn.className = "tour-hint__nav-btn tour-hint__nav-btn--finish";
              finishNavBtn.textContent = "Finish Tour ✓";
              finishNavBtn.addEventListener("click", function () {
                exitTour();
              });
              navRow.appendChild(finishNavBtn);
            } else {
              var nextNavBtn = document.createElement("button");
              nextNavBtn.type = "button";
              nextNavBtn.className = "tour-hint__nav-btn tour-hint__nav-btn--next";
              nextNavBtn.textContent = "Next stop →";
              nextNavBtn.addEventListener("click", function () {
                var next = stopIdx + 1;
                setState({ index: next });
                window.location.href = STOPS[next].url;
              });
              navRow.appendChild(nextNavBtn);
            }

            el.appendChild(navRow);
          } else {
            btn.classList.add("is-wrong");
            choiceBtns[stop.correct].classList.add("is-correct");
            feedback.textContent = "Not quite! The correct answer is highlighted above.";
            feedback.className = "tour-hint__feedback tour-hint__feedback--wrong";
            // Let them try again after a moment
            setTimeout(function () {
              answered = false;
              choiceBtns.forEach(function (b) {
                b.disabled = false;
                b.classList.remove("is-wrong", "is-correct");
              });
              feedback.textContent = "";
              feedback.className = "tour-hint__feedback";
            }, 2000);
          }
        });
      });

      // Animate in after a beat
      setTimeout(function () { el.classList.add("is-visible"); }, 300);
    }

    // ── Exit tour ─────────────────────────────────────────────────────────────
    function exitTour() {
      ribbon.classList.remove("is-visible");
      clearState();
      setTimeout(function () { ribbon.hidden = true; }, 350);
      var ind = document.getElementById("tourStopIndicator");
      if (ind) ind.remove();
    }

    // ── Navigate to a stop index ──────────────────────────────────────────────
    function goToStop(idx) {
      if (idx >= STOPS.length) { exitTour(); return; }
      if (idx < 0) idx = 0;
      setState({ index: idx });
      render(idx);
    }

    // ── Event listeners ───────────────────────────────────────────────────────
    if (startBtn) {
      startBtn.addEventListener("click", function () {
        setState({ index: 0 });
        // Navigate to first stop
        window.location.href = STOPS[0].url;
      });
    }

    if (prevBtn) {
      prevBtn.addEventListener("click", function () {
        var s = getState();
        if (!s) return;
        var prev = s.index - 1;
        setState({ index: prev });
        window.location.href = STOPS[prev].url;
      });
    }

    if (nextBtn) {
      nextBtn.addEventListener("click", function () {
        // If locked (quiz not yet answered), nudge the user
        if (nextBtn.getAttribute("data-locked") === "true") {
          var hint = document.getElementById("tourStopIndicator");
          if (hint) {
            // Shake the card
            hint.classList.remove("is-shaking");
            hint.offsetHeight; // reflow to restart animation
            hint.classList.add("is-shaking");
            hint.addEventListener("animationend", function () {
              hint.classList.remove("is-shaking");
            }, { once: true });

            // Pulse the correct answer button
            var s = getState();
            if (s !== null) {
              var correctIdx = STOPS[s.index] && STOPS[s.index].correct;
              var choiceBtns = hint.querySelectorAll(".tour-hint__choice");
              var correctBtn = choiceBtns[correctIdx];
              if (correctBtn) {
                correctBtn.classList.remove("is-pulsing");
                correctBtn.offsetHeight;
                correctBtn.classList.add("is-pulsing");
                correctBtn.addEventListener("animationend", function () {
                  correctBtn.classList.remove("is-pulsing");
                }, { once: true });
              }

              // Show a message in the feedback area
              var feedback = hint.querySelector(".tour-hint__feedback");
              if (feedback && !hint.classList.contains("is-answered")) {
                feedback.textContent = "Answer the question to continue!";
                feedback.className = "tour-hint__feedback tour-hint__feedback--wrong";
                setTimeout(function () {
                  if (!hint.classList.contains("is-answered")) {
                    feedback.textContent = "";
                    feedback.className = "tour-hint__feedback";
                  }
                }, 2500);
              }
            }
          }
          return;
        }

        var s = getState();
        if (!s) return;
        var next = s.index + 1;
        if (next >= STOPS.length) { exitTour(); return; }
        setState({ index: next });
        window.location.href = STOPS[next].url;
      });
    }

    if (exitBtn) exitBtn.addEventListener("click", exitTour);

    // ── On page load: check if a tour is active ───────────────────────────────
    var state = getState();
    if (state !== null) {
      var idx = state.index || 0;
      // Clamp to valid range
      if (idx < 0) idx = 0;
      if (idx >= STOPS.length) { clearState(); return; }

      render(idx);

      // If we're on the correct stop page, show the arrival hint
      var curPath = window.location.pathname;
      var stopPath = STOPS[idx].url;
      var onStop = curPath === stopPath || curPath === stopPath.replace(/\/$/, "") || curPath.replace(/\/$/, "") === stopPath.replace(/\/$/, "");
      if (onStop) {
        showArrivalHint(STOPS[idx]);
      }
    }

  }());
  // ── End Guided Tour ────────────────────────────────────────────────────────


})();
