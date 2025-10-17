export function resolveApiBase() {
  try {
    const w = typeof window !== 'undefined' ? window : {};
    const fromWindow = w.__API_BASE__;
    const fromStorage = (() => { try { return w.localStorage?.getItem('API_BASE'); } catch { return null; }})();
    const fromMeta = (() => {
      if (typeof document === 'undefined') return null;
      const meta = document.querySelector('meta[name="api-base"]');
      return meta?.content || null;
    })();
    const host = (typeof location !== 'undefined') ? location.hostname : '';
    const isLocal = host === 'localhost' || host === '127.0.0.1';
    const isVercel = /\.vercel\.app$/i.test(host);
    const localDefault = 'http://localhost:4000/api';
    
    const prodDefault = isVercel ? 'https://reliquias.onrender.com/api' : '/api';
    return fromWindow || fromStorage || fromMeta || (isLocal ? localDefault : prodDefault);
  } catch {
    return '/api';
  }
}

export const API_BASE = resolveApiBase();
