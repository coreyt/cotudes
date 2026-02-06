/**
 * Web Worker for SmolLM2 inference via Transformers.js.
 *
 * Based on https://github.com/mikeesto/smollm2-browser
 * Uses AutoTokenizer + AutoModelForCausalLM for direct control.
 */

/* global self */

import {
  AutoTokenizer,
  AutoModelForCausalLM,
  TextStreamer,
  InterruptableStoppingCriteria,
} from '@huggingface/transformers';

const MODEL_ID = 'HuggingFaceTB/SmolLM2-1.7B-Instruct';

let tokenizer = null;
let model = null;
const stopping_criteria = new InterruptableStoppingCriteria();

self.onmessage = async (event) => {
  const { type, id, payload } = event.data;

  switch (type) {
    case 'init':
      await handleInit(id);
      break;
    case 'generate':
      await handleGenerate(id, payload);
      break;
    case 'abort':
      stopping_criteria.interrupt();
      break;
  }
};

async function handleInit(id) {
  try {
    // Check WebGPU availability
    let device = 'wasm';
    let dtype = 'q4';

    if (typeof navigator !== 'undefined' && navigator.gpu) {
      try {
        const adapter = await navigator.gpu.requestAdapter();
        if (adapter) {
          device = 'webgpu';
          dtype = 'q4f16';
        }
      } catch { /* WebGPU not available */ }
    }

    const deviceLabel = device === 'webgpu' ? 'WebGPU' : 'WASM';
    self.postMessage({ type: 'status', id, status: 'loading', message: `Using ${deviceLabel}. Downloading model (first time may take a while)...` });

    const progress_callback = (progress) => {
      if (progress.status === 'progress') {
        const pct = Math.round(progress.progress || 0);
        const name = progress.file?.split('/').pop() || '';
        self.postMessage({
          type: 'status',
          id,
          status: 'loading',
          message: `Downloading ${name}... ${pct}%`,
        });
      } else if (progress.status === 'done') {
        self.postMessage({
          type: 'status',
          id,
          status: 'loading',
          message: 'Loading model into memory...',
        });
      } else if (progress.status === 'initiate') {
        const name = progress.file?.split('/').pop() || 'files';
        self.postMessage({
          type: 'status',
          id,
          status: 'loading',
          message: `Fetching ${name}...`,
        });
      }
    };

    tokenizer = await AutoTokenizer.from_pretrained(MODEL_ID, {
      progress_callback,
    });

    model = await AutoModelForCausalLM.from_pretrained(MODEL_ID, {
      dtype,
      device,
      progress_callback,
    });

    // Warmup: compile shaders / JIT with dummy input
    self.postMessage({ type: 'status', id, status: 'loading', message: 'Compiling shaders and warming up...' });
    const warmupInputs = tokenizer('a');
    await model.generate({ ...warmupInputs, max_new_tokens: 1 });

    self.postMessage({ type: 'ready', id });
  } catch (error) {
    self.postMessage({ type: 'error', id, error: error.message });
  }
}

async function handleGenerate(id, { messages, system }) {
  if (!model || !tokenizer) {
    self.postMessage({ type: 'error', id, error: 'Model not loaded' });
    return;
  }

  try {
    // Build chat messages with system prompt
    const chatMessages = [];
    if (system) {
      chatMessages.push({ role: 'system', content: system });
    }
    chatMessages.push(...messages);

    const inputs = tokenizer.apply_chat_template(chatMessages, {
      add_generation_prompt: true,
      return_dict: true,
    });

    const callback_function = (output) => {
      if (output) {
        self.postMessage({ type: 'token', id, token: output });
      }
    };

    const streamer = new TextStreamer(tokenizer, {
      skip_prompt: true,
      skip_special_tokens: true,
      callback_function,
    });

    stopping_criteria.reset();

    const { sequences } = await model.generate({
      ...inputs,
      max_new_tokens: 512,
      do_sample: true,
      temperature: 0.7,
      top_p: 0.9,
      streamer,
      stopping_criteria,
      return_dict_in_generate: true,
    });

    const decoded = tokenizer.batch_decode(sequences, {
      skip_special_tokens: true,
    });

    // Extract just the generated portion (after the prompt)
    const fullText = decoded[0] || '';
    const promptText = tokenizer.apply_chat_template(chatMessages, {
      add_generation_prompt: true,
      tokenize: false,
    });
    const generated = fullText.slice(promptText.length).trim();

    self.postMessage({ type: 'done', id, text: generated });
  } catch (error) {
    self.postMessage({ type: 'error', id, error: error.message });
  }
}
