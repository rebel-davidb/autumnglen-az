// ==========================================================================
// Azalea Estates — PDF Viewer
// Lazy-loads PDF.js from cdnjs, renders PDFs in a full-screen modal.
// Triggered by any element with data-pdf-url + data-pdf-title attributes.
//
// Supports: zoom in/out, multi-page scroll, print (new window), download,
//           keyboard Escape, backdrop click, focus-trap, WCAG AA.
// ==========================================================================
(function () {
  'use strict';

  // ── PDF.js CDN ──────────────────────────────────────────────────────────
  var PDFJS_SRC    = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
  var PDFJS_WORKER = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

  // ── State ───────────────────────────────────────────────────────────────
  var pdfJsReady   = false;
  var pdfJsLoading = false;
  var pdfJsQueue   = [];   // callbacks waiting for PDF.js
  var currentPdf   = null;
  var currentUrl   = '';
  var currentZoom  = 1.0;  // 1.0 = 100%
  var BASE_SCALE   = 1.5;  // render scale at 100% zoom
  var renderTick   = 0;    // cancels stale renders after zoom change
  var returnFocus  = null;

  // ── DOM refs (set after DOMContentLoaded) ───────────────────────────────
  var modal, stage, pages, titleEl, zoomEl, downloadBtn;
  var closeBtns, zoomInBtn, zoomOutBtn, printBtn;

  // ── Load PDF.js lazily ──────────────────────────────────────────────────
  function requirePdfJs(cb) {
    if (pdfJsReady)   { cb(); return; }
    if (pdfJsLoading) { pdfJsQueue.push(cb); return; }
    pdfJsLoading = true;
    pdfJsQueue.push(cb);

    var s = document.createElement('script');
    s.src = PDFJS_SRC;
    s.onload = function () {
      // Blob-URL trick: lets the CDN worker bypass same-origin restrictions
      var blob = new Blob(
        ['importScripts("' + PDFJS_WORKER + '")'],
        { type: 'text/javascript' }
      );
      window.pdfjsLib.GlobalWorkerOptions.workerSrc = URL.createObjectURL(blob);
      pdfJsReady   = true;
      pdfJsLoading = false;
      pdfJsQueue.forEach(function (fn) { fn(); });
      pdfJsQueue = [];
    };
    s.onerror = function () {
      pdfJsLoading = false;
      pdfJsQueue = [];
      showError('Could not load the PDF library. Please try again.');
    };
    document.head.appendChild(s);
  }

  // ── Open / close ────────────────────────────────────────────────────────
  function open(url, title) {
    returnFocus  = document.activeElement;
    currentUrl   = url;
    currentZoom  = 1.0;

    titleEl.textContent     = title || 'Document';
    downloadBtn.href        = url;
    downloadBtn.download    = url.split('/').pop();
    zoomEl.textContent      = '100%';

    pages.innerHTML = loading();
    modal.removeAttribute('hidden');
    document.body.style.overflow = 'hidden';
    closeBtns[0].focus();

    requirePdfJs(function () { renderPdf(url); });
  }

  function close() {
    modal.setAttribute('hidden', '');
    document.body.style.overflow = '';
    if (currentPdf) { try { currentPdf.destroy(); } catch (e) {} currentPdf = null; }
    renderTick++;
    if (returnFocus && typeof returnFocus.focus === 'function') returnFocus.focus();
    returnFocus = null;
  }

  // ── Render ──────────────────────────────────────────────────────────────
  function renderPdf(url) {
    var tick = ++renderTick;
    if (currentPdf) { try { currentPdf.destroy(); } catch (e) {} currentPdf = null; }

    window.pdfjsLib.getDocument(url).promise.then(function (pdf) {
      if (tick !== renderTick) { pdf.destroy(); return; }
      currentPdf = pdf;
      pages.innerHTML = '';
      updateZoomLabel();

      var seq = Promise.resolve();
      for (var i = 1; i <= pdf.numPages; i++) {
        seq = seq.then(renderPage.bind(null, pdf, i, tick));
      }
    }).catch(function () {
      if (tick === renderTick) showError(url);
    });
  }

  function renderPage(pdf, num, tick) {
    if (tick !== renderTick) return;
    return pdf.getPage(num).then(function (page) {
      if (tick !== renderTick) return;

      var scale    = currentZoom * BASE_SCALE;
      var vp       = page.getViewport({ scale: scale });
      var wrapper  = document.createElement('div');
      wrapper.className = 'pdfv__page';

      var canvas = document.createElement('canvas');
      canvas.width  = vp.width;
      canvas.height = vp.height;
      canvas.setAttribute('aria-label', 'Page ' + num);
      canvas.setAttribute('role', 'img');
      wrapper.appendChild(canvas);
      pages.appendChild(wrapper);

      return page.render({
        canvasContext: canvas.getContext('2d'),
        viewport:      vp
      }).promise;
    });
  }

  // ── Zoom ────────────────────────────────────────────────────────────────
  var ZOOM_STEPS = [0.5, 0.75, 1.0, 1.25, 1.5, 2.0, 2.5, 3.0];

  function changeZoom(direction) {
    var idx = nearestZoomIndex();
    var next = direction > 0
      ? Math.min(idx + 1, ZOOM_STEPS.length - 1)
      : Math.max(idx - 1, 0);
    currentZoom = ZOOM_STEPS[next];
    updateZoomLabel();

    // Re-render: record scroll ratio so we can restore position
    var scrollRatio = stage.scrollTop / (stage.scrollHeight || 1);
    pages.innerHTML = loading();
    if (currentPdf) {
      var pdf = currentPdf;
      var tick = ++renderTick;
      currentPdf = null;
      var seq = Promise.resolve();
      for (var i = 1; i <= pdf.numPages; i++) {
        seq = seq.then(renderPage.bind(null, pdf, i, tick));
      }
      seq.then(function () {
        currentPdf = pdf;
        stage.scrollTop = scrollRatio * stage.scrollHeight;
      });
    }
  }

  function nearestZoomIndex() {
    var best = 0, diff = Infinity;
    ZOOM_STEPS.forEach(function (z, i) {
      var d = Math.abs(z - currentZoom);
      if (d < diff) { diff = d; best = i; }
    });
    return best;
  }

  function updateZoomLabel() {
    zoomEl.textContent = Math.round(currentZoom * 100) + '%';
    zoomInBtn.disabled  = currentZoom >= ZOOM_STEPS[ZOOM_STEPS.length - 1];
    zoomOutBtn.disabled = currentZoom <= ZOOM_STEPS[0];
  }

  // ── Print ───────────────────────────────────────────────────────────────
  function printPdf() {
    var win = window.open(currentUrl, '_blank');
    if (win) { win.focus(); win.onload = function () { win.print(); }; }
  }

  // ── UI helpers ──────────────────────────────────────────────────────────
  function loading() {
    return '<div class="pdfv__msg"><div class="pdfv__spinner" aria-label="Loading…"></div><p>Loading…</p></div>';
  }
  function showError(url) {
    pages.innerHTML =
      '<div class="pdfv__msg pdfv__msg--err">' +
      '<p>The PDF could not be displayed.</p>' +
      '<a href="' + url + '" target="_blank" rel="noopener" class="btn btn--outline">Open PDF directly</a>' +
      '</div>';
  }

  // ── Focus trap ──────────────────────────────────────────────────────────
  function trapFocus(e) {
    if (modal.hasAttribute('hidden') || e.key !== 'Tab') return;
    var focusable = Array.from(
      modal.querySelectorAll('button:not([disabled]), a[href], [tabindex]:not([tabindex="-1"])')
    ).filter(function (el) { return el.offsetParent !== null; });
    if (!focusable.length) return;
    var first = focusable[0], last = focusable[focusable.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last)  { e.preventDefault(); first.focus(); }
  }

  // ── Init ────────────────────────────────────────────────────────────────
  function init() {
    modal       = document.getElementById('pdfViewer');
    if (!modal) return;

    stage       = modal.querySelector('.pdfv__stage');
    pages       = modal.querySelector('.pdfv__pages');
    titleEl     = modal.querySelector('.pdfv__title');
    zoomEl      = modal.querySelector('.pdfv__zoom-label');
    downloadBtn = modal.querySelector('.pdfv__download');
    zoomInBtn   = modal.querySelector('.pdfv__zoom-in');
    zoomOutBtn  = modal.querySelector('.pdfv__zoom-out');
    printBtn    = modal.querySelector('.pdfv__print');
    closeBtns   = modal.querySelectorAll('.pdfv__close');

    // Controls
    Array.from(closeBtns).forEach(function (b) { b.addEventListener('click', close); });
    zoomInBtn.addEventListener ('click', function () { changeZoom(+1); });
    zoomOutBtn.addEventListener('click', function () { changeZoom(-1); });
    printBtn.addEventListener  ('click', printPdf);

    // Backdrop click
    stage.addEventListener('click', function (e) {
      if (e.target === stage) close();
    });

    // Keyboard
    document.addEventListener('keydown', function (e) {
      if (modal.hasAttribute('hidden')) return;
      if (e.key === 'Escape') { e.preventDefault(); close(); }
      if ((e.key === '+' || e.key === '=') && (e.ctrlKey || e.metaKey)) { e.preventDefault(); changeZoom(+1); }
      if (e.key === '-' && (e.ctrlKey || e.metaKey)) { e.preventDefault(); changeZoom(-1); }
    });
    document.addEventListener('keydown', trapFocus);

    // Trigger: any element with data-pdf-url
    document.addEventListener('click', function (e) {
      var el = e.target.closest('[data-pdf-url]');
      if (!el) return;
      e.preventDefault();
      open(el.dataset.pdfUrl, el.dataset.pdfTitle || '');
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
