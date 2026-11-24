import { LEKCJE } from './wiedza-dane.js';
import { zbrojownia } from './zbrojownia.js';
import { sezon } from './sezon.js';
import { esc } from './opinie.js';

const el = id => document.getElementById(id);
const data = iso => new Intl.DateTimeFormat('pl', {dateStyle:'long', timeZone:'UTC'}).format(new Date(iso));

const dema = {
  strefa: { tytul: 'Zaplanowana rotacja', label: 'Postęp burzy', max: 100, odczyt: v =>
    v < 36 ? 'Masz czas wybrać drogę przez osłony.' : v < 70 ? 'Ruszaj. Dłuższa trasa może być już ryzykowna.' : 'Krąg jest blisko zamknięcia. Wybierz najbliższe bezpieczne przejście.' },
  dystans: { tytul: 'Zmieniaj dystans', label: 'Odległość w ćwiczeniu', max: 100, odczyt: v =>
    v < 33 ? 'Blisko. Porównaj klasy strzelby i SMG.' : v < 67 ? 'Średni dystans. Sprawdź uniwersalny karabin.' : 'Daleko. Precyzyjna broń lub zmiana pozycji.' },
  oslona: { tytul: 'Linia widzenia', label: 'Pozycja gracza', max: 100, odczyt: v =>
    v >= 35 && v <= 65 ? 'Pełna osłona przecina widok na gracza.' : 'Gracz jest na widoku. Przesuń się za osłonę.' },
  cel: { tytul: 'Prowadzenie celownika', label: 'Położenie celownika', max: 100, odczyt: v =>
    `Położenie ${v}. Ustaw celownik na znaczniku i wybierz „Sprawdź próbę”.` },
};

function pokazDemo(id, root) {
  if (!id) return;
  const d = dema[id], cel = id === 'cel';
  root.innerHTML = `<section class="wiedza-demo" aria-label="${d.tytul}">
    <h3>${d.tytul}</h3>
    <div class="demo-scena demo-${id}" aria-hidden="true"><i class="demo-stala"></i><i class="demo-cel"></i><i class="demo-gracz"></i></div>
    <label>${d.label} <input type="range" value="20" min="0" max="${d.max}"></label>
    ${cel ? '<button class="btn btn-drugi" type="button">Sprawdź próbę</button>' : ''}
    <p role="status"></p></section>`;
  const scena = root.querySelector('.demo-scena'), status = root.querySelector('[role=status]'), suwak = root.querySelector('input');
  const cele = [74, 26, 59, 87, 43];
  let proby = 0, trafienia = 0;
  const pokaz = () => {
    const v = +suwak.value;
    scena.style.setProperty('--gracz', v);
    scena.style.setProperty('--cel', cele[proby % cele.length]);
    status.textContent = d.odczyt(v);
    suwak.setAttribute('aria-valuetext', cel ? `Celownik ${v}, znacznik ${cele[proby % cele.length]}` : d.odczyt(v));
  };
  suwak.addEventListener('input', pokaz);
  root.querySelector('button')?.addEventListener('click', () => {
    const trafienie = Math.abs(+suwak.value - cele[proby % cele.length]) <= 7;
    proby++;
    if (trafienie) trafienia++;
    pokaz();
    status.textContent = `${trafienie ? 'Trafienie' : 'Pudło'} · ${trafienia}/${proby}. Następny znacznik: ${cele[proby % cele.length]}.`;
  });
  pokaz();
}

const pytania = [
  ['Burza jest blisko. Która trasa pomaga?', ['Przejście przez wcześniej wybrane osłony', 'Czekanie na dalszą strefę', 'Bieg za przypadkowym graczem'], 0],
  ['Co zrobić po utracie nadtarczy w Zero Build?', ['Wyjść szerzej na otwartą przestrzeń', 'Odciąć linię widzenia i przygotować nową pozycję', 'Założyć, że nadtarcza zastąpi wszystkie zapasy'], 1],
  ['Jak zgrać rotację duetu?', ['Ruszyć w różnych kierunkach', 'Podać plan dopiero po wejściu do strefy', 'Uzgodnić punkt i sprawdzić gotowość partnera'], 2],
];

function akademia() {
  const root = el('akademia');
  root.innerHTML = `<div class="wiedza-uklad">
    <div class="wiedza-opcje" role="group" aria-label="Lekcje">${LEKCJE.map((l, i) =>
      `<button type="button" data-lekcja="${i}" aria-pressed="false">${l.nazwa}</button>`).join('')}</div>
    <article id="lekcja" class="wiedza-panel"></article></div>
    <section class="wiedza-panel quiz" aria-labelledby="quiz-tytul"><h2 id="quiz-tytul">Sprawdź decyzje</h2>
      <form id="quiz-form">${pytania.map(([p, odp], i) => `<fieldset><legend>${p}</legend>${odp.map((o, k) =>
        `<label><input type="radio" name="quiz-${i}" value="${k}" required> ${o}</label>`).join('')}</fieldset>`).join('')}
      <button class="btn btn-glowny" type="submit">Sprawdź odpowiedzi</button><p role="status" id="quiz-wynik"></p></form>
    </section>`;
  const pokaz = i => {
    const l = LEKCJE[i];
    root.querySelectorAll('[data-lekcja]').forEach(b => b.setAttribute('aria-pressed', String(+b.dataset.lekcja === i)));
    el('lekcja').innerHTML = `<h2>${l.nazwa}</h2><p class="znacznik">Cel lekcji</p><p>${l.cel}</p>
      <ol>${l.kroki.map(k => `<li>${k}</li>`).join('')}</ol>
      <div class="dwa-pola"><p><b>Uważaj na:</b> ${l.blad}</p><p><b>Zadanie:</b> ${l.zadanie}</p></div><div id="lekcja-demo"></div>`;
    pokazDemo(l.demo, el('lekcja-demo'));
  };
  root.addEventListener('click', e => {
    const b = e.target.closest('[data-lekcja]');
    if (b) pokaz(+b.dataset.lekcja);
  });
  el('quiz-form').addEventListener('submit', e => {
    e.preventDefault();
    const odp = new FormData(e.target);
    const bledy = pytania.flatMap(([p, warianty, nr], i) => odp.get(`quiz-${i}`) === String(nr) ? [] : [warianty[nr]]);
    el('quiz-wynik').textContent = `Wynik ${pytania.length - bledy.length}/${pytania.length}. ${bledy.length ? 'Wskazówki: ' + bledy.join(' · ') : 'Wszystkie odpowiedzi poprawne.'}`;
  });
  pokaz(0);
}

