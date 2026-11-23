import { MISJE, LEGENDARNA, PUNKTACJA, SKLADY, TRYBY, TRUDNOSCI, WERSJA_ZASAD, pula, misja } from './misje.js';
import { LEGACY_OPISY } from './misje-legacy.js';

export const WERSJA = 3;
export const RUNDY = 3;
export const LIMITY_RUND = [3, 5, 10, 0];
export const TRYBY_ZABAWY = ['seria', 'swobodny', 'duet'];
export const ETAPY = ['start', 'odkrycie', 'karta', 'mecz', 'rozliczenie', 'brak', 'final'];
const etapyKarty = ['odkrycie', 'karta', 'mecz', 'rozliczenie'];
const kopia = s => JSON.parse(JSON.stringify(s));

export function nowyStan() {
  return {
    v: WERSJA, etap: 'start', gracze: ['Gracz 1', 'Gracz 2'], tryb: 'build',
    sklad: 'solo', trudnosc: 'latwy', sposob: 'seria', limit: RUNDY, wymianyDowolne: false,
    seria: null, ostatnia: null, historia: [],
  };
}

const noweId = () => globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random()}`;
let rng = Math.random;
export const ustawLosowanie = f => { rng = f; };
export const runda = s => s.seria?.rundy.at(-1) ?? null;
export const numerRundy = s => (s.seria?.rundy ?? []).filter(r => !r.uniewazniona).length;
export const swobodny = s => s.sposob === 'swobodny';
export const duet = s => s.sposob === 'duet';
export const liczbaWynikow = s => duet(s) ? 1 : 2;
export const limitRund = s => s.seria?.limit ?? s.limit;
export const ostatniaRunda = s => !!limitRund(s) && numerRundy(s) >= limitRund(s);
export const misjaRundy = r => r?.opis ?? misja(r?.karta);
export const wartoscRundy = r => r?.punkty ?? 0;

// Punktacja i treść są zamrożone od przydziału, także gdy w przyszłości karta zniknie z katalogu.
function migawka(id, wersja = WERSJA_ZASAD) {
  const karta = misja(id);
  if (!karta) return null;
  return {
    karta: id, trudnosc: karta.trudnosc, punkty: wersja === 0 ? 1 : PUNKTACJA[karta.trudnosc],
    wersjaZasad: wersja, opis: wersja === 0 ? { ...karta, ...LEGACY_OPISY[id] } : { ...karta },
  };
}

function pasujace(s, trud = s.trudnosc) {
  return pula(s.tryb, trud, s.sklad).filter(m => s.sposob !== 'seria' || m.sklady.includes('solo'));
}

export function wolne(s, bez = null) {
  const pokazane = new Set(s.seria?.pokazane ?? []);
  return pasujace(s).filter(m => !pokazane.has(m.id) && m.id !== bez);
}

function losujKarte(s, unikaj = null) {
  const kandydaci = wolne(s, unikaj);
  if (kandydaci.length) return kandydaci[Math.floor(rng() * kandydaci.length)].id;
  const dostepne = new Set(pasujace(s).map(m => m.id));
  return s.seria.pokazane.find(id => dostepne.has(id) && id !== unikaj) ?? null;
}

function zapiszKarte(s, id) {
  s.seria.pokazane = s.seria.pokazane.filter(karta => karta !== id);
  s.seria.pokazane.push(id);
  return { ...migawka(id), wyniki: Array(liczbaWynikow(s)).fill(null), odkryta: false, rozliczona: false };
}

export function ustawGracza(s, i, nazwa) {
  if (s.etap !== 'start' || ![0, 1].includes(i)) return s;
  const n = kopia(s);
  n.gracze[i] = String(nazwa ?? '').replace(/\s+/g, ' ').slice(0, 16);
  return n;
}

export const nazwaGracza = (s, i) => s.gracze[i].trim() || `Gracz ${i + 1}`;

export function ustawOpcje(s, pole, wartosc) {
  if (s.etap !== 'start') return s;
  const dopuszczalne = {
    tryb: Object.keys(TRYBY), sklad: Object.keys(SKLADY),
    trudnosc: TRUDNOSCI.map(t => t.id), limit: LIMITY_RUND, wymianyDowolne: [true, false],
  };
  if (!dopuszczalne[pole]?.includes(wartosc) || s[pole] === wartosc) return s;
  return { ...s, [pole]: wartosc };
}
export const ustawTryb = (s, tryb) => ustawOpcje(s, 'tryb', tryb);
export const ustawTrudnosc = (s, trud) => ustawOpcje(s, 'trudnosc', trud);

export function rozpocznij(s, sposob = s.sposob, specjalna = false) {
  if (!['start', 'final'].includes(s.etap) || !TRYBY_ZABAWY.includes(sposob)) return s;
  const n = kopia(s);
  n.sposob = sposob;
  if (duet(n)) n.sklad = 'duo';
  n.gracze = n.gracze.map((_, i) => nazwaGracza(n, i));
  n.seria = { id: noweId(), rundy: [], pokazane: [], wymiana: false, koniec: null,
    limit: specjalna ? 1 : n.limit, legendarna: specjalna };
  if (specjalna) {
    if (!mozeWybracSpecjalna({ ...n, etap: 'start' })) return s;
    n.seria.rundy.push(zapiszKarte(n, LEGENDARNA.id));
    n.etap = 'odkrycie';
    return n;
  }
  return pasujace(n).length ? dobierz(n, s.etap === 'final' ? s.ostatnia : null) : s;
}

export const rewanz = s => s.etap === 'final' ? rozpocznij(s, s.sposob, s.seria.limit === 1) : s;

function dobierz(n, unikaj = n.seria.pokazane.at(-1)) {
  const id = losujKarte(n, unikaj);
  if (!id) { n.etap = 'brak'; return n; }
  n.seria.rundy.push(zapiszKarte(n, id));
  n.etap = 'odkrycie';
  return n;
}

export function odkryj(s) {
  if (s.etap !== 'odkrycie') return s;
  const n = kopia(s);
  runda(n).odkryta = true;
  n.etap = 'karta';
  return n;
}

export const mozeWybracSpecjalna = s =>
  !swobodny(s) && LEGENDARNA.tryby.includes(s.tryb) && LEGENDARNA.sklady.includes(s.sklad) &&
  (s.etap === 'start' || (['odkrycie', 'karta'].includes(s.etap) && !s.seria.legendarna));

export function wybierzSpecjalna(s) {
  if (!mozeWybracSpecjalna(s) || s.etap === 'start') return s;
  const n = kopia(s);
  n.seria.legendarna = true;
  n.seria.rundy[n.seria.rundy.length - 1] = zapiszKarte(n, LEGENDARNA.id);
  n.etap = 'odkrycie';
  return n;
}

export const mozeWymienic = s => ['karta', 'odkrycie'].includes(s.etap) &&
  runda(s).karta !== LEGENDARNA.id && (swobodny(s) || s.wymianyDowolne || !s.seria.wymiana) &&
  pasujace(s).some(m => m.id !== runda(s).karta);

export function wymien(s) {
  if (!mozeWymienic(s)) return s;
  if (swobodny(s)) return kolejnaSwobodna(s);
  const n = kopia(s);
  const id = losujKarte(n, runda(s).karta);
  n.seria.wymiana = true;
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

export const dostepneTrudnosci = s => TRUDNOSCI.filter(t => pasujace(s, t.id).length);

export function zmienTrudnosc(s, trud) {
  if (!['odkrycie', 'karta', 'brak'].includes(s.etap) ||
      (s.trudnosc === trud && runda(s)?.karta !== LEGENDARNA.id) ||
      !dostepneTrudnosci(s).some(t => t.id === trud)) return s;
  const n = kopia(s);
  n.trudnosc = trud;
  if (n.etap !== 'brak') n.seria.rundy.pop();
  return dobierz(n);
}

export function graj(s) {
  return s.etap === 'karta' ? { ...s, etap: 'mecz' } : s;
}

export function doRozliczenia(s) {
  return !swobodny(s) && ['mecz', 'karta'].includes(s.etap) ? { ...s, etap: 'rozliczenie' } : s;
}

export function wrocDoKarty(s) {
  return s.etap === 'rozliczenie' ? { ...s, etap: 'mecz' } : s;
}

export function uniewaznij(s) {
  if (!['karta', 'mecz', 'rozliczenie'].includes(s.etap)) return s;
  if (swobodny(s)) return kolejnaSwobodna(s);
  const n = kopia(s);
  const r = runda(n);
  r.uniewazniona = true;
  r.wyniki.fill(null);
  return dobierz(n, r.karta);
}

export function ustawWynik(s, gracz, wartosc, nrRundy = null) {
  if (!Number.isInteger(gracz) || gracz < 0 || gracz >= liczbaWynikow(s) || ![0, 1].includes(wartosc)) return s;
  if (nrRundy === null ? s.etap !== 'rozliczenie' : s.etap !== 'final') return s;
  const n = kopia(s);
  const r = nrRundy === null ? runda(n) : rozegrane(n)[nrRundy];
  if (!r || r.wyniki[gracz] === wartosc) return s;
  r.wyniki[gracz] = wartosc;
  if (s.etap === 'final') archiwizuj(n);
  return n;
}

export const gotowe = s => s.etap === 'rozliczenie' && runda(s).wyniki.every(w => w !== null);
export const rozegrane = s => (s.seria?.rundy ?? []).filter(r => r.rozliczona && !r.uniewazniona);

export function punkty(s) {
  const wynik = Array(liczbaWynikow(s)).fill(0);
  for (const r of rozegrane(s)) r.wyniki.forEach((w, i) => { wynik[i] += w * wartoscRundy(r); });
  return wynik;
}

export function zwyciezca(s) {
  const [a, b] = punkty(s);
  return duet(s) || a === b ? null : a > b ? 0 : 1;
}

function archiwizuj(s) {
  const rundy = rozegrane(s);
  if (!rundy.length) return;
  const { id } = s.seria;
  const stary = s.historia.find(seria => seria.id === id);
  const wpis = { id, data: stary?.data ?? new Date().toISOString(), gracze: s.gracze,
    tryb: s.tryb, sklad: s.sklad, sposob: s.sposob, punkty: punkty(s), rundy };
  s.historia = [wpis, ...s.historia.filter(seria => seria.id !== id)];
}

function finisz(s, koniec) {
  s.etap = 'final';
  s.seria.koniec = koniec;
  archiwizuj(s);
  return s;
}

export function zatwierdz(s) {
  if (!gotowe(s)) return s;
  const n = kopia(s);
  runda(n).rozliczona = true;
  n.ostatnia = runda(n).karta;
  if (ostatniaRunda(n)) return finisz(n, 'pelna');
  n.seria.wymiana = false;
  return dobierz(n, n.ostatnia);
}

export function zakonczWczesniej(s) {
  if (!s.seria || swobodny(s) || ['start', 'final'].includes(s.etap)) return s;
  const n = kopia(s);
  if (runda(n) && !runda(n).rozliczona && !runda(n).uniewazniona) n.seria.rundy.pop();
  return finisz(n, 'wczesniej');
}

export function doKonfiguracji(s) {
  const n = kopia(s);
  if (n.seria && !swobodny(n)) archiwizuj(n);
  n.etap = 'start';
  n.seria = null;
  return n;
}

function poprawnaRunda(r, s) {
  return r && typeof r.karta === 'string' && r.opis?.id === r.karta && typeof r.opis.tytul === 'string' &&
    (Object.hasOwn(PUNKTACJA, r.trudnosc)) && r.opis.trudnosc === r.trudnosc &&
    typeof r.opis.cel === 'string' && typeof r.opis.zaliczenie === 'string' &&
    Array.isArray(r.opis.doprecyzowanie) && [1, 3, 5, 7, 10, 25].includes(r.punkty) &&
    Number.isInteger(r.wersjaZasad) && typeof r.rozliczona === 'boolean' &&
    Array.isArray(r.wyniki) && r.wyniki.length === liczbaWynikow(s) &&
    r.wyniki.every(w => [0, 1, null].includes(w)) && (!r.rozliczona || !r.wyniki.includes(null));
}

function poprawneArchiwum(wpis) {
  if (!wpis || typeof wpis.id !== 'string' || !['seria', 'duet'].includes(wpis.sposob) ||
      !Array.isArray(wpis.gracze) || wpis.gracze.length !== 2 || wpis.gracze.some(g => typeof g !== 'string')) return false;
  return Array.isArray(wpis.punkty) && wpis.punkty.length === liczbaWynikow(wpis) &&
    wpis.punkty.every(p => Number.isSafeInteger(p) && p >= 0) &&
    Array.isArray(wpis.rundy) && wpis.rundy.length > 0 &&
    wpis.rundy.every(r => poprawnaRunda(r, wpis) && r.rozliczona);
}

export function poprawny(s) {
  if (!s || s.v !== WERSJA || !ETAPY.includes(s.etap) || !TRYBY_ZABAWY.includes(s.sposob) ||
      !Object.hasOwn(TRYBY, s.tryb) || !Object.hasOwn(SKLADY, s.sklad) ||
      !TRUDNOSCI.some(t => t.id === s.trudnosc) || !LIMITY_RUND.includes(s.limit) ||
      typeof s.wymianyDowolne !== 'boolean' || !Array.isArray(s.historia)) return false;
  if (!Array.isArray(s.gracze) || s.gracze.length !== 2 || s.gracze.some(g => typeof g !== 'string')) return false;
  if (s.etap === 'start') return true;
  const se = s.seria;
  if (!se || typeof se.id !== 'string' || ![1, ...LIMITY_RUND].includes(se.limit) ||
      !Array.isArray(se.rundy) || !Array.isArray(se.pokazane) || !se.pokazane.every(id => typeof id === 'string') ||
      !se.rundy.every(r => poprawnaRunda(r, s))) return false;
  if (etapyKarty.includes(s.etap) && (!runda(s) || runda(s).uniewazniona || runda(s).rozliczona)) return false;
  return !swobodny(s) || (se.rundy.length === 1 && ['odkrycie', 'karta', 'mecz'].includes(s.etap));
}

export function migruj(stary) {
  if (!stary || typeof stary !== 'object') return null;
  if (stary.v === WERSJA) {
    if (Array.isArray(stary.historia)) return { ...stary, historia: stary.historia.filter(poprawneArchiwum) };
    return stary;
  }
  if (stary.v === 1 || stary.v === 2) {
    const n = { ...nowyStan(), ...stary, v: WERSJA, historia: [], sposob: stary.sposob ?? 'seria' };
    if (n.etap === 'start') return n;
    if (!Array.isArray(stary.seria?.rundy)) return null;
    n.seria = { ...stary.seria, id: noweId(), limit: RUNDY, legendarna: false, rundy: [] };
    for (const [i, staraRunda] of stary.seria.rundy.entries()) {
      const mig = migawka(staraRunda?.karta, 0);
      if (!mig || !Array.isArray(staraRunda.wyniki)) return null;
      const aktywna = i === stary.seria.rundy.length - 1 && etapyKarty.includes(n.etap);
      n.seria.rundy.push({ ...staraRunda, ...mig, rozliczona: !aktywna && !staraRunda.uniewazniona && !staraRunda.wyniki.includes(null) });
    }
    if (n.etap === 'final' && poprawny(n)) archiwizuj(n);
    return n;
  }
  if (stary.v !== 0 && stary.v !== undefined) return null;
  const n = nowyStan();
  if (Array.isArray(stary.gracze)) {
    n.gracze = n.gracze.map((domyslny, i) => String(stary.gracze[i] || domyslny).slice(0, 16));
  }
  if (Object.hasOwn(TRYBY, stary.tryb)) n.tryb = stary.tryb;
  if (TRUDNOSCI.some(t => t.id === stary.trudnosc)) n.trudnosc = stary.trudnosc;
  return n;
}

export { MISJE, misja };
