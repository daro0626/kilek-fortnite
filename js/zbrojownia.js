import { METRYKI, PLAYLISTY, RZADKOSCI, SPRZET, WERYFIKACJA, ZRODLA_SPRZETU } from './sprzet-dane.js';
import { UZBROJENIE } from './wiedza-dane.js';
import { materialSprzetu } from './sprzet-media.js';

const statusy = { potwierdzony: 'Potwierdzone', sprawdz: 'Do sprawdzenia', archiwum: 'Archiwum' };
const etykietyUjec = { render: 'Render Epic', ikona: 'Ekwipunek', gra: 'W meczu' };
const nazwyZrodel = {
  sezon: 'Epic · start sezonu', br: 'Epic · aktualizacja 43.10', reload: 'Epic · Reaktywacja 43.00',
  blitz: 'Epic · Blitz 43.00', flint: 'Epic · render v8.11', hammer: 'Epic · render Vibin’', flap: 'Epic · render Wilds',
  oscar: 'Epic · Dzień Kapitana Oscara',
};
const para = SPRZET.flatMap(s => s.warianty.map(w => ({ s, w })));
const klucz = ({ s, w }) => s.id + '/' + w.id;
const wariant = w => w.nazwa || RZADKOSCI[w.rzadkosc];
const zakres = w => w.tryby.map(k => PLAYLISTY[k]).join(' / ');
const nazwaPary = ({ s, w }) => `${s.nazwa} · ${wariant(w)} · ${zakres(w)}${w.status === 'archiwum' ? ' · ' + w.wersja : ''}`;
const liczba = new Intl.NumberFormat('pl', { maximumFractionDigits: 2 });
const zrodlo = (url, tekst) => `<a href="${url}">${tekst}</a>`;
const opcje = (slownik, zero) => `<option value="">${zero}</option>${Object.entries(slownik).map(([id, nazwa]) =>
  `<option value="${id}">${nazwa}</option>`).join('')}`;

export function miniaturaSprzetu(s, w) {
  const obraz = materialSprzetu(s.id, w, 'ikona') ?? materialSprzetu(s.id, w, 'miniatura-renderu');
  if (!obraz) return '';
  return `<span class="arsenal-mini"><img width="${obraz.rozmiar[0]}" height="${obraz.rozmiar[1]}" loading="lazy" decoding="async"
    src="${obraz.plik}" alt=""></span>`;
}

const dostepneKadry = (s, w) => Object.keys(etykietyUjec)
  .map(typ => materialSprzetu(s.id, w, typ)).filter(Boolean);

function pokazZdjecie(root, s, foto, poprzedniObraz) {
  const pole = root.querySelector('#arsenal-foto');
  pole.innerHTML = `<button class="arsenal-powieksz" type="button" data-zoom aria-label="Powiększ obraz · ${s.nazwa}">
    <img src="${foto.plik}" width="${foto.rozmiar[0]}" height="${foto.rozmiar[1]}" alt="${s.nazwa}, ${etykietyUjec[foto.typ]}" decoding="async" fetchpriority="high">
    <span>Powiększ</span></button>`;
  if (poprzedniObraz?.getAttribute('src') === foto.plik) {
    pole.querySelector('img').replaceWith(poprzedniObraz);
  }
  const opis = foto.wariant === null ? 'Render referencyjny. Rzadkość opisuje wybrany wariant karty.' : etykietyUjec[foto.typ] + '.';
  root.querySelector('#arsenal-fotopis').innerHTML =
    `${opis} ${zrodlo(foto.zrodlo, `${foto.tworca} · ${foto.publikacja}`)}`;
  for (const b of root.querySelectorAll('[data-ujecie]')) {
    b.setAttribute('aria-pressed', String(b.dataset.ujecie === foto.typ));
  }
}

function statystyki(w) {
  return `<dl class="arsenal-parametry">${METRYKI.map(([id, nazwa, j]) => {
    const wartosc = w.statystyki?.[id];
    const opis = id === 'daleko' && w.odlegloscSpadku ? ` po ${w.odlegloscSpadku} m` : '';
    return `<div><dt>${nazwa}${opis}</dt><dd>${Number.isFinite(wartosc) ? liczba.format(wartosc) + j : 'Brak potwierdzonych danych'}</dd></div>`;
  }).join('')}</dl>`;
}

