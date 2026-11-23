// =========================================================
// KILEK CHALLENGE: interfejs. Stan → widok. Logika jest w seria.js.
// =========================================================
import * as S from './seria.js';
import { TRYBY, TRUDNOSCI, SLOWNIK, misja, dostepna, pula, MIN_KART, trudnosc } from './misje.js';
import { wczytaj, zapisz, wyczysc } from './zapis.js';
import { INSYGNIA, IKONY, ODZNAKA, rewers, awatar } from './grafika.js';
import { aktualizujPortal, przejdzDo, uruchomPortal } from './portal.js';
import * as fx from './fx.js';

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const esc = t => String(t).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

const ekran = $('#ekran');
const hud = $('#hud');
const STOL = ['odkrycie', 'karta', 'mecz'];

const wczytane = wczytaj();
let stan = wczytane.stan;
let trwaly = wczytane.trwaly;
let faza = 'talia';        // tylko w interfejsie: talia | rozdawanie | zakryta | odkrywanie
let pominiecie = false;

// ---------------------------------------------------------
// Zmiana stanu: każda akcja przechodzi tędy.
// ---------------------------------------------------------
function ustaw(nowy, { rysuj = true } = {}) {
  if (nowy === stan) return false; // akcja niedozwolona albo powtórzona (np. podwójne dotknięcie)
  const stary = stan;
  stan = nowy;
  if (trwaly && !zapisz(stan)) { trwaly = false; pokazKomunikat(tekstBrakuZapisu); }
  if (rysuj) render(stary);
  return true;
}

const tekstBrakuZapisu = 'Ta przeglądarka nie pozwala zapisywać. Dokończcie serię w tej karcie, bo odświeżenie strony ją skasuje.';

let tKom;
function pokazKomunikat(t, czas = 5200) {
  const k = $('#komunikat');
  k.textContent = t; k.classList.add('widoczny');
  clearTimeout(tKom); tKom = setTimeout(() => k.classList.remove('widoczny'), czas);
}
const oglos = t => { const o = $('#ogloszenie'); o.textContent = ''; requestAnimationFrame(() => { o.textContent = t; }); };

// ---------------------------------------------------------
// Rysowanie
// ---------------------------------------------------------
function motyw() {
  document.body.dataset.etap = stan.etap;
  document.body.dataset.trud = stan.trudnosc;
  document.body.dataset.faza = STOL.includes(stan.etap) ? faza : '';
}

async function render(stary = null) {
  motyw();
  renderHud();
  aktualizujPortal(stan);
  const zmianaWidoku = !stary || widok(stary) !== widok(stan) ||
    (STOL.includes(stan.etap) && S.runda(stary)?.karta !== S.runda(stan)?.karta);
  if (!zmianaWidoku) { aktualizuj(stary); return; }
  const poprzedni = ekran.firstElementChild;
  const poprzedniaKarta = $('.karta-wrap', ekran);
  const losujPoWymianie = ['wymien', 'uniewaznij'].includes(ostatniaAkcja);
  const wymiana = losujPoWymianie || ostatniaAkcja === 'kolejna-swobodna';
  if (stary && poprzedni && !ekran.closest('[hidden]')) {
    poprzedni.inert = true;
    if (wymiana && poprzedniaKarta) await fx.odrzuc(poprzedniaKarta, ostatniaAkcja === 'wymien' ? -1 : 1);
    else await fx.wyjscie(poprzedni);
    if (!poprzedni.isConnected) return;
  }
  ekran.innerHTML = rysujWidok();
  if (document.body.dataset.dzial !== 'wyzwania') return podlacz();
  scrollTo({ top: 0, behavior: 'instant' });
  podlacz(stary, losujPoWymianie);
  const f = $('[data-fokus]', ekran);
  if (stary && f) f.focus({ preventScroll: true });
}

const widok = s => (STOL.includes(s.etap) ? 'stol' : s.etap);

function rysujWidok() {
  switch (widok(stan)) {
    case 'start': return widokStart();
    case 'stol': return widokStol();
    case 'rozliczenie': return widokRozliczenie();
    case 'brak': return widokBrak();
    case 'final': return widokFinal();
  }
  return '';
}

// Aktualizacje w miejscu (bez przebudowy), żeby animacje miały ciągłość.
function aktualizuj(stary) {
  if (STOL.includes(stan.etap)) { aktualizujStol(); return; }
  if (stan.etap === 'rozliczenie') { aktualizujRozliczenie(stary); return; }
  if (stan.etap === 'final') { aktualizujFinal(); return; }
  if (stan.etap === 'start') aktualizujStart(stary);
}

// ---------------- HUD ----------------
function renderHud() {
  const s = stan;
  hud.hidden = s.etap === 'start' || S.swobodny(s);
  if (hud.hidden) return;
  const p = S.punkty(s);
  const nr = S.numerRundy(s);
  const kropki = [0, 1, 2].map(i => {
    const r = S.rozegrane(s).length;
    const cls = i < r ? 'zrobiona' : (i === nr - 1 && s.etap !== 'final' ? 'biezaca' : '');
    return `<i class="kropka ${cls}"></i>`;
  }).join('');
  hud.innerHTML = `
    <div class="hud-in">
      <div class="hud-runda" role="img" aria-label="Runda ${Math.min(nr, 3)} z 3">${kropki}</div>
      <div class="hud-wynik" role="group" aria-label="Wynik: ${esc(s.gracze[0])} ${p[0]}, ${esc(s.gracze[1])} ${p[1]}">
        <span class="hud-gracz p0">${awatar(s.gracze[0], 0, 'mini')}<span class="hud-nazwa">${esc(s.gracze[0])}</span><b>${p[0]}</b></span>
        <span class="hud-gracz p1"><b>${p[1]}</b><span class="hud-nazwa">${esc(s.gracze[1])}</span>${awatar(s.gracze[1], 1, 'mini')}</span>
      </div>
    </div>`;
}

