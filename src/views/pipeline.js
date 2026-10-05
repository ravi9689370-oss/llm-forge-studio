import { h, toast, fmt, fmtInt } from '../ui.js';
import { STAGES } from '../state.js';

export function renderPipeline(state, onUpdate) {
  const container = h('div');

  const hero = h('div', { class: 'card hero' },
    h('span', { class: 'chip acc', text: 'Full 4-Stage Lifecycle' }),
    h('h2', { text: 'LLM Manufacturing Pipeline' }),
    h('p', { text: 'Building a frontier AI model from scratch follows 4 core stages: massive data collection, pre-training across GPU clusters, alignment (RLHF/DPO), and low-latency deployment.' }),
  );
  container.append(hero);

  // Stage 1: Data Collection & Cleaning
  container.append(createStage1(state, onUpdate));

  // Stage 2: Pre-Training Simulator
  container.append(createStage2(state, onUpdate));

  // Stage 3: Fine-Tuning & Alignment (RLHF / DPO)
  container.append(createStage3(state, onUpdate));

  // Stage 4: Deployment & Serving (vLLM / TensorRT-LLM)
  container.append(createStage4(state, onUpdate));

  return container;
}

/* ============================================================
   STAGE 1: DATA COLLECTION & CLEANING
   ============================================================ */
