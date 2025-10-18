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

// WhatsApp helpers
export function resolveWhatsAppNumber() {
  try {
    const w = typeof window !== 'undefined' ? window : {};
    const fromWindow = w.__WHATSAPP_NUMBER__ || w.__WA_NUMBER__;
    const fromStorage = (() => { try { return w.localStorage?.getItem('WHATSAPP_NUMBER'); } catch { return null; } })();
    const fromMeta = (() => {
      if (typeof document === 'undefined') return null;
      const meta = document.querySelector('meta[name="whatsapp-number"]');
      return meta?.content || null;
    })();
  const fallback = '99999999'; // Exemplo genérico
    return (fromWindow || fromStorage || fromMeta || fallback).replace(/[^0-9]/g, '');
  } catch {
  return '99999999';
  }
}

export const WHATSAPP_NUMBER = resolveWhatsAppNumber();

export function buildWhatsAppLink(message, number = WHATSAPP_NUMBER) {
  const msg = encodeURIComponent(message || 'Olá!');
  const num = String(number || '').replace(/[^0-9]/g, '');
  return `https://wa.me/${num}?text=${msg}`;
}