// ---------------- START ----------------
function widokStart() {
  return `<section class="widok widok-start" data-widok="start">
    <h1 class="gra-tytul" data-fokus tabindex="-1">Wyzwania</h1>
    <div id="konfiguracja" class="konfiguracja">${konfiguracja()}</div>
    <div class="akcje-rzad wybor-zabawy">
      <button class="btn btn-glowny" type="button" data-akcja="rozpocznij-swobodnie">Losuj swobodnie</button>
      <button class="btn btn-drugi" type="button" data-akcja="rozpocznij">Rozpocznij serię</button>
    </div>
    <p class="nota-zapisu" id="notaZapisu">${notaZapisu()}</p>
  </section>`;
}

function notaZapisu() {
  return trwaly ? 'Wyniki zapisują się tylko w tej przeglądarce. Nic nie jest wysyłane.' : esc(tekstBrakuZapisu);
}

function konfiguracja() {
  const s = stan;
  const t = trudnosc(s.trudnosc);
  const idx = TRUDNOSCI.findIndex(x => x.id === s.trudnosc);
  return `
    <div class="gracze">
      ${[0, 1].map(i => `
        <div class="plakietka p${i}">
          <button class="awatar-btn" type="button" data-akcja="awatar" data-g="${i}" aria-label="Awatar gracza ${i + 1}">${awatar(s.gracze[i], i)}</button>
          <label class="plakietka-pole">
            <input id="g${i}" class="pseudonim" value="${esc(s.gracze[i])}" maxlength="16" autocomplete="off" spellcheck="false" enterkeyhint="done" aria-label="Pseudonim gracza ${i + 1}">
          </label>
          ${IKONY.olowek}
        </div>`).join('<div class="vs" aria-hidden="true">VS</div>')}
    </div>
    <fieldset class="wybor-trybu">
      <legend>Tryb meczu</legend>
      <div class="tryby">
      ${Object.values(TRYBY).map(tr => `
        <label class="tryb dotyk">
          <input type="radio" name="tryb" value="${tr.id}" ${s.tryb === tr.id ? 'checked' : ''}>
          <span class="tryb-in">${IKONY[tr.id]}<span class="tryb-nazwa">${tr.nazwa}</span><span class="tryb-opis">${tr.opis}</span></span>
        </label>`).join('')}
      </div>
    </fieldset>
    <fieldset class="wybor-trudnosci" style="--i:${idx}">
      <legend>Trudność</legend>
      <div class="trudnosci">
        <span class="wskaznik" aria-hidden="true"></span>
        ${TRUDNOSCI.map(d => {
          const ok = dostepna(s.tryb, d.id);
          return `<label class="trud dotyk t-${d.id}" data-t="${d.id}">
            <input type="radio" name="trud" value="${d.id}" ${s.trudnosc === d.id ? 'checked' : ''} ${ok ? '' : 'disabled'}>
            <span class="trud-in">${INSYGNIA[d.id]}<span class="trud-nazwa">${d.nazwa}</span></span>
          </label>`;
        }).join('')}
      </div>
      <div class="trud-opis" id="trudOpis" aria-live="polite">${opisTrudnosci(t)}</div>
    </fieldset>
    <p class="zasada-proby">Każdy gra swój mecz w tym samym trybie. Najlepiej Solo.</p>`;
}

function opisTrudnosci(t) {
  const n = pula(stan.tryb, t.id).length;
  if (!dostepna(stan.tryb, t.id)) return `<b>${t.kod}</b> Ta trudność ma w tym trybie za mało kart (${n} z ${MIN_KART}). Wybierz inną.`;
  return `<span class="kod">${t.kod}</span><span>${t.opis}</span>`;
}

function aktualizujStart(stary) {
  // po zmianie trybu dostępność trudności mogła się zmienić
  const fs = $('.wybor-trudnosci');
  if (!fs) return;
  const idx = TRUDNOSCI.findIndex(x => x.id === stan.trudnosc);
  fs.style.setProperty('--i', idx);
  $$('input[name="trud"]').forEach(i => { i.checked = i.value === stan.trudnosc; i.disabled = !dostepna(stan.tryb, i.value); });
  $$('input[name="tryb"]').forEach(i => { i.checked = i.value === stan.tryb; });
  $('#trudOpis').innerHTML = opisTrudnosci(trudnosc(stan.trudnosc));
  if (stary && stary.trudnosc !== stan.trudnosc) {
    fx.przebarwMape();
    const ins = $(`.t-${stan.trudnosc} .ins`);
    fx.podskok(ins);
  }
}

