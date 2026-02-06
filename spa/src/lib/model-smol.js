/**
 * SmolLM2 adapter using Transformers.js via Web Worker.
 */

export class SmolModelAdapter {
  constructor() {
    this.worker = null;
    this.status = 'idle';
    this.statusMessage = '';
    this._messageId = 0;
    this._pendingCallbacks = new Map();
    this._onStatusChange = null;
  }

  onStatusChange(cb) {
    this._onStatusChange = cb;
  }

  _setStatus(status, message = '') {
    this.status = status;
    this.statusMessage = message;
    this._onStatusChange?.(status, message);
  }

  async initialize() {
    if (this.worker) return;

    this._setStatus('loading', 'Initializing worker...');

    // Create worker from blob URL for file:// compatibility
    const workerUrl = new URL('./model-smol-worker.js', import.meta.url);
    this.worker = new Worker(workerUrl, { type: 'module' });

    this.worker.onmessage = (event) => {
      const { type, id, ...data } = event.data;

      if (type === 'status') {
        this._setStatus('loading', data.message);
        return;
      }

      const cb = this._pendingCallbacks.get(id);
      if (!cb) return;

      switch (type) {
        case 'ready':
          this._setStatus('ready');
          cb.resolve();
          this._pendingCallbacks.delete(id);
          break;
        case 'token':
          cb.onToken?.(data.token);
          break;
        case 'done':
          this._setStatus('ready');
          cb.resolve(data.text);
          this._pendingCallbacks.delete(id);
          break;
        case 'error':
          this._setStatus('error', data.error);
          cb.reject(new Error(data.error));
          this._pendingCallbacks.delete(id);
          break;
      }
    };

    return new Promise((resolve, reject) => {
      const id = ++this._messageId;
      this._pendingCallbacks.set(id, { resolve, reject });
      this.worker.postMessage({ type: 'init', id });
    });
  }

  async *chatStream(messages, system) {
    if (!this.worker) throw new Error('Model not initialized');

    this._setStatus('generating');

    const id = ++this._messageId;
    const tokens = [];
    let done = false;
    let error = null;
    let resolveWait;

    const waitForToken = () => new Promise((resolve) => { resolveWait = resolve; });

    this._pendingCallbacks.set(id, {
      onToken: (token) => {
        tokens.push(token);
        resolveWait?.();
      },
      resolve: () => {
        done = true;
        resolveWait?.();
      },
      reject: (err) => {
        error = err;
        done = true;
        resolveWait?.();
      },
    });

    this.worker.postMessage({
      type: 'generate',
      id,
      payload: { messages, system },
    });

    while (!done || tokens.length > 0) {
      if (tokens.length > 0) {
        yield tokens.shift();
      } else if (!done) {
        await waitForToken();
      }
    }

    if (error) throw error;
  }

  getStatus() {
    return this.status;
  }

  getContextLimit() {
    return 8192;
  }

  destroy() {
    this.worker?.terminate();
    this.worker = null;
    this._setStatus('idle');
  }
}
