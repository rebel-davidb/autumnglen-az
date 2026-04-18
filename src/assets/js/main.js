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

  // Simple gallery lightbox
  var lightbox = document.querySelector(".lightbox");
  if (lightbox) {
    var img = lightbox.querySelector("img");
    var closeBtn = lightbox.querySelector(".lightbox__close");
    document.querySelectorAll(".gallery-item").forEach(function (item) {
      item.addEventListener("click", function () {
        var large = item.dataset.full || item.querySelector("img").src;
        var alt = item.querySelector("img").alt || "";
        img.src = large;
        img.alt = alt;
        lightbox.classList.add("open");
        document.body.style.overflow = "hidden";
      });
    });
    function close() {
      lightbox.classList.remove("open");
      document.body.style.overflow = "";
      img.src = "";
    }
    closeBtn.addEventListener("click", close);
    lightbox.addEventListener("click", function (e) {
      if (e.target === lightbox) close();
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") close();
    });
  }

  // Active nav highlight based on path
  var here = location.pathname.replace(/\/$/, "") || "/";
  document.querySelectorAll(".nav a").forEach(function (a) {
    var p = new URL(a.href, location.origin).pathname.replace(/\/$/, "") || "/";
    if (p === here) a.classList.add("active");
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