// ---------------- STÓŁ: losowanie, karta, mecz ----------------
function kartaHTML(m, trud) {
  const t = trudnosc(trud);
  const dop = m.doprecyzowanie.map(k => `<li>${esc(SLOWNIK[k])}</li>`).join('');
  return `<article class="karta t-${trud}" aria-labelledby="kartaTytul">
    <div class="pasy" aria-hidden="true"></div>
    <span class="naroznik n1" aria-hidden="true"></span><span class="naroznik n2" aria-hidden="true"></span>
    <span class="naroznik n3" aria-hidden="true"></span><span class="naroznik n4" aria-hidden="true"></span>
    <header class="karta-gora">
      <span class="karta-trud">${INSYGNIA[trud]}<span>${t.nazwa}</span></span>
      <span class="karta-meta"><span>Misja ${m.id}</span><span>${TRYBY[stan.tryb].nazwa}</span></span>
    </header>
    <div class="karta-tresc">
      <h2 class="karta-tytul" id="kartaTytul">${esc(m.tytul)}</h2>
      <p class="karta-cel">${esc(m.cel)}</p>
      <dl class="karta-zasady">
        <div><dt>Od kiedy</dt><dd>${esc(m.odKiedy)}</dd></div>
        <div class="zal"><dt>Zaliczasz, gdy</dt><dd>${esc(m.zaliczenie)}</dd></div>
      </dl>
      ${dop ? `<details class="karta-dop"><summary>Co dokładnie się liczy</summary><ul>${dop}</ul></details>` : ''}
      <p class="karta-wsk"><span>Wskazówka</span> ${esc(m.wskazowka)}</p>
    </div>
  </article>`;
}

function widokStol() {
  const r = S.runda(stan);
  const m = misja(r.karta);
  if (stan.etap !== 'odkrycie') faza = 'odkryta';
  else if (faza === 'odkryta' || faza === 'odkrywanie') faza = 'talia';
  motyw();
  const nr = S.numerRundy(stan);
  return `<section class="widok widok-stol">
    <div class="stol-naglowek">
      <h2 class="runda-tytul" data-fokus tabindex="-1">${S.swobodny(stan) ? 'Swobodne losowanie' : `Runda <b>${nr}</b><span> z 3</span>`}</h2>
      <p class="stol-status" id="stolStatus">${statusStolu()}</p>
    </div>
    <div class="rama" data-faza="${faza}">
      <span class="rama-n r1"></span><span class="rama-n r2"></span><span class="rama-n r3"></span><span class="rama-n r4"></span>
      <div class="karta-wrap" id="kartaWrap">
        ${kartaHTML(m, stan.trudnosc)}
        <button class="rewers dotyk t-${stan.trudnosc}" type="button" data-akcja="odkryj" aria-label="Odkryj kartę">${rewers(stan.trudnosc)}</button>
        <div class="blysk" aria-hidden="true"></div><div class="fala" aria-hidden="true"></div>
      </div>
      <button class="talia dotyk" type="button" data-akcja="losuj" aria-label="Losuj kartę z talii">
        ${[0, 1, 2, 3].map(i => `<span class="talia-rewers t-${stan.trudnosc}" style="transform:translate(${i * 3 - 4}px,${-i * 4}px) rotate(${(i - 1.5) * 2.5}deg)">${rewers(stan.trudnosc)}</span>`).join('')}
      </button>
    </div>
    <div class="plomien" aria-hidden="true"></div>
    <div class="stol-panel">
      <div class="akcje" id="akcje">${akcjeStolu()}</div>
      <div id="stol-ustawienia">${ustawieniaStolu()}</div>
    </div>
  </section>`;
}

function statusStolu() {
  if (stan.etap === 'mecz') return 'Mecz trwa. Karta zostaje tutaj, wróćcie do niej w każdej chwili.';
  if (stan.etap === 'karta') return S.swobodny(stan) ? 'Możesz zagrać tę kartę albo wylosować następną.' : 'Ta sama karta obowiązuje obu graczy.';
  if (faza === 'zakryta') return 'Karta czeka w ramce. Odkryjcie ją razem.';
  if (faza === 'rozdawanie') return 'Losuję…';
  return 'Karta jest już wylosowana i zapisana. Dotknijcie talii.';
}

function akcjeStolu() {
  const s = stan;
  if (s.etap === 'odkrycie') {
    if (faza === 'zakryta') return `<button class="btn btn-glowny" type="button" data-akcja="odkryj">Odkryj kartę</button>`;
    if (faza === 'rozdawanie' || faza === 'odkrywanie') return `<button class="btn btn-cichy" type="button" data-akcja="pomin">Odkryj od razu</button>`;
    return `<button class="btn btn-glowny" type="button" data-akcja="losuj">Losuj kartę</button>
      <button class="btn btn-cichy" type="button" data-akcja="pomin">Odkryj od razu</button>`;
  }
  if (S.swobodny(s)) return s.etap === 'mecz'
    ? '<button class="btn btn-glowny" type="button" data-akcja="kolejna-swobodna">Następna karta</button>'
    : `<button class="btn btn-glowny" type="button" data-akcja="graj">Zaczynamy mecz</button>
       <button class="btn btn-drugi" type="button" data-akcja="wymien">${IKONY.wymiana}Losuj nową kartę</button>`;
  const wymiana = S.mozeWymienic(s);
  const tekstWym = s.seria.wymiana ? 'Wymiana zużyta' : (wymiana ? 'Wymień kartę' : 'Brak kart do wymiany');
  if (s.etap === 'karta') return `
    <button class="btn btn-glowny" type="button" data-akcja="graj">Zaczynamy mecz</button>
    <div class="akcje-rzad">
      <button class="btn btn-drugi" type="button" data-akcja="wymien" ${wymiana ? '' : 'disabled'}>${IKONY.wymiana}<span>${tekstWym}</span>${wymiana ? '<span class="zeton" aria-label="zostało: 1">1</span>' : ''}</button>
      <button class="btn btn-drugi" type="button" data-akcja="uniewaznij">${IKONY.uniewaznij}<span>Karta niewykonalna</span></button>
    </div>
    <p class="akcje-nota">Wymiana: jedna wspólna na całą serię. Niewykonalną kartę unieważniacie bez punktu i bez zużycia wymiany.</p>`;
  return `
    <button class="btn btn-glowny" type="button" data-akcja="rozlicz">Mecz skończony, wpisz wyniki</button>
    <div class="akcje-rzad">
      <button class="btn btn-drugi" type="button" data-akcja="uniewaznij">${IKONY.uniewaznij}<span>Karta niewykonalna</span></button>
    </div>`;
}

