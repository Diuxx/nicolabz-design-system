const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");
const vm = require("node:vm");

const root = path.resolve(__dirname, "..");
const source = fs.readFileSync(path.join(root, "src", "components.js"), "utf8");
const styles = fs.readFileSync(path.join(root, "src", "styles", "components.css"), "utf8");
const tableStyles = fs.readFileSync(path.join(root, "src", "styles", "tables.css"), "utf8");
const markup = fs.readFileSync(path.join(root, "demo", "index.html"), "utf8");
const catalog = require("../tokens/components.json");

class Element {
  constructor(id = "", tagName = "DIV") {
    this.id = id;
    this.tagName = tagName.toUpperCase();
    this.attributes = {};
    this.listeners = {};
    this.children = [];
    this.hidden = false;
    this.disabled = false;
    this.tabIndex = 0;
    this.classes = new Set();
    this.classList = {
      add: (...names) => names.forEach((name) => this.classes.add(name)),
      contains: (name) => this.classes.has(name),
      toggle: (name, force) => {
        const shouldAdd = force === undefined ? !this.classes.has(name) : force;
        if (shouldAdd) this.classes.add(name);
        else this.classes.delete(name);
        return shouldAdd;
      }
    };
    this.dataset = {};
    this.value = "";
  }
  get className() { return Array.from(this.classes).join(" "); }
  set className(value) { this.classes = new Set(String(value).split(/\s+/).filter(Boolean)); }
  get textContent() { return `${this._textContent || ""}${this.children.map((child) => child.textContent).join("")}`; }
  set textContent(value) { this._textContent = String(value); }
  hasAttribute(name) { return Object.prototype.hasOwnProperty.call(this.attributes, name); }
  setAttribute(name, value) { this.attributes[name] = value; }
  getAttribute(name) { return this.attributes[name] ?? null; }
  removeAttribute(name) { delete this.attributes[name]; }
  addEventListener(name, callback) { this.listeners[name] = callback; }
  emit(name, event) { this.listeners[name](event); }
  append(...children) {
    for (const child of children) {
      if (child.parent) {
        const index = child.parent.children.indexOf(child);
        if (index >= 0) child.parent.children.splice(index, 1);
      }
      this.children.push(child);
      child.parent = this;
      child.parentElement = this;
    }
  }
  insertBefore(child, reference) {
    const index = this.children.indexOf(reference);
    if (child.parent) {
      const childIndex = child.parent.children.indexOf(child);
      if (childIndex >= 0) child.parent.children.splice(childIndex, 1);
    }
    this.children.splice(index < 0 ? this.children.length : index, 0, child);
    child.parent = this;
    child.parentElement = this;
  }
  contains(child) { return this.children.includes(child); }
  matches() { return false; }
  remove() {
    const index = this.parent.children.indexOf(this);
    if (index >= 0) this.parent.children.splice(index, 1);
  }
  focus() { this.focused = true; }
  closest() { return this; }
}

function setup(configuredTables = []) {
  const document = {
    createElement: (tagName) => new Element("", tagName),
    documentElement: { getAttribute: () => "fr" },
    readyState: "complete",
    querySelectorAll: () => configuredTables,
    activeElement: null
  };
  let scheduled;
  const window = {
    setTimeout: (callback, duration) => { scheduled = { callback, duration }; return 1; },
    clearTimeout: () => {},
    matchMedia: () => ({ matches: true })
  };
  vm.runInNewContext(source, { window, document, CSS: { escape: (value) => value } });
  return { api: window.nicolabzComponents, document, getScheduled: () => scheduled };
}

function createTable({ sortable = false, filterable = false } = {}) {
  const table = new Element("", "table");
  table.classList.add("nz-table");
  if (sortable) table.attributes["data-sortable"] = "";
  if (filterable) table.attributes["data-filterable"] = "";
  table.closest = () => null;
  const headers = ["Project", "Hours"].map((label, index) => {
    const header = new Element("", "th");
    header.cellIndex = index;
    header.textContent = label;
    if (index === 1) header.dataset.sortType = "number";
    return header;
  });
  const body = new Element("", "tbody");
  body.rows = body.children;
  const rows = [
    ["Alpha", "12"],
    ["Beta", "4"]
  ].map((values) => {
    const row = new Element("", "tr");
    row.cells = values.map((value) => {
      const cell = new Element("", "td");
      cell.textContent = value;
      return cell;
    });
    row.append(...row.cells);
    return row;
  });
  body.append(...rows);
  table.tBodies = [body];
  table.querySelectorAll = () => headers;
  const parent = new Element();
  parent.append(table);
  return { table, headers, body, rows, parent };
}

test("tabs select panels with keyboard navigation and skip disabled tabs", () => {
  const { api } = setup();
  const tabs = [new Element("a"), new Element("b"), new Element("c")];
  const panels = [new Element("pa"), new Element("pb"), new Element("pc")];
  tabs.forEach((tab, index) => tab.setAttribute("aria-controls", panels[index].id));
  tabs[1].disabled = true;
  const list = new Element();
  list.querySelectorAll = () => tabs;
  const container = {
    querySelector(selector) {
      return selector === ".nz-tab-list" ? list : panels.find((panel) => `#${panel.id}` === selector);
    }
  };
  api.initializeTabs(container);
  assert.equal(tabs[0].getAttribute("aria-selected"), "true");
  assert.equal(panels[0].hidden, false);
  assert.equal(panels[2].hidden, true);
  let prevented = false;
  list.emit("keydown", { target: tabs[0], key: "ArrowRight", preventDefault: () => { prevented = true; } });
  assert.equal(prevented, true);
  assert.equal(tabs[2].getAttribute("aria-selected"), "true");
  assert.equal(tabs[2].focused, true);
  assert.equal(panels[0].hidden, true);
  assert.equal(panels[2].hidden, false);
  list.emit("click", { target: tabs[0] });
  assert.equal(tabs[0].getAttribute("aria-selected"), "true");
});

