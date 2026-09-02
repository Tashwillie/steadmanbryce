/* ==================================================================
   STEADMANBRYCE.COM — BEHAVIOUR
   Menu open/close, footer year, contact form, and showreel loading.
   ================================================================== */
(function () {
  "use strict";

  /* ---------- Overlay menu ---------- */
  var openBtn = document.getElementById("menuOpen");
  var closeBtn = document.getElementById("menuClose");
  var overlay = document.getElementById("overlayMenu");
  var lastFocused = null;

  function menuFocusable() {
    return overlay.querySelectorAll("a[href], button:not([disabled])");
  }

  function openMenu() {
    lastFocused = document.activeElement;
    overlay.classList.add("is-open");
    overlay.setAttribute("aria-hidden", "false");
    overlay.setAttribute("aria-modal", "true");
    openBtn.setAttribute("aria-expanded", "true");
    document.body.style.overflow = "hidden";
    closeBtn.focus();
  }

  function closeMenu() {
    overlay.classList.remove("is-open");
    overlay.setAttribute("aria-hidden", "true");
    overlay.removeAttribute("aria-modal");
    openBtn.setAttribute("aria-expanded", "false");
    document.body.style.overflow = "";
    if (lastFocused) lastFocused.focus();
  }

  if (openBtn && closeBtn && overlay) {
    openBtn.addEventListener("click", openMenu);
    closeBtn.addEventListener("click", closeMenu);
    overlay.addEventListener("click", function (e) {
      if (e.target.tagName === "A") closeMenu();
    });
    document.addEventListener("keydown", function (e) {
      if (!overlay.classList.contains("is-open")) return;
      if (e.key === "Escape") {
        closeMenu();
        return;
      }
      if (e.key !== "Tab") return;
      var items = menuFocusable();
      if (!items.length) return;
      var first = items[0];
      var last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    });
  }

  /* ---------- Footer year ---------- */
  var yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------- Contact form (CRM connection paused) ---------- */
  var form = document.getElementById("contactForm");
  var statusEl = document.getElementById("formStatus");
  if (form && statusEl) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      statusEl.hidden = false;
      statusEl.className = "form-status is-error";
      statusEl.textContent = "Please call 01273 569 396 or send a message on LinkedIn. The online form will open shortly.";
    });
  }

  /* ---------- Showreel: desktop only, skip on data saver / reduced motion ---------- */
  var video = document.querySelector(".reel-video");
  if (video) {
    var savesData = navigator.connection && navigator.connection.saveData;
    var reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    var isNarrow = window.matchMedia("(max-width: 880px)").matches;
    if (savesData || reducedMotion || isNarrow) {
      video.removeAttribute("autoplay");
      video.pause();
    } else {
      video.querySelectorAll("source").forEach(function (source) {
        if (source.dataset.src) source.src = source.dataset.src;
      });
      video.load();
      var play = video.play();
      if (play && typeof play.catch === "function") play.catch(function () {});
    }
  }
})();