function wyborTrudnosciRundy() {
  const dostepne = new Set(S.dostepneTrudnosci(stan).map(t => t.id));
  return `<label class="stol-trudnosc">Trudność przed losowaniem
    <select name="trud-rundy">
      ${TRUDNOSCI.map(t => `<option value="${t.id}" ${t.id === stan.trudnosc ? 'selected' : ''} ${dostepne.has(t.id) ? '' : 'disabled'}>${t.nazwa}</option>`).join('')}
    </select></label>`;
}

function ustawieniaStolu() {
  const wLosowaniu = faza === 'rozdawanie' || faza === 'odkrywanie';
  return `${stan.etap !== 'mecz' && !wLosowaniu ? wyborTrudnosciRundy() : ''}
    ${S.swobodny(stan) ? '' : '<button class="btn btn-cichy" type="button" data-akcja="zakoncz">Zakończ serię i zobacz wynik</button>'}
    <button class="btn btn-cichy" type="button" data-akcja="konfiguracja">Wróć do ustawień</button>`;
}

function aktualizujStol() {
  motyw();
  const rama = $('.rama');
  if (!rama) return;
  rama.dataset.faza = faza;
  $('#akcje').innerHTML = akcjeStolu();
  $('#stol-ustawienia').innerHTML = ustawieniaStolu();
  $('#stolStatus').textContent = statusStolu();
  const odkryta = faza === 'odkryta';
  const k = $('.karta');
  k.inert = !odkryta;
  if (odkryta) k.removeAttribute('aria-hidden'); else k.setAttribute('aria-hidden', 'true');
  const rew = $('.rewers');
  rew.hidden = odkryta;
  rew.tabIndex = faza === 'zakryta' ? 0 : -1;
  $('.talia').hidden = !(faza === 'talia' || faza === 'rozdawanie');
}

// ---------------- ROZLICZENIE ----------------
function widokRozliczenie() {
  const r = S.runda(stan);
  const m = misja(r.karta);
  const nr = S.numerRundy(stan);
  const ost = nr >= S.RUNDY;
  return `<section class="widok widok-rozliczenie">
    <h2 class="sekcja-tytul" data-fokus tabindex="-1">Wyniki rundy ${nr}</h2>
    <div class="mini-karta t-${stan.trudnosc}">
      ${INSYGNIA[stan.trudnosc]}
      <div><p class="mini-tytul">${esc(m.tytul)}</p><p class="mini-zal"><b>Zaliczasz, gdy:</b> ${esc(m.zaliczenie)}</p></div>
    </div>
    <p class="uczciwie">Każdy zaznacza swój wynik. Strona nie sprawdza gry, liczy się uczciwość.</p>
    <div class="panele">${[0, 1].map(panelGracza).join('')}</div>
    <div class="akcje">
      <button class="btn btn-glowny" type="button" data-akcja="zatwierdz" ${S.gotowe(stan) ? '' : 'disabled'}>${ost ? 'Zatwierdź i zobacz finał' : `Zatwierdź rundę ${nr}`}</button>
      <button class="btn btn-cichy" type="button" data-akcja="wroc">${IKONY.wstecz}<span>Wróć do karty</span></button>
    </div>
  </section>`;
}

function panelGracza(i) {
  const w = S.runda(stan).wyniki[i];
  const n = esc(stan.gracze[i]);
  return `<div class="panel-gracza p${i}" data-wynik="${w ?? ''}">
    <div class="panel-glowa">${awatar(stan.gracze[i], i)}<span class="panel-nazwa">${n}</span></div>
    <div class="wybor" role="group" aria-label="Wynik gracza ${n}">
      <button class="opcja tak" type="button" data-akcja="wynik" data-g="${i}" data-w="1" aria-pressed="${w === 1}">${IKONY.zalicz}<span>Zaliczone</span></button>
      <button class="opcja nie" type="button" data-akcja="wynik" data-g="${i}" data-w="0" aria-pressed="${w === 0}">${IKONY.nie}<span>Nie tym razem</span></button>
    </div>
    <p class="etykieta-wyniku">${w === 1 ? '+1 punkt' : w === 0 ? '0 punktów, następnym razem' : 'Wybierz wynik'}</p>
    <div class="stempel" aria-hidden="true">Zaliczone</div>
  </div>`;
}

