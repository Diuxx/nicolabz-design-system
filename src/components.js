(function (global) {
  "use strict";

  function initializeTabs(container) {
    const list = container.querySelector(".nz-tab-list");
    const tabs = list ? Array.from(list.querySelectorAll(".nz-tab")) : [];
    if (!list || tabs.length === 0) throw new Error("Tabs require a tab list and at least one tab.");
    const panels = tabs.map((tab) => {
      const id = tab.getAttribute("aria-controls");
      const panel = id && container.querySelector(`#${CSS.escape(id)}`);
      if (!tab.id || !panel) throw new Error("Each tab requires an id and a matching panel.");
      return panel;
    });
    const enabled = tabs.filter((tab) => !tab.disabled);
    if (!enabled.length) throw new Error("Tabs require an enabled tab.");

    list.setAttribute("role", "tablist");
    tabs.forEach((tab, index) => {
      tab.setAttribute("role", "tab");
      panels[index].setAttribute("role", "tabpanel");
      panels[index].setAttribute("aria-labelledby", tab.id);
    });
    function select(tab, focus) {
      tabs.forEach((item, index) => {
        const selected = item === tab;
        item.setAttribute("aria-selected", String(selected));
        item.tabIndex = selected ? 0 : -1;
        panels[index].hidden = !selected;
      });
      if (focus) tab.focus();
    }
    select(enabled.find((tab) => tab.getAttribute("aria-selected") === "true") || enabled[0], false);
    list.addEventListener("click", (event) => {
      const tab = event.target.closest(".nz-tab");
      if (tabs.includes(tab) && !tab.disabled) select(tab, false);
    });
    list.addEventListener("keydown", (event) => {
      const index = enabled.indexOf(event.target);
      if (index < 0) return;
      let next;
      if (event.key === "ArrowRight") next = (index + 1) % enabled.length;
      else if (event.key === "ArrowLeft") next = (index + enabled.length - 1) % enabled.length;
      else if (event.key === "Home") next = 0;
      else if (event.key === "End") next = enabled.length - 1;
      else return;
      event.preventDefault();
      select(enabled[next], true);
    });
  }

  function showToast(region, message, options = {}) {
    const { duration = 0, dismissLabel = "Dismiss", variant = "info" } = options;
    if (!region || typeof message !== "string" || !message.trim()) throw new Error("A toast requires a region and message.");
    if (!Number.isFinite(duration) || duration < 0) throw new Error("Toast duration must be a non-negative number.");
    if (typeof dismissLabel !== "string" || !dismissLabel.trim()) throw new Error("A toast requires a dismissal label.");
    if (!["info", "success", "warning", "error"].includes(variant)) throw new Error(`Invalid toast variant: ${variant}.`);
    region.classList.add("nz-toast-region");
    const toast = document.createElement("div");
    toast.className = `nz-toast nz-alert-${variant}`;
    const text = document.createElement("span");
    text.textContent = message;
    const button = document.createElement("button");
    button.type = "button";
    button.className = "nz-button nz-button-secondary";
    button.textContent = dismissLabel;
    toast.append(text, button);
    region.append(toast);
    let timer = duration > 0 ? global.setTimeout(dismiss, duration) : null;
    let dismissing = false;
    if (duration > 0) {
      function pause() {
        if (timer !== null) global.clearTimeout(timer);
        timer = null;
      }
      function resume() {
        if (!dismissing && timer === null && !toast.matches(":hover") && !toast.contains(document.activeElement)) {
          timer = global.setTimeout(dismiss, duration);
        }
      }
      toast.addEventListener("pointerenter", pause);
      toast.addEventListener("pointerleave", resume);
      toast.addEventListener("focusin", pause);
      toast.addEventListener("focusout", (event) => {
        if (timer === null && !toast.contains(event.relatedTarget) && !toast.matches(":hover") && !dismissing) {
          timer = global.setTimeout(dismiss, duration);
        }
      });
    }
    function dismiss() {
      if (dismissing) return;
      dismissing = true;
      if (timer !== null) global.clearTimeout(timer);
      if (toast.contains(document.activeElement)) region.focus();
      if (global.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        toast.remove();
        return;
      }
      toast.classList.add("nz-toast-exit");
      const removalTimer = global.setTimeout(() => toast.remove(), 200);
      toast.addEventListener("animationend", (event) => {
        if (event.target !== toast || !event.animationName.startsWith("nz-toast-exit")) return;
        global.clearTimeout(removalTimer);
        toast.remove();
      });
    }
    button.addEventListener("click", dismiss);
    return dismiss;
  }

  function initializeTooltip(container) {
    const trigger = container.querySelector("[aria-describedby]");
    const tooltip = container.querySelector(".nz-tooltip-text");
    if (!trigger || !tooltip || trigger.getAttribute("aria-describedby") !== tooltip.id) {
      throw new Error("A tooltip requires a trigger describing its tooltip.");
    }
    container.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        container.dataset.dismissed = "true";
        delete container.dataset.visible;
      }
    });
    trigger.addEventListener("click", () => {
      if (container.dataset.visible) {
        delete container.dataset.visible;
        container.dataset.dismissed = "true";
      } else {
        delete container.dataset.dismissed;
        container.dataset.visible = "true";
      }
    });
    container.addEventListener("pointerleave", () => {
      if (!container.contains(document.activeElement)) delete container.dataset.dismissed;
    });
    container.addEventListener("focusout", (event) => {
      if (!container.contains(event.relatedTarget)) {
        if (!container.matches(":hover")) delete container.dataset.dismissed;
        delete container.dataset.visible;
      }
    });
  }

  function initializeDropdown(dropdown) {
    const summary = dropdown.querySelector("summary");
    if (!summary) throw new Error("A dropdown requires a summary.");
    dropdown.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && dropdown.open) {
        dropdown.open = false;
        summary.focus();
        event.preventDefault();
      }
    });
    dropdown.addEventListener("click", (event) => {
      const action = event.target.closest(".nz-dropdown-panel a, .nz-dropdown-panel button");
      if (action && !action.disabled) {
        dropdown.open = false;
        if (action.tagName === "BUTTON") summary.focus();
      }
    });
    document.addEventListener("click", (event) => {
      if (dropdown.open && !dropdown.contains(event.target)) dropdown.open = false;
    });
  }

  global.nicolabzComponents = { initializeTabs, initializeTooltip, initializeDropdown, showToast };
})(window);
