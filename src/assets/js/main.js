// Minimal progressive enhancement
(function () {
  // Mobile menu toggle
  var toggle = document.querySelector(".menu-toggle");
  var nav = document.querySelector(".nav");
  if (toggle && nav) {
    toggle.addEventListener("click", function () {
      var open = nav.classList.toggle("open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
      document.body.style.overflow = open ? "hidden" : "";
    });
    nav.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", function () {
        nav.classList.remove("open");
        toggle.setAttribute("aria-expanded", "false");
        document.body.style.overflow = "";
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
})();
