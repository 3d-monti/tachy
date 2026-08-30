(function () {
  "use strict";

  var messages = {
    fr: {
      required: "Ce champ est obligatoire.",
      email: "Saisissez une adresse email valide.",
      short: "Le message doit contenir au moins 20 caractères.",
      long: "Le message ne peut pas dépasser 4 000 caractères.",
      nameLong: "Le nom ne peut pas dépasser 80 caractères.",
      invalid: "Vérifiez les champs signalés avant l’envoi.",
      spam: "Le message n’a pas pu être envoyé.",
      defaultEmailLabel: "Adresse email de réponse",
      defaultEmailHelp: "Cette adresse sera utilisée uniquement pour vous répondre.",
      closedTestEmailLabel: "Adresse du compte Google utilisée sur Google Play",
      closedTestEmailHelp: "Utilisez l’adresse exacte du compte Google avec lequel vous ouvrirez le lien du test. Il peut s’agir d’une adresse Gmail ou d’une autre adresse associée à votre compte Google.",
      closedTestMessage: "Bonjour,\n\nJe souhaite participer au test fermé de TACHY.\n\nJe confirme que l’adresse indiquée ci-dessus est celle du compte Google que j’utilise sur Google Play.\n\nMerci."
    },
    en: {
      required: "This field is required.",
      email: "Enter a valid email address.",
      short: "The message must contain at least 20 characters.",
      long: "The message cannot exceed 4,000 characters.",
      nameLong: "The name cannot exceed 80 characters.",
      invalid: "Check the highlighted fields before sending.",
      spam: "The message could not be sent.",
      defaultEmailLabel: "Reply email address",
      defaultEmailHelp: "This address will only be used to reply to your message.",
      closedTestEmailLabel: "Google account email used on Google Play",
      closedTestEmailHelp: "Enter the exact email address of the Google account you will use to open the test link. This may be a Gmail address or another email address associated with your Google account.",
      closedTestMessage: "Hello,\n\nI would like to participate in the TACHY closed test.\n\nI confirm that the email address entered above is associated with the Google account I use on Google Play.\n\nThank you."
    }
  };

  function errorFor(field, copy) {
    if (field.validity.valueMissing) return copy.required;
    if (field.type === "email" && field.validity.typeMismatch) return copy.email;
    if (field.name === "message" && field.validity.tooShort) return copy.short;
    if (field.name === "message" && field.validity.tooLong) return copy.long;
    if (field.name === "name" && field.validity.tooLong) return copy.nameLong;
    return "";
  }

  function renderError(field, copy) {
    var target = document.getElementById(field.id + "-error");
    var error = errorFor(field, copy);
    field.setAttribute("aria-invalid", String(Boolean(error)));
    if (target) target.textContent = error;
    return !error;
  }

  document.addEventListener("DOMContentLoaded", function () {
    document.querySelectorAll("[data-contact-form]").forEach(function (form) {
      form.noValidate = true;
      var language = form.dataset.language === "fr" ? "fr" : "en";
      var copy = messages[language];
      var fields = Array.prototype.slice.call(form.querySelectorAll("input:not([type='hidden']), select, textarea"))
        .filter(function (field) { return !field.classList.contains("honeypot"); });
      var status = form.querySelector("[data-form-status]");
      var honeypot = form.querySelector("[data-honeypot]");
      var subject = form.querySelector("[name='subject']");
      var message = form.querySelector("[name='message']");
      var emailLabel = form.querySelector("label[for='email']");
      var emailHelp = form.querySelector("#email-help");
      var closedTestOption = subject ? subject.querySelector("[data-closed-test-subject]") : null;
      var messageWasGenerated = false;

      function fitMessageToContent() {
        if (!message) return;
        message.style.height = "auto";
        var minimum = parseFloat(window.getComputedStyle(message).minHeight) || 0;
        var chrome = message.offsetHeight - message.clientHeight;
        message.style.height = Math.max(message.scrollHeight + chrome, minimum) + "px";
      }

      function scheduleMessageFit() {
        window.requestAnimationFrame(fitMessageToContent);
        window.setTimeout(fitMessageToContent, 160);
        if (document.fonts && document.fonts.ready) {
          document.fonts.ready.then(fitMessageToContent);
        }
      }

      function isClosedTestSelected() {
        return Boolean(subject && subject.selectedOptions[0] &&
          subject.selectedOptions[0].hasAttribute("data-closed-test-subject"));
      }

      function updateEmailCopy(closedTestSelected) {
        if (emailLabel) {
          emailLabel.textContent = closedTestSelected ? copy.closedTestEmailLabel : copy.defaultEmailLabel;
        }
        if (emailHelp) {
          emailHelp.textContent = closedTestSelected ? copy.closedTestEmailHelp : copy.defaultEmailHelp;
        }
      }

      function updateSubjectState() {
        var closedTestSelected = isClosedTestSelected();
        updateEmailCopy(closedTestSelected);

        if (closedTestSelected && message && !message.value.trim()) {
          message.value = copy.closedTestMessage;
          messageWasGenerated = true;
          scheduleMessageFit();
          return;
        }

        if (!closedTestSelected && message && messageWasGenerated && message.value === copy.closedTestMessage) {
          message.value = "";
          messageWasGenerated = false;
          message.style.height = "";
        }
      }

      if (new URLSearchParams(window.location.search).get("motif") === "test-ferme" && subject && closedTestOption) {
        subject.value = closedTestOption.value;
      }

      updateSubjectState();

      if (subject) {
        subject.addEventListener("change", updateSubjectState);
      }

      fields.forEach(function (field) {
        field.addEventListener("blur", function () { renderError(field, copy); });
        field.addEventListener("input", function () {
          if (field === message && messageWasGenerated) messageWasGenerated = false;
          if (field.getAttribute("aria-invalid") === "true") renderError(field, copy);
        });
      });

      form.addEventListener("submit", function (event) {
        if (honeypot && honeypot.value) {
          event.preventDefault();
          status.textContent = copy.spam;
          return;
        }

        var valid = true;
        fields.forEach(function (field) {
          if (!renderError(field, copy)) valid = false;
        });
        if (!valid) {
          event.preventDefault();
          status.textContent = copy.invalid;
          var firstInvalid = form.querySelector("[aria-invalid='true']");
          if (firstInvalid) firstInvalid.focus();
        }
      });
    });
  });
}());
