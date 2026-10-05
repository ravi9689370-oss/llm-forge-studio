// On-device "personal" language model:
// - n-gram LM trained on the user's dataset (real, runs locally)
// - small knowledge base of original explanations
// - deterministic fallback generator

export function trainNgram(text) {
  const words = text.toLowerCase().replace(/\s+/g, ' ').trim().split(' ').filter(Boolean);
  const bi = new Map();  // w1 -> Map(w2 -> count)
  const tri = new Map(); // "w1 w2" -> Map(w3 -> count)
  const starts = new Map();
  for (let i = 0; i < words.length; i++) {
    starts.set(words[i], (starts.get(words[i]) || 0) + 1);
    if (i < words.length - 1) {
      if (!bi.has(words[i])) bi.set(words[i], new Map());
      const m = bi.get(words[i]);
      m.set(words[i + 1], (m.get(words[i + 1]) || 0) + 1);
    }
    if (i < words.length - 2) {
      const key = words[i] + ' ' + words[i + 1];
      if (!tri.has(key)) tri.set(key, new Map());
      const m = tri.get(key);
      m.set(words[i + 2], (m.get(words[i + 2]) || 0) + 1);
    }
  }
  return { words, bi, tri, starts, size: words.length };
}

function sampleTemporal(map, temp) {
  const entries = [...map.entries()];
  if (entries.length === 0) return null;
  const t = Math.max(temp, 0.05);
  const weights = entries.map(([, c]) => Math.pow(c, 1 / t));
  let total = 0;
  for (const w of weights) total += w;
  let r = Math.random() * total;
  for (let i = 0; i < entries.length; i++) {
    r -= weights[i];
    if (r <= 0) return entries[i][0];
  }
  return entries[entries.length - 1][0];
}

// Generate a continuation from a prompt using the trained n-gram model.
export function generate(model, prompt, { maxTokens = 48, temperature = 0.8 } = {}) {
  if (!model || model.size < 12) return null;
  const p = prompt.toLowerCase().replace(/[^\w\s]/g, '').trim().split(/\s+/).filter(Boolean);
  if (p.length === 0) return null;
  let a = p.length > 1 ? p[p.length - 2] : '';
  let b = p[p.length - 1];
  const out = [];
  for (let i = 0; i < maxTokens; i++) {
    let next = null;
    const triKey = a + ' ' + b;
    if (model.tri.has(triKey)) next = sampleTemporal(model.tri.get(triKey), temperature);
    if (!next && model.bi.has(b)) next = sampleTemporal(model.bi.get(b), temperature);
    if (!next) {
      // restart from a random frequent word
      next = sampleTemporal(model.starts, 1.0);
      if (!next) break;
    }
    out.push(next);
    a = b;
    b = next;
    if (out.length >= 8 && /[.!?]$/.test(next)) break;
  }
  if (out.length < 3) return null;
  let text = out.join(' ').replace(/\s+([,.!?;:])/g, '$1');
  text = text.charAt(0).toUpperCase() + text.slice(1);
  if (!/[.!?]$/.test(text)) text += '.';
  return text;
}