function porownanie(root) {
  const wyniki = root.querySelector('#arsenal-porownanie');
  const pary = [...root.querySelectorAll('[data-porownaj]')].map(el => para.find(p => klucz(p) === el.value));
  const [a, b] = pary;
  const kontekst = zakres(a.w) === zakres(b.w) && a.w.status === b.w.status
    ? '' : '<p class="nota">Warianty pochodzą z różnego trybu lub okresu. Sprawdź podpisy pod nazwami.</p>';
  wyniki.innerHTML = `${kontekst}<div class="arsenal-porownanie-panele">${pary.map(({s,w}) =>
    `<section class="arsenal-porownanie-karta rzad-${w.rzadkosc}"><h3>${s.nazwa}</h3>
      <p class="arsenal-rzadkosc">${wariant(w)} · ${zakres(w)}</p>
      <dl>${METRYKI.map(([id, nazwa, j]) => {
        const p = w.statystyki?.[id];
        const inne = (w === a.w ? b : a).w.statystyki?.[id];
        const mozna = Number.isFinite(p) && Number.isFinite(inne) && (id !== 'daleko' || a.w.odlegloscSpadku === b.w.odlegloscSpadku);
        const opis = id === 'daleko' && w.odlegloscSpadku ? ` po ${w.odlegloscSpadku} m` : '';
        return `<div><dt>${nazwa}${opis}</dt><dd>${Number.isFinite(p) ? liczba.format(p) + j : 'Brak potwierdzonych danych'}
            ${mozna ? `<span class="arsenal-belka" aria-hidden="true" style="--dlugosc:${100*p/Math.max(p,inne,1)}%"></span>` : ''}</dd></div>`;
      }).join('')}</dl>
      <p class="nota">Sprawdzono ${w.sprawdzono ?? WERYFIKACJA} · ${zrodlo(w.zrodlo, w.nazwaZrodla)}</p>
    </section>`).join('')}</div>`;
}

function przewodnik() {
  return `<details class="arsenal-przewodnik wiedza-panel"><summary>Poradnik rodzin sprzętu</summary>
    <div class="arsenal-rodziny">${UZBROJENIE.map(t => `<article>
      <h3>${t.id === 'proca' ? 'Procę i broń ładowaną' : t.nazwa}</h3><p>${t.dystans}. ${t.plus}</p>
      <p><b>Ograniczenie</b> ${t.minus}</p><p><b>Typowy błąd</b> ${t.blad}</p><p><b>Ćwiczenie</b> ${t.proba}</p>
    </article>`).join('')}</div></details>`;
}

const widoki = new WeakMap();

