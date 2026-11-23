// KILEK CHALLENGE: wątek roboczy rysujący mapę poza głównym wątkiem.
import { rysujWarstwice } from './mapa-rys.js';

self.onmessage = async e => {
  const { w, h, dpr } = e.data;
  try {
    const cv = new OffscreenCanvas(1, 1);
    rysujWarstwice(cv, w, h, dpr);
    self.postMessage(await cv.convertToBlob({ type: 'image/png' }));
  } catch {
    self.postMessage(null);
  }
};