// Original, generic knowledge base — no copyrighted content.
const KB = [
  {
    keys: ['transformer', 'attention', 'architecture'],
    text: 'A transformer is a neural network built around self-attention. Every token looks at every other token in the sequence, computes a relevance score, and mixes information accordingly. Stack many of these blocks with feed-forward layers and you get a large language model. Self-attention is what lets the model connect distant words — like matching a pronoun to its subject — in a single parallel pass.',
  },
  {
    keys: ['pretrain', 'pre-train', 'pre-train', 'training', 'gpu', 'cluster', 'loss'],
    text: 'Pre-training is the most expensive stage: the model reads trillions of tokens and repeatedly guesses the next token, adjusting billions of weights with gradient descent (usually AdamW with a cosine learning-rate schedule). On large GPU clusters this can take months. The loss curve dropping from ~4.3 to ~1.3 is the classic sign the model is learning the structure of language.',
  },
  {
    keys: ['rlhf', 'human feedback', 'alignment', 'reward'],
    text: 'RLHF (Reinforcement Learning from Human Feedback) aligns a model with human preferences. First you collect human rankings of model answers, train a small reward model on them, then fine-tune the main model to maximize that reward while staying close to the original (a KL penalty keeps it from gaming the reward).',
  },
  {
    keys: ['dpo', 'preference'],
    text: 'DPO (Direct Preference Optimization) is a simpler alternative to RLHF. Instead of training a separate reward model and running reinforcement learning, DPO directly optimizes the policy on paired preference data — "answer A is better than answer B" — with a single classification-style loss. Same goal, far less machinery.',
  },
  {
    keys: ['fine', 'lora', 'finetun', 'custom', 'personal'],
    text: 'Fine-tuning continues training on a small, curated dataset (often just thousands of examples). Full fine-tuning updates every weight, while parameter-efficient methods like LoRA freeze the base model and train tiny adapter matrices — a fraction of the compute, nearly the same quality. This is the "shortcut": you start from an open-weight base model instead of training from scratch.',
  },
  {
    keys: ['deploy', 'serve', 'vllm', 'tensorrt', 'inference', 'quantiz'],
    text: 'Deployment means serving the model so users get fast answers. Engines like vLLM or TensorRT-LLM use continuous batching, PagedAttention for the KV cache, and quantization (INT8/INT4) to squeeze more throughput from each GPU. A well-tuned serving stack can answer hundreds of requests per second with sub-second latency.',
  },
  {
    keys: ['data', 'token', 'dataset', 'corpus'],
    text: 'Data quality matters more than raw size. A real pipeline crawls the open web, deduplicates with MinHash LSH to avoid memorization, filters low-quality and toxic text, and tokenizes everything into sub-word units. Roughly 10–20 tokens per parameter is the classic compute-optimal ratio from scaling-law research.',
  },
  {
    keys: ['tokeniz', 'bpe', 'vocab'],
    text: 'Tokenization splits text into sub-word units the model can process. Byte-Pair Encoding starts from characters and repeatedly merges the most frequent adjacent pair — "l"+"ow" becomes "low", then "low"+"est" becomes "lowest". The tokenizer playground in this app runs a real, tiny BPE trainer on your own text.',
  },
  {
    keys: ['offline', 'privacy', 'local'],
    text: 'Everything in this app runs 100% offline in your browser or inside the Android WebView. Your dataset, trained model weights and chat history never leave the device — they live in local storage. That is the point of on-device AI: full privacy, zero network dependency.',
  },
  {
    keys: ['kv cache', 'cache', 'memory', 'vram'],
    text: 'During generation, every previous token\'s key and value vectors are cached (the KV cache) so they are not recomputed. VRAM needs are roughly 2 bytes per parameter in FP16, plus the KV cache which grows with batch size and context length. Quantizing to INT4 cuts the weight footprint to about 0.6 bytes per parameter.',
  },
];

const FALLBACK_TEMPLATES = [
  'Great question. In this forge, models are built in four stages: curate data, pre-train on next-token prediction, align with SFT then RLHF/DPO, and serve with a fast inference engine. Each stage is simulated step-by-step in the Pipeline tab.',
  'That touches the core of LLM design. The transformer block — multi-head self-attention plus a feed-forward layer — is repeated N times. In the Architecture tab you can scale depth, width and heads and watch parameter count and VRAM update live.',
  'Here is a practical take: start from an open-weight base model, add your own dataset, and fine-tune with LoRA-style adapters. It is dramatically cheaper than training from scratch, and the Shortcut tab in this app walks you through it.',
  'The honest answer depends on scale. Small models (1–8B params) fit on a single modern GPU, especially at INT4 quantization. Large models need clusters with months of pre-training. Try the cost estimator in the Architecture tab for concrete numbers.',
  'Alignment is what separates a raw base model from a helpful assistant. SFT teaches the format, RLHF or DPO teaches the taste — which answers humans actually prefer. The Alignment tab simulates both reward curves live.',
];

export function knowledgeAnswer(question) {
  const q = question.toLowerCase();
  for (const item of KB) {
    for (const k of item.keys) {
      if (q.includes(k)) return item.text;
    }
  }
  return FALLBACK_TEMPLATES[Math.floor(Math.random() * FALLBACK_TEMPLATES.length)];
}
