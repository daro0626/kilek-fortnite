// =========================================================
// KILEK CHALLENGE: logika serii. Czyste funkcje, bez DOM.
// Każda akcja dostaje stan i zwraca NOWY stan (albo ten sam, gdy akcja
// jest niedozwolona). Dzięki temu podwójne dotknięcie nic nie psuje.
// =========================================================
import { MISJE, TRYBY, TRUDNOSCI, pula, dostepna, misja } from './misje.js';

export const WERSJA = 2;
export const RUNDY = 3;
export const TRYBY_ZABAWY = ['seria', 'swobodny'];
export const ETAPY = ['start', 'odkrycie', 'karta', 'mecz', 'rozliczenie', 'brak', 'final'];

const kopia = s => JSON.parse(JSON.stringify(s));

export function nowyStan() {
  return {
    v: WERSJA,
    etap: 'start',
    gracze: ['Gracz 1', 'Gracz 2'],
    tryb: 'build',
    trudnosc: 'latwy',
    sposob: 'seria',
    seria: null,
    ostatnia: null, // ID ostatniej rozegranej karty (dla rewanżu)
  };
}

function nowaSeria() {
  return { rundy: [], pokazane: [], wymiana: false, koniec: null };
}

// Losowanie: kryptograficzne, jeśli jest; w testach można podać własne.
let rng = () => {
  if (globalThis.crypto?.getRandomValues) {
    const a = new Uint32Array(1); globalThis.crypto.getRandomValues(a); return a[0] / 2 ** 32;
  }
  return Math.random();
};
export const ustawLosowanie = f => { rng = f; };

export const runda = s => s.seria?.rundy[s.seria.rundy.length - 1] || null;
export const numerRundy = s => s.seria ? s.seria.rundy.filter(r => !r.uniewazniona).length : 0;
export const swobodny = s => s.sposob === 'swobodny';

// Karty jeszcze niepokazane w tej serii.
export function wolne(s, bez = null) {
  const pokazane = new Set(s.seria?.pokazane || []);
  return pula(s.tryb, s.trudnosc).filter(m => !pokazane.has(m.id) && m.id !== bez);
}

function losujKarte(s, unikaj = null) {
  let kandydaci = wolne(s, unikaj);
  if (!kandydaci.length) kandydaci = wolne(s);
  if (!kandydaci.length) {
    if (!swobodny(s)) return null;
    const zgodne = new Set(pula(s.tryb, s.trudnosc).map(m => m.id));
    return s.seria.pokazane.find(id => zgodne.has(id) && id !== unikaj) ?? null;
  }
  return kandydaci[Math.floor(rng() * kandydaci.length)].id;
}

function zapiszKarte(s, id) {
  if (swobodny(s)) s.seria.pokazane = s.seria.pokazane.filter(karta => karta !== id);
  s.seria.pokazane.push(id);
  return { karta: id, wyniki: [null, null], odkryta: false };
}

// ---------- konfiguracja ----------
export function ustawGracza(s, i, nazwa) {
  if (s.etap !== 'start' && s.etap !== 'final') return s;
  const n = kopia(s);
  n.gracze[i] = String(nazwa ?? '').replace(/\s+/g, ' ').slice(0, 16);
  return n;
}

export function ustawTryb(s, tryb) {
  if (s.etap !== 'start' || !TRYBY[tryb]) return s;
  const n = kopia(s); n.tryb = tryb;
  if (!dostepna(n.tryb, n.trudnosc)) n.trudnosc = TRUDNOSCI.find(t => dostepna(tryb, t.id))?.id ?? n.trudnosc;
  return n;
}

export function ustawTrudnosc(s, trud) {
  if (s.etap !== 'start' || !TRUDNOSCI.some(t => t.id === trud) || !dostepna(s.tryb, trud)) return s;
  const n = kopia(s); n.trudnosc = trud; return n;
}

export const nazwaGracza = (s, i) => (s.gracze[i] || '').trim() || `Gracz ${i + 1}`;

// ---------- seria ----------
// Start serii i losowanie pierwszej karty. Karta jest zapisana PRZED animacją.
export function rozpocznij(s, sposob = s.sposob) {
  if (s.etap !== 'start' && s.etap !== 'final') return s;
  if (!dostepna(s.tryb, s.trudnosc) || !TRYBY_ZABAWY.includes(sposob)) return s;
  const n = kopia(s);
  n.sposob = sposob;
  n.gracze = n.gracze.map((_, i) => nazwaGracza(n, i));
  n.seria = nowaSeria();
  return dobierz(n, s.etap === 'final' ? s.ostatnia : null);
}
export const rewanz = s => (s.etap === 'final' ? rozpocznij(s) : s);