function createStage1(state, onUpdate) {
  const card = h('div', { class: 'card' });
  const isDone = state.stageDone.data;

  const header = h('div', { style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' } },
    h('div', { style: { display: 'flex', alignItems: 'center', gap: '10px' } },
      h('span', { class: 'chip ' + (isDone ? 'ok' : 'acc'), text: 'Stage 1' }),
      h('h3', { style: { margin: 0 }, text: 'Data Collection & Curation' })
    ),
    isDone ? h('span', { class: 'chip ok', text: '✓ Curated' }) : null
  );

  const desc = h('p', { text: 'Billions of raw web documents must be scraped, deduplicated using MinHash LSH, stripped of toxicity, and packed into binary token streams.' });

  const statsRow = h('div', { class: 'grid2', style: { marginBottom: '12px' } },
    h('div', { class: 'stat' },
      h('div', { class: 'v', id: 'raw-docs-val', text: isDone ? '15.4B' : '0' }),
      h('div', { class: 'k', text: 'Raw Documents Crawled' })
    ),
    h('div', { class: 'stat' },
      h('div', { class: 'v', id: 'clean-tokens-val', text: isDone ? '3.8T' : '0' }),
      h('div', { class: 'k', text: 'Clean Training Tokens' })
    )
  );

  const term = h('div', { class: 'term', id: 'data-term' },
    isDone
      ? '[SYSTEM] Corpus compiled: 3.8 Trillion clean tokens ready for pre-training.'
      : '[STANDBY] Ready to initiate CommonCrawl, ArXiv, GitHub & Wikipedia ingester...'
  );

  const bar = h('div', { class: 'bar' }, h('i', { id: 'data-bar-fill', style: { width: isDone ? '100%' : '0%' } }));

  let crawling = false;
  const startBtn = h('button', {
    class: 'btn block',
    style: { marginTop: '12px' },
    text: isDone ? 'Re-run Data Ingestion' : 'Start Web Scraper & MinHash Pipeline',
    onclick: () => {
      if (crawling) return;
      crawling = true;
      startBtn.disabled = true;
      term.textContent = '';
      const barFill = card.querySelector('#data-bar-fill');
      const rawEl = card.querySelector('#raw-docs-val');
      const tokEl = card.querySelector('#clean-tokens-val');

      const logs = [
        'Connecting to CommonCrawl dump (240 TiB WARC files)...',
        'Filtering HTML boilerplate & navigation menus...',
        'Running MinHash LSH (128 hash permutations) for near-duplicate removal...',
        'Deduplication complete: 42.8% duplicate documents discarded.',
        'FastText language identification: retained high-quality multilingual text.',
        'Filtering toxic & PII content (regex + heuristic scoring)...',
        'BPE Tokenizer encoding into uint16 binary files (.bin)...',
        'Finished! 3,842,109,200,000 tokens packaged across 256 shards.'
      ];

      let step = 0;
      const interval = setInterval(() => {
        if (step < logs.length) {
          term.textContent += `[${new Date().toLocaleTimeString()}] ${logs[step]}\n`;
          term.scrollTop = term.scrollHeight;
          const pct = Math.round(((step + 1) / logs.length) * 100);
          barFill.style.width = pct + '%';
          rawEl.textContent = (step * 2.2).toFixed(1) + 'B';
          tokEl.textContent = (step * 0.55).toFixed(1) + 'T';
          step++;
        } else {
          clearInterval(interval);
          crawling = false;
          startBtn.disabled = false;
          startBtn.textContent = 'Re-run Data Ingestion';
          state.stageDone.data = true;
          state.stats.tokensProcessed = (state.stats.tokensProcessed || 0) + 3800000000000;
          onUpdate(state);
          toast('Data Curation Complete: 3.8T Tokens Ready');
        }
      }, 350);
    }
  });

  card.append(header, desc, statsRow, term, bar, startBtn);
  return card;
}

/* ============================================================
   STAGE 2: PRE-TRAINING (GPU CLUSTER SIMULATOR)
   ============================================================ */
function createStage2(state, onUpdate) {
  const card = h('div', { class: 'card' });
  const isDone = state.stageDone.pretrain;

  const header = h('div', { style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' } },
    h('div', { style: { display: 'flex', alignItems: 'center', gap: '10px' } },
      h('span', { class: 'chip ' + (isDone ? 'ok' : 'acc'), text: 'Stage 2' }),
      h('h3', { style: { margin: 0 }, text: 'Pre-Training Simulator' })
    ),
    isDone ? h('span', { class: 'chip ok', text: '✓ Pre-Trained' }) : null
  );

  const desc = h('p', { text: 'Train billions of parameters using Megatron-LM tensor & pipeline parallelism across NVIDIA H100 clusters. Watch cross-entropy loss fall exponentially.' });

  const metrics = h('div', { class: 'grid2', style: { marginBottom: '10px' } },
    h('div', { class: 'stat' },
      h('div', { class: 'v', id: 'loss-val', text: isDone ? '1.24' : '4.65' }, h('span', { style: { fontSize: '11px', color: 'var(--muted)', marginLeft: '4px' }, text: 'Loss' })),
      h('div', { class: 'k', text: 'Cross-Entropy Loss' })
    ),
    h('div', { class: 'stat' },
      h('div', { class: 'v', id: 'mfu-val', text: isDone ? '48.2%' : '0%' }),
      h('div', { class: 'k', text: 'Model FLOPs Utilization (MFU)' })
    )
  );

  const canvas = h('canvas', { class: 'plot', width: 480, height: 110 });
  const ctx = canvas.getContext('2d');

  function drawLossCurve(lossHistory) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    // Grid lines
    ctx.strokeStyle = 'rgba(109, 141, 255, 0.1)';
    ctx.lineWidth = 1;
    for (let y = 20; y < canvas.height; y += 25) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvas.width, y);
      ctx.stroke();
    }
    if (lossHistory.length < 2) return;
    ctx.beginPath();
    ctx.strokeStyle = '#43e0d4';
    ctx.lineWidth = 2.5;
    for (let i = 0; i < lossHistory.length; i++) {
      const x = (i / (lossHistory.length - 1)) * (canvas.width - 20) + 10;
      const normalized = Math.max(0, Math.min(1, (lossHistory[i] - 1.0) / 3.8));
      const y = (1 - normalized) * (canvas.height - 25) + 12;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();
  }

  // Initial draw
  setTimeout(() => {
    drawLossCurve(isDone ? [4.65, 3.8, 3.1, 2.6, 2.1, 1.8, 1.5, 1.34, 1.24] : [4.65]);
  }, 50);

  const term = h('div', { class: 'term', style: { height: '140px', marginTop: '10px' }, id: 'train-term' },
    isDone
      ? '[CLUSTER] Pre-training checkpoint saved at Step 100,000. Loss: 1.24. Base model weights ready.'
      : '[CLUSTER] 1,024x NVIDIA H100 SXM5 nodes allocated. Ready to trigger training.'
  );

  let training = false;
  const trainBtn = h('button', {
    class: 'btn block',
    style: { marginTop: '12px' },
    text: isDone ? 'Re-train Base Model' : 'Launch H100 Cluster Pre-Training',
    onclick: () => {
      if (training) return;
      training = true;
      trainBtn.disabled = true;
      term.textContent = '';
      const lossEl = card.querySelector('#loss-val');
      const mfuEl = card.querySelector('#mfu-val');
      let loss = 4.65;
      const history = [loss];
      let step = 0;

      const timer = setInterval(() => {
        step += 5000;
        loss = Math.max(1.18, loss * 0.88 + (Math.random() * 0.05 - 0.02));
        history.push(loss);
        drawLossCurve(history);

        lossEl.firstChild.nodeValue = loss.toFixed(2);
        mfuEl.textContent = (47.5 + Math.random() * 2.5).toFixed(1) + '%';

        term.textContent += `Step ${step.toString().padStart(6, ' ')} | Loss: ${loss.toFixed(4)} | LR: ${(3e-4 * Math.cos((step / 100000) * (Math.PI / 2))).toExponential(2)} | TFLOPS/GPU: 680\n`;
        term.scrollTop = term.scrollHeight;

        if (step >= 100000) {
          clearInterval(timer);
          training = false;
          trainBtn.disabled = false;
          trainBtn.textContent = 'Re-train Base Model';
          state.stageDone.pretrain = true;
          state.stats.gpuHours = (state.stats.gpuHours || 0) + 120000;
          onUpdate(state);
          toast('Pre-Training Completed! Final Loss: ' + loss.toFixed(2));
        }
      }, 160);
    }
  });

  card.append(header, desc, metrics, canvas, term, trainBtn);
  return card;
}

