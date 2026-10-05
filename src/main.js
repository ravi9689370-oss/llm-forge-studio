import './styles.css';
import { APP_NAME, APP_TAGLINE, APP_VERSION } from './config.js';
import { h } from './ui.js';
import { load, save } from './state.js';
import { renderPipeline } from './views/pipeline.js';
import { renderArchitecture } from './views/architecture.js';
import { renderShortcut } from './views/shortcut.js';
import { renderTokenizerLab } from './views/tokenizerLab.js';
import { renderAcademy } from './views/academy.js';

// Set document title from single source of truth in src/config.js
document.title = APP_NAME;

const appEl = document.getElementById('app');
let state = load();

function updateState(newState) {
  state = { ...newState };
  save(state);
}

// Navigation Tabs
const TABS = [
  {
    id: 'pipeline',
    label: 'Pipeline',
    icon: `<svg viewBox="0 0 24 24"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>`,
    render: () => renderPipeline(state, updateState)
  },
  {
    id: 'architecture',
    label: 'Transformer',
    icon: `<svg viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>`,
    render: () => renderArchitecture(state, updateState)
  },
  {
    id: 'shortcut',
    label: 'Shortcut & Chat',
    icon: `<svg viewBox="0 0 24 24"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>`,
    render: () => renderShortcut(state, updateState)
  },
  {
    id: 'tokenizer',
    label: 'Tokenizer',
    icon: `<svg viewBox="0 0 24 24"><polyline points="4 7 4 4 20 4 20 7"/><line x1="9" y1="20" x2="15" y2="20"/><line x1="12" y1="4" x2="12" y2="20"/></svg>`,
    render: () => renderTokenizerLab(state, updateState)
  },
  {
    id: 'academy',
    label: 'Academy',
    icon: `<svg viewBox="0 0 24 24"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>`,
    render: () => renderAcademy(state, updateState)
  },
];

let activeTab = 'shortcut'; // default to the popular shortcut & chat experience

// Render Topbar
function renderTopBar() {
  const isOnline = navigator.onLine;
  const netBadge = h('div', { class: 'net-badge' + (isOnline ? '' : ' off'), id: 'net-badge' },
    h('span', { class: 'dot' }),
    h('span', { text: isOnline ? 'Offline-Ready' : 'Offline Mode' })
  );

  window.addEventListener('online', () => {
    netBadge.className = 'net-badge';
    netBadge.lastChild.textContent = 'Offline-Ready';
  });
  window.addEventListener('offline', () => {
    netBadge.className = 'net-badge off';
    netBadge.lastChild.textContent = 'Offline Mode';
  });

  return h('header', { class: 'topbar' },
    h('div', { class: 'logo', text: 'AI' }),
    h('div', { class: 'titles' },
      h('h1', { text: APP_NAME }),
      h('div', { class: 'sub', text: APP_TAGLINE })
    ),
    netBadge
  );
}

// Render Main View Area
const mainContent = h('main');

function switchTab(tabId) {
  activeTab = tabId;
  mainContent.innerHTML = '';
  const tab = TABS.find(t => t.id === tabId) || TABS[0];
  mainContent.append(tab.render());
  window.scrollTo({ top: 0, behavior: 'instant' });

  // Update nav buttons
  bottomNav.querySelectorAll('button').forEach((b) => {
    b.classList.toggle('on', b.dataset.tab === tabId);
  });
}

// Bottom Navigation Bar
const bottomNav = h('nav', { class: 'bottomnav' });
TABS.forEach((tab) => {
  const btn = h('button', {
    class: tab.id === activeTab ? 'on' : '',
    dataset: { tab: tab.id },
    html: `${tab.icon}<span>${tab.label}</span>`,
    onclick: () => switchTab(tab.id)
  });
  bottomNav.append(btn);
});

// Assemble app
appEl.innerHTML = '';
appEl.append(renderTopBar(), mainContent, bottomNav);

// Mount initial view
switchTab(activeTab);

// Service Worker for offline capability
if ('serviceWorker' in navigator && !window.location.protocol.startsWith('file')) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js').catch(() => {});
  });
}
