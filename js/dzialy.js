import { AKTUALNOSCI, EPIC, LEKCJE, UZBROJENIE } from './wiedza-dane.js';
import { esc } from './opinie.js';

const el = id => document.getElementById(id);
const data = iso => new Intl.DateTimeFormat('pl', {dateStyle:'long', timeZone:'UTC'}).format(new Date(iso));

const wykroj = {
  proca: 'M94 106L139 73L180 109L217 61L242 83L187 145L156 145L109 124Z M152 140L165 212L137 222L117 152Z',
  pompa: 'M33 126L115 100L180 100L201 93L322 93L322 109L195 120L172 139L141 141L132 170L105 169L107 138L39 153Z',
  auto: 'M36 120L104 103L145 87L245 95L310 95L310 115L245 120L170 137L151 181L124 178L132 137L39 150Z',
  ar: 'M30 111L105 100L133 84L203 84L220 101L319 101L319 109L209 127L184 127L196 177L172 183L155 130L121 133L111 157L88 156L90 129L30 150Z',
  seria: 'M35 113L105 90L130 105L157 90L206 90L217 101L313 101L313 109L210 125L185 130L185 173L155 173L145 131L99 142L35 151Z',
  smg: 'M46 113L102 95L192 97L214 109L279 105L279 120L187 129L164 177L133 177L142 130L91 130L75 145L44 142Z',
  pistolet: 'M90 98L260 95L265 125L191 129L175 179L137 180L147 129L87 127Z',
  snajperka: 'M31 118L112 101L135 84L206 84L220 104L327 100L327 107L211 127L158 130L146 164L124 164L131 130L35 151Z M148 73L148 55L197 55L197 72Z',
  precyzyjna: 'M30 114L107 90L184 89L211 98L322 101L322 110L188 132L162 131L156 161L129 165L135 130L36 150Z M135 80L135 59L188 59L188 79Z',
  specjalna: 'M57 130L105 85L236 85L295 123L254 156L104 154Z M119 152L144 181L166 181L172 154Z',
  mobilnosc: 'M92 148L116 76L187 66L239 155L207 182L170 157L132 181Z M143 127L165 97L185 127L163 145Z',
  leczenie: 'M111 68L225 68L246 93L245 190L222 207L112 207L87 190L87 93Z M154 99L154 121L129 121L129 146L154 146L154 173L177 173L177 146L205 146L205 121L177 121L177 99Z',
};

function ilustracja(typ) {
  return `<svg class="model-svg" viewBox="0 0 350 248" aria-hidden="true" focusable="false">
    <path d="M30 124H320M175 30V218" class="model-siatka"/>
    <ellipse cx="175" cy="177" rx="133" ry="47" class="model-siata"/>
    <path d="${wykroj[typ.id]}" transform="translate(5 9)" class="model-cien"/>
    <path d="${wykroj[typ.id]}" class="model-front" fill-rule="evenodd"/>
    <path d="M39 65V43H72M278 43H310V65M39 188V211H72M278 211H310V188" class="model-siatka"/>
  </svg>`;
}

