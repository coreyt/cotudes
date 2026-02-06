/**
 * Web Worker for SmolLM2 inference via Transformers.js.
 *
 * Runs in a separate thread to avoid blocking the UI.
 * Communicates via postMessage with the main thread.
 */

/* global self */

let pipeline = null;
let tokenizer = null;

const MODEL_ID = 'HuggingFaceTB/SmolLM2-1.7B-Instruct';

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
      // Future: implement AbortController support
      break;
  }
};

async function handleInit(id) {
  try {
    self.postMessage({ type: 'status', id, status: 'loading', message: 'Loading Transformers.js...' });

    const { pipeline: createPipeline, env } = await import(
      'https://cdn.jsdelivr.net/npm/@huggingface/transformers@3'
    );

    // Prefer WebGPU, fall back to WASM
    env.backends.onnx.wasm.numThreads = 4;

    self.postMessage({ type: 'status', id, status: 'loading', message: 'Downloading model (first time may take a while)...' });

    pipeline = await createPipeline('text-generation', MODEL_ID, {
      dtype: 'q4',
      device: 'webgpu',
    }).catch(() => {
      self.postMessage({ type: 'status', id, status: 'loading', message: 'WebGPU unavailable, falling back to WASM...' });
      return createPipeline('text-generation', MODEL_ID, {
        dtype: 'q4',
        device: 'wasm',
      });
    });

    tokenizer = pipeline.tokenizer;

    self.postMessage({ type: 'ready', id });
  } catch (error) {
    self.postMessage({ type: 'error', id, error: error.message });
  }
}

async function handleGenerate(id, { messages, system }) {
  if (!pipeline) {
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

    const output = await pipeline(chatMessages, {
      max_new_tokens: 512,
      temperature: 0.7,
      top_p: 0.9,
      do_sample: true,
      return_full_text: false,
      callback_function: (token) => {
        // Stream tokens back to main thread
        if (token?.length) {
          const text = typeof token === 'string' ? token : pipeline.tokenizer.decode(token, { skip_special_tokens: true });
          if (text) {
            self.postMessage({ type: 'token', id, token: text });
          }
        }
      },
    });

    const generated = output?.[0]?.generated_text || '';
    self.postMessage({ type: 'done', id, text: generated });
  } catch (error) {
    self.postMessage({ type: 'error', id, error: error.message });
  }
}
