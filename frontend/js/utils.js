window.utils = (function () {
  function clamp(value, min, max) {
    return Math.min(max, Math.max(min, value));
  }

  function countWords(text) {
    if (!text) return 0;
    return (text.trim().match(/\b\w+\b/g) || []).length;
  }

  function debounce(fn, delay) {
    let t;
    return function (...args) {
      clearTimeout(t);
      t = setTimeout(() => fn.apply(this, args), delay);
    };
  }

  return { clamp, countWords, debounce };
})();


