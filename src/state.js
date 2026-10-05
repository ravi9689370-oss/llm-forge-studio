// Persistent app state (localStorage — fully offline).
import { APP_VERSION } from './config.js';

const KEY = 'llmforge.state.v1';

export function defaultState() {
  return {
    version: APP_VERSION,
    stageDone: { data: false, pretrain: false, finetune: false, deploy: false },
    stats: { tokensProcessed: 0, gpuHours: 0, simRuns: 0 },
    arch: { layers: 12, hidden: 768, heads: 12, context: 4096 },
    dataset: '',
    model: null, // { base, baseParams, method, dataChars, ts }
    chat: [],    // { role: 'user'|'bot', text, ts }
    quizBest: 0,
  };
}

export function load() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return defaultState();
    const d = defaultState();
    const p = JSON.parse(raw);
    return {
      ...d, ...p,
      stats: { ...d.stats, ...(p.stats || {}) },
      arch: { ...d.arch, ...(p.arch || {}) },
      stageDone: { ...d.stageDone, ...(p.stageDone || {}) },
    };
  } catch {
    return defaultState();
  }
}

export function save(s) {
  try { localStorage.setItem(KEY, JSON.stringify(s)); } catch { /* storage full/blocked — stay in-memory */ }
}

export const STAGES = [
  {
    id: 'data', step: 1, title: 'Data Collection & Curation',
    blurb: 'Crawl the open web, deduplicate with MinHash LSH, filter for quality, and tokenize into a clean corpus.',
    chips: ['Target: 10T tokens', 'MinHash LSH', 'Quality filter'],
  },
  {
    id: 'pretrain', step: 2, title: 'Pre-Training',
    blurb: 'Next-token prediction across a GPU cluster. Watch the loss fall as the model learns language.',
    chips: ['Next-token loss', 'AdamW + cosine LR', 'GPU cluster'],
  },
  {
    id: 'finetune', step: 3, title: 'Fine-Tuning & Alignment',
    blurb: 'Instruction tuning, then RLHF / DPO to make the model helpful, honest and harmless.',
    chips: ['SFT', 'RLHF', 'DPO'],
  },
  {
    id: 'deploy', step: 4, title: 'Deployment & Serving',
    blurb: 'Quantize, compile, and serve with a fast inference engine for snappy responses.',
    chips: ['INT4 quant', 'KV cache', 'Streaming'],
  },
];
