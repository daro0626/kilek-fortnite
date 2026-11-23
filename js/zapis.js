// =========================================================
// KILEK CHALLENGE: zapis w tej przeglądarce.
// Klucz ma przedrostek „kc:” i ten sam format JSON co `store` z core.js,
// więc da się go później przenieść na `store` bez migracji danych.
// Katalogi na jednym hoście dzielą localStorage, dlatego wszystko
// modułu leży pod jednym kluczem `kc:fortnite`.
// =========================================================
import { nowyStan, poprawny, migruj, WERSJA } from './seria.js';

export const KLUCZ = 'kc:fortnite';
const PRZEDROSTEK = 'kc:fortnite';

function magazyn() {
  try {
    const ls = globalThis.localStorage;
    const t = PRZEDROSTEK + ':test';
    ls.setItem(t, '1'); ls.removeItem(t);
    return ls;
  } catch { return null; }
}

// Zwraca { stan, uwaga, trwaly }. uwaga: null | 'uszkodzony' | 'starszy' | 'nowszy' | 'brak-pamieci'
export function wczytaj() {
  const ls = magazyn();
  if (!ls) return { stan: nowyStan(), uwaga: 'brak-pamieci', trwaly: false };
  let tekst;
  try { tekst = ls.getItem(KLUCZ); } catch { return { stan: nowyStan(), uwaga: 'brak-pamieci', trwaly: false }; }
  if (tekst === null) return { stan: nowyStan(), uwaga: null, trwaly: true };
  let dane;
  try { dane = JSON.parse(tekst); } catch { return { stan: nowyStan(), uwaga: 'uszkodzony', trwaly: true }; }
  if (dane && typeof dane === 'object' && typeof dane.v === 'number' && dane.v > WERSJA) {
    return { stan: nowyStan(), uwaga: 'nowszy', trwaly: false }; // nie nadpisujemy nowszego zapisu
  }
  const starszy = !dane || dane.v !== WERSJA;
  const stan = migruj(dane);
  if (!stan || !poprawny(stan)) return { stan: nowyStan(), uwaga: 'uszkodzony', trwaly: true };
  return { stan, uwaga: starszy ? 'starszy' : null, trwaly: true };
}

export function zapisz(stan) {
  try { globalThis.localStorage.setItem(KLUCZ, JSON.stringify(stan)); return true; } catch { return false; }
}

// Usuwa tylko dane modułu Fortnite. Klucze Minecrafta (kc:xp, kc:… ) zostają.
export function wyczysc() {
  try {
    const ls = globalThis.localStorage;
    const doUsuniecia = [];
    for (let i = 0; i < ls.length; i++) {
      const k = ls.key(i);
      if (k === PRZEDROSTEK || k.startsWith(PRZEDROSTEK + ':')) doUsuniecia.push(k);
    }
    doUsuniecia.forEach(k => ls.removeItem(k));
    return true;
  } catch { return false; }
}
