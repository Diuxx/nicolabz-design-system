(() => {
  const toggleButton = document.querySelector("[data-theme-toggle]");
  const themeLabel = document.querySelector("[data-theme-label]");
  const themeIcon = document.querySelector("[data-theme-icon]");
  const themeColor = document.querySelector('meta[name="theme-color"]');
  const form = document.querySelector("#demo-form");
  const formFeedback = document.querySelector("#form-feedback");

  function updateThemeControls() {
    const isDark = window.nicolabzTheme.getTheme() === "dark";
    toggleButton.setAttribute("aria-pressed", String(isDark));
    toggleButton.setAttribute("aria-label", isDark ? "Activer le thème clair" : "Activer le thème sombre");
    themeLabel.textContent = isDark ? "Mode clair" : "Mode sombre";
    themeIcon.textContent = isDark ? "☀" : "☾";
    themeColor.setAttribute("content", getComputedStyle(document.documentElement).getPropertyValue("--color-background").trim());
  }

  updateThemeControls();
  window.addEventListener("nicolabz-theme-change", updateThemeControls);
  toggleButton.addEventListener("click", () => window.nicolabzTheme.toggle());

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const projectName = String(new FormData(form).get("project") ?? "").trim();
    if (!projectName) {
      formFeedback.textContent = "Renseigne le nom du projet.";
      return;
    }
    formFeedback.textContent = `Démo : « ${projectName} » est prêt à être configuré.`;
  });
})();
