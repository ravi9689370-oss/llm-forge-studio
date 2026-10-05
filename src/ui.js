// Tiny DOM helper + UI primitives (no framework, fully offline).

export function h(tag, attrs = {}, ...kids) {
  const el = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (v == null || v === false) continue;
    if (k === 'class') el.className = v;
    else if (k === 'html') el.innerHTML = v;
    else if (k === 'text') el.textContent = v;
    else if (k === 'value') el.value = v;
    else if (k === 'style' && typeof v === 'object') Object.assign(el.style, v);
    else if (k.startsWith('on') && typeof v === 'function') el.addEventListener(k.slice(2), v);
    else el.setAttribute(k, v);
  }
  for (const kid of kids.flat(9)) {
    if (kid == null || kid === false) continue;
    el.append(kid.nodeType ? kid : document.createTextNode(String(kid)));
  }
  return el;
}

export function toast(msg) {
  let box = document.getElementById('toasts');
  if (!box) {
    box = h('div', { id: 'toasts' });
    document.body.append(box);
  }
  const t = h('div', { class: 'toast', text: msg });
  box.append(t);
  setTimeout(() => { t.style.opacity = '0'; t.style.transition = 'opacity .3s'; }, 2400);
  setTimeout(() => t.remove(), 2750);
}

export function modal(title, bodyEl, { wide = false } = {}) {
  const closeBtn = h('button', { class: 'btn ghost small', text: '✕ Close' });
  const sheet = h('div', { class: 'sheet' },
    h('div', { class: 'close-row' }, closeBtn),
    h('h3', { text: title }),
    bodyEl,
  );
  const overlay = h('div', { class: 'overlay' }, sheet);
  const close = () => { overlay.remove(); document.removeEventListener('keydown', onKey); };
  const onKey = (e) => { if (e.key === 'Escape') close(); };
  overlay.addEventListener('click', (e) => { if (e.target === overlay) close(); });
  closeBtn.addEventListener('click', close);
  document.addEventListener('keydown', onKey);
  document.body.append(overlay);
  return { close, sheet };
}

export function fmt(n, digits = 1) {
  if (!isFinite(n)) return '—';
  const abs = Math.abs(n);
  const units = [
    [1e12, 'T'], [1e9, 'B'], [1e6, 'M'], [1e3, 'K'],
  ];
  for (const [u, s] of units) {
    if (abs >= u) return (n / u).toFixed(abs >= u * 100 ? 0 : digits) + s;
  }
  return n.toFixed(abs >= 100 ? 0 : digits);
}

export function fmtInt(n) {
  return Math.round(n).toLocaleString('en-US');
}

export function debounce(fn, ms = 180) {
  let t;
  return (...args) => { clearTimeout(t); t = setTimeout(() => fn(...args), ms); };
}
