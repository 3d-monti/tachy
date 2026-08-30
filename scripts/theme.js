(function () {
  "use strict";

  var storageKey = "tachy-theme";
  var root = document.documentElement;

  function storedTheme() {
    try {
      var value = localStorage.getItem(storageKey);
      return value === "light" || value === "dark" ? value : null;
    } catch (error) {
      return null;
    }
  }

  function systemTheme() {
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  }

  function effectiveTheme() {
    return root.dataset.theme || systemTheme();
  }

  function updateButtons() {
    var current = effectiveTheme();
    var language = root.lang === "fr" ? "fr" : "en";
    document.querySelectorAll("[data-theme-toggle]").forEach(function (button) {
      var nextLabel = current === "dark"
        ? (language === "fr" ? "CLAIR" : "LIGHT")
        : (language === "fr" ? "SOMBRE" : "DARK");
      button.textContent = nextLabel;
      button.setAttribute("aria-label", language === "fr"
        ? "Passer au thème " + (current === "dark" ? "clair" : "sombre")
        : "Switch to " + (current === "dark" ? "light" : "dark") + " theme");
      button.setAttribute("aria-pressed", String(current === "dark"));
    });
  }

  var initial = storedTheme();
  if (initial) {
    root.dataset.theme = initial;
  }

  document.addEventListener("DOMContentLoaded", function () {
    var desktopNavigation = window.matchMedia("(min-width: 54rem)");
    var syncNavigation = function () {
      document.querySelectorAll(".nav-menu").forEach(function (menu) {
        menu.open = desktopNavigation.matches;
      });
    };

    syncNavigation();
    desktopNavigation.addEventListener("change", syncNavigation);
    updateButtons();

    document.querySelectorAll("[data-theme-toggle]").forEach(function (button) {
      button.addEventListener("click", function () {
        var next = effectiveTheme() === "dark" ? "light" : "dark";
        root.dataset.theme = next;
        try {
          localStorage.setItem(storageKey, next);
        } catch (error) {
          // The selected theme still applies for the current page.
        }
        updateButtons();
      });
    });

    window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", function () {
      if (!storedTheme()) {
        updateButtons();
      }
    });
  });
}());