function zbrojownia() {
  const root = el('zbrojownia');
  root.innerHTML = `
    <div class="wiedza-uklad">
      <div class="wiedza-opcje" id="sprzet-opcje" role="group" aria-label="Kategorie wyposażenia">
        ${UZBROJENIE.map(t => `<button type="button" data-sprzet="${t.id}" aria-pressed="false">${t.nazwa}</button>`).join('')}
      </div>
      <article class="wiedza-panel" id="sprzet-karta"></article>
    </div>
    <section class="wiedza-panel porownanie" aria-labelledby="porownanie-tytul">
      <h2 id="porownanie-tytul">Porównaj zastosowania</h2>
      <p>Wskaźniki pokazują umowną przydatność w szkoleniu. Nie są statystykami broni ani rankingiem sezonu.</p>
      <div class="porownanie-wybor">${[0, 1].map(i => `<label>Pozycja ${i + 1}
        <select data-porownaj>${UZBROJENIE.map((t, j) => `<option value="${t.id}" ${j === i * 2 ? 'selected' : ''}>${t.nazwa}</option>`).join('')}</select>
      </label>`).join('')}</div>
      <div class="porownanie-wynik" id="porownanie-wynik" aria-live="polite"></div>
    </section>`;
  const wybierz = typ => {
    root.querySelectorAll('[data-sprzet]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.sprzet === typ.id)));
    const karta = el('sprzet-karta');
    karta.innerHTML = `<div class="model-viewport">${ilustracja(typ)}</div>
      <label class="model-obrot">Obrót schematu <input type="range" min="-55" max="55" value="0" id="model-obrot"></label>
      <p class="znacznik">${typ.dystans}</p><h2>${typ.nazwa}</h2>
      <dl class="dwa-pola"><div><dt>Zaleta</dt><dd>${typ.plus}</dd></div><div><dt>Ograniczenie</dt><dd>${typ.minus}</dd></div></dl>
      <h3>Typowy błąd</h3><p>${typ.blad}</p><h3>Ćwiczenie</h3><p>${typ.proba}</p>
      ${typ.id === 'proca' ? `<h3>Gdzie potwierdzono procę</h3>
        <ul><li>Battle Royale · <a href="${EPIC.sezon}">Łowcy Skarbów, 1.11.2026</a>. W <a href="${EPIC.br}">v43.10</a> Epic odnotował również poprawkę odmiany Galaxy.</li>
        <li>Reaktywacja · <a href="${EPIC.reload}">pula v43.00, 1.11.2026</a>. Obecna rotacja wymaga sprawdzenia w grze.</li>
        <li>Blitz Royale · <a href="${EPIC.blitz}">złote zrzuty v43.00, 1.11.2026</a>. Obecna rotacja wymaga sprawdzenia w grze.</li></ul>
        <p class="nota">Weryfikacja źródeł 23.11.2026. Epic opisuje ciężkie pociski. Tempo, obrażenia i zasięg zależą od wersji i odmiany.</p>`
      : typ.id === 'seria' || typ.id === 'pompa' || typ.id === 'leczenie' ? `<p>Przykład z materiałów v43.00: ${{seria:'karabin powtarzalny Bundlebuss',pompa:'strzelba Gilded Dragoon (przykład strzelby jednostrzałowej)',leczenie:'Mandarynka Nami'}[typ.id]}.
          <a href="${EPIC.sezon}">Battle Royale · 1.11.2026</a></p>` : ''}`;
    const model = karta.querySelector('.model-svg');
    el('model-obrot').addEventListener('input', e => model.style.setProperty('--obrot', `${e.target.value}deg`));
  };
  const porownaj = () => {
    const [a, b] = [...root.querySelectorAll('[data-porownaj]')].map(s => UZBROJENIE.find(t => t.id === s.value));
    el('porownanie-wynik').innerHTML = [a, b].map(t => `<article><h3>${t.nazwa}</h3>${['Bliski', 'Średni', 'Daleki'].map((n, i) =>
      `<label>${n} <meter min="0" max="5" value="${t.skala[i]}">${t.skala[i]} z 5</meter></label>`).join('')}<p>${t.plus}</p></article>`).join('');
  };
  root.addEventListener('click', e => {
    const b = e.target.closest('[data-sprzet]');
    if (b) wybierz(UZBROJENIE.find(t => t.id === b.dataset.sprzet));
  });
  root.querySelectorAll('[data-porownaj]').forEach(s => s.addEventListener('change', porownaj));
  wybierz(UZBROJENIE.find(t => t.id === 'proca'));
  porownaj();
}

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

function aktualnie() {
  el('aktualnie').innerHTML = `<div class="aktualnosci-grid">${AKTUALNOSCI.map(n => `<article class="wiedza-panel notatka">
    <p class="znacznik">${n.tryb}</p><time datetime="${n.data}">${data(n.data)}</time>
    <h2>${n.nazwa}</h2><p>${n.opis}</p><a href="${n.zrodlo}">Otwórz notatkę Epic</a></article>`).join('')}</div>
    <p class="nota">Nowszą rotację przedmiotów, różnice pomiędzy kolejkami i aktualny balans sprawdź w wybranym trybie. Porady dotyczące decyzji i planowania znajdziesz w <a href="#akademia">Akademii</a>.</p>`;
}

function podsumuj(historia) {
  const ranking = new Map();
  for (const seria of historia) {
    const zespol = seria.sposob === 'duet';
    const nazwy = zespol ? [seria.gracze.join(' + ')] : seria.gracze;
    nazwy.forEach((nazwa, i) => {
      const klucz = zespol
        ? JSON.stringify(seria.gracze.map(g => g.toLowerCase()).sort())
        : 'solo:' + nazwa.toLowerCase();
      const rekord = ranking.get(klucz) ?? { nazwa, zespol, punkty: 0, zaliczenia: 0, legendarna: false, ekstremalna: false, wygrane: 0 };
      rekord.punkty += seria.punkty[i];
      const zaliczone = seria.rundy.filter(r => r.wyniki[i] === 1);
      rekord.zaliczenia += zaliczone.length;
      rekord.legendarna ||= zaliczone.some(r => r.punkty === 25);
      rekord.ekstremalna ||= zaliczone.some(r => r.punkty === 10);
      if (!zespol && seria.punkty[i] > seria.punkty[1 - i]) rekord.wygrane++;
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
  const lista = duel => {
    const wpisy = ranking.filter(r => r.zespol === duel);
    return wpisy.length ? `<ol class="ranking">${wpisy.map(r => `<li><strong>${esc(r.nazwa)}</strong><b>${r.punkty} pkt</b>
      <small>${r.zaliczenia} zaliczeń</small><div class="odznaki">${odznaki(r).map(o => `<span>${o}</span>`).join('')}</div></li>`).join('')}</ol>`
      : '<p>Pojawi się tu wynik po rozliczeniu serii.</p>';
  };
  el('turnieje').innerHTML = `<div class="ranking-uklad">
    <article class="wiedza-panel"><h2>Ranking pojedynków</h2>${lista(false)}</article>
    <article class="wiedza-panel"><h2>Ranking duetów</h2>${lista(true)}</article></div>
    <section class="wiedza-panel historia"><h2>Historia rund</h2>
    ${historia.length ? historia.map(s => `<details><summary><strong>${s.gracze.map(esc).join(s.sposob === 'duet' ? ' + ' : ' : ')}</strong>
      <span>${s.punkty.map(esc).join(' : ')} pkt · ${Number.isNaN(Date.parse(s.data)) ? 'Starszy zapis' : data(s.data)}</span></summary>
      <ul>${s.rundy.map(r => `<li>${esc(r.opis?.tytul ?? r.karta)} · ${esc(r.punkty)} pkt${r.wersjaZasad === 0 ? ' (legacy)' : ''}
      · ${Array.isArray(r.wyniki) ? r.wyniki.map(w => w ? 'zaliczona' : 'niezaliczona').join(' / ') : ''}</li>`).join('')}</ul></details>`).join('')
    : '<p>Na tym urządzeniu nie zapisano jeszcze ukończonych rund.</p>'}</section>`;
}

export function pokazSekcje(nazwa, stan) {
  if (nazwa === 'turnieje') turnieje(stan);
  if (nazwa === 'zbrojownia' && !el(nazwa).firstElementChild) zbrojownia();
  if (nazwa === 'akademia' && !el(nazwa).firstElementChild) akademia();
  if (nazwa === 'aktualnie' && !el(nazwa).firstElementChild) aktualnie();
}
