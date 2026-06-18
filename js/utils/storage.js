/* ═══════════════════════════════════════════════════════════
   EcoTrace — Storage Utility
   localStorage wrapper with namespacing and versioning
   ═══════════════════════════════════════════════════════════ */

const Storage = (() => {
  const PREFIX = 'ecotrace_';
  const VERSION_KEY = PREFIX + '_version';
  const CURRENT_VERSION = 1;

  function _key(name) {
    return PREFIX + name;
  }

  function get(name, fallback = null) {
    try {
      const raw = localStorage.getItem(_key(name));
      if (raw === null) return fallback;
      return JSON.parse(raw);
    } catch (e) {
      console.warn(`Storage.get error for "${name}":`, e);
      return fallback;
    }
  }

  function set(name, value) {
    try {
      localStorage.setItem(_key(name), JSON.stringify(value));
      return true;
    } catch (e) {
      console.warn(`Storage.set error for "${name}":`, e);
      return false;
    }
  }

  function remove(name) {
    localStorage.removeItem(_key(name));
  }

  function clear() {
    const keys = Object.keys(localStorage).filter(k => k.startsWith(PREFIX));
    keys.forEach(k => localStorage.removeItem(k));
  }

  function has(name) {
    return localStorage.getItem(_key(name)) !== null;
  }

  // Array helpers
  function pushToArray(name, item) {
    const arr = get(name, []);
    arr.push(item);
    set(name, arr);
    return arr;
  }

  function removeFromArray(name, predicate) {
    const arr = get(name, []);
    const filtered = arr.filter((item) => !predicate(item));
    set(name, filtered);
    return filtered;
  }

  function updateInArray(name, predicate, updater) {
    const arr = get(name, []);
    const updated = arr.map(item => predicate(item) ? updater(item) : item);
    set(name, updated);
    return updated;
  }

  // Initialize version
  function init() {
    const storedVersion = parseInt(localStorage.getItem(VERSION_KEY) || '0');
    if (storedVersion < CURRENT_VERSION) {
      // Future migration logic here
      localStorage.setItem(VERSION_KEY, String(CURRENT_VERSION));
    }
  }

  init();

  return { get, set, remove, clear, has, pushToArray, removeFromArray, updateInArray };
})();
