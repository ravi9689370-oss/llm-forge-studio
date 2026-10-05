import { h, toast, fmtInt } from '../ui.js';
import { trainNgram, generate, knowledgeAnswer } from '../trainer.js';

export function renderShortcut(state, onUpdate) {
  const container = h('div');

  const hero = h('div', { class: 'card hero' },
    h('span', { class: 'chip warn', text: 'The Modern Shortcut' }),
    h('h2', { text: 'Open-Source Fine-Tuning & Chat' }),
    h('p', { text: 'Instead of spending millions training from zero, download an open-weight base model (LLaMA 3, Gemma, Mistral), fine-tune on your personal data using LoRA, and chat with your custom AI offline.' }),
  );
  container.append(hero);

  // 1. Base Model & Method Selection Card
  const setupCard = h('div', { class: 'card' });
  setupCard.append(h('h3', { text: '1. Choose Open-Source Base Model' }));

  let selectedBase = state.model?.base || 'Meta LLaMA 3 (8B)';
  let selectedMethod = state.model?.method || 'LoRA (Low-Rank Adaptation)';

  const baseModels = [
    { name: 'Meta LLaMA 3 (8B)', desc: 'Frontier reasoning, fast, open weights', params: '8.03B' },
    { name: 'Google Gemma 2 (9B)', desc: 'High quality per parameter, sliding-window', params: '9.24B' },
    { name: 'Mistral NeMo (12B)', desc: 'Strong multilingual and code capabilities', params: '12.2B' },
    { name: 'Nano-Base (125M)', desc: 'Ultra-lightweight on-device model', params: '125M' },
  ];

  const baseList = h('div', { style: { display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '10px' } });
  baseModels.forEach((m) => {
    const item = h('div', {
      class: 'stage' + (selectedBase === m.name ? ' done' : ''),
      style: { cursor: 'pointer', margin: 0, padding: '10px 12px' },
      onclick: () => {
        baseList.querySelectorAll('.stage').forEach(el => el.classList.remove('done'));
        item.classList.add('done');
        selectedBase = m.name;
      }
    },
      h('div', { class: 'num', style: { width: '28px', height: '28px', fontSize: '12px' }, text: 'AI' }),
      h('div', { class: 'body' },
        h('h4', { style: { margin: 0, fontSize: '13.5px' }, text: m.name }),
        h('p', { style: { fontSize: '11.5px', color: 'var(--muted)' }, text: `${m.desc} • ${m.params}` })
      )
    );
    baseList.append(item);
  });
  setupCard.append(baseList);

  // Fine-tuning technique selector
  setupCard.append(h('h3', { style: { marginTop: '16px' }, text: '2. Fine-Tuning Technique' }));
  const methods = ['LoRA (Low-Rank Adaptation)', 'QLoRA (4-bit Quantized)', 'Full Weight Tuning'];
  const methodSeg = h('div', { class: 'seg', style: { marginTop: '8px' } },
    ...methods.map(m => h('button', {
      class: selectedMethod === m ? 'on' : '',
      text: m.split(' ')[0],
      onclick: (e) => {
        methodSeg.querySelectorAll('button').forEach(b => b.classList.remove('on'));
        e.target.classList.add('on');
        selectedMethod = m;
      }
    }))
  );
  setupCard.append(methodSeg);
  container.append(setupCard);

  // 2. Training Data Input Card
  const dataCard = h('div', { class: 'card' });
  dataCard.append(
    h('h3', { text: '3. Your Personal Training Data' }),
    h('p', { text: 'Enter custom knowledge, personal FAQs, or Hinglish notes to train your AI model right in this browser:' })
  );

  const presets = [
    {
      name: 'Personal Assistant (Hinglish/English)',
      data: `Mere baare mein jankari:
Main ek personal AI assistant hoon jise offline device par fine-tune kiya gaya hai.
Main Hindi, Hinglish aur English teenon languages samajh sakta hoon.
Mera purpose users ko AI concepts, programming, aur daily queries mein help karna hai.
Transformer neural network deep learning par based hota hai jisme self-attention use hota hai.
LoRA ka full form Low-Rank Adaptation hai jo base model ke weights freeze karke chote adapter matrices train karta hai.`
    },
    {
      name: 'Python & AI Engineer',
      data: `PyTorch is a popular deep learning framework for training neural networks.
To train an LLM with LoRA, use Hugging Face PEFT library with LoraConfig.
AdamW is the preferred optimizer for transformer architectures with weight decay.
FlashAttention speeds up attention computation by tiling memory in GPU SRAM.
Continuous batching in vLLM maximizes token generation throughput.`
    },
    {
      name: 'E-Commerce Agent',
      data: `Hamare store ka return policy 7 din ka hai.
Shipping poore India mein 2 se 4 business days mein deliver hoti hai.
Payment options: UPI, Credit Card, Debit Card, aur Cash on Delivery available hai.
Customer support helpline subah 9 baje se shaam 8 baje tak active rehti hai.`
    }
  ];

  const presetRow = h('div', { class: 'btn-row', style: { marginBottom: '10px' } },
    ...presets.map(p => h('button', {
      class: 'btn ghost small',
      text: p.name.split(' ')[0] + ' Preset',
      onclick: () => {
        dataTextarea.value = p.data;
      }
    }))
  );
  dataCard.append(presetRow);

  const defaultText = state.dataset || presets[0].data;
  const dataTextarea = h('textarea', {
    placeholder: 'Paste your custom text or FAQ here...',
    style: { minHeight: '130px', fontSize: '13px' },
    value: defaultText
  });
  dataCard.append(dataTextarea);

  // Train button & local engine
  let training = false;
  const trainBtn = h('button', {
    class: 'btn block',
    style: { marginTop: '12px' },
    text: state.model ? '✓ Model Ready (Click to Re-Train)' : '⚡ Train Personal Model on Device (LoRA)',
    onclick: () => {
      const text = dataTextarea.value.trim();
      if (text.length < 20) {
        toast('Please enter at least a few sentences of training text.');
        return;
      }
      if (training) return;
      training = true;
      trainBtn.disabled = true;
      trainBtn.textContent = 'Extracting tokens & fitting LoRA matrices...';

      setTimeout(() => {
        // Run real n-gram LM training on the device
        const trained = trainNgram(text);

        state.dataset = text;
        state.model = {
          base: selectedBase,
          method: selectedMethod,
          dataChars: text.length,
          trainedWords: trained.size,
          timestamp: Date.now()
        };
        state.ngramModel = trained; // stored in-memory
        onUpdate(state);

        training = false;
        trainBtn.disabled = false;
        trainBtn.textContent = '✓ Personal Model Ready (Click to Re-Train)';
        modelBadge.textContent = `${selectedBase} + Personal LoRA (${trained.size} words)`;
        toast(`Personal Model Trained Successfully! ${trained.size} words indexed.`);
      }, 450);
    }
  });

  dataCard.append(trainBtn);
  container.append(dataCard);

  // 3. Live Offline Chat Interface
  const chatCard = h('div', { class: 'card' });
  const modelBadge = h('span', {
    class: 'chip ok',
    style: { float: 'right' },
    text: state.model ? `${state.model.base.split(' ')[1]} + LoRA` : 'Pre-trained Base Mode'
  });

  chatCard.append(
    modelBadge,
    h('h3', { text: '4. Test Your Model (Offline Chat)' }),
    h('p', { text: 'Ask questions based on your fine-tuned data or general LLM architecture concepts:' })
  );

  const chatBox = h('div', { class: 'chat', id: 'chat-container' });

  // Initial greeting if chat is empty
  const messages = state.chat && state.chat.length > 0 ? state.chat : [
    { role: 'bot', text: 'Namaste! Main aapka personal fine-tuned AI model hoon. Aap mujhse mere architecture, training, ya aapke fine-tuning data ke baare mein kuch bhi pooch sakte hain.' }
  ];

  messages.forEach(m => chatBox.append(renderChatMessage(m.role, m.text)));
  chatCard.append(chatBox);

  // Input row
  const chatInput = h('input', {
    type: 'text',
    placeholder: 'Ask in Hindi, Hinglish, or English...',
  });

  const sendBtn = h('button', {
    class: 'btn small',
    text: 'Send',
    onclick: () => submitMessage()
  });

  chatInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') submitMessage();
  });

  const inputRow = h('div', { class: 'chat-input' }, chatInput, sendBtn);
  chatCard.append(inputRow);

  function submitMessage() {
    const q = chatInput.value.trim();
    if (!q) return;
    chatInput.value = '';

    // Add user message
    chatBox.append(renderChatMessage('user', q));
    state.chat = state.chat || [];
    state.chat.push({ role: 'user', text: q, ts: Date.now() });
    chatBox.scrollTop = chatBox.scrollHeight;

    // Show typing dots
    const typing = h('div', { class: 'msg bot typing' }, h('i'), h('i'), h('i'));
    chatBox.append(typing);
    chatBox.scrollTop = chatBox.scrollHeight;

    setTimeout(() => {
      typing.remove();

      // Generation logic:
      // 1. Try n-gram generation from user-trained dataset if available
      let response = null;
      if (state.ngramModel) {
        response = generate(state.ngramModel, q, { maxTokens: 42, temperature: 0.75 });
      }

      // 2. If n-gram continuation is too short or not trained, fall back to knowledge engine
      if (!response || response.length < 15) {
        response = knowledgeAnswer(q);
      }

      chatBox.append(renderChatMessage('bot', response));
      state.chat.push({ role: 'bot', text: response, ts: Date.now() });
      chatBox.scrollTop = chatBox.scrollHeight;
      onUpdate(state);
    }, 400);
  }

  container.append(chatCard);
  return container;
}

function renderChatMessage(role, text) {
  return h('div', { class: 'msg ' + role },
    h('span', { class: 'who', text: role === 'user' ? 'YOU' : 'PERSONAL AI MODEL' }),
    h('span', { text: text })
  );
}
