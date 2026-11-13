const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");
const vm = require("node:vm");

const root = path.resolve(__dirname, "..");
const source = fs.readFileSync(path.join(root, "src", "components.js"), "utf8");
const styles = fs.readFileSync(path.join(root, "src", "styles", "components.css"), "utf8");
const markup = fs.readFileSync(path.join(root, "demo", "index.html"), "utf8");

class Element {
  constructor(id = "") {
    this.id = id;
    this.attributes = {};
    this.listeners = {};
    this.children = [];
    this.hidden = false;
    this.disabled = false;
    this.tabIndex = 0;
    this.classList = { add: (...names) => { this.className = `${this.className || ""} ${names.join(" ")}`.trim(); } };
  }
  setAttribute(name, value) { this.attributes[name] = value; }
  getAttribute(name) { return this.attributes[name] ?? null; }
  addEventListener(name, callback) { this.listeners[name] = callback; }
  emit(name, event) { this.listeners[name](event); }
  append(...children) { this.children.push(...children); for (const child of children) child.parent = this; }
  contains(child) { return this.children.includes(child); }
  matches() { return false; }
  remove() { this.parent.children = this.parent.children.filter((child) => child !== this); }
  focus() { this.focused = true; }
  closest() { return this; }
}

function setup() {
  const document = { createElement: () => new Element(), activeElement: null };
  let scheduled;
  const window = {
    setTimeout: (callback, duration) => { scheduled = { callback, duration }; return 1; },
    clearTimeout: () => {},
    matchMedia: () => ({ matches: true })
  };
  vm.runInNewContext(source, { window, document, CSS: { escape: (value) => value } });
  return { api: window.nicolabzComponents, document, getScheduled: () => scheduled };
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