export function zbrojownia(root, [przedmiot, idWariantu] = []) {
  if (widoki.has(root)) {
    widoki.get(root)(przedmiot, idWariantu);
    return;
  }
  const typy = Object.fromEntries([...new Set(SPRZET.map(s => s.typ))].map(n => [n,n]));
  root.querySelector('#arsenal-dodatki').innerHTML = `
  <section class="arsenal-porownaj wiedza-panel">
    <h2>Porównaj warianty</h2>
    <div class="arsenal-pary">${['Pierwszy wariant','Drugi wariant'].map(n =>
      `<label>${n}<select data-porownaj>${para.map(p => `<option value="${klucz(p)}">${nazwaPary(p)}</option>`).join('')}</select></label>`).join('')}</div>
    <div id="arsenal-porownanie"></div>
  </section>
  ${przewodnik()}
  <dialog class="arsenal-dialog" aria-labelledby="arsenal-dialog-tytul"><div class="arsenal-dialog-gora">
    <h2 id="arsenal-dialog-tytul"></h2><button autofocus class="btn btn-drugi" type="button" data-zamknij-foto>Zamknij</button>
    </div><div class="arsenal-dialog-foto"></div></dialog>`;
  const znajdz = s => root.querySelector(s);
  const filtry = znajdz('form');
  const [okres, typ, playlista, rzadkosc] = [...filtry.querySelectorAll('select')];
  typ.innerHTML = opcje(typy, 'Wszystkie rodzaje');
  playlista.innerHTML = opcje(PLAYLISTY, 'Wszystkie tryby');
  rzadkosc.innerHTML = opcje(RZADKOSCI, 'Wszystkie rzadkości');
  const lista = znajdz('#arsenal-karty');
  const widok = znajdz('#arsenal-widok');
  const dialog = znajdz('dialog');
  let aktualna = para.find(p => klucz(p) === 'flint/br-rzadka'), typUjecia = 'render', foto;
  let pierwszyRender = true;
  const pasuje = ({s,w}) => (w.status === 'archiwum') === (okres.value === 'archiwum') &&
    (!typ.value || s.typ === typ.value) && (!playlista.value || w.tryby.includes(playlista.value)) &&
    (!rzadkosc.value || w.rzadkosc === rzadkosc.value);

  function pokaz({s,w}) {
    aktualna = {s,w};
    const dostepneUjecia = dostepneKadry(s,w);
    foto = dostepneUjecia.find(kadr => kadr.typ === typUjecia) ?? dostepneUjecia[0];
    typUjecia = foto?.typ ?? 'render';
    const poprzedniObraz = pierwszyRender ? widok.querySelector('img[data-startowy][loading="eager"]') : null;
    pierwszyRender = false;
    widok.className = 'arsenal-widok rzad-' + w.rzadkosc;
    widok.innerHTML = `<header class="arsenal-gora"><div><p class="znacznik">${s.typ} · ${w.wersja}</p>
      <h2 tabindex="-1">${s.nazwa}</h2><p class="arsenal-oryginal">${s.oryginal}</p></div>
      <div><p class="arsenal-rzadkosc">${wariant(w)}</p><p class="arsenal-status">${w.rzadkosc === 'mityczna' ? '6 gwiazdek · ' : ''}${statusy[w.status]}</p></div></header>
      ${foto ? '<figure class="arsenal-galeria"><div id="arsenal-foto"></div><figcaption id="arsenal-fotopis"></figcaption></figure>'
        : '<p class="arsenal-bez-zdjecia">Opis przedmiotu · oczekuje na potwierdzone zdjęcie.</p>'}
      ${dostepneUjecia.length > 1 ? `<div class="arsenal-ujecia" role="group" aria-label="Widok przedmiotu">${dostepneUjecia.map(({typ}) =>
        `<button type="button" data-ujecie="${typ}" aria-pressed="false">${etykietyUjec[typ]}</button>`).join('')}</div>` : ''}
      <div class="arsenal-szczegoly">
        <label class="arsenal-wariant">Wariant i tryb
          <select id="arsenal-wariant">${para.filter(p => p.s === s && pasuje(p)).map(p =>
            `<option value="${klucz(p)}" ${p.w === w ? 'selected' : ''}>${wariant(p.w)} · ${zakres(p.w)}</option>`).join('')}</select>
        </label>
        <p>${s.opis}</p><p class="arsenal-stan"><strong>${zakres(w)}</strong> · ${w.nota}</p>
        ${statystyki(w)}
        <p class="nota">Sprawdzono ${w.sprawdzono ?? WERYFIKACJA} · ${zrodlo(w.zrodlo, w.nazwaZrodla)}</p>
        <dl class="arsenal-porady"><div><dt>Zaleta</dt><dd>${s.zalety}</dd></div>
          <div><dt>Ograniczenie</dt><dd>${s.ograniczenia}</dd></div><div><dt>Jak używać</dt><dd>${s.wskazowka}</dd></div></dl>
        <p class="arsenal-zrodla">${s.oficjalne.map(z => zrodlo(ZRODLA_SPRZETU[z], nazwyZrodel[z])).join(' · ')}</p>
      </div>`;
    if (foto) pokazZdjecie(root,s,foto,poprzedniObraz);
  }
  function odswiez() {
    const pasujace = para.filter(pasuje);
    const pierwsze = new Map();
    for (const p of pasujace) if (!pierwsze.has(p.s.id)) pierwsze.set(p.s.id,p);
    znajdz('#arsenal-licznik').textContent = `${pierwsze.size} przedmiotów · ${pasujace.length} wariantów`;
    if (!pasujace.length) {
      aktualna = null;
      widok.className = 'arsenal-widok';
      widok.innerHTML = '<p class="arsenal-pusto">Brak przedmiotów dla tych filtrów.</p>';
      lista.innerHTML = '';
      return;
    }
    if (!aktualna || !pasuje(aktualna)) aktualna = pasujace[0];
    pierwsze.set(aktualna.s.id, aktualna);
    pokaz(aktualna);
    const grupy = new Map([['Z obrazem', []], ['Opisy bez zdjęć', []]]);
    for (const {s,w} of pierwsze.values()) {
      const zeZdjeciem = dostepneKadry(s,w).length > 0;
      grupy.get(zeZdjeciem ? 'Z obrazem' : 'Opisy bez zdjęć').push(
        `<a class="arsenal-karta rzad-${w.rzadkosc}" href="#zbrojownia/${klucz({s,w})}" ${s === aktualna.s ? 'aria-current="true"' : ''}>
          ${miniaturaSprzetu(s,w)}<span><strong>${s.nazwa}</strong><small>${s.typ}</small></span></a>`);
    }
    lista.innerHTML = [...grupy].filter(([,linki]) => linki.length).map(([nazwa, linki]) =>
      `<section class="arsenal-grupa"><h3>${nazwa}</h3><div>${linki.join('')}</div></section>`).join('');
  }
  function otworz(id, target) {
    if (!id) return;
    const p = (target && para.find(({s,w}) => s.id === id && w.id === target))
      || para.find(p => p.s.id === id && pasuje(p)) || para.find(p => p.s.id === id);
    if (!p) return;
    if (!pasuje(p)) {
      okres.value = p.w.status === 'archiwum' ? 'archiwum' : 'sezon';
      typ.value = playlista.value = rzadkosc.value = '';
    }
    if (aktualna?.s !== p.s) typUjecia = 'render';
    aktualna = p;
    odswiez();
  }
  filtry.addEventListener('submit', e => e.preventDefault());
  root.addEventListener('change', e => {
    if (e.target.closest('.arsenal-filtry')) {
      typUjecia = 'render';
      odswiez();
    }
    if (e.target.matches('#arsenal-wariant')) {
      const p = para.find(p => klucz(p) === e.target.value);
      if (!p) return;
      history.replaceState(null, '', '#zbrojownia/' + klucz(p));
      aktualna = p;
      odswiez();
      znajdz('#arsenal-wariant')?.focus({ preventScroll: true });
    }
    if (e.target.matches('[data-porownaj]')) porownanie(root);
  });
  const delikatnyRuch = matchMedia('(pointer: fine) and (prefers-reduced-motion: no-preference)');
  widok.addEventListener('pointermove', e => {
    const kadr = e.target.closest('.arsenal-powieksz');
    if (!delikatnyRuch.matches || !kadr) return;
    const rect = kadr.getBoundingClientRect();
    kadr.style.setProperty('--mx', `${(e.clientX - rect.left) / rect.width * 10 - 5}px`);
    kadr.style.setProperty('--my', `${(e.clientY - rect.top) / rect.height * 6 - 3}px`);
  });
  widok.addEventListener('pointerout', e => {
    const kadr = e.target.closest('.arsenal-powieksz');
    if (!kadr || kadr.contains(e.relatedTarget)) return;
    kadr.style.removeProperty('--mx');
    kadr.style.removeProperty('--my');
  });
  root.addEventListener('click', e => {
    const przycisk = e.target.closest('button');
    if (!przycisk) return;
    if (przycisk.dataset.ujecie && aktualna) {
      const wybrany = materialSprzetu(aktualna.s.id, aktualna.w, przycisk.dataset.ujecie);
      if (!wybrany) return;
      foto = wybrany;
      typUjecia = foto.typ;
      pokazZdjecie(root, aktualna.s, foto);
    }
    if (przycisk.hasAttribute('data-zoom') && foto && aktualna) {
      dialog.querySelector('h2').textContent = aktualna.s.nazwa;
      dialog.querySelector('.arsenal-dialog-foto').innerHTML =
        `<img src="${foto.plik}" alt="${aktualna.s.nazwa}, ${etykietyUjec[typUjecia]}">`;
      dialog.showModal();
    }
    if (przycisk.hasAttribute('data-zamknij-foto')) dialog.close();
  });
  dialog.addEventListener('click', e => { if (e.target === dialog) dialog.close(); });
  const porownywane = root.querySelectorAll('[data-porownaj]');
  porownywane[0].value = 'flint/br-rzadka';
  porownywane[1].value = 'dragoon/br-epicka';
  porownanie(root);
  widoki.set(root, otworz);
  if (przedmiot) otworz(przedmiot,idWariantu);
  else odswiez();
}
