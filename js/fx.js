// =========================================================
// KILEK CHALLENGE: oprawa ruchowa.
// Zasady: animujemy tylko transform i opacity, bez rozmyć; brak stałej pętli
// rAF; każda sekwencja da się dokończyć od razu (pominięcie); przy
// prefers-reduced-motion wynik pojawia się natychmiast.
// =========================================================
import { rysujWarstwice } from './mapa-rys.js';

const mq = matchMedia('(prefers-reduced-motion: reduce)');
export let reduced = mq.matches;
mq.addEventListener?.('change', e => { reduced = e.matches; document.documentElement.classList.toggle('rm', reduced); });
document.documentElement.classList.toggle('rm', reduced);

const EASE_OUT = 'cubic-bezier(.16,1,.3,1)';
const EASE_SPRING = 'cubic-bezier(.34,1.56,.64,1)';

// Aktywne animacje sekwencji, żeby „Pomiń” mogło je zakończyć od razu.
let biezace = [];
const sledz = a => { biezace.push(a); a.finished.catch(() => {}).then(() => { biezace = biezace.filter(x => x !== a); }); return a; };
export function dokoncz() { biezace.slice().forEach(a => { try { a.finish(); } catch { /* już skończona */ } }); biezace = []; }
const anim = (el, kf, opt) => sledz(el.animate(kf, { fill: 'none', ...opt }));
const czekaj = a => a.finished.catch(() => {});

let mapaGotowa = false;

// Warstwice rysuje wątek roboczy (OffscreenCanvas), żeby nie blokować dotyku.
// Bez OffscreenCanvas rysujemy w wolnej chwili na głównym wątku.
function obrazMapy(w, h) {
  const limitDpr = matchMedia('(pointer: coarse)').matches ? .85 : 1.5;
  const dpr = Math.min(devicePixelRatio || 1, limitDpr, Math.sqrt(3.2e6 / (w * h)));
  if ('OffscreenCanvas' in window && 'Worker' in window) {
    return new Promise(ok => {
      let wk;
      try { wk = new Worker(new URL('./mapa-worker.js', import.meta.url), { type: 'module' }); }
      catch { ok(naGlownym()); return; }
      wk.onmessage = e => { wk.terminate(); ok(e.data || naGlownym()); };
      wk.onerror = () => { wk.terminate(); ok(naGlownym()); };
      wk.postMessage({ w, h, dpr });
    });
  }
  return naGlownym();
  function naGlownym() {
    const cv = document.getElementById('warstwice');
    rysujWarstwice(cv, w, h, dpr);
    return new Promise(ok => cv.toBlob(ok, 'image/png'));
  }
}

export async function zbudujMape() {
  const plan = document.getElementById('mapaPlan');
  const kafle = document.getElementById('kafle');
  if (!plan || mapaGotowa) return;
  mapaGotowa = true;
  const w = plan.offsetWidth, h = plan.offsetHeight;
  const zn = document.getElementById('znaczniki');
  if (zn) zn.innerHTML = [[38, 44], [61, 39], [52, 58], [30, 63], [70, 55]].map(([x, y], i) =>
    `<span class="znacznik z${i}" style="left:${x}%;top:${y}%"><svg viewBox="0 0 24 32"><path d="M12 1C6 1 2 5.5 2 11c0 7.5 10 20 10 20s10-12.5 10-20C22 5.5 18 1 12 1z"/><circle cx="12" cy="11" r="4"/></svg></span>`).join('');
  const blob = await obrazMapy(w, h);
  if (!blob) return;
  const url = URL.createObjectURL(blob);
  const zlozMape = () => {
    kafle.style.setProperty('--maska-mapy', `url(${url})`);
    kafle.classList.add('zlozona');
    kafle.replaceChildren();
  };
  pingMapy();
  if (reduced || sessionStorageBezpieczny('kc:fortnite:intro')) {
    zlozMape();
    return;
  }
  const K = 3, W = 4; // 3 kolumny × 4 rzędy fragmentów
  const fr = document.createDocumentFragment();
  const kafel = [];
  const kw = w / K, kh = h / W;
  for (let r = 0; r < W; r++) for (let k = 0; k < K; k++) {
    const d = document.createElement('div');
    d.className = 'kafel';
    Object.assign(d.style, {
      left: (k * kw) + 'px', top: (r * kh) + 'px', width: Math.ceil(kw) + 1 + 'px', height: Math.ceil(kh) + 1 + 'px',
      maskImage: `url(${url})`, webkitMaskImage: `url(${url})`,
      maskSize: `${w}px ${h}px`, webkitMaskSize: `${w}px ${h}px`,
      maskPosition: `${-k * kw}px ${-r * kh}px`, webkitMaskPosition: `${-k * kw}px ${-r * kh}px`,
    });
    fr.appendChild(d); kafel.push([d, k, r]);
  }
  kafle.appendChild(fr);
  // Fragmenty mapy układają się wokół tytułu w ok. 350 ms.
  const wejscia = kafel.map(([d, k, r], i) => {
    const dx = (k - 1) * 60, dy = (r - 1.5) * 50;
    return d.animate([
      { transform: `translate3d(${dx}px, ${dy}px, 0) rotate(${(i % 2 ? 1 : -1) * 6}deg) scale(.9)`, opacity: 0 },
      { transform: 'none', opacity: 1 },
    ], { duration: 300, delay: (i % 6) * 10, easing: EASE_OUT, fill: 'backwards' }).finished;
  });
  await Promise.allSettled(wejscia);
  zlozMape();
}
function sessionStorageBezpieczny(k) {
  try { if (sessionStorage.getItem(k)) return true; sessionStorage.setItem(k, '1'); } catch { /* bez pamięci sesji */ }
  return false;
}

