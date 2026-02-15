import "@testing-library/jest-dom/vitest";

// Radix UI needs pointer capture APIs that jsdom doesn't provide
Element.prototype.hasPointerCapture = () => false;
Element.prototype.setPointerCapture = () => {};
Element.prototype.releasePointerCapture = () => {};
Element.prototype.scrollIntoView = () => {};

// ResizeObserver mock for Radix UI
globalThis.ResizeObserver = class {
  observe() {}
  unobserve() {}
  disconnect() {}
};
