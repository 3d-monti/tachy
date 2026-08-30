(function () {
  "use strict";

  function fallbackCopy(value) {
    var field = document.createElement("textarea");
    field.value = value;
    field.setAttribute("readonly", "");
    field.style.position = "fixed";
    field.style.opacity = "0";
    document.body.appendChild(field);
    field.select();
    var copied = document.execCommand("copy");
    field.remove();
    return copied ? Promise.resolve() : Promise.reject(new Error("Copy failed"));
  }

  function copyText(value) {
    if (navigator.clipboard && window.isSecureContext) {
      return navigator.clipboard.writeText(value);
    }
    return fallbackCopy(value);
  }

  document.addEventListener("DOMContentLoaded", function () {
    document.querySelectorAll("[data-copy-link]").forEach(function (button) {
      var resetTimer;
      button.addEventListener("click", function () {
        copyText(button.dataset.copyUrl).then(function () {
          window.clearTimeout(resetTimer);
          button.classList.add("is-copied");
          button.title = button.dataset.copySuccess;
          button.querySelector(".copy-link-feedback").textContent = button.dataset.copySuccess;
          resetTimer = window.setTimeout(function () {
            button.classList.remove("is-copied");
            button.title = button.dataset.copyTooltip;
            button.querySelector(".copy-link-feedback").textContent = "";
          }, 2000);
        });
      });
    });
  });
}());
