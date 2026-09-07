(function () {
  "use strict";

  function revealInView() {
    var nodes = document.querySelectorAll(".reveal, .reveal-fade, .reveal-scale, .reveal-line");
    if (!nodes.length) return;

    function show(el) {
      el.classList.add("is-visible");
    }

    if (!("IntersectionObserver" in window)) {
      nodes.forEach(show);
      return;
    }

    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            show(entry.target);
            observer.unobserve(entry.target);
          }
        });
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.08 }
    );

    nodes.forEach(function (el) {
      observer.observe(el);
    });

    window.setTimeout(function () {
      nodes.forEach(show);
    }, 1800);
  }

  function hasReact(el) {
    if (!el) return false;
    return Object.keys(el).some(function (key) {
      return key.indexOf("__react") === 0;
    });
  }

  function mobileMenu() {
    var menu = document.getElementById("mobile-menu");
    if (!menu) return;

    var toggle = document.querySelector('[aria-controls="mobile-menu"]');
    if (hasReact(toggle) || hasReact(menu)) return;
    var closer = menu.querySelector("button");
    var links = menu.querySelectorAll("a");

    function isOpen() {
      return menu.getAttribute("aria-hidden") === "false";
    }

    function setOpen(open) {
      menu.setAttribute("aria-hidden", open ? "false" : "true");
      menu.classList.toggle("invisible", !open);
      menu.classList.toggle("opacity-0", !open);
      menu.classList.toggle("visible", open);
      menu.classList.toggle("opacity-100", open);
      if (toggle) toggle.setAttribute("aria-expanded", open ? "true" : "false");
      document.body.style.overflow = open ? "hidden" : "";
      links.forEach(function (link) {
        link.tabIndex = open ? 0 : -1;
        link.classList.toggle("opacity-0", !open);
        link.classList.toggle("translate-y-4", !open);
        link.classList.toggle("opacity-100", open);
        link.classList.toggle("translate-y-0", open);
      });
    }

    if (toggle) {
      toggle.addEventListener("click", function (event) {
        event.preventDefault();
        setOpen(!isOpen());
      });
    }

    if (closer) {
      closer.addEventListener("click", function () {
        setOpen(false);
      });
    }

    links.forEach(function (link) {
      link.addEventListener("click", function () {
        setOpen(false);
      });
    });

    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape" && isOpen()) setOpen(false);
    });
  }

  function systemsView() {
    var items = document.querySelectorAll("ol li[data-index]");
    if (items.length < 2) return;
    if (hasReact(items[0].querySelector("button"))) return;

    items.forEach(function (item) {
      var button = item.querySelector("button");
      if (!button) return;
      button.addEventListener("click", function () {
        items.forEach(function (other) {
          var active = other === item;
          other.classList.toggle("opacity-100", active);
          other.classList.toggle("opacity-45", !active);
          other.classList.toggle("lg:opacity-40", !active);
          var note = other.querySelector("span.mt-6.block");
          if (note) {
            note.classList.toggle("opacity-100", active);
            note.classList.toggle("translate-y-0", active);
            note.classList.toggle("opacity-0", !active);
            note.classList.toggle("lg:opacity-0", !active);
            note.classList.toggle("translate-y-2", !active);
          }
          var pressed = other.querySelector("button");
          if (pressed) pressed.setAttribute("aria-pressed", active ? "true" : "false");
        });
      });
    });
  }

  function contactForm() {
    var form = document.querySelector("main form");
    if (!form || !form.querySelector('[name="email"]')) return;

    var cfg = window.LSB_ZOHO || {};
    var status = form.querySelector(".form-status");
    if (!status) {
      status = document.createElement("p");
      status.className = "form-status";
      status.setAttribute("role", "status");
      status.hidden = true;
      form.appendChild(status);
    }

    function showStatus(ok, message) {
      status.hidden = false;
      status.className = "form-status " + (ok ? "is-success" : "is-error");
      status.textContent = message;
    }

    function splitName(fullName) {
      var parts = (fullName || "").trim().split(/\s+/);
      if (!parts[0]) return { first: "", last: "" };
      if (parts.length === 1) return { first: "", last: parts[0] };
      return { first: parts[0], last: parts.slice(1).join(" ") };
    }

    form.addEventListener(
      "submit",
      function (event) {
        event.preventDefault();
        event.stopImmediatePropagation();

        var honeypot = form.querySelector('[name="website"]');
        if (honeypot && honeypot.value) return;

        var name = (form.querySelector('[name="name"]') || {}).value || "";
        var email = (form.querySelector('[name="email"]') || {}).value || "";
        var message = (form.querySelector('[name="message"]') || {}).value || "";
        var organisation = (form.querySelector('[name="organisation"]') || {}).value || "";
        var subject = (form.querySelector('[name="subject"]') || {}).value || "General enquiry";

        if (!name.trim() || !email.trim() || !message.trim()) {
          showStatus(false, "Please complete name, email and message.");
          return;
        }

        var xn = (cfg.xnQsjsdp || "").trim();
        var xm = (cfg.xmIwtLD || "").trim();
        if (!xn || !xm || !cfg.endpoint) {
          showStatus(false, "The contact form is not connected yet. Email louis@inkfishhomes.com or call 01273 569 396.");
          return;
        }

        var names = splitName(name);
        var zoho = document.createElement("form");
        zoho.method = "POST";
        zoho.action = cfg.endpoint;
        zoho.style.display = "none";

        function add(fieldName, value) {
          var input = document.createElement("input");
          input.type = "hidden";
          input.name = fieldName;
          input.value = value;
          zoho.appendChild(input);
        }

        add("xnQsjsdp", xn);
        add("xmIwtLD", xm);
        add("actionType", cfg.actionType || "TGVhZHM=");
        add("returnURL", cfg.thanksPage || "https://stedmanbryce.com/thanks.html");
        add("zc_gad", "");
        add("aG9uZXlwb3Q", "");
        add("Lead Source", cfg.leadSource || "Web Research");
        add("Tag", cfg.tag || "Website");
        add("First Name", names.first.slice(0, 40));
        add("Last Name", names.last.slice(0, 80));
        add("Email", email.trim());
        add(
          "Description",
          "[Website]\nSubject: " + subject + "\nOrganisation: " + organisation + "\n\n" + message.trim()
        );

        var btn = form.querySelector('[type="submit"]');
        if (btn) btn.disabled = true;
        document.body.appendChild(zoho);
        zoho.submit();
      },
      true
    );
  }

  function bootFallbacks() {
    revealInView();
    contactForm();
    window.setTimeout(function () {
      mobileMenu();
      systemsView();
    }, 1200);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", bootFallbacks);
  } else {
    bootFallbacks();
  }
})();
