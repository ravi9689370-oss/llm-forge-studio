import { h, fmt, fmtInt } from '../ui.js';

export function renderArchitecture(state, onUpdate) {
  const container = h('div');

  const hero = h('div', { class: 'card hero' },
    h('span', { class: 'chip acc', text: 'Transformer Neural Network' }),
    h('h2', { text: 'Architecture Studio & Sizer' }),
    h('p', { text: 'Design your own Transformer model. Tweak layers, hidden dimensions, and attention heads to watch parameters, VRAM footprint, and training compute update in real time.' }),
  );
  container.append(hero);

  // Architecture presets
  const presetsCard = h('div', { class: 'card' },
    h('h3', { text: 'Architecture Presets' }),
    h('p', { text: 'Load standard frontier or lightweight mobile configurations:' }),
    h('div', { class: 'btn-row', style: { marginTop: '8px' } },
      createPresetBtn('Nano 15M (Edge)', { layers: 6, hidden: 288, heads: 6, context: 2048 }),
      createPresetBtn('Micro 125M (On-Device)', { layers: 12, hidden: 768, heads: 12, context: 4096 }),
      createPresetBtn('Mobile 1.2B (Phone)', { layers: 22, hidden: 2048, heads: 16, context: 8192 }),
      createPresetBtn('Llama-3 8B (Workstation)', { layers: 32, hidden: 4096, heads: 32, context: 8192 }),
    )
  );
  container.append(presetsCard);

  function createPresetBtn(label, cfg) {
    return h('button', {
      class: 'btn ghost small',
      text: label,
      onclick: () => {
        state.arch = { ...cfg };
        onUpdate(state);
        updateCalculations();
      }
    });
  }

  // Interactive Sliders Card
  const slidersCard = h('div', { class: 'card' });
  slidersCard.append(h('h3', { text: 'Hyperparameters' }));

  const layersInput = createSlider('Layers (Depth)', state.arch.layers, 2, 80, 1, ' layers', (v) => {
    state.arch.layers = v;
    onUpdate(state);
    updateCalculations();
  });

  const hiddenInput = createSlider('Hidden Dimension (d_model)', state.arch.hidden, 128, 8192, 64, ' dims', (v) => {
    state.arch.hidden = v;
    onUpdate(state);
    updateCalculations();
  });

  const headsInput = createSlider('Attention Heads', state.arch.heads, 2, 64, 2, ' heads', (v) => {
    state.arch.heads = v;
    onUpdate(state);
    updateCalculations();
  });

  const contextInput = createSlider('Context Length', state.arch.context, 1024, 65536, 1024, ' tokens', (v) => {
    state.arch.context = v;
    onUpdate(state);
    updateCalculations();
  });

  slidersCard.append(layersInput.el, hiddenInput.el, headsInput.el, contextInput.el);
  container.append(slidersCard);

  // Parameter & VRAM Stats Card
  const statsCard = h('div', { class: 'card' });
  statsCard.append(h('h3', { text: 'Weights & Memory Footprint' }));

  const statGrid = h('div', { class: 'grid2', style: { marginBottom: '12px' } },
    h('div', { class: 'stat' },
      h('div', { class: 'v', id: 'total-params-val', text: '—' }),
      h('div', { class: 'k', text: 'Total Parameters' })
    ),
    h('div', { class: 'stat' },
      h('div', { class: 'v', id: 'fp16-vram-val', text: '—' }),
      h('div', { class: 'k', text: 'Inference VRAM (FP16)' })
    ),
    h('div', { class: 'stat' },
      h('div', { class: 'v', id: 'int4-vram-val', text: '—' }),
      h('div', { class: 'k', text: 'Quantized VRAM (INT4/AWQ)' })
    ),
    h('div', { class: 'stat' },
      h('div', { class: 'v', id: 'kv-cache-val', text: '—' }),
      h('div', { class: 'k', text: 'KV Cache (per token)' })
    )
  );

  const trainingCalc = h('div', { class: 'card', style: { background: 'rgba(10, 16, 32, 0.6)', border: '1px solid var(--border)' } },
    h('h4', { style: { margin: '0 0 6px', fontSize: '14.5px' }, text: 'Chinchilla Compute & Training Estimation' }),
    h('p', { id: 'compute-summary-text', text: 'Calculating cluster training requirements...' }),
    h('div', { class: 'grid2', style: { marginTop: '8px' } },
      h('div', { class: 'stat' },
        h('div', { class: 'v', id: 'train-tokens-val', text: '—' }),
        h('div', { class: 'k', text: 'Optimal Training Tokens' })
      ),
      h('div', { class: 'stat' },
        h('div', { class: 'v', id: 'cluster-cost-val', text: '—' }),
        h('div', { class: 'k', text: 'Est. H100 Cluster Cost' })
      )
    )
  );

  statsCard.append(statGrid, trainingCalc);
  container.append(statsCard);

  // Transformer Layer Flow Diagram
  const flowCard = h('div', { class: 'card' });
  flowCard.append(
    h('h3', { text: 'Transformer Layer Block Visualizer' }),
    h('p', { text: 'Tap any stage in the forward pass to inspect its tensor transformations:' })
  );

  const flowBox = h('div', { class: 'flow', style: { marginTop: '12px', marginBottom: '14px' } },
    createBlock('1. Token Embedding & RoPE', 'x = Embed(tokens) + Pos(t)'),
    createBlock('2. RMSNorm', 'x_norm = RMSNorm(x)'),
    createBlock('3. Multi-Head Attention', 'attn = Softmax(Q·Kᵀ / √d)·V'),
    createBlock('4. Residual Add', 'x = x + MHA(x_norm)'),
    createBlock('5. SwiGLU FFN', 'ffn = (Swish(xW₁) ⊙ xW₂)W₃'),
    createBlock('6. Final Norm & Head', 'logits = RMSNorm(x) · W_outᵀ'),
  );

  const detailBox = h('div', {
    class: 'learn',
    style: { background: 'rgba(5, 8, 15, 0.8)', border: '1px solid var(--border)', borderRadius: '12px', padding: '12px' },
    id: 'flow-detail-text',
    html: '<b>Tap any layer block above</b> to inspect its internal linear projections, activation functions, and memory mechanics.'
  });

  function createBlock(title, subtitle) {
    const el = h('div', { class: 'blk', style: { cursor: 'pointer' } },
      h('b', { text: title }),
      h('span', { text: subtitle })
    );
    el.addEventListener('click', () => {
      flowBox.querySelectorAll('.blk').forEach(b => b.classList.remove('lit'));
      el.classList.add('lit');
      showBlockDetails(title);
    });
    return el;
  }

  function showBlockDetails(title) {
    const details = {
      '1. Token Embedding & RoPE': '<b>Token Embedding + Rotary Position Embedding (RoPE):</b><br/>Input tokens are looked up in the vocabulary matrix <code>W_embed ∈ ℝ^{V × d}</code>. RoPE applies a complex 2D rotation to query and key vectors based on their token index <code>m</code>, giving the model natural relative positional awareness across long contexts without needing absolute position vectors.',
      '2. RMSNorm': '<b>Root Mean Square Layer Normalization (RMSNorm):</b><br/>A faster variant of LayerNorm that enforces unit variance without computing the mean: <code>RMS(x) = √(1/d ∑ x_i²)</code>. This stabilizes gradient backpropagation across deep stacks of 32+ layers.',
      '3. Multi-Head Attention': '<b>Multi-Query / Grouped-Query Attention (GQA):</b><br/>Input is projected into Query, Key, and Value tensors. Attention scores calculate how much each token attends to prior context: <code>Score = Softmax((Q · Kᵀ) / √d_k) · V</code>. Grouped-Query Attention shares key/value heads across query groups, reducing KV cache VRAM by up to 8x.',
      '4. Residual Add': '<b>Residual Skip Connection:</b><br/>The identity map <code>x_new = x + SubLayer(x)</code> ensures gradients flow directly through the network during backpropagation without vanishing, enabling models with 80+ layers to train reliably.',
      '5. SwiGLU FFN': '<b>SwiGLU Feed-Forward Network:</b><br/>A gated activation layer used in modern models: <code>FFN(x) = (Swish(x · W_gate) ⊙ (x · W_up)) · W_down</code>. With hidden intermediate size <code>(8/3) × d_model</code>, this gives the network non-linear memorization capacity for facts and reasoning rules.',
      '6. Final Norm & Head': '<b>Language Model Output Head:</b><br/>Projects the final hidden representation back to the vocabulary dimension <code>V</code> to produce unnormalized log-probabilities (logits). The Softmax of logits defines the next-token probability distribution: <code>P(w_{t+1} | w_{1:t})</code>.'
    };
    detailBox.innerHTML = details[title] || '';
  }

  flowCard.append(flowBox, detailBox);
  container.append(flowCard);

  function createSlider(label, val, min, max, step, unit, onChange) {
    const valueEl = h('b', { text: val + unit });
    const lbl = h('label', {}, h('span', { text: label }), valueEl);
    const slider = h('input', {
      type: 'range',
      min: String(min),
      max: String(max),
      step: String(step),
      value: String(val),
      oninput: (e) => {
        const num = Number(e.target.value);
        valueEl.textContent = num + unit;
        onChange(num);
      }
    });
    return {
      el: h('div', { class: 'field' }, lbl, slider),
      setValue: (newVal) => {
        slider.value = String(newVal);
        valueEl.textContent = newVal + unit;
      }
    };
  }

  function updateCalculations() {
    const { layers, hidden, heads, context } = state.arch;
    const vocab = 128256; // Standard modern Llama-3 style vocab

    // 1. Embedding weights: vocab * hidden
    const embedParams = vocab * hidden;

    // 2. Attention weights per layer (Q, K, V, O): 4 * hidden^2
    const attnPerLayer = 4 * hidden * hidden;

    // 3. SwiGLU FFN weights per layer: gate, up, down = 3 * hidden * (8/3 * hidden) = 8 * hidden^2
    const ffnPerLayer = 8 * hidden * hidden;

    // 4. Norms per layer: 2 * hidden
    const normPerLayer = 2 * hidden;

    // Total per layer
    const perLayer = attnPerLayer + ffnPerLayer + normPerLayer;

    // Total Model Parameters
    const totalParams = embedParams + (layers * perLayer) + (vocab * hidden); // with tied/untied head

    // VRAM calculation:
    // FP16 = 2 bytes per param
    const fp16Bytes = totalParams * 2;
    // INT4 = 0.55 bytes per param (with quantization scales)
    const int4Bytes = totalParams * 0.55;

    // KV Cache per token (in bytes for FP16): 2 * layers * 2(K+V) * hidden * 2 bytes
    const kvCachePerToken = 2 * layers * hidden * 2;
    const fullContextKV = kvCachePerToken * context;

    // Chinchilla optimal tokens = 20 * params
    const chinchillaTokens = totalParams * 20;

    // Training FLOPs = 6 * params * tokens
    const trainFlops = 6 * totalParams * chinchillaTokens;

    // H100 provides ~700 TFLOPS at 50% MFU
    const h100FlopsPerSec = 700e12 * 0.5;
    const totalGpuSeconds = trainFlops / h100FlopsPerSec;
    const totalGpuHours = totalGpuSeconds / 3600;
    const estCostUSD = totalGpuHours * 2.80; // ~$2.80 per H100-hour

    // Update UI elements
    const pEl = container.querySelector('#total-params-val');
    const fp16El = container.querySelector('#fp16-vram-val');
    const int4El = container.querySelector('#int4-vram-val');
    const kvEl = container.querySelector('#kv-cache-val');
    const tokEl = container.querySelector('#train-tokens-val');
    const costEl = container.querySelector('#cluster-cost-val');
    const sumEl = container.querySelector('#compute-summary-text');

    if (pEl) pEl.textContent = fmt(totalParams, 2);
    if (fp16El) fp16El.textContent = (fp16Bytes / 1e9).toFixed(1) + ' GB';
    if (int4El) int4El.textContent = (int4Bytes / 1e9).toFixed(1) + ' GB';
    if (kvEl) kvEl.textContent = (kvCachePerToken / 1024).toFixed(1) + ' KB';
    if (tokEl) tokEl.textContent = fmt(chinchillaTokens, 1);
    if (costEl) costEl.textContent = estCostUSD < 1000 ? '$' + Math.round(estCostUSD) : '$' + fmt(estCostUSD, 1);

    if (sumEl) {
      sumEl.innerHTML = `To compute-optimally train this <b>${fmt(totalParams, 2)} parameter model</b> on <b>${fmt(chinchillaTokens, 1)} tokens</b>, you would require approximately <b>${fmtInt(totalGpuHours)} H100 GPU-hours</b> (~${(totalGpuHours / (256 * 24)).toFixed(1)} days on a 256-GPU cluster).`;
    }

    // Also update slider displays if preset changed
    layersInput.setValue(layers);
    hiddenInput.setValue(hidden);
    headsInput.setValue(heads);
    contextInput.setValue(context);
  }

  // Trigger initial calculation
  setTimeout(updateCalculations, 40);

  return container;
}