// Nowa runda z nową kartą (albo koniec, gdy brak kart).
function dobierz(n, unikaj = null) {
  const id = losujKarte(n, unikaj);
  if (!id) { n.etap = 'brak'; return n; }
  n.seria.rundy.push(zapiszKarte(n, id));
  n.etap = 'odkrycie';
  return n;
}

export function odkryj(s) {
  if (s.etap !== 'odkrycie') return s;
  const n = kopia(s); runda(n).odkryta = true; n.etap = 'karta'; return n;
}

export const mozeWymienic = s => (s.etap === 'karta' || s.etap === 'odkrycie') &&
  (swobodny(s) || (!s.seria.wymiana && wolne(s).length > 0));

// Jedna wspólna wymiana na serię, przed rozpoczęciem rundy. Karta wypada z puli serii.
export function wymien(s) {
  if (!mozeWymienic(s)) return s;
  if (swobodny(s)) return kolejnaSwobodna(s);
  const n = kopia(s);
  const r = runda(n);
  const id = losujKarte(n);
  n.seria.wymiana = true;
  n.seria.wymieniona = r.karta;
  n.seria.rundy[n.seria.rundy.length - 1] = zapiszKarte(n, id);
  n.etap = 'odkrycie';
  return n;
}

export function kolejnaSwobodna(s) {
  if (!swobodny(s) || !['odkrycie', 'karta', 'mecz'].includes(s.etap)) return s;
  const n = kopia(s);
  const id = losujKarte(n, runda(s).karta);
  if (!id) return s;
  n.seria.rundy = [zapiszKarte(n, id)];
  n.etap = 'odkrycie';
  return n;
}

export function dostepneTrudnosci(s) {
  return TRUDNOSCI.filter(t => dostepna(s.tryb, t.id) &&
    (swobodny(s) || pula(s.tryb, t.id).some(m => !s.seria.pokazane.includes(m.id))));
}

// Zmiana przed meczem dotyczy bieżącej, nierozliczonej rundy.
export function zmienTrudnosc(s, trud) {
  if (!['odkrycie', 'karta', 'brak'].includes(s.etap) || s.trudnosc === trud ||
      !dostepneTrudnosci(s).some(t => t.id === trud)) return s;
  const n = kopia(s);
  n.trudnosc = trud;
  if (n.etap !== 'brak') n.seria.rundy.pop();
  return dobierz(n);
}

export function graj(s) {
  if (s.etap !== 'karta') return s;
  const n = kopia(s); n.etap = 'mecz'; return n;
}

export function doRozliczenia(s) {
  if (s.etap !== 'mecz' && s.etap !== 'karta') return s;
  const n = kopia(s); n.etap = 'rozliczenie'; return n;
}

export function wrocDoKarty(s) {
  if (s.etap !== 'rozliczenie') return s;
  const n = kopia(s); n.etap = 'mecz'; return n;
}

// Niewykonalna karta: bez punktu, bez zużycia wymiany. Jeśli są karty, losujemy nową.
export function uniewaznij(s) {
  if (!['karta', 'mecz', 'rozliczenie'].includes(s.etap)) return s;
  if (swobodny(s)) return kolejnaSwobodna(s);
  const n = kopia(s);
  const r = runda(n);
  r.uniewazniona = true; r.wyniki = [null, null];
  return dobierz(n);
}

// Ustawienie wyniku jest idempotentne: ta sama wartość drugi raz nic nie zmienia.
export function ustawWynik(s, gracz, wartosc, nrRundy = null) {
  if (![0, 1].includes(gracz) || ![0, 1].includes(wartosc)) return s;
  let r;
  const n = kopia(s);
  if (nrRundy === null) {
    if (s.etap !== 'rozliczenie') return s;
    r = runda(n);
  } else {
    if (s.etap !== 'final') return s; // korekta rozegranej rundy
    r = rozegrane(n)[nrRundy];
  }
  if (!r || r.wyniki[gracz] === wartosc) return s;
  r.wyniki[gracz] = wartosc;
  return n;
}

