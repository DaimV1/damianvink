(function () {
  var root = document.documentElement;
  var stored = localStorage.getItem("theme");
  if (stored === "light" || stored === "dark") {
    root.setAttribute("data-theme", stored);
  }

  function resolvedTheme() {
    var current = root.getAttribute("data-theme");
    if (current === "light" || current === "dark") return current;
    return window.matchMedia("(prefers-color-scheme: light)").matches
      ? "light"
      : "dark";
  }

  function syncThemeColor(theme) {
    var color = theme === "light" ? "#f6f4ee" : "#0e1014";
    var metas = document.querySelectorAll('meta[name="theme-color"]');
    metas.forEach(function (meta) {
      meta.setAttribute("content", color);
    });
  }

  function apply(theme) {
    root.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
    syncThemeColor(theme);
  }

  document.addEventListener("DOMContentLoaded", function () {
    var year = document.getElementById("year");
    if (year) year.textContent = String(new Date().getFullYear());

    syncThemeColor(resolvedTheme());

    var btn = document.querySelector(".theme-toggle");
    if (btn) {
      btn.addEventListener("click", function () {
        apply(resolvedTheme() === "dark" ? "light" : "dark");
      });
    }

    var header = document.querySelector("header");
    if (header) {
      var onScroll = function () {
        header.classList.toggle("is-scrolled", window.scrollY > 8);
      };
      onScroll();
      window.addEventListener("scroll", onScroll, { passive: true });
    }

    var toggle = document.querySelector(".nav-toggle");
    var nav = document.getElementById("site-nav");
    if (toggle && nav) {
      var setOpen = function (open) {
        toggle.setAttribute("aria-expanded", open ? "true" : "false");
        nav.classList.toggle("is-open", open);
      };
      toggle.addEventListener("click", function () {
        setOpen(toggle.getAttribute("aria-expanded") !== "true");
      });
      document.addEventListener("keydown", function (e) {
        if (e.key === "Escape") setOpen(false);
      });
      nav.querySelectorAll("a").forEach(function (link) {
        link.addEventListener("click", function () {
          setOpen(false);
        });
      });
      window.addEventListener("resize", function () {
        if (window.matchMedia("(min-width: 961px)").matches) setOpen(false);
      });
    }

    var els = document.querySelectorAll(".reveal");
    if (!els.length) return;
    if (!("IntersectionObserver" in window)) {
      els.forEach(function (el) {
        el.classList.add("is-visible");
      });
      return;
    }
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -60px 0px" }
    );
    els.forEach(function (el) {
      io.observe(el);
    });
  });
})();
