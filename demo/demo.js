(() => {
  const toggleButton = document.querySelector("[data-theme-toggle]");
  const themeLabel = document.querySelector("[data-theme-label]");
  const themeIcon = document.querySelector("[data-theme-icon]");
  const themeColor = document.querySelector('meta[name="theme-color"]');

  function updateThemeControls() {
    const isDark = window.nicolabzTheme.getTheme() === "dark";
    toggleButton.setAttribute("aria-pressed", String(isDark));
    toggleButton.setAttribute("aria-label", isDark ? "Activer le thème clair" : "Activer le thème sombre");
    themeLabel.textContent = isDark ? "Mode clair" : "Mode sombre";
    themeIcon.textContent = isDark ? "☀" : "☾";
    themeColor.setAttribute("content", getComputedStyle(document.documentElement).getPropertyValue("--color-background").trim());
  }

  function initializeExamples() {
    for (const template of document.querySelectorAll("template[data-example]")) {
      const story = document.querySelector(`[data-story="${template.dataset.example}"]`);
      const preview = story && story.querySelector("[data-preview]");
      const code = story && story.querySelector("[data-code]");
      if (!preview || !code) {
        throw new Error(`L'exemple « ${template.dataset.example} » doit avoir un aperçu et un bloc de code.`);
      }
      preview.replaceChildren(template.content.cloneNode(true));
      const lines = template.innerHTML.trim().split(/\r?\n/);
      const indentedLines = lines.length > 1 ? lines.slice(1) : lines;
      const indentation = Math.min(...indentedLines.filter((line) => line.trim()).map((line) => line.match(/^\s*/)[0].length));
      code.textContent = lines.map((line, index) => index === 0 ? line.trimStart() : line.slice(indentation)).join("\n");
    }
  }

  function copyFallback(value) {
    if (typeof document.execCommand !== "function") {
      throw new Error("La copie dans le presse-papiers n'est pas prise en charge.");
    }
    const textArea = document.createElement("textarea");
    textArea.value = value;
    textArea.setAttribute("readonly", "");
    textArea.style.position = "fixed";
    textArea.style.opacity = "0";
    document.body.append(textArea);
    textArea.select();
    const copied = document.execCommand("copy");
    textArea.remove();
    if (!copied) throw new Error("Le navigateur a refusé la copie dans le presse-papiers.");
  }

  async function copyExample(button) {
    const story = button.closest(".story-card");
    const code = story && story.querySelector("[data-code]");
    const status = story && story.querySelector("[data-copy-status]");
    if (!code || !status) throw new Error("Le code à copier ou son message de confirmation est introuvable.");

    try {
      if (navigator.clipboard && typeof navigator.clipboard.writeText === "function") {
        await navigator.clipboard.writeText(code.textContent);
      } else {
        copyFallback(code.textContent);
      }
      status.textContent = "HTML copié.";
    } catch (error) {
      console.error("Impossible de copier l'exemple HTML :", error);
      status.textContent = "Copie impossible dans ce navigateur.";
    }
  }

  initializeExamples();
  const toastRegion = document.querySelector("[data-toast-region]");
  document.body.append(toastRegion);
  for (const tabs of document.querySelectorAll("[data-tabs]")) window.nicolabzComponents.initializeTabs(tabs);
  for (const tooltip of document.querySelectorAll("[data-tooltip]")) window.nicolabzComponents.initializeTooltip(tooltip);
  for (const dropdown of document.querySelectorAll("[data-dropdown]")) window.nicolabzComponents.initializeDropdown(dropdown);
  const dialog = document.querySelector("#demo-dialog");
  document.querySelector("[data-open-dialog]").addEventListener("click", () => dialog.showModal());
  const formDialog = document.querySelector("#demo-form-dialog");
  document.querySelector("[data-open-form-dialog]").addEventListener("click", () => formDialog.showModal());
  formDialog.addEventListener("close", () => {
    if (formDialog.returnValue === "confirm") {
      document.querySelector("[data-dialog-feedback]").textContent = `Projet : ${document.querySelector("#dialog-project-name").value}`;
    }
    formDialog.returnValue = "";
  });
  const messages = {
    info: "Information : une mise à jour est disponible.",
    success: "Succès : les changements sont enregistrés.",
    warning: "Attention : vérifie les informations.",
    error: "Erreur : la sauvegarde a échoué."
  };
  document.querySelector("#toast-position").addEventListener("change", (event) => {
    toastRegion.classList.toggle("nz-toast-region-bottom", event.target.value === "bottom");
  });
  for (const button of document.querySelectorAll("[data-toast-variant]")) {
    button.addEventListener("click", () => {
      const variant = button.dataset.toastVariant;
      window.nicolabzComponents.showToast(toastRegion, messages[variant], { variant, dismissLabel: "Fermer" });
    });
  }
  document.querySelector("[data-show-timed-toast]").addEventListener("click", () => {
    window.nicolabzComponents.showToast(toastRegion, "Information : notification temporaire.", {
      duration: 5000,
      dismissLabel: "Fermer"
    });
  });
  for (const link of document.querySelectorAll("[data-page-link]")) {
    link.addEventListener("click", (event) => {
      event.preventDefault();
      for (const item of document.querySelectorAll("[data-page-link]")) {
        if (item === link) item.setAttribute("aria-current", "page");
        else item.removeAttribute("aria-current");
      }
      for (const row of document.querySelectorAll("tr[data-page]")) row.hidden = row.dataset.page !== link.dataset.pageLink;
    });
  }
  updateThemeControls();
  window.addEventListener("nicolabz-theme-change", updateThemeControls);
  toggleButton.addEventListener("click", () => window.nicolabzTheme.toggle());

  for (const button of document.querySelectorAll("[data-copy]")) {
    button.addEventListener("click", () => {
      void copyExample(button);
    });
  }

  const form = document.querySelector("#demo-form");
  const formFeedback = document.querySelector("#form-feedback");
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const projectName = String(new FormData(form).get("name") ?? "").trim();
    if (!projectName) {
      formFeedback.textContent = "Renseigne ton nom.";
      return;
    }
    formFeedback.textContent = `Démo : « ${projectName} » est prêt à être configuré.`;
  });
})();