function aktualizujRozliczenie(stary) {
  const r = S.runda(stan), rs = S.runda(stary);
  [0, 1].forEach(i => {
    const p = $(`.panel-gracza.p${i}`);
    const w = r.wyniki[i];
    p.dataset.wynik = w ?? '';
    $$('.opcja', p).forEach(b => b.setAttribute('aria-pressed', String(+b.dataset.w === w)));
    $('.etykieta-wyniku', p).textContent = w === 1 ? '+1 punkt' : w === 0 ? '0 punktów, następnym razem' : 'Wybierz wynik';
    if (rs && rs.wyniki[i] !== w && w === 1) { fx.stempel($('.stempel', p)); fx.podskok($('.panel-glowa .awatar', p)); }
  });
  $('[data-akcja="zatwierdz"]').disabled = !S.gotowe(stan);
}

// ---------------- BRAK KART ----------------
function widokBrak() {
  const rozegr = S.rozegrane(stan).length;
  return `<section class="widok widok-brak">
    <h2 class="sekcja-tytul" data-fokus tabindex="-1">Brak kolejnej karty</h2>
    <p>W tej konfiguracji nie została żadna nowa karta. Wszystkie pasujące karty były już w tej serii pokazane, wymienione albo unieważnione.</p>
    <p>${rozegr ? `Rozegraliście ${rozegr} ${rozegr === 1 ? 'rundę' : 'rundy'}. Wyniki zostają.` : 'Nie ma jeszcze rozegranych rund.'}</p>
    <div class="akcje">
      ${wyborTrudnosciRundy()}
      <button class="btn btn-glowny" type="button" data-akcja="zakoncz">Zakończ serię i zobacz wynik</button>
      <button class="btn btn-cichy" type="button" data-akcja="konfiguracja">Wróć do ustawień</button>
    </div>
  </section>`;
}

// ---------------- FINAŁ ----------------
function tytulFinalu() {
  const z = S.zwyciezca(stan);
  if (!S.rozegrane(stan).length) return 'Seria bez wyniku';
  return z === null ? 'Remis!' : `Wygrywa ${esc(stan.gracze[z])}!`;
}

function widokFinal() {
  const p = S.punkty(stan);
  const z = S.zwyciezca(stan);
  const rundy = S.rozegrane(stan);
  const wynik = z === null ? 'remis' : String(z);
  return `<section class="widok widok-final" data-wynik="${wynik}">
    <h2 class="final-tytul" data-fokus tabindex="-1" id="finalTytul">${tytulFinalu()}</h2>
    <div class="podium">
      <div class="reflektor" aria-hidden="true"></div>
      ${[0, 1].map(i => `
        <div class="kolumna p${i} ${z === i || (z === null && rundy.length) ? 'na-szczycie' : ''}">
          <div class="promienie" aria-hidden="true"></div>
          <div class="odznaka-miejsce" aria-hidden="true">${ODZNAKA}</div>
          ${awatar(stan.gracze[i], i, 'duzy')}
          <p class="kolumna-nazwa">${esc(stan.gracze[i])}</p>
          <p class="kolumna-pkt"><span class="beben" aria-hidden="true"><span class="beben-tasma">${'0123'.split('').map(d => `<span>${d}</span>`).join('')}</span></span><span class="sr">${p[i]} pkt</span><span class="pkt-j" aria-hidden="true">pkt</span></p>
        </div>`).join('<div class="final-vs" aria-hidden="true">:</div>')}
    </div>
    ${rundy.length ? `<table class="tabela-rund">
      <caption>Rundy. Dotknij wyniku, żeby go poprawić.</caption>
      <thead><tr><th scope="col">Misja</th>${[0, 1].map(i => `<th scope="col">${esc(stan.gracze[i])}</th>`).join('')}</tr></thead>
      <tbody>${rundy.map((r, n) => `<tr class="wiersz">
        <th scope="row"><span class="nr">${n + 1}</span>${esc(misja(r.karta).tytul)}<small>${trudnosc(misja(r.karta).trudnosc).nazwa}</small></th>
        ${[0, 1].map(i => komorka(r, n, i)).join('')}
      </tr>`).join('')}</tbody>
    </table>` : ''}
    ${stan.seria.koniec === 'wczesniej' ? `<p class="nota">Seria zakończona wcześniej: ${rundy.length} z 3 rund.</p>` : ''}
    <div class="akcje">
      <button class="btn btn-glowny btn-rewanz" type="button" data-akcja="rewanz">Rewanż</button>
      <button class="btn btn-cichy" type="button" data-akcja="konfiguracja">Zmień graczy albo trudność</button>
    </div>
  </section>`;
}

function komorka(r, n, i) {
  const w = r.wyniki[i];
  const nazwa = esc(stan.gracze[i]);
  return `<td><button class="komorka ${w ? 'tak' : 'nie'}" type="button" data-akcja="popraw" data-r="${n}" data-g="${i}"
    aria-label="Runda ${n + 1}, ${nazwa}: ${w ? 'zaliczone' : 'niezaliczone'}. Zmień">${w ? IKONY.zalicz : IKONY.nie}</button></td>`;
}

function aktualizujFinal() {
  const sek = $('.widok-final');
  const p = S.punkty(stan), z = S.zwyciezca(stan), rundy = S.rozegrane(stan);
  sek.dataset.wynik = z === null ? 'remis' : String(z);
  $('#finalTytul').innerHTML = tytulFinalu();
  [0, 1].forEach(i => {
    const k = $(`.kolumna.p${i}`);
    k.classList.toggle('na-szczycie', z === i || (z === null && rundy.length > 0));
    $('.beben-tasma', k).style.transform = `translateY(${-p[i]}em)`;
    $('.sr', k).textContent = `${p[i]} pkt`;
  });
  $$('.wiersz', sek).forEach((tr, n) => { $$('td', tr).forEach((td, i) => { td.innerHTML = komorka(rundy[n], n, i); }); });
  oglos(`${tytulFinalu()} ${stan.gracze[0]} ${p[0]}, ${stan.gracze[1]} ${p[1]}.`);
}