// Paralaksa mapy pod kursorem (tylko precyzyjny wskaźnik, z throttlingiem rAF).
export function paralaksa() {
  if (!matchMedia('(pointer: fine)').matches) return;
  const m = document.getElementById('mapa');
  let raf = 0, x = 0, y = 0;
  addEventListener('pointermove', e => {
    x = e.clientX / innerWidth - .5; y = e.clientY / innerHeight - .5;
    if (raf || reduced) return;
    raf = requestAnimationFrame(() => { raf = 0; m.style.setProperty('--px', x.toFixed(3)); m.style.setProperty('--py', y.toFixed(3)); });
  }, { passive: true });
}

// Zmiana koloru mapy jest jednorazowa (jedno przemalowanie), a przejście
// maskuje krótki „mrug” warstwy, który działa tylko na kompozytorze.
export function przebarwMape() {
  if (reduced) return;
  const plan = document.getElementById('mapaPlan');
  plan?.animate([{ opacity: .35 }, { opacity: 1 }], { duration: 280, easing: 'ease-out' });
  pingMapy();
}

// Puls znaczników na mapie (np. przy losowaniu).
export function pingMapy() {
  if (reduced) return;
  document.querySelectorAll('.znacznik').forEach((z, i) => {
    z.animate([{ transform: 'scale(.6)', opacity: 0 }, { transform: 'scale(1.15)', opacity: 1, offset: .5 }, { transform: 'scale(1)', opacity: 1 }],
      { duration: 420, delay: i * 70, easing: EASE_OUT });
  });
}

// ---------------------------------------------------------
// Przyciski: natychmiastowa reakcja na dotyk (klasa na pointerdown).
// ---------------------------------------------------------
export function reakcjaDotyku(root) {
  root.addEventListener('pointerdown', e => {
    const b = e.target.closest('button, .dotyk');
    if (!b || b.disabled) return;
    b.classList.add('wcisniety');
    const r = b.getBoundingClientRect();
    b.style.setProperty('--tx', (e.clientX - r.left) + 'px');
    b.style.setProperty('--ty', (e.clientY - r.top) + 'px');
    const pusc = () => { b.classList.remove('wcisniety'); removeEventListener('pointerup', pusc); removeEventListener('pointercancel', pusc); };
    addEventListener('pointerup', pusc); addEventListener('pointercancel', pusc);
  });
}