/* ============================================================
   STAGE 3: FINE-TUNING & ALIGNMENT (RLHF & DPO)
   ============================================================ */
function createStage3(state, onUpdate) {
  const card = h('div', { class: 'card' });
  const isDone = state.stageDone.finetune;

  const header = h('div', { style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' } },
    h('div', { style: { display: 'flex', alignItems: 'center', gap: '10px' } },
      h('span', { class: 'chip ' + (isDone ? 'ok' : 'acc'), text: 'Stage 3' }),
      h('h3', { style: { margin: 0 }, text: 'Fine-Tuning & Alignment (RLHF / DPO)' })
    ),
    isDone ? h('span', { class: 'chip ok', text: '✓ Aligned' }) : null
  );

  const desc = h('p', { text: 'Raw pre-trained models only complete text. Supervised Fine-Tuning (SFT) and Direct Preference Optimization (DPO) turn raw text predictors into safe, helpful assistants.' });

  // Alignment Method Toggle
  let currentMethod = 'DPO';
  const methodSeg = h('div', { class: 'seg', style: { marginBottom: '12px' } },
    h('button', {
      class: 'on', text: 'DPO (Direct Preference Optimization)',
      onclick: (e) => {
        methodSeg.querySelectorAll('button').forEach(b => b.classList.remove('on'));
        e.target.classList.add('on');
        currentMethod = 'DPO';
        methodExpl.innerHTML = '<b>DPO:</b> Directly optimizes policy on paired feedback (chosen vs rejected responses) without needing a separate reward model or complex PPO actor-critic loop.';
      }
    }),
    h('button', {
      text: 'RLHF (Reward Model + PPO)',
      onclick: (e) => {
        methodSeg.querySelectorAll('button').forEach(b => b.classList.remove('on'));
        e.target.classList.add('on');
        currentMethod = 'RLHF';
        methodExpl.innerHTML = '<b>RLHF:</b> Trains a Reward Model on human preference pairs, then uses Proximal Policy Optimization (PPO) with a KL-divergence penalty to maximize human satisfaction.';
      }
    })
  );

  const methodExpl = h('div', {
    class: 'learn',
    style: { marginBottom: '12px', background: 'rgba(13, 18, 36, 0.7)', padding: '10px 12px', borderRadius: '10px', border: '1px solid var(--border)' },
    html: '<b>DPO:</b> Directly optimizes policy on paired feedback (chosen vs rejected responses) without needing a separate reward model or complex PPO actor-critic loop.'
  });

  const comparisonBox = h('div', { class: 'grid2', style: { marginBottom: '12px' } },
    h('div', { class: 'stat' },
      h('div', { class: 'v', id: 'align-score', text: isDone ? '94.8%' : '32.1%' }),
      h('div', { class: 'k', text: 'Helpful & Safe Benchmark' })
    ),
    h('div', { class: 'stat' },
      h('div', { class: 'v', id: 'kl-div', text: isDone ? '0.042' : '0.000' }),
      h('div', { class: 'k', text: 'KL Drift from Base' })
    )
  );

  let aligning = false;
  const alignBtn = h('button', {
    class: 'btn block',
    text: isDone ? 'Re-align Model' : 'Run Alignment Optimization',
    onclick: () => {
      if (aligning) return;
      aligning = true;
      alignBtn.disabled = true;
      alignBtn.textContent = `Running ${currentMethod} Alignment...`;

      let score = 32.1;
      const target = 95.2;
      const scoreEl = card.querySelector('#align-score');
      const klEl = card.querySelector('#kl-div');

      const interval = setInterval(() => {
        score += (target - score) * 0.22;
        scoreEl.textContent = score.toFixed(1) + '%';
        klEl.textContent = (0.005 + (score / 100) * 0.038).toFixed(3);

        if (score >= target - 0.4) {
          clearInterval(interval);
          scoreEl.textContent = '95.4%';
          aligning = false;
          alignBtn.disabled = false;
          alignBtn.textContent = 'Re-align Model';
          state.stageDone.finetune = true;
          onUpdate(state);
          toast(`${currentMethod} Alignment Completed! Score: 95.4%`);
        }
      }, 100);
    }
  });

  card.append(header, desc, methodSeg, methodExpl, comparisonBox, alignBtn);
  return card;
}

/* ============================================================
   STAGE 4: DEPLOYMENT & SERVING (vLLM / TensorRT-LLM)
   ============================================================ */
function createStage4(state, onUpdate) {
  const card = h('div', { class: 'card' });
  const isDone = state.stageDone.deploy;

  const header = h('div', { style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' } },
    h('div', { style: { display: 'flex', alignItems: 'center', gap: '10px' } },
      h('span', { class: 'chip ' + (isDone ? 'ok' : 'acc'), text: 'Stage 4' }),
      h('h3', { style: { margin: 0 }, text: 'Deployment & High-Speed Serving' })
    ),
    isDone ? h('span', { class: 'chip ok', text: '✓ Serving Online' }) : null
  );

  const desc = h('p', { text: 'Compile the aligned weights for high-throughput serving with continuous batching, PagedAttention, and INT4 / AWQ quantization.' });

  const configRow = h('div', { class: 'grid2', style: { marginBottom: '12px' } },
    h('div', { class: 'stat' },
      h('div', { class: 'v', id: 'tps-val', text: isDone ? '184.2' : '0' }, h('span', { style: { fontSize: '11px', color: 'var(--muted)', marginLeft: '4px' }, text: 'tok/s' })),
      h('div', { class: 'k', text: 'Serving Throughput' })
    ),
    h('div', { class: 'stat' },
      h('div', { class: 'v', id: 'ttft-val', text: isDone ? '18.4 ms' : '—' }),
      h('div', { class: 'k', text: 'Time To First Token (TTFT)' })
    )
  );

  let deploying = false;
  const deployBtn = h('button', {
    class: 'btn block',
    text: isDone ? 'Re-deploy Server' : 'Deploy to vLLM / TensorRT-LLM Endpoint',
    onclick: () => {
      if (deploying) return;
      deploying = true;
      deployBtn.disabled = true;
      deployBtn.textContent = 'Compiling PagedAttention Kernels...';

      setTimeout(() => {
        deployBtn.textContent = 'Quantizing weights to AWQ INT4...';
      }, 700);

      setTimeout(() => {
        deployBtn.textContent = 'Spinning up OpenAI-compatible API endpoint...';
      }, 1400);

      setTimeout(() => {
        deploying = false;
        deployBtn.disabled = false;
        deployBtn.textContent = 'Re-deploy Server';
        card.querySelector('#tps-val').firstChild.nodeValue = (175 + Math.random() * 20).toFixed(1);
        card.querySelector('#ttft-val').textContent = (16 + Math.random() * 4).toFixed(1) + ' ms';
        state.stageDone.deploy = true;
        onUpdate(state);
        toast('Model Server Deployed and Ready to Answer!');
      }, 2100);
    }
  });

  card.append(header, desc, configRow, deployBtn);
  return card;
}
