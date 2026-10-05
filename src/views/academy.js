import { h, toast } from '../ui.js';

export function renderAcademy(state, onUpdate) {
  const container = h('div');

  const hero = h('div', { class: 'card hero' },
    h('span', { class: 'chip acc', text: 'Curriculum & Theory' }),
    h('h2', { text: 'LLM Foundations Academy' }),
    h('p', { text: 'Master the science and engineering behind modern frontier language models — from transformer attention to cluster parallelism and DPO alignment.' }),
  );
  container.append(hero);

  // Chapters list
  const chapters = [
    {
      title: '1. Transformer Neural Network Architecture',
      badge: 'Core Model',
      body: `
        <p>Introduced in <i>Attention Is All You Need</i> (2017), the Decoder-only Transformer is the universal backbone for LLMs like Gemini and GPT.</p>
        <ul>
          <li><b>Self-Attention:</b> Allows every token to attend to all preceding tokens via Query (Q), Key (K), and Value (V) projections: <code>Attention(Q,K,V) = Softmax(QKᵀ / √d_k) V</code>.</li>
          <li><b>RoPE (Rotary Position Embeddings):</b> Rotates vectors in 2D coordinate pairs to encode relative distance directly into attention dot-products.</li>
          <li><b>SwiGLU Non-Linearity:</b> Replaces older ReLU/GELU activations with gated linear units, improving reasoning capacity per parameter.</li>
          <li><b>RMSNorm:</b> Replaces LayerNorm by ignoring mean centering, speeding up training wall-clock time by ~7%.</li>
        </ul>
      `
    },
    {
      title: '2. Frameworks & Engineering Stack',
      badge: 'Tooling',
      body: `
        <p>The standard deep learning stack used across industrial research labs:</p>
        <ul>
          <li><b>PyTorch & CUDA:</b> The dominant training framework. Custom CUDA/Triton kernels (FlashAttention-3) saturate GPU SRAM bandwidth.</li>
          <li><b>JAX & XLA:</b> Popularized by Google for high-scale TPU/GPU matrix multiplication and automated vectorization (<code>vmap</code>, <code>pmap</code>).</li>
          <li><b>Hugging Face:</b> The open-source standard for model weights (Transformers), parameter-efficient adapters (PEFT), and dataset hosting.</li>
          <li><b>Megatron-LM & DeepSpeed:</b> 3D Parallelism libraries that split models across Tensor Parallelism (TP), Pipeline Parallelism (PP), and Data Parallelism (ZeRO-3).</li>
        </ul>
      `
    },
    {
      title: '3. Pre-Training at Scale',
      badge: 'Compute Heavy',
      body: `
        <p>Pre-training consumes 98% of the total project budget:</p>
        <ul>
          <li><b>Chinchilla Scaling Laws:</b> A compute-optimal model trains on 20 tokens per parameter (e.g. an 8B model needs at least 160B tokens; modern models like LLaMA-3 train on 15T tokens to saturate inference efficiency).</li>
          <li><b>Optimization:</b> AdamW optimizer with $\beta_1=0.9$, $\beta_2=0.95$, weight decay $0.1$, and a cosine learning rate decay with 2,000 steps of linear warmup.</li>
          <li><b>Hardware:</b> Clusters of 1,024 to 24,000 NVIDIA H100 GPUs connected via 3.2 Tbps InfiniBand (Quantum-2) networks to eliminate all-reduce bottlenecks.</li>
        </ul>
      `
    },
    {
      title: '4. Alignment: RLHF vs. DPO',
      badge: 'Behavior Tuning',
      body: `
        <p>Aligning raw completions with human intent:</p>
        <ul>
          <li><b>Supervised Fine-Tuning (SFT):</b> Train on curated high-quality Q&A conversations to teach conversational turn-taking and system prompt compliance.</li>
          <li><b>RLHF (PPO):</b> Human annotators rank outputs. A reward model is trained on these rankings, and the base model is optimized via PPO with a KL-divergence penalty.</li>
          <li><b>DPO (Direct Preference Optimization):</b> Derives an exact analytical relationship between policy and reward, enabling direct gradient optimization on preference pairs without running a separate reward model or RL loop.</li>
        </ul>
      `
    },
    {
      title: '5. High-Throughput Serving & Inference',
      badge: 'Production',
      body: `
        <p>Generating tokens at 100+ tokens/second:</p>
        <ul>
          <li><b>vLLM & PagedAttention:</b> Manages the KV cache like virtual memory in an OS, eliminating 96% of wasted VRAM and enabling continuous batching.</li>
          <li><b>TensorRT-LLM:</b> NVIDIA\'s compiler that fuses multi-head attention and GEMM operations into specialized GPU assembly kernels.</li>
          <li><b>Quantization (INT4 / AWQ / GPTQ):</b> Squeezes 16-bit floating point weights into 4-bit integers with less than 0.5% degradation in perplexity.</li>
        </ul>
      `
    },
    {
      title: '6. The Open-Source Shortcut',
      badge: 'Smart Strategy',
      body: `
        <p>For 99% of developers and businesses, training from scratch is unnecessary and uneconomical. The modern approach is:</p>
        <ul>
          <li>Download high-grade open weights: <b>Meta LLaMA 3</b>, <b>Google Gemma</b>, or <b>Mistral</b>.</li>
          <li>Attach <b>LoRA (Low-Rank Adaptation)</b> adapters to attention matrices (W_q, W_v).</li>
          <li>Fine-tune on private domain data using a single consumer GPU in just a few hours.</li>
        </ul>
      `
    }
  ];

  chapters.forEach((ch, idx) => {
    const card = h('div', { class: 'card' });
    card.append(
      h('div', { style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' } },
        h('h3', { style: { margin: 0, fontSize: '15px' }, text: ch.title }),
        h('span', { class: 'chip acc', text: ch.badge })
      ),
      h('div', { class: 'learn', html: ch.body })
    );
    container.append(card);
  });

  // Interactive Quiz Card
  container.append(createQuizCard(state, onUpdate));

  return container;
}

function createQuizCard(state, onUpdate) {
  const card = h('div', { class: 'card' });
  card.append(
    h('span', { class: 'chip ok', text: 'Interactive Certification' }),
    h('h3', { text: 'LLM Engineering Knowledge Check' }),
    h('p', { text: 'Test your understanding of transformers, pre-training, and alignment with these practical engineering questions:' })
  );

  const questions = [
    {
      q: 'Which mechanism in the Transformer enables tokens to contextualize distant words in parallel?',
      opts: [
        'Convolutional kernel filters',
        'Multi-Head Self-Attention',
        'Recurrent hidden states (LSTM)',
        'Dropout regularization'
      ],
      correct: 1,
      exp: 'Multi-Head Self-Attention computes dot-product relevance scores between all token pairs in O(1) sequential steps.'
    },
    {
      q: 'What is the main advantage of DPO (Direct Preference Optimization) over traditional RLHF?',
      opts: [
        'DPO does not require any human preference data',
        'DPO bypasses training a separate reward model and avoids complex PPO actor-critic loops',
        'DPO increases model parameter size by 4x',
        'DPO only works on vision models'
      ],
      correct: 1,
      exp: 'DPO expresses the optimal policy directly in closed-form relative to the preference loss, eliminating reward modeling and RL instability.'
    },
    {
      q: 'How does LoRA (Low-Rank Adaptation) drastically reduce fine-tuning VRAM requirements?',
      opts: [
        'It deletes all feed-forward network layers',
        'It freezes base model weights and trains low-rank decomposition matrices (A × B)',
        'It reduces token vocabulary size to 256',
        'It runs only on CPU'
      ],
      correct: 1,
      exp: 'LoRA freezes base weights W and optimizes ΔW = B · A where rank r << d, requiring <1% parameter updates and tiny optimizer memory.'
    },
    {
      q: 'What problem does PagedAttention (used in vLLM) solve during serving?',
      opts: [
        'It translates English tokens to Hindi',
        'It eliminates fragmentation in KV-Cache memory by managing it like virtual memory pages',
        'It trains the model faster on web crawls',
        'It compresses model weights from 32-bit to 8-bit'
      ],
      correct: 1,
      exp: 'PagedAttention organizes continuous Key-Value cache vectors into non-contiguous physical memory blocks, boosting GPU serving throughput up to 4x.'
    }
  ];

  let currentScore = 0;
  const questionsContainer = h('div', { style: { display: 'flex', flexDirection: 'column', gap: '14px', marginTop: '12px' } });

  questions.forEach((item, qIdx) => {
    const qBox = h('div', {
      style: { background: 'rgba(5, 8, 15, 0.7)', border: '1px solid var(--border)', borderRadius: '12px', padding: '12px' }
    });

    qBox.append(
      h('div', { style: { fontWeight: '700', fontSize: '13.5px', marginBottom: '8px' }, text: `Q${qIdx + 1}: ${item.q}` })
    );

    const optsBox = h('div', { style: { display: 'flex', flexDirection: 'column', gap: '6px' } });
    let answered = false;

    item.opts.forEach((optText, oIdx) => {
      const optBtn = h('button', {
        class: 'btn ghost small',
        style: { justifyContent: 'flex-start', textAlign: 'left', fontWeight: '500' },
        text: optText,
        onclick: () => {
          if (answered) return;
          answered = true;
          if (oIdx === item.correct) {
            optBtn.style.background = 'rgba(61, 220, 151, 0.2)';
            optBtn.style.borderColor = 'var(--ok)';
            optBtn.style.color = 'var(--ok)';
            currentScore++;
            toast('Correct answer! +1 Point');
          } else {
            optBtn.style.background = 'rgba(255, 107, 129, 0.2)';
            optBtn.style.borderColor = 'var(--danger)';
            optBtn.style.color = 'var(--danger)';
            // Highlight correct one
            optsBox.children[item.correct].style.borderColor = 'var(--ok)';
            optsBox.children[item.correct].style.color = 'var(--ok)';
          }
          expBox.style.display = 'block';
          updateTotalScore();
        }
      });
      optsBox.append(optBtn);
    });

    const expBox = h('div', {
      class: 'learn',
      style: { display: 'none', marginTop: '8px', padding: '8px 10px', background: 'rgba(109, 141, 255, 0.08)', borderRadius: '8px', border: '1px solid var(--border)' },
      html: `<b>Explanation:</b> ${item.exp}`
    });

    qBox.append(optsBox, expBox);
    questionsContainer.append(qBox);
  });

  const scoreBanner = h('div', {
    class: 'stat',
    style: { marginTop: '12px', textAlign: 'center' },
    id: 'quiz-score-banner'
  },
    h('div', { class: 'v', id: 'quiz-score-val', text: '0 / 4' }),
    h('div', { class: 'k', text: 'Knowledge Check Score' })
  );

  function updateTotalScore() {
    card.querySelector('#quiz-score-val').textContent = `${currentScore} / ${questions.length}`;
    if (currentScore > (state.quizBest || 0)) {
      state.quizBest = currentScore;
      onUpdate(state);
    }
  }

  card.append(questionsContainer, scoreBanner);
  return card;
}