// ---------------------------------------------------------
// Losowanie: szybki obrót rewersów i dłuższe wyhamowanie wybranej karty.
// ---------------------------------------------------------
export async function rozdaj(talia, karta) {
  if (reduced) return;
  const tr = talia.getBoundingClientRect(), kr = karta.getBoundingClientRect();
  const dx = (tr.left + tr.width / 2) - (kr.left + kr.width / 2);
  const dy = (tr.top + tr.height / 2) - (kr.top + kr.height / 2);
  const rewersy = [...talia.querySelectorAll('.talia-rewers')];
  // talia reaguje od razu
  anim(talia, [{ scale: 1 }, { scale: .94 }, { scale: 1 }], { duration: 160, easing: EASE_OUT });
  rewersy.forEach((r, i) => {
    const s = i % 2 ? 1 : -1, o = 26 + i * 12;
    anim(r, [
      { transform: r.style.transform || 'none' },
      { transform: `translate(${s * o}px, ${-12 - i * 4}px) rotate(${s * (18 + i * 4)}deg)`, offset: .34 },
      { transform: `translate(${-s * o * .85}px, 8px) rotate(${-s * 18}deg)`, offset: .62 },
      { transform: r.style.transform || 'none' },
    ], { duration: 520 + i * 36, easing: 'ease-in-out' });
  });
  pingMapy();
  const rama = karta.closest('.rama');
  if (rama) {
    anim(rama, [{ opacity: .72 }, { opacity: 1, offset: .32 }, { opacity: .86, offset: .73 }, { opacity: 1 }],
      { duration: 790, easing: EASE_OUT });
    rama.querySelectorAll('.rama-n').forEach((n, i) => anim(n, [
      { scale: .64, opacity: .25 },
      { scale: 1.45, opacity: 1, offset: .55 },
      { scale: 1, opacity: 1 },
    ], { duration: 380, delay: 120 + i * 45, easing: EASE_SPRING }));
  }
  const lot = anim(karta, [
    { transform: `translate(${dx}px, ${dy}px) scale(.40) rotate(-16deg) rotateY(-65deg)`, opacity: .05 },
    { transform: `translate(${dx + 14}px, ${dy - 25}px) scale(.53) rotate(-26deg) rotateY(36deg)`, opacity: .7, offset: .26 },
    { transform: `translate(${dx * .45}px, ${dy * .47 - 42}px) scale(.75) rotate(10deg) rotateY(-17deg)`, opacity: 1, offset: .53 },
    { transform: 'translate(0, -6px) scale(1.035) rotate(-1.2deg) rotateY(3deg)', opacity: 1, offset: .83 },
    { transform: 'none', opacity: 1 },
  ], { duration: 790, easing: 'cubic-bezier(.23,.58,.27,1)' });
  await czekaj(lot);
  rama?.classList.add('zamkniete');
}

// Odkrycie: rewers odsuwa się przez ok. 180 ms, tytuł i warunek pojawiają się razem.
export async function odkryj(karta, trud) {
  const rewers = karta.querySelector('.rewers');
  const blysk = karta.querySelector('.blysk');
  if (reduced || !rewers) return;
  anim(rewers, [
    { transform: 'none', opacity: 1 },
    { transform: 'translate(43%, -6%) rotate(9deg) rotateY(64deg)', opacity: 0 },
  ], { duration: 180, easing: 'cubic-bezier(.5,0,.75,0)' });
  if (blysk) anim(blysk, [{ opacity: .95, transform: 'scale(.6)' }, { opacity: 0, transform: 'scale(1.6)' }], { duration: 520, easing: EASE_OUT });
  const fala = karta.querySelector('.fala');
  if (fala) anim(fala, [{ opacity: .9, transform: 'scale(.4)' }, { opacity: 0, transform: 'scale(2.2)' }], { duration: 600, easing: EASE_OUT });
  // charakter trudności
  if (trud === 'ekstremalny') {
    wstrzas();
    const t = karta.querySelector('.karta-tytul');
    if (t) anim(t, [
      { transform: 'translate(-3px,0) skewX(-8deg)', clipPath: 'inset(0 0 55% 0)' },
      { transform: 'translate(4px,0) skewX(6deg)', clipPath: 'inset(40% 0 0 0)', offset: .3 },
      { transform: 'translate(-2px,0)', clipPath: 'inset(0 0 0 0)', offset: .6 },
      { transform: 'none', clipPath: 'inset(0 0 0 0)' },
    ], { duration: 260, easing: 'steps(6, end)' });
    const pl = document.querySelector('.plomien');
    if (pl) anim(pl, [{ opacity: 0 }, { opacity: .8, offset: .15 }, { opacity: 0 }], { duration: 700, easing: 'ease-out' });
  } else if (trud === 'ekspert') {
    karta.querySelectorAll('.naroznik').forEach((n, i) => anim(n, [
      { transform: `translate(${i % 2 ? 18 : -18}px, ${i < 2 ? -18 : 18}px)`, opacity: 0 },
      { transform: 'none', opacity: 1 }], { duration: 260, delay: 60, easing: EASE_SPRING }));
  } else if (trud === 'trudny') {
    const pas = karta.querySelector('.pasy');
    if (pas) anim(pas, [{ transform: 'translateX(-100%)' }, { transform: 'translateX(0)' }], { duration: 320, easing: EASE_OUT });
  } else if (trud === 'normalny' && fala) {
    anim(fala, [{ opacity: .8, transform: 'scaleX(.2)' }, { opacity: 0, transform: 'scaleX(1.8)' }],
      { duration: 470, easing: EASE_OUT });
  } else if (trud === 'specjalna' && blysk) {
    anim(blysk, [{ opacity: .95, transform: 'rotate(-25deg) scale(.4)' }, { opacity: 0, transform: 'rotate(23deg) scale(1.8)' }],
      { duration: 720, easing: EASE_OUT });
  }
  const face = karta.querySelector('.karta');
  if (face) { face.classList.remove('polysk'); void face.offsetWidth; face.classList.add('polysk'); }
  pingMapy();
  const tresc = karta.querySelector('.karta-tresc');
  if (tresc) anim(tresc, [{ opacity: 0, transform: 'translateY(6px)' }, { opacity: 1, transform: 'none' }], { duration: 200, easing: EASE_OUT });
  await new Promise(r => setTimeout(r, 180));
}

