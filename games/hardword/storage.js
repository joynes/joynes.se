// A separate namespace prevents progress and exported saves from touching sibling games.
(function (global) {
  const prefix = 'joynes.hardword.';
  const memory = new Map();
  let native;
  let unavailable = false;
  function notice() {
    unavailable = true;
    const show = () => {
      if (document.getElementById('storageNotice')) return;
      const note = document.createElement('p');
      note.id = 'storageNotice'; note.setAttribute('role', 'status');
      note.textContent = 'Lagringen är blockerad eller full. Du kan spela, men framstegen sparas bara medan sidan är öppen.';
      note.style.cssText = 'position:relative;z-index:3;color:#ffe5a0;background:#271b35;padding:14px;text-align:center;font:14px system-ui';
      document.body.prepend(note);
    };
    if (document.body) show(); else document.addEventListener('DOMContentLoaded', show, {once: true});
  }
  try { native = global.localStorage; } catch { notice(); }
  function keys() {
    const result = new Set(memory.keys());
    if (native) try {
      for (let i = 0; i < native.length; i++) {
        const k = native.key(i); if (k?.startsWith(prefix)) result.add(k.slice(prefix.length));
      }
    } catch { notice(); }
    return [...result];
  }
  global.appStorage = {
    get length() { return keys().length; },
    key(i) { return keys()[i] ?? null; },
    getItem(key) {
      key = String(key);
      if (memory.has(key)) return memory.get(key);
      if (native) try { return native.getItem(prefix + key); } catch { notice(); }
      return null;
    },
    setItem(key, value) {
      key = String(key); value = String(value); memory.set(key, value);
      if (native) try { native.setItem(prefix + key, value); return; } catch { notice(); }
      if (!unavailable) notice();
    },
    removeItem(key) {
      memory.delete(String(key));
      if (native) try { native.removeItem(prefix + key); } catch { notice(); }
    },
    clear() { for (const key of keys()) this.removeItem(key); }
  };
})(window);
