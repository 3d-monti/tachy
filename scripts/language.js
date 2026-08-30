(function () {
  "use strict";

  var storageKey = "tachy-language-choice";
  var path = window.location.pathname;
  var isFrenchRoot = path === "/" || path === "/index.html";

  try {
    if (isFrenchRoot && !localStorage.getItem(storageKey) && !navigator.language.toLowerCase().startsWith("fr")) {
      window.location.replace("/en/");
      return;
    }
  } catch (error) {
    // Reading remains available if browser storage is blocked.
  }

  document.addEventListener("DOMContentLoaded", function () {
    document.querySelectorAll("[data-lang-switch]").forEach(function (link) {
      link.addEventListener("click", function () {
        try {
          localStorage.setItem(storageKey, link.dataset.langSwitch);
        } catch (error) {
          // The link itself remains fully functional.
        }
      });
    });
  });
}());
