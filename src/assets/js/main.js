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

  // ── Gallery lightbox — prev/next, captions, focus management (WCAG AA) ──
  var lightbox = document.querySelector(".lightbox");
  if (lightbox) {
    var lbImg      = lightbox.querySelector(".lightbox__img");
    var lbCaption  = lightbox.querySelector(".lightbox__caption");
    var lbCounter  = lightbox.querySelector(".lightbox__counter");
    var lbStatus   = lightbox.querySelector("#lightbox-status");
    var closeBtn   = lightbox.querySelector(".lightbox__close");
    var prevBtn    = lightbox.querySelector(".lightbox__prev");
    var nextBtn    = lightbox.querySelector(".lightbox__next");

    var items      = Array.prototype.slice.call(document.querySelectorAll(".gallery-item"));
    var current    = 0;
    var returnFocus = null;   // element to focus when lightbox closes

    // ── Helpers ─────────────────────────────────────────────────────────
    function mod(n, m) { return ((n % m) + m) % m; }  // always-positive modulo

    function show(index) {
      current = mod(index, items.length);
      var item = items[current];
      var src  = item.dataset.full || item.querySelector("img").src;
      var alt  = item.querySelector("img").alt || "";

      lbImg.src = src;
      lbImg.alt = alt;

      var captionText = alt;
      if (lbCaption) lbCaption.textContent = captionText;
      if (lbCounter) lbCounter.textContent = (current + 1) + " \u2044 " + items.length;

      // Announce to screen readers without reading the counter aloud
      if (lbStatus) lbStatus.textContent = "Photo " + (current + 1) + " of " + items.length + ". " + alt;

      // Update dialog label for AT
      lightbox.setAttribute("aria-label", "Photo viewer: " + (current + 1) + " of " + items.length);
    }

    function openLightbox(index) {
      returnFocus = document.activeElement;
      show(index);
      lightbox.classList.add("open");
      document.body.style.overflow = "hidden";
      // Move focus into the dialog (close button first per WCAG 2.4.3)
      closeBtn.focus();
    }

    function closeLightbox() {
      lightbox.classList.remove("open");
      document.body.style.overflow = "";
      lbImg.src = "";
      if (lbStatus) lbStatus.textContent = "";
      if (returnFocus && typeof returnFocus.focus === "function") returnFocus.focus();
      returnFocus = null;
    }

    // ── Gallery thumbnails — click + keyboard (Enter / Space) ────────────
    items.forEach(function (item, i) {
      item.addEventListener("click", function () { openLightbox(i); });
      item.addEventListener("keydown", function (e) {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          openLightbox(i);
        }
      });
    });

    // ── Controls ─────────────────────────────────────────────────────────
    closeBtn.addEventListener("click", closeLightbox);
    if (prevBtn) prevBtn.addEventListener("click", function () { show(current - 1); });
    if (nextBtn) nextBtn.addEventListener("click", function () { show(current + 1); });

    // Backdrop click closes
    lightbox.addEventListener("click", function (e) {
      if (e.target === lightbox) closeLightbox();
    });

    // ── Keyboard navigation ───────────────────────────────────────────────
    document.addEventListener("keydown", function (e) {
      if (!lightbox.classList.contains("open")) return;
      switch (e.key) {
        case "Escape":     closeLightbox();        break;
        case "ArrowLeft":  e.preventDefault(); show(current - 1); break;
        case "ArrowRight": e.preventDefault(); show(current + 1); break;
      }
    });

    // ── Focus trap — keeps Tab cycling within the dialog (WCAG 2.1.2) ───
    lightbox.addEventListener("keydown", function (e) {
      if (e.key !== "Tab") return;
      var focusable = Array.prototype.slice.call(
        lightbox.querySelectorAll("button:not([disabled])")
      );
      if (!focusable.length) return;
      var first = focusable[0];
      var last  = focusable[focusable.length - 1];
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

})();