// Karta odlatuje (wymiana / unieważnienie).
export async function odrzuc(karta, kierunek = 1) {
  if (reduced || !karta) return;
  await czekaj(anim(karta, [
    { transform: 'none', opacity: 1 },
    { transform: `translate(${kierunek * 120}%, 30px) rotate(${kierunek * 18}deg)`, opacity: 0 },
  ], { duration: 240, easing: 'cubic-bezier(.5,0,.75,0)', fill: 'forwards' }));
}

export function wstrzas() {
  if (reduced) return;
  const e = document.getElementById('ekran');
  anim(e, [
    { transform: 'translate(0,0)' }, { transform: 'translate(-5px,2px)' }, { transform: 'translate(4px,-3px)' },
    { transform: 'translate(-3px,1px)' }, { transform: 'translate(2px,0)' }, { transform: 'translate(0,0)' },
  ], { duration: 240, easing: 'linear' });
}

// Stempel „Zaliczone”.
export function stempel(el) {
  if (reduced || !el) return;
  anim(el, [
    { transform: 'rotate(-14deg) scale(2.1)', opacity: 0 },
    { transform: 'rotate(-9deg) scale(.92)', opacity: 1, offset: .65 },
    { transform: 'rotate(-10deg) scale(1)', opacity: 1 },
  ], { duration: 260, easing: 'cubic-bezier(.2,.9,.3,1.2)' });
  const panel = el.closest('.panel-gracza');
  if (panel) anim(panel, [{ transform: 'none' }, { transform: 'translateY(3px) scale(.99)', offset: .6 }, { transform: 'none' }], { duration: 220, delay: 150 });
}

export function podskok(el) {
  if (reduced || !el) return;
  anim(el, [{ transform: 'none' }, { transform: 'translateY(-10px) rotate(-6deg) scale(1.08)', offset: .4 }, { transform: 'none' }],
    { duration: 380, easing: EASE_SPRING });
}

// Wjazd elementów nowego widoku: krótko, tylko przy zmianie widoku.
export function wejscie(elementy, odstep = 40) {
  if (reduced) return;
  elementy.forEach((el, i) => anim(el, [
    { opacity: 0, transform: 'translateY(14px)' }, { opacity: 1, transform: 'none' },
  ], { duration: 260, delay: i * odstep, easing: EASE_OUT, fill: 'backwards' }));
}

export async function wyjscie(el) {
  if (reduced || !el) return;
  el.style.pointerEvents = 'none';
  await czekaj(anim(el, [{ opacity: 1, transform: 'none' }, { opacity: 0, transform: 'translateY(-8px) scale(.985)' }],
    { duration: 120, easing: 'ease-in', fill: 'forwards' }));
}

