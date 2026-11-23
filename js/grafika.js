// =========================================================
// KILEK CHALLENGE: autorskie grafiki SVG (insygnia, ikony, awatary).
// Wszystko rysowane tutaj, bez emoji i zewnętrznych zestawów ikon.
// =========================================================

const svg = (vb, inner, cls = '') =>
  `<svg class="${cls}" viewBox="${vb}" aria-hidden="true" focusable="false">${inner}</svg>`;

// Insygnia trudności: każda ma własny kształt, nie tylko kolor.
export const INSYGNIA = {
  // Zwiad: znacznik z okręgiem widzenia
  latwy: svg('0 0 48 48', `
    <circle cx="24" cy="24" r="17" fill="none" stroke="currentColor" stroke-width="2.5" stroke-dasharray="3 5"/>
    <path d="M24 12c-5 0-8.5 3.6-8.5 8.2 0 6.3 8.5 14.8 8.5 14.8s8.5-8.5 8.5-14.8C32.5 15.6 29 12 24 12z" fill="currentColor"/>
    <circle cx="24" cy="20.4" r="3.2" fill="var(--ins-tlo,#0a1626)"/>`, 'ins'),
  // Patrol: przerywana trasa z grotem
  normalny: svg('0 0 48 48', `
    <path d="M8 38c6-2 7-10 13-12s10 3 15-3" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-dasharray="1 6"/>
    <path d="M30 14l11 4-6 9z" fill="currentColor"/>
    <circle cx="8" cy="38" r="3.5" fill="currentColor"/>`, 'ins'),
  // Szturm: podwójny szewron
  trudny: svg('0 0 48 48', `
    <path d="M10 26l14-12 14 12" fill="none" stroke="currentColor" stroke-width="5" stroke-linejoin="miter" stroke-linecap="square"/>
    <path d="M10 38l14-12 14 12" fill="none" stroke="currentColor" stroke-width="5" stroke-linejoin="miter" stroke-linecap="square" opacity=".55"/>`, 'ins'),
  // Operacja: celownik z rombem
  ekspert: svg('0 0 48 48', `
    <circle cx="24" cy="24" r="15" fill="none" stroke="currentColor" stroke-width="2.5"/>
    <path d="M24 4v10M24 34v10M4 24h10M34 24h10" stroke="currentColor" stroke-width="3" stroke-linecap="square"/>
    <path d="M24 17l7 7-7 7-7-7z" fill="currentColor"/>`, 'ins'),
  // Strefa zero: pierścień burzy z piorunem
  ekstremalny: svg('0 0 48 48', `
    <path d="M24 5a19 19 0 1 1-13.4 5.6" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"/>
    <path d="M10.6 10.6l-1.2 7.3 7.2-1.6" fill="none" stroke="currentColor" stroke-width="3" stroke-linejoin="round" stroke-linecap="round"/>
    <path d="M27 11l-10 15h7l-3 11 11-16h-7z" fill="currentColor"/>`, 'ins'),
};

export const IKONY = {
  build: svg('0 0 32 32', `
    <path d="M3 27h26M5 27V17h10v10M15 27V11h12v16" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linejoin="round"/>
    <path d="M5 22h10M15 19h12M21 11v8M10 17v5M9 22v5M21 19v8" stroke="currentColor" stroke-width="1.6"/>`, 'ik'),
  zero: svg('0 0 32 32', `
    <path d="M5 27V13h22v14" fill="none" stroke="currentColor" stroke-width="2.4" stroke-dasharray="4 3"/>
    <path d="M4 6l24 22" stroke="currentColor" stroke-width="2.8" stroke-linecap="round"/>
    <path d="M3 27h26" stroke="currentColor" stroke-width="2.4"/>`, 'ik'),
  zalicz: svg('0 0 32 32', `<path d="M6 17l7 7L27 9" fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="square"/>`, 'ik'),
  nie: svg('0 0 32 32', `<path d="M9 9l14 14M23 9L9 23" fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="square"/>`, 'ik'),
  wymiana: svg('0 0 32 32', `
    <path d="M7 12h17l-5-5M25 20H8l5 5" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/>`, 'ik'),
  uniewaznij: svg('0 0 32 32', `
    <rect x="7" y="4" width="18" height="24" rx="2" fill="none" stroke="currentColor" stroke-width="2.4"/>
    <path d="M4 28L28 4" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"/>`, 'ik'),
  info: svg('0 0 32 32', `
    <circle cx="16" cy="16" r="12" fill="none" stroke="currentColor" stroke-width="2.4"/>
    <path d="M16 14v9" stroke="currentColor" stroke-width="3" stroke-linecap="round"/><circle cx="16" cy="9.5" r="1.9" fill="currentColor"/>`, 'ik'),
  wstecz: svg('0 0 32 32', `<path d="M19 7l-9 9 9 9" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>`, 'ik'),
  zamknij: svg('0 0 32 32', `<path d="M9 9l14 14M23 9L9 23" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"/>`, 'ik'),
  olowek: svg('0 0 32 32', `<path d="M6 26l2-7L21 6l5 5-13 13zM18 9l5 5" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linejoin="round"/>`, 'ik'),
};