function podsumuj(historia) {
  const ranking = new Map();
  for (const seria of historia) {
    const zespol = seria.sposob === 'duet';
    const nazwy = zespol ? [seria.gracze.join(' + ')] : seria.gracze.slice(0, seria.punkty.length);
    nazwy.forEach((nazwa, i) => {
      const klucz = zespol
        ? JSON.stringify(seria.gracze.map(g => g.toLowerCase()).sort())
        : seria.sposob + ':' + nazwa.toLowerCase();
      const rekord = ranking.get(klucz) ?? { nazwa, sposob: seria.sposob, punkty: 0, zaliczenia: 0, legendarna: false, ekstremalna: false, wygrane: 0 };
      rekord.punkty += seria.punkty[i];
      const zaliczone = seria.rundy.filter(r => r.wyniki[i] === 1);
      rekord.zaliczenia += zaliczone.length;
      rekord.legendarna ||= zaliczone.some(r => r.punkty === 25);
      rekord.ekstremalna ||= zaliczone.some(r => r.punkty === 10);
      if (seria.sposob === 'seria' && seria.punkty[i] > seria.punkty[1 - i]) rekord.wygrane++;
      ranking.set(klucz, rekord);
    });
  }
  return [...ranking.values()].sort((a, b) => b.punkty - a.punkty || b.zaliczenia - a.zaliczenia || a.nazwa.localeCompare(b.nazwa, 'pl'));
}

function turnieje(stan) {
  const { historia } = stan;
  const ranking = podsumuj(historia);
  const odznaki = r => [r.zaliczenia && 'Pierwsze zaliczenie', r.zaliczenia >= 5 && 'Pięć zaliczeń',
    r.ekstremalna && 'Ekstremalna próba', r.legendarna && 'Legendarne 25', r.wygrane && 'Wygrany pojedynek'].filter(Boolean);
  const lista = sposob => {
    const wpisy = ranking.filter(r => r.sposob === sposob);
    return wpisy.length ? `<ol class="ranking">${wpisy.map(r => `<li><strong>${esc(r.nazwa)}</strong><b>${r.punkty} pkt</b>
      <small>${r.zaliczenia} zaliczeń</small><div class="odznaki">${odznaki(r).map(o => `<span>${o}</span>`).join('')}</div></li>`).join('')}</ol>`
      : '<p>Pojawi się tu wynik po rozliczeniu serii.</p>';
  };
  el('turnieje').innerHTML = `<div class="ranking-uklad">
    <article class="wiedza-panel"><h2>Ranking pojedynków</h2>${lista('seria')}</article>
    <article class="wiedza-panel"><h2>Ranking duetów</h2>${lista('duet')}</article>
    <article class="wiedza-panel"><h2>Ranking solo</h2>${lista('solo')}</article></div>
    <section class="wiedza-panel historia"><h2>Historia rund</h2>
    ${historia.length ? historia.map(s => `<details><summary><strong>${(s.sposob === 'solo' ? s.gracze.slice(0, 1) : s.gracze).map(esc).join(s.sposob === 'duet' ? ' + ' : ' : ')}</strong>
      <span>${s.punkty.map(esc).join(' : ')} pkt · ${Number.isNaN(Date.parse(s.data)) ? 'Starszy zapis' : data(s.data)}</span></summary>
      <ul>${s.rundy.map(r => `<li>${esc(r.opis?.tytul ?? r.karta)} · ${esc(r.punkty)} pkt${r.wersjaZasad === 0 ? ' (legacy)' : ''}
      · ${Array.isArray(r.wyniki) ? r.wyniki.map(w => w ? 'zaliczona' : 'niezaliczona').join(' / ') : ''}</li>`).join('')}</ul></details>`).join('')
    : '<p>Na tym urządzeniu nie zapisano jeszcze ukończonych rund.</p>'}</section>`;
}

export function pokazSekcje(nazwa, stan, kontekst) {
  if (nazwa === 'turnieje') turnieje(stan);
  if (nazwa === 'zbrojownia') zbrojownia(el('arsenal-root'), kontekst);
  if (nazwa === 'akademia' && !el(nazwa).firstElementChild) akademia();
  if (nazwa === 'aktualnie') {
    el('sezon-widok').querySelector('picture img').loading = 'eager';
    sezon(el('sezon-tresc'));
  }
}