test("toasts use text, support dismissal and validate their duration", () => {
  const { api, document, getScheduled } = setup();
  const region = new Element();
  const dismiss = api.showToast(region, "<saved>", { duration: 1000, dismissLabel: "Close" });
  const toast = region.children[0];
  assert.match(toast.className, /nz-alert-info/);
  assert.match(region.className, /nz-toast-region/);
  assert.equal(toast.children[0].textContent, "<saved>");
  assert.equal(toast.children[1].textContent, "Close");
  assert.equal(getScheduled().duration, 1000);
  toast.emit("focusin", {});
  toast.emit("focusout", { relatedTarget: null });
  assert.equal(getScheduled().duration, 1000);
  document.activeElement = toast.children[1];
  dismiss();
  assert.equal(region.focused, true);
  assert.equal(region.children.length, 0);
  api.showToast(region, "Temporary", { duration: 50 });
  getScheduled().callback();
  assert.equal(region.children.length, 0);
  assert.throws(() => api.showToast(region, "Saved", { duration: -1 }), /non-negative/);
  assert.throws(() => api.showToast(region, "", {}), /message/);
  assert.throws(() => api.showToast(region, "Saved", { variant: "invalid" }), /variant/);
  for (const variant of ["info", "success", "warning", "error"]) {
    api.showToast(region, variant, { variant });
    assert.match(region.children.at(-1).className, new RegExp(`nz-alert-${variant}`));
  }
});

test("extended components use native semantics and reduced-motion styles", () => {
  assert.match(markup, /<dialog class="nz-dialog" aria-labelledby=/);
  assert.match(markup, /<input type="checkbox" role="switch"/);
  assert.match(markup, /<fieldset>[\s\S]*?<legend>/);
  assert.match(markup, /<details class="nz-accordion"><summary>/);
  assert.match(markup, /<table class="nz-table">[\s\S]*?<caption>/);
  assert.match(markup, /aria-describedby="demo-tooltip"/);
  assert.match(styles, /\.nz-spinner,\s*\.nz-skeleton,\s*\.nz-toast,\s*\.nz-toast-exit,[\s\S]*?animation:\s*none/);
  assert.match(styles, /\.nz-toast-region\s*\{[^}]*position:\s*fixed/);
  assert.match(styles, /\.nz-dialog-actions\s*\{[^}]*justify-content:\s*flex-end/);
  assert.match(styles, /\.nz-spinner-sm\s*\{/);
  assert.match(styles, /\.nz-spinner-lg\s*\{/);
});

test("tables expose grouped compact rows and sticky headers without changing the default table", () => {
  assert.match(styles, /@import url\("\.\/tables\.css"\)/);
  assert.match(tableStyles, /\.nz-table-compact th, \.nz-table-compact td\s*\{[^}]*padding:/);
  assert.match(tableStyles, /\.nz-table-sticky thead th\s*\{[^}]*position:\s*sticky/);
  assert.match(tableStyles, /\.nz-table \.nz-table-align-end\s*\{[^}]*text-align:\s*end/);
  assert.match(tableStyles, /\.nz-table \.nz-table-group > \*/);
  assert.match(tableStyles, /\.nz-table-filter:focus-visible:enabled\s*\{[^}]*outline:\s*none;[^}]*box-shadow:\s*inset 0 0 0 1px var\(--color-accent\);/);
  assert.match(markup, /class="nz-table nz-table-compact nz-table-sticky"/);
  assert.match(markup, /class="nz-table-group"/);
  const table = catalog.components.find((component) => component.name === "Table");
  assert.equal(table.variants.compact, ".nz-table-compact");
  assert.equal(table.variants.sticky, ".nz-table-sticky");
});

test("table sorting and filtering are opt-in and operate on rows", () => {
  const { api } = setup();
  const unchanged = createTable();
  api.initializeTable(unchanged.table);
  assert.equal(unchanged.parent.children.length, 1);
  assert.equal(unchanged.headers[0].children.length, 0);

  const interactive = createTable({ sortable: true, filterable: true });
  api.initializeTable(interactive.table);
  assert.equal(interactive.headers[1].children[0].getAttribute("aria-label"), "Trier par Hours");
  interactive.headers[1].children[0].emit("click", {});
  assert.deepEqual(interactive.body.rows.map((row) => row.cells[0].textContent), ["Beta", "Alpha"]);
  assert.equal(interactive.headers[1].getAttribute("aria-sort"), "ascending");
  interactive.headers[1].children[0].emit("click", {});
  assert.deepEqual(interactive.body.rows.map((row) => row.cells[0].textContent), ["Alpha", "Beta"]);
  assert.equal(interactive.headers[1].getAttribute("aria-sort"), "descending");

  const controls = interactive.parent.children[0];
  const filter = controls.children[0].children[0];
  filter.value = "alpha";
  filter.emit("input", {});
  const rowsByName = new Map(interactive.body.rows.map((row) => [row.cells[0].textContent, row]));
  assert.equal(rowsByName.get("Alpha").classList.contains("nz-table-filtered-out"), false);
  assert.equal(rowsByName.get("Beta").classList.contains("nz-table-filtered-out"), true);
  assert.equal(controls.children[1].textContent, "1 résultat");
});

test("tables with opt-in attributes initialize automatically and only once", () => {
  const configured = createTable({ filterable: true });
  const { api } = setup([configured.table]);
  assert.equal(configured.parent.children.length, 2);
  api.initializeTable(configured.table);
  assert.equal(configured.parent.children.length, 2);
});