// ---------------------------------------------------------
// Po narysowaniu: animacje wejścia i sekwencje
// ---------------------------------------------------------
function podlacz(stary, losujPoWymianie) {
  const w = widok(stan);
  if (w === 'start') {
    if (stary) fx.wejscie($$('.widok-start > *'), 35);
    return;
  }
  if (w === 'stol') {
    aktualizujStol();
    if (!stary) return;
    if (stan.etap === 'odkrycie' && losujPoWymianie) { losuj(); return; }
    fx.wejscie([$('.stol-naglowek'), $('.rama'), $('#akcje')], 50);
    return;
  }
  if (w === 'final') {
    const p = S.punkty(stan), z = S.zwyciezca(stan);
    fx.finalWejscie($$('.kolumna'), $$('.wiersz'), $('#finalTytul'));
    $$('.kolumna').forEach((k, i) => fx.beben($('.beben', k), p[i], 260));
    if (stary && S.rozegrane(stan).length) {
      const kol = z === null ? ['#ff7a45', '#36d0ff', '#ffcf3a', '#eef1e6'] : [z ? '#36d0ff' : '#ff7a45', '#ffcf3a', '#eef1e6'];
      const zr = z === null ? [[.25, .42], [.75, .42]] : [[z ? .72 : .28, .4]];
      setTimeout(() => {
        if (stan.etap === 'final' && document.body.dataset.dzial === 'wyzwania') fx.konfetti(kol, zr);
      }, fx.reduced ? 0 : 420);
    }
    oglos(`${tytulFinalu()} ${stan.gracze[0]} ${p[0]} punktów, ${stan.gracze[1]} ${p[1]} punktów.`);
    return;
  }
  fx.wejscie($$(`.widok > *`, ekran), 40);
}

// ---------------------------------------------------------
// Sekwencja losowania i odkrycia
// ---------------------------------------------------------
async function losuj() {
  if (stan.etap !== 'odkrycie' || faza !== 'talia') return;
  if (fx.reduced) { odkryjTeraz(); return; }
  faza = 'rozdawanie'; pominiecie = false; aktualizujStol();
  const wrap = $('#kartaWrap');
  await fx.rozdaj($('.talia'), wrap);
  if (stan.etap !== 'odkrycie' || faza !== 'rozdawanie') return;
  faza = 'zakryta'; aktualizujStol();
  if (pominiecie) { odkryjTeraz(); return; }
  $('.rewers')?.focus({ preventScroll: true });
}

async function odkryjTeraz() {
  if (stan.etap !== 'odkrycie' || faza === 'odkrywanie') return;
  faza = 'odkrywanie'; aktualizujStol();
  // stan zapisujemy od razu; animacja jest tylko dekoracją
  const nowy = S.odkryj(stan);
  stan = nowy; if (trwaly && !zapisz(stan)) { trwaly = false; pokazKomunikat(tekstBrakuZapisu); }
  const karta = $('#kartaWrap');
  const anim = fx.odkryj(karta, stan.trudnosc);
  faza = 'odkryta';
  await anim;
  if (stan !== nowy) return;
  motyw(); renderHud(); aktualizujStol(); aktualizujPortal(stan);
  const m = misja(S.runda(stan).karta);
  oglos(`Misja ${m.tytul}. ${m.cel} Od kiedy: ${m.odKiedy} Zaliczasz, gdy: ${m.zaliczenie}`);
  $('#kartaTytul')?.setAttribute('tabindex', '-1');
  $('#kartaTytul')?.focus({ preventScroll: true });
}

function pomin() {
  pominiecie = true;
  if (faza === 'rozdawanie') { fx.dokoncz(); return; }
  if (faza === 'talia' || faza === 'zakryta') odkryjTeraz();
}

// ---------------------------------------------------------
// Zdarzenia
// ---------------------------------------------------------
let ostatniaAkcja = null;
const potwierdzenia = new WeakMap();

function potwierdz(btn, tekst) {
  if (potwierdzenia.get(btn)) return true;
  const stary = btn.innerHTML;
  btn.classList.add('potwierdz');
  btn.innerHTML = `${IKONY.uniewaznij}<span>${tekst}</span>`;
  potwierdzenia.set(btn, true);
  setTimeout(() => { if (btn.isConnected) { btn.innerHTML = stary; btn.classList.remove('potwierdz'); potwierdzenia.delete(btn); } }, 3500);
  return false;
}

function potwierdzZakonczenie(akcja) {
  const d = $('#potwierdz-serie');
  const ustawienia = akcja === 'konfiguracja';
  $('#potwierdz-tytul').textContent = ustawienia ? 'Wrócić do ustawień?' : 'Zakończyć serię?';
  $('p', d).textContent = ustawienia
    ? 'Po powrocie do ustawień bieżąca karta i wynik tej gry zostaną wyczyszczone.'
    : 'Podsumowanie zachowa ukończone rundy. Bieżąca runda zostanie zamknięta.';
  $('button[value="reset"]', d).textContent = ustawienia ? 'Wróć do ustawień' : 'Zakończ serię';
  d.returnValue = '';
  d.addEventListener('close', () => {
    if (d.returnValue !== 'reset') return;
    faza = 'talia';
    ustaw(ustawienia ? S.doKonfiguracji(stan) : S.zakonczWczesniej(stan));
  }, { once: true });
  d.showModal();
}

