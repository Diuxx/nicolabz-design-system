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

  function getTableRowGroups(rows) {
    const groups = [];
    for (const row of rows) {
      if (row.classList.contains("nz-table-group")) groups.push([row]);
      else if (groups.length) groups[groups.length - 1].push(row);
      else groups.push([row]);
    }
    return groups;
  }

  function initializeTable(table) {
    if (!table || table.tagName !== "TABLE" || !table.classList.contains("nz-table")) {
      throw new Error("Table initialization requires a .nz-table element.");
    }
    if (initializedTables.has(table)) return;

    const sortable = table.hasAttribute("data-sortable");
    const filterable = table.hasAttribute("data-filterable");
    if (!sortable && !filterable) return;
    if (!table.tBodies.length) throw new Error("An interactive table requires at least one tbody.");
    if (filterable && !table.parentElement) throw new Error("A filterable table requires a parent container.");

    const localeElement = table.closest("[lang]") || document.documentElement;
    const locale = localeElement.getAttribute("lang") || "en";
    const isFrench = locale.toLowerCase().startsWith("fr");

    if (sortable) {
      const headers = Array.from(table.querySelectorAll("thead th[scope='col']"));
      if (!headers.length) throw new Error("A sortable table requires column headers with scope=\"col\".");
      const collator = new Intl.Collator(locale, { numeric: true, sensitivity: "base" });
      let sortedHeader = null;
      let sortDirection = 1;
      const sortButtons = new Map();

      function getValue(row, columnIndex) {
        return row.cells[columnIndex] ? row.cells[columnIndex].textContent.trim() : "";
      }

      function compareRows(left, right, columnIndex, header, direction) {
        const leftValue = getValue(left, columnIndex);
        const rightValue = getValue(right, columnIndex);
        if (!leftValue) return rightValue ? 1 : 0;
        if (!rightValue) return -1;

        if (header.dataset.sortType === "number") {
          const leftNumber = Number(leftValue);
          const rightNumber = Number(rightValue);
          if (Number.isFinite(leftNumber) && Number.isFinite(rightNumber)) return (leftNumber - rightNumber) * direction;
        }
        return collator.compare(leftValue, rightValue) * direction;
      }

      function sortBy(header, button) {
        sortDirection = sortedHeader === header ? -sortDirection : 1;
        sortedHeader = header;
        for (const item of headers) {
          item.removeAttribute("aria-sort");
          sortButtons.get(item).textContent = "↕";
        }
        header.setAttribute("aria-sort", sortDirection === 1 ? "ascending" : "descending");
        button.textContent = sortDirection === 1 ? "↑" : "↓";

        for (const body of table.tBodies) {
          const groups = getTableRowGroups(Array.from(body.rows));
          for (const group of groups) {
            const hasGroupHeader = group[0].classList.contains("nz-table-group");
            const firstDataRow = hasGroupHeader ? 1 : 0;
            const sortedRows = group.slice(firstDataRow).map((row, index) => ({ row, index }));
            sortedRows.sort((left, right) => {
              const comparison = compareRows(left.row, right.row, header.cellIndex, header, sortDirection);
              return comparison === 0 ? left.index - right.index : comparison;
            });
            group.splice(firstDataRow, sortedRows.length, ...sortedRows.map(({ row }) => row));
          }
          for (const row of groups.flat()) body.append(row);
        }
      }

      for (const header of headers) {
        const label = header.textContent.trim();
        const button = document.createElement("button");
        button.type = "button";
        button.className = "nz-table-sort";
        button.textContent = "↕";
        button.setAttribute("aria-label", `${isFrench ? "Trier par" : "Sort by"} ${label}`);
        button.addEventListener("click", () => sortBy(header, button));
        header.append(button);
        sortButtons.set(header, button);
      }
    }

    if (filterable) {
      const parent = table.parentElement;
      const controls = document.createElement("div");
      controls.className = "nz-table-controls";
      const label = document.createElement("label");
      label.className = "nz-table-filter-label";
      label.textContent = isFrench ? "Filtrer les lignes" : "Filter rows";
      const input = document.createElement("input");
      input.type = "search";
      input.className = "nz-table-filter";
      label.append(input);
      const status = document.createElement("span");
      status.className = "nz-table-filter-status";
      status.setAttribute("role", "status");
      status.setAttribute("aria-live", "polite");
      controls.append(label, status);
      parent.insertBefore(controls, table);

      input.addEventListener("input", () => {
        const query = input.value.trim().toLocaleLowerCase(locale);
        let matchingRows = 0;
        for (const body of table.tBodies) {
          for (const group of getTableRowGroups(Array.from(body.rows))) {
            const hasGroupHeader = group[0].classList.contains("nz-table-group");
            const firstDataRow = hasGroupHeader ? 1 : 0;
            const dataRows = group.slice(firstDataRow);
            let groupHasMatch = false;
            for (const row of dataRows) {
              const matches = !query || row.textContent.toLocaleLowerCase(locale).includes(query);
              row.classList.toggle("nz-table-filtered-out", !matches);
              if (matches) {
                matchingRows += 1;
                groupHasMatch = true;
              }
            }
            if (hasGroupHeader) group[0].classList.toggle("nz-table-filtered-out", Boolean(query) && !groupHasMatch);
          }
        }
        status.textContent = query
          ? isFrench ? `${matchingRows} résultat${matchingRows === 1 ? "" : "s"}` : `${matchingRows} result${matchingRows === 1 ? "" : "s"}`
          : "";
      });
    }
    initializedTables.add(table);
  }

  const initializedTables = new WeakSet();

  function initializeOptInTables() {
    for (const table of document.querySelectorAll("table.nz-table[data-sortable], table.nz-table[data-filterable]")) {
      initializeTable(table);
    }
  }

  global.nicolabzComponents = { initializeTabs, initializeTooltip, initializeDropdown, initializeTable, showToast };
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initializeOptInTables, { once: true });
  } else {
    initializeOptInTables();
  }
})(window);