// Odznaka zwycięzcy: gwiazda na wieńcu z warstwic.
export const ODZNAKA = svg('0 0 120 120', `
  <defs><linearGradient id="og" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff3b0"/><stop offset=".55" stop-color="#ffcf3a"/><stop offset="1" stop-color="#e09a00"/></linearGradient></defs>
  <circle cx="60" cy="60" r="54" fill="none" stroke="#ffcf3a" stroke-width="2" stroke-dasharray="2 6" opacity=".7"/>
  <circle cx="60" cy="60" r="44" fill="none" stroke="#ffcf3a" stroke-width="1.5" opacity=".45"/>
  <path d="M60 18l11.8 25.6 28 3.2-20.8 19 5.6 27.6L60 79.4 35.4 93.4 41 65.8 20.2 46.8l28-3.2z" fill="url(#og)" stroke="#5a3b00" stroke-width="2.5" stroke-linejoin="round"/>
  <path d="M60 30l7.6 16.6 18 2-13.4 12.3 3.6 17.8L60 69.6" fill="none" stroke="#fff" stroke-width="2" opacity=".55" stroke-linejoin="round"/>`, 'odznaka');

// Rewers karty: wzór z warstwic i insygnium serii.
export function rewers(trud) {
  return `<div class="rewers-wzor"></div>
    <div class="rewers-srodek">${INSYGNIA[trud] || ''}<span class="rewers-napis">KILEK</span></div>`;
}

// ---------- Awatary graczy ----------
// Hełm z wizjerem. Wariant zależy od pseudonimu, kolor od numeru gracza.
const KOLORY = [
  { a: '#ff7a45', b: '#ffb08c', c: '#7a2a0c' },
  { a: '#36d0ff', b: '#9be7ff', c: '#0a4a66' },
];

function hash(t) {
  let h = 2166136261;
  for (const ch of t) { h ^= ch.codePointAt(0); h = Math.imul(h, 16777619); }
  return h >>> 0;
}

let licznik = 0;
export function awatar(nazwa, nr, cls = '') {
  const k = KOLORY[nr];
  const h = hash((nazwa || '').trim().toLowerCase() + '#' + nr);
  const wizjer = h % 4, gora = (h >> 3) % 4, pas = (h >> 6) % 3;
  const id = `av${nr}_${licznik++}`;
  const wizjery = [
    `<path d="M18 33c0-5 4-8 14-8s14 3 14 8v4c0 3-3 5-14 5s-14-2-14-5z" fill="url(#${id}w)"/>`,
    `<rect x="17" y="27" width="13" height="11" rx="5" fill="url(#${id}w)"/><rect x="34" y="27" width="13" height="11" rx="5" fill="url(#${id}w)"/>`,
    `<path d="M16 31h32l-3 6H19z" fill="url(#${id}w)"/>`,
    `<circle cx="32" cy="33" r="9" fill="url(#${id}w)"/>`,
  ];
  const gory = [
    `<path d="M32 6v-4" stroke="${k.a}" stroke-width="2.5" stroke-linecap="round"/><circle cx="32" cy="2.5" r="2.5" fill="${k.b}"/>`,
    `<path d="M24 8l8-7 8 7z" fill="${k.c}"/>`,
    `<path d="M14 18l-5-9 9 5zM50 18l5-9-9 5z" fill="${k.c}"/>`,
    '',
  ];
  const pasy = [
    `<path d="M32 8v12" stroke="${k.b}" stroke-width="4" opacity=".6"/>`,
    `<path d="M22 12l20 0" stroke="${k.b}" stroke-width="3" opacity=".5"/>`,
    `<circle cx="44" cy="17" r="3" fill="${k.b}" opacity=".8"/>`,
  ];
  return svg('0 0 64 64', `
    <defs>
      <linearGradient id="${id}h" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${k.b}"/><stop offset=".6" stop-color="${k.a}"/><stop offset="1" stop-color="${k.c}"/></linearGradient>
      <linearGradient id="${id}w" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#1b2e44"/><stop offset=".5" stop-color="#0a1626"/><stop offset="1" stop-color="#24496a"/></linearGradient>
      <clipPath id="${id}c"><path d="M12 33C12 17 20 8 32 8s20 9 20 25v5c0 9-8 15-20 15S12 47 12 38z"/></clipPath>
    </defs>
    <g class="av-cialo">
      <path d="M6 64c1-9 8-13 16-14h20c8 1 15 5 16 14z" fill="#13283c" stroke="${k.c}" stroke-width="1.5"/>
      <path d="M22 50l10 8 10-8" fill="none" stroke="${k.a}" stroke-width="3" stroke-linejoin="round"/>
      ${gory[gora]}
      <path d="M12 33C12 17 20 8 32 8s20 9 20 25v5c0 9-8 15-20 15S12 47 12 38z" fill="url(#${id}h)" stroke="${k.c}" stroke-width="2"/>
      <path d="M18 18c3-5 8-7 14-7" fill="none" stroke="#fff" stroke-width="2.5" stroke-linecap="round" opacity=".45"/>
      ${pasy[pas]}
      <g class="av-wizjer">${wizjery[wizjer]}</g>
      <g clip-path="url(#${id}c)"><rect class="av-blysk" x="-30" y="0" width="12" height="64" fill="#fff" opacity=".55" transform="skewX(-20)"/></g>
    </g>`, 'awatar ' + cls);
}