export const gotowe = s => s.etap === 'rozliczenie' && runda(s).wyniki.every(w => w !== null);

// Zatwierdzenie rundy. Drugie dotknięcie trafia na inny etap i jest ignorowane.
export function zatwierdz(s) {
  if (!gotowe(s)) return s;
  const n = kopia(s);
  n.ostatnia = runda(n).karta;
  if (numerRundy(n) >= RUNDY) { n.etap = 'final'; n.seria.koniec = 'pelna'; return n; }
  return dobierz(n);
}

// Zakończenie bez kolejnej karty: zachowujemy rozegrane rundy.
export function zakonczWczesniej(s) {
  if (!s.seria || s.etap === 'final' || s.etap === 'start') return s;
  const n = kopia(s);
  const r = runda(n);
  if (r && !r.uniewazniona && r.wyniki.some(w => w === null)) n.seria.rundy.pop();
  n.etap = 'final'; n.seria.koniec = 'wczesniej';
  return n;
}

export function doKonfiguracji(s) {
  const n = kopia(s); n.etap = 'start'; n.seria = null; return n;
}

// ---------- wyniki ----------
export function rozegrane(s) {
  return (s.seria?.rundy || []).filter(r => !r.uniewazniona && r.wyniki.every(w => w !== null));
}

export function punkty(s) {
  const p = [0, 0];
  for (const r of rozegrane(s)) r.wyniki.forEach((w, i) => { p[i] += w; });
  return p;
}

export function zwyciezca(s) {
  const [a, b] = punkty(s);
  return a === b ? null : a > b ? 0 : 1;
}

// ---------- walidacja wczytanego stanu ----------
export function poprawny(s) {
  try {
    if (!s || s.v !== WERSJA || !ETAPY.includes(s.etap)) return false;
    if (!Array.isArray(s.gracze) || s.gracze.length !== 2 || s.gracze.some(g => typeof g !== 'string')) return false;
    if (!TRYBY[s.tryb] || !TRUDNOSCI.some(t => t.id === s.trudnosc) || !TRYBY_ZABAWY.includes(s.sposob)) return false;
    if (s.etap === 'start') return true;
    const se = s.seria;
    if (!se || !Array.isArray(se.rundy) || !Array.isArray(se.pokazane)) return false;
    const ids = new Set(MISJE.filter(m => m.tryby.includes(s.tryb)).map(m => m.id));
    if (se.pokazane.some(id => !ids.has(id))) return false;
    if (new Set(se.pokazane).size !== se.pokazane.length) return false;
    for (const r of se.rundy) {
      if (!ids.has(r.karta) || !Array.isArray(r.wyniki) || r.wyniki.length !== 2) return false;
      if (r.wyniki.some(w => ![0, 1, null].includes(w))) return false;
    }
    if (rozegrane(s).length > RUNDY) return false;
    if (['odkrycie', 'karta', 'mecz', 'rozliczenie'].includes(s.etap) &&
        (!runda(s) || runda(s).uniewazniona || misja(runda(s).karta).trudnosc !== s.trudnosc)) return false;
    if (swobodny(s) && (se.rundy.length !== 1 || !['odkrycie', 'karta', 'mecz'].includes(s.etap))) return false;
    return true;
  } catch { return false; }
}

// Migracja starszych formatów. v0 (szkic bez numeru wersji) nie trafił do ludzi,
// więc zachowujemy z niego tylko ustawienia, a serię zaczynamy od nowa.
export function migruj(stary) {
  if (!stary || typeof stary !== 'object') return null;
  if (stary.v === WERSJA) return stary;
  if (stary.v === 1) return { ...stary, v: WERSJA, sposob: 'seria' };
  if (stary.v === undefined || stary.v === 0) {
    const n = nowyStan();
    if (Array.isArray(stary.gracze)) n.gracze = stary.gracze.slice(0, 2).map((g, i) => String(g || `Gracz ${i + 1}`).slice(0, 16));
    while (n.gracze.length < 2) n.gracze.push(`Gracz ${n.gracze.length + 1}`);
    if (TRYBY[stary.tryb]) n.tryb = stary.tryb;
    if (TRUDNOSCI.some(t => t.id === stary.trudnosc) && dostepna(n.tryb, stary.trudnosc)) n.trudnosc = stary.trudnosc;
    return n;
  }
  return null; // nowsza wersja niż znamy: nie ruszamy
}

export { MISJE, misja };