document.addEventListener('click', e => {
  const b = e.target.closest('[data-akcja]');
  if (!b || b.disabled || b.closest('[inert]')) return;
  const a = b.dataset.akcja;
  ostatniaAkcja = a;
  switch (a) {
    case 'rozpocznij': faza = 'talia'; ustaw(S.rozpocznij(stan, 'seria')); break;
    case 'rozpocznij-swobodnie':
    case 'graj-od-razu': {
      faza = 'talia';
      if (ustaw(S.rozpocznij(stan, 'swobodny')) && a === 'graj-od-razu') przejdzDo('wyzwania');
      break;
    }
    case 'rewanz': faza = 'talia'; ustaw(S.rewanz(stan)); break;
    case 'losuj': losuj(); break;
    case 'odkryj': if (faza === 'zakryta' || faza === 'talia') odkryjTeraz(); break;
    case 'pomin': pomin(); break;
    case 'graj': ustaw(S.graj(stan)); break;
    case 'rozlicz': ustaw(S.doRozliczenia(stan)); break;
    case 'wroc': faza = 'odkryta'; ustaw(S.wrocDoKarty(stan)); break;
    case 'wymien': {
      const n = S.wymien(stan);
      if (n === stan) break;
      faza = 'talia'; ustaw(n);
      if (!S.swobodny(stan)) pokazKomunikat('Karta wymieniona. Wymiana na tę serię jest zużyta.', 3200);
      break;
    }
    case 'kolejna-swobodna': {
      faza = 'talia'; ustaw(S.kolejnaSwobodna(stan));
      break;
    }
    case 'uniewaznij': {
      if (!potwierdz(b, 'Na pewno? Dotknij jeszcze raz')) break;
      const n = S.uniewaznij(stan);
      if (n === stan) break;
      faza = 'talia'; ustaw(n);
      if (n.etap !== 'brak') pokazKomunikat('Karta unieważniona bez punktu i bez zużycia wymiany.', 3200);
      break;
    }
    case 'wynik': ustaw(S.ustawWynik(stan, +b.dataset.g, +b.dataset.w)); break;
    case 'zatwierdz': faza = 'talia'; ustaw(S.zatwierdz(stan)); break;
    case 'popraw': {
      const r = S.rozegrane(stan)[+b.dataset.r];
      if (!r) break;
      const g = +b.dataset.g;
      if (ustaw(S.ustawWynik(stan, g, r.wyniki[g] ? 0 : 1, +b.dataset.r))) {
        $(`[data-akcja="popraw"][data-r="${b.dataset.r}"][data-g="${g}"]`)?.focus();
      }
      break;
    }
    case 'zakoncz': {
      if (stan.etap === 'brak') ustaw(S.zakonczWczesniej(stan));
      else potwierdzZakonczenie(a);
      break;
    }
    case 'konfiguracja': potwierdzZakonczenie(a); break;
    case 'awatar': {
      const av = b.querySelector('.awatar');
      av.classList.remove('blysk-teraz'); void av.getBoundingClientRect(); av.classList.add('blysk-teraz');
      fx.podskok(av);
      break;
    }
    case 'info': otworzInfo(); break;
  }
});

document.addEventListener('change', e => {
  const t = e.target;
  if (t.name === 'tryb') ustaw(S.ustawTryb(stan, t.value));
  if (t.name === 'trud') ustaw(S.ustawTrudnosc(stan, t.value));
  if (t.name === 'trud-rundy') {
    const nowy = S.zmienTrudnosc(stan, t.value);
    if (nowy === stan) return;
    ostatniaAkcja = null;
    faza = 'talia';
    ustaw(nowy);
    oglos(`Trudność następnej karty: ${trudnosc(nowy.trudnosc).nazwa}.`);
  }
});

let tAv;
document.addEventListener('input', e => {
  const t = e.target;
  if (!t.classList.contains('pseudonim')) return;
  const i = +t.id.slice(1);
  ustaw(S.ustawGracza(stan, i, t.value), { rysuj: false });
  clearTimeout(tAv);
  tAv = setTimeout(() => {
    const btn = $(`.awatar-btn[data-g="${i}"]`);
    if (btn) { btn.innerHTML = awatar(stan.gracze[i], i); fx.podskok(btn.firstElementChild); }
  }, 260);
});
document.addEventListener('focusout', e => {
  const t = e.target;
  if (t.classList?.contains('pseudonim') && !t.value.trim()) { t.value = S.nazwaGracza(stan, +t.id.slice(1)); ustaw(S.ustawGracza(stan, +t.id.slice(1), t.value), { rysuj: false }); }
});
document.addEventListener('keydown', e => {
  if (e.key === 'Enter' && e.target.classList?.contains('pseudonim')) e.target.blur();
});

