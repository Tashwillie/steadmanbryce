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

  /* ---------- Contact form → Zoho CRM (EU) ---------- */
  var form = document.getElementById("contactForm");
  var statusEl = document.getElementById("formStatus");

  function zohoValue(html, fieldName) {
    var named = new RegExp("name=['\"]" + fieldName + "['\"][^>]*value=['\"]([^'\"]*)['\"]", "i");
    var valued = new RegExp("value=['\"]([^'\"]*)['\"][^>]*name=['\"]" + fieldName + "['\"]", "i");
    var match = html.match(named) || html.match(valued);
    return match ? match[1] : "";
  }

  function zohoSettings() {
    var cfg = window.LSB_ZOHO || {};
    var html = cfg.sourceHtml || "";
    var fromHtml = {
      endpoint: (html.match(/action=['"]([^'"]+)['"]/i) || [])[1],
      xnQsjsdp: zohoValue(html, "xnQsjsdp"),
      xmIwtLD: zohoValue(html, "xmIwtLD"),
      actionType: zohoValue(html, "actionType")
    };
    return {
      endpoint: fromHtml.endpoint || cfg.endpoint || "https://crm.zoho.eu/crm/WebToLeadForm",
      xnQsjsdp: (fromHtml.xnQsjsdp || cfg.xnQsjsdp || "").trim(),
      xmIwtLD: (fromHtml.xmIwtLD || cfg.xmIwtLD || "").trim(),
      actionType: fromHtml.actionType || cfg.actionType || "TGVhZHM=",
      leadSource: cfg.leadSource || "Web Research",
      thanksPage: cfg.thanksPage || "https://stedmanbryce.com/thanks.html"
    };
  }

  function showFormError(message) {
    if (!statusEl) return;
    statusEl.hidden = false;
    statusEl.className = "form-status is-error";
    statusEl.textContent = message;
  }

  function splitName(fullName) {
    var parts = (fullName || "").trim().split(/\s+/);
    if (parts.length === 0 || (parts.length === 1 && !parts[0])) {
      return { first: "", last: "" };
    }
    if (parts.length === 1) return { first: "", last: parts[0] };
    return { first: parts[0], last: parts.slice(1).join(" ") };
  }

  var zoho = zohoSettings();

  if (form) {
    if (zoho.endpoint) form.action = zoho.endpoint;

    form.addEventListener("submit", function (e) {
      var honeypot = form.querySelector("[name='a_password']");
      if (honeypot && honeypot.value) {
        e.preventDefault();
        return;
      }

      var xn = (zoho.xnQsjsdp || "").trim();
      var xm = (zoho.xmIwtLD || "").trim();
      if (!xn || !xm) {
        e.preventDefault();
        showFormError("The contact form is not connected to Zoho yet. Please call 01273 569 396 or reach out on LinkedIn.");
        return;
      }

      var names = splitName(document.getElementById("contactName").value);
      var enquiry = document.getElementById("enquiryType").value;
      var message = document.getElementById("contactMessage").value.trim();

      document.getElementById("zohoXnQsjsdp").value = xn;
      document.getElementById("zohoXmIwtLD").value = xm;
      document.getElementById("zohoActionType").value = zoho.actionType || "TGVhZHM=";
      document.getElementById("zohoReturnURL").value = zoho.thanksPage;
      document.getElementById("zohoLeadSource").value = zoho.leadSource;
      document.getElementById("zohoFirstName").value = names.first.slice(0, 40);
      document.getElementById("zohoLastName").value = names.last.slice(0, 80);
      document.getElementById("zohoDescription").value =
        "Enquiry type: " + enquiry + "\n\n" + message;

      var btn = form.querySelector("[type='submit']");
      if (btn) {
        btn.disabled = true;
        btn.textContent = "Sending…";
      }
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