// Finał: pola wyników ustawiają się w ok. 450 ms, liczby przewijają się jak bębny.
export function finalWejscie(kolumny, wiersze, tytul) {
  if (reduced) return;
  if (tytul) anim(tytul, [
    { transform: 'scale(1.9) rotate(-3deg)', opacity: 0, letterSpacing: '.12em' },
    { transform: 'scale(.94) rotate(0)', opacity: 1, letterSpacing: '0', offset: .7 },
    { transform: 'none', opacity: 1 },
  ], { duration: 420, easing: 'cubic-bezier(.2,.8,.3,1)', fill: 'backwards' });
  kolumny.forEach((k, i) => anim(k, [
    { opacity: 0, transform: `translateX(${i ? 40 : -40}px) skewX(${i ? -6 : 6}deg)` }, { opacity: 1, transform: 'none' },
  ], { duration: 380, delay: 40, easing: EASE_OUT, fill: 'backwards' }));
  wiersze.forEach((w, i) => anim(w, [{ opacity: 0, transform: 'translateY(10px)' }, { opacity: 1, transform: 'none' }],
    { duration: 240, delay: 160 + i * 70, easing: EASE_OUT, fill: 'backwards' }));
}

// Konfetti: jednorazowa seria cząstek na canvasie, sama się sprząta.
export function konfetti(kolory, zrodla = [[.5, .35]]) {
  if (reduced) return;
  const cv = document.createElement('canvas');
  cv.className = 'konfetti'; cv.setAttribute('aria-hidden', 'true');
  document.body.appendChild(cv);
  const dpr = Math.min(devicePixelRatio || 1, 2);
  const W = innerWidth, H = innerHeight;
  cv.width = W * dpr; cv.height = H * dpr;
  const c = cv.getContext('2d'); c.scale(dpr, dpr);
  const N = Math.min(150, Math.round(W * .28));
  const cz = [];
  for (let i = 0; i < N; i++) {
    const [zx, zy] = zrodla[i % zrodla.length];
    const a = -Math.PI / 2 + (Math.random() - .5) * 1.9, v = 6 + Math.random() * 9;
    cz.push({ x: zx * W, y: zy * H, vx: Math.cos(a) * v, vy: Math.sin(a) * v, r: Math.random() * 6.28, vr: (Math.random() - .5) * .4,
      w: 5 + Math.random() * 7, h: 3 + Math.random() * 5, k: kolory[i % kolory.length], f: Math.random() < .3 });
  }
  const t0 = performance.now(), CZAS = 1900;
  const krok = t => {
    const p = (t - t0) / CZAS;
    c.clearRect(0, 0, W, H);
    if (p >= 1 || document.hidden) { cv.remove(); return; }
    c.globalAlpha = p > .7 ? 1 - (p - .7) / .3 : 1;
    for (const q of cz) {
      q.vy += .32; q.vx *= .985; q.vy *= .985; q.x += q.vx; q.y += q.vy; q.r += q.vr;
      c.save(); c.translate(q.x, q.y); c.rotate(q.r); c.fillStyle = q.k;
      if (q.f) { c.beginPath(); c.moveTo(0, -q.w / 2); c.lineTo(q.h / 2, q.w / 2); c.lineTo(-q.h / 2, q.w / 2); c.fill(); }
      else c.fillRect(-q.w / 2, -q.h / 2, q.w, q.h * Math.abs(Math.cos(q.r * 2)) + .6);
      c.restore();
    }
    requestAnimationFrame(krok);
  };
  requestAnimationFrame(krok);
}

// Publiczna wartość wyniku jest gotowa od razu; ruch licznika służy prezentacji.
const zegary = new WeakMap();
export function licznik(el, od, doWyniku) {
  const poprzedni = zegary.get(el);
  if (poprzedni) cancelAnimationFrame(poprzedni);
  if (reduced || document.hidden || od === doWyniku) { el.textContent = doWyniku; return; }
  const start = performance.now();
  const krok = teraz => {
    if (!el.isConnected) return;
    const p = Math.min(1, (teraz - start) / 440);
    el.textContent = Math.round(od + (doWyniku - od) * (1 - (1 - p) ** 3));
    if (p < 1 && !document.hidden) zegary.set(el, requestAnimationFrame(krok));
    else { el.textContent = doWyniku; zegary.delete(el); }
  };
  zegary.set(el, requestAnimationFrame(krok));
}