// ---------------------------------------------------------
// Arkusz informacji: zasady, zapis, reset
// ---------------------------------------------------------
function otworzInfo() {
  const d = $('#info');
  d.innerHTML = `
    <div class="arkusz-in">
      <div class="arkusz-gora">
        <h2 id="infoTytul">Zasady i zapis</h2>
        <button class="btn-ikona" type="button" data-zamknij aria-label="Zamknij">${IKONY.zamknij}</button>
      </div>
      <div class="zakladki" role="tablist" aria-label="Sekcje">
        <span class="zakladki-wsk" aria-hidden="true"></span>
        <button role="tab" id="zk1" aria-controls="zp1" aria-selected="true" type="button">Jak grać</button>
        <button role="tab" id="zk2" aria-controls="zp2" aria-selected="false" tabindex="-1" type="button">Zapis i prywatność</button>
      </div>
      <div class="zakladka-panel" role="tabpanel" id="zp1" aria-labelledby="zk1" tabindex="0">
        <ol class="kroki">
          <li>Wpiszcie pseudonimy. Wybierzcie tryb i trudność.</li>
          <li>Losujcie kartę. Jedna karta obowiązuje obu graczy.</li>
          <li>Każdy gra swój mecz w tym samym trybie. Najlepiej Solo.</li>
          <li>Po meczu każdy zaznacza swój wynik. Zaliczenie to 1 punkt, brak to 0.</li>
          <li>Po trzech rundach jest finał i rewanż.</li>
        </ol>
        <p><b>Wymiana.</b> Jedna wspólna na serię, przed rozpoczęciem rundy. Wymieniona karta nie wraca w tej serii.</p>
        <p><b>Swobodne losowanie.</b> Zmieniaj trudność i losuj kolejne karty bez limitu. Ten tryb jest bez punktów.</p>
        <p><b>Trudność w serii.</b> Można ją zmienić przed meczem. Każde zaliczenie nadal daje 1 punkt.</p>
        <p><b>Karta niewykonalna.</b> Unieważniacie ją bez punktu i bez zużycia wymiany. Dostajecie nową kartę.</p>
        <h3>Co dokładnie się liczy</h3>
        <ul class="slownik">${Object.values(SLOWNIK).map(t => `<li>${esc(t)}</li>`).join('')}</ul>
      </div>
      <div class="zakladka-panel" role="tabpanel" id="zp2" aria-labelledby="zk2" tabindex="0" hidden>
        <p>Wyniki zatwierdzacie sami. Strona nie łączy się z grą i niczego nie sprawdza.</p>
        <p>Seria, wyniki i ustawienia zapisują się tylko w tej przeglądarce na tym urządzeniu. Nic nie jest wysyłane: nie ma kont, reklam ani analityki.</p>
        <p class="stan-zapisu">${trwaly ? 'Zapis działa.' : esc(tekstBrakuZapisu)}</p>
        <button class="btn btn-drugi" type="button" data-reset>Usuń dane KILEK CHALLENGE</button>
        <p class="nota">Usuwa tylko tę grę. Postęp z innych stron KILEKCRAFT zostaje.</p>
      </div>
    </div>`;
  d.showModal();
  const tabs = $$('[role=tab]', d);
  const wybierz = (i, fokus = true) => {
    tabs.forEach((t, j) => { t.setAttribute('aria-selected', j === i); t.tabIndex = j === i ? 0 : -1; $('#' + t.getAttribute('aria-controls')).hidden = j !== i; });
    $('.zakladki', d).style.setProperty('--z', i);
    if (fokus) tabs[i].focus();
  };
  tabs.forEach((t, i) => {
    t.addEventListener('click', () => wybierz(i));
    t.addEventListener('keydown', e => {
      if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') { e.preventDefault(); wybierz((i + 1) % 2); }
    });
  });
  $('[data-zamknij]', d).addEventListener('click', () => d.close());
  d.addEventListener('click', e => { if (e.target === d) d.close(); }, { once: true });
  const reset = $('[data-reset]', d);
  reset.addEventListener('click', () => {
    if (!reset.dataset.pewne) { reset.dataset.pewne = '1'; reset.textContent = 'Na pewno? Dotknij jeszcze raz'; reset.classList.add('potwierdz'); return; }
    if (!wyczysc()) {
      pokazKomunikat('Nie udało się usunąć danych w tej przeglądarce.');
      return;
    }
    const poResecie = wczytaj();
    stan = poResecie.stan;
    trwaly = poResecie.trwaly;
    faza = 'talia';
    d.close();
    ekran.innerHTML = ''; render(null);
    pokazKomunikat('Dane KILEK CHALLENGE usunięte.');
  });
}

// ---------------------------------------------------------
// Start
// ---------------------------------------------------------
fx.reakcjaDotyku(document);
fx.paralaksa();
document.addEventListener('visibilitychange', () => document.documentElement.classList.toggle('ukryta', document.hidden));

uruchomPortal();
render();
fx.uruchomScene($('.portal-scena'));
if (wczytane.uwaga === 'uszkodzony') pokazKomunikat('Zapis był uszkodzony. Zaczynacie od nowa.');
if (wczytane.uwaga === 'starszy') pokazKomunikat('Wczytano zapis ze starszej wersji.');
if (wczytane.uwaga === 'nowszy') pokazKomunikat('Zapis pochodzi z nowszej wersji strony. Nie nadpisujemy go, ta sesja nie będzie zapisana.');
if (wczytane.uwaga === 'brak-pamieci') pokazKomunikat(tekstBrakuZapisu, 8000);

// mapa po pierwszej klatce, żeby tytuł i przycisk były dostępne natychmiast
requestAnimationFrame(() => setTimeout(() => {
  const go = () => fx.zbudujMape();
  ('requestIdleCallback' in window) ? requestIdleCallback(go, { timeout: 120 }) : go();
}, 0));
