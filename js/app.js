// =========================================================
// KILEK CHALLENGE: interfejs. Stan → widok. Logika jest w seria.js.
// =========================================================
import * as S from './seria.js';
import { TRYBY, TRUDNOSCI, SLOWNIK, PUNKTACJA, SKLADY, trudnosc } from './misje.js';
import { wczytaj, zapisz, wyczysc } from './zapis.js';
import { INSYGNIA, IKONY, ODZNAKA, rewers, awatar } from './grafika.js';
import { aktualizujPortal, przejdzDo, uruchomPortal } from './portal.js';
import { esc, formularzOpinii, podlaczOpinie, wyczyscOpinie } from './opinie.js';
import * as fx from './fx.js';
import { uruchomArene } from './arena.js';

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];

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
  document.body.dataset.trud = S.runda(stan)?.trudnosc ?? stan.trudnosc;
  document.body.dataset.faza = STOL.includes(stan.etap) ? faza : '';
}

async function render(stary = null) {
  motyw();
  renderHud();
  aktualizujPortal(stan);
  const zmianaWidoku = !stary || widok(stary) !== widok(stan) ||
    (STOL.includes(stan.etap) && (S.runda(stary)?.karta !== S.runda(stan)?.karta || S.numerRundy(stary) !== S.numerRundy(stan)));
  if (!zmianaWidoku) { aktualizuj(stary); return; }
  const poprzedni = ekran.firstElementChild;
  const poprzedniaKarta = $('.karta-wrap', ekran);
  const losujPoWymianie = ['wymien', 'uniewaznij'].includes(ostatniaAkcja);
  const odRazu = S.swobodny(stan) && ['rozpocznij', 'graj-od-razu'].includes(ostatniaAkcja);
  const wymiana = losujPoWymianie || ostatniaAkcja === 'kolejna-swobodna';
  if (stary && poprzedni && !ekran.closest('[hidden]')) {
    poprzedni.inert = true;
    if (wymiana && poprzedniaKarta) await fx.odrzuc(poprzedniaKarta, ostatniaAkcja === 'wymien' ? -1 : 1);
    else await fx.wyjscie(poprzedni);
    if (!poprzedni.isConnected) return;
  }
  ekran.innerHTML = rysujWidok();
  if (document.body.dataset.dzial !== 'wyzwania') return podlacz(odRazu ? stary : null, odRazu);
  scrollTo({ top: 0, behavior: 'instant' });
  podlacz(stary, losujPoWymianie || odRazu);
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
const indeksy = () => S.liczbaWynikow(stan) === 1 ? [0] : [0, 1];
const nazwaWyniku = i => S.duet(stan) ? 'Duet' : stan.gracze[i];
const napisLimitu = s => S.limitRund(s) ? ` z ${S.limitRund(s)}` : '';
const cenaRundy = r => `${S.wartoscRundy(r)} pkt${r?.wersjaZasad === 0 ? ' · legacy' : ''}`;
const zaliczenia = i => S.rozegrane(stan).filter(r => r.wyniki[i] === 1).length;

function renderHud() {
  const s = stan;
  hud.hidden = s.etap === 'start' || S.swobodny(s);
  if (hud.hidden) return;
  const przed = $$('[data-suma]', hud).map(el => +el.dataset.suma);
  const p = S.punkty(s);
  const nr = s.etap === 'final' ? S.rozegrane(s).length : S.numerRundy(s);
  hud.innerHTML = `<div class="hud-in">
    <div class="hud-etap"><b>Runda ${nr}${napisLimitu(s)}</b>
      ${S.runda(s) && s.etap !== 'final' ? `<span>Do zdobycia ${cenaRundy(S.runda(s))}</span>` : ''}</div>
    <div class="hud-wynik" role="group" aria-label="Punkty ${p.map((pkt, i) => `${esc(nazwaWyniku(i))} ${pkt}`).join(', ')}">
      ${indeksy().map(i => `<span class="hud-gracz p${i}">${awatar(s.gracze[i], i, 'mini')}<span class="hud-nazwa">${esc(nazwaWyniku(i))}</span><b data-suma="${p[i]}">${p[i]}</b></span>`).join('')}
    </div>
  </div>`;
  $$('[data-suma]', hud).forEach((el, i) => fx.licznik(el, przed[i] ?? p[i], p[i]));
}

// ---------------- START ----------------
const formyGry = {
  solo: ['Solo — gram sam', 'Jeden gracz i jeden wynik w turnieju.'],
  seria: ['Pojedynek Solo — osobne mecze', 'Robicie tę samą misję w osobnych meczach Solo. Każdy zdobywa własne punkty.'],
  duet: ['Duo — wspólny mecz', 'Gracie razem w Duo. Zespół zdobywa punkty raz.'],
};

const formaGry = s => !S.swobodny(s) ? s.sposob : s.sklad === 'duo' ? 'duet' : 'solo';
let legendarnaNaStart = false;

function widokStart() {
  return `<section class="widok widok-start wybor-start" data-widok="start">
    <h1 class="gra-tytul" data-fokus tabindex="-1">Wyzwania</h1>
    <div class="wybor-start-panel">
      <fieldset class="wybor-start-cel">
        <legend>Co chcesz zrobić?</legend>
        <div class="wybor-start-kafelki">
          ${[['swobodny', 'Szybkie wyzwanie', 'Karta do meczu. Bez punktów.'],
            ['turniej', 'Turniej na punkty', 'Rundy, wyniki i finał.']].map(([id, nazwa, opis]) =>
            `<label><input type="radio" name="cel-gry" value="${id}"><span><b>${nazwa}</b><small>${opis}</small></span></label>`).join('')}
        </div>
      </fieldset>
      <div class="wybor-start-pola">
        <label>Tryb gry
          <select name="forma-gry" aria-describedby="opisFormy">${Object.entries(formyGry).map(([id, [nazwa]]) => `<option value="${id}">${nazwa}</option>`).join('')}</select>
        </label>
        <label>Budowanie
          <select name="tryb">${Object.values(TRYBY).map(tr => `<option value="${tr.id}">${tr.nazwa}</option>`).join('')}</select>
        </label>
        <label id="startPoziom">Trudność
          <select name="trud" aria-describedby="opisFormy"></select>
        </label>
        <label id="startRundy">Liczba rund
          <select name="limit">${S.LIMITY_RUND.map(n => `<option value="${n}">${n || 'Bez limitu'}</option>`).join('')}</select>
        </label>
      </div>
      <p id="opisFormy" class="wybor-start-opis"></p>
      <p id="startLegenda" class="wybor-start-legenda" hidden><strong>Wygraj bez broni · 25 pkt</strong> <button class="btn btn-cichy" type="button" data-akcja="anuluj-legendarna">Wróć do losowania</button></p>
      <button class="btn btn-glowny wybor-start-cta" type="button" data-akcja="rozpocznij"></button>
      <div class="wybor-start-dodatki">
        <details id="startWiecej">
          <summary>Więcej ustawień</summary>
          <div class="gracze">
            ${[0, 1].map(i => `<div class="plakietka p${i}" data-pseudonim="${i}">
              <button class="awatar-btn" type="button" data-akcja="awatar" data-g="${i}" aria-label="Awatar gracza ${i + 1}">${awatar(stan.gracze[i], i)}</button>
              <label class="plakietka-pole">
                <input id="g${i}" class="pseudonim" value="${esc(stan.gracze[i])}" maxlength="16" autocomplete="off" spellcheck="false" enterkeyhint="done" aria-label="Pseudonim gracza ${i + 1}">
              </label>${IKONY.olowek}</div>`).join('')}
          </div>
          <label class="opcja-serii"><input type="checkbox" name="wymianyDowolne" ${stan.wymianyDowolne ? 'checked' : ''}> Dowolne wymiany w turnieju</label>
        </details>
        <details id="startSpecjalne">
          <summary>Wybierz konkretną misję</summary>
          <p>Wygraj bez podnoszenia broni i bez atakowania rywali. Za zaliczenie przysługuje 25 pkt.</p>
          <button class="btn btn-cichy" type="button" data-akcja="zaznacz-legendarna">Wybierz „Wygraj bez broni”</button>
        </details>
      </div>
    </div>
    <p class="nota-zapisu" id="notaZapisu">${trwaly ? 'Postęp zapisuje się w tej przeglądarce.' : esc(tekstBrakuZapisu)}</p>
  </section>`;
}

function aktualizujStart(stary) {
  const root = $('.wybor-start', ekran);
  if (!root) return;
  const szybka = S.swobodny(stan);
  const forma = formaGry(stan);
  const [formaPole, tryb, trud, limit] = $$('select', root);
  $$('input[name="cel-gry"]', root).forEach(i => { i.checked = i.value === (szybka ? 'swobodny' : 'turniej'); });
  formaPole.querySelector('[value="seria"]').hidden = szybka;
  formaPole.querySelector('[value="seria"]').disabled = szybka;
  formaPole.value = forma;
  tryb.value = stan.tryb;
  limit.value = stan.limit;
  const znacznikOpcji = [szybka, stan.sklad, stan.tryb].join('/');
  if (trud.dataset.opcje !== znacznikOpcji) {
    const dostepne = S.dostepneTrudnosci(stan);
    trud.replaceChildren(...dostepne.map(t => new Option(t.nazwa + (szybka ? '' : ` · ${PUNKTACJA[t.id]} pkt`), t.id)));
    trud.dataset.opcje = znacznikOpcji;
  }
  trud.value = stan.trudnosc;
  $('#startPoziom').hidden = legendarnaNaStart;
  $('#startRundy').hidden = szybka || legendarnaNaStart;
  $('#startWiecej').hidden = szybka;
  $('#startLegenda').hidden = !legendarnaNaStart;
  $('[data-pseudonim="1"]', root).hidden = forma === 'solo';
  $('#opisFormy').textContent = szybka
    ? forma === 'duet' ? 'Jedna karta do wspólnego meczu.' : 'Jedna karta do meczu solo.'
    : formyGry[forma][1];
  $('[data-akcja="rozpocznij"]', root).textContent = szybka ? 'Losuj wyzwanie' : 'Rozpocznij turniej';
  if (stary && stary.trudnosc !== stan.trudnosc) fx.przebarwMape();
}

// ---------------- STÓŁ: losowanie, karta, mecz ----------------
function kartaHTML(m, r) {
  const trud = r.trudnosc;
  const t = trudnosc(trud);
  const dop = m.doprecyzowanie.map(k => `<li>${esc(SLOWNIK[k])}</li>`).join('');
  return `<article class="karta t-${trud}" aria-labelledby="kartaTytul">
    <div class="pasy" aria-hidden="true"></div>
    <span class="naroznik n1" aria-hidden="true"></span><span class="naroznik n2" aria-hidden="true"></span>
    <span class="naroznik n3" aria-hidden="true"></span><span class="naroznik n4" aria-hidden="true"></span>
    <header class="karta-gora">
      <span class="karta-trud">${INSYGNIA[trud] ?? ODZNAKA}<span>${t.nazwa}</span></span>
      <span class="karta-meta"><span>${S.swobodny(stan) ? '' : cenaRundy(r) + ' · '}${esc(m.id)}</span><span>${TRYBY[stan.tryb].nazwa} · ${SKLADY[stan.sklad]}</span></span>
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
  const m = S.misjaRundy(r);
  if (stan.etap !== 'odkrycie') faza = 'odkryta';
  else if (faza === 'odkryta' || faza === 'odkrywanie') faza = 'talia';
  motyw();
  const nr = S.numerRundy(stan);
  return `<section class="widok widok-stol">
    <div class="stol-naglowek">
      <h2 class="runda-tytul" data-fokus tabindex="-1">${S.swobodny(stan) ? 'Szybkie wyzwanie' : `Runda <b>${nr}</b><span>${napisLimitu(stan)}</span>`}</h2>
      <p class="stol-status" id="stolStatus">${statusStolu()}</p>
      ${S.swobodny(stan) ? '' : `<span class="stol-stawka">${cenaRundy(r)} za zaliczenie</span>`}
    </div>
    <div class="rama" data-faza="${faza}">
      <span class="rama-n r1"></span><span class="rama-n r2"></span><span class="rama-n r3"></span><span class="rama-n r4"></span>
      <div class="karta-wrap" id="kartaWrap">
        ${kartaHTML(m, r)}
        <button class="rewers dotyk t-${r.trudnosc}" type="button" data-akcja="odkryj" aria-label="Odkryj kartę">${rewers(r.trudnosc === 'specjalna' ? 'ekstremalny' : r.trudnosc)}</button>
        <div class="blysk" aria-hidden="true"></div><div class="fala" aria-hidden="true"></div>
      </div>
      <button class="talia dotyk" type="button" data-akcja="losuj" aria-label="Losuj kartę z talii">
        ${[0, 1, 2, 3].map(i => `<span class="talia-rewers t-${r.trudnosc}" style="transform:translate(${i * 3 - 4}px,${-i * 4}px) rotate(${(i - 1.5) * 2.5}deg)">${rewers(r.trudnosc === 'specjalna' ? 'ekstremalny' : r.trudnosc)}</span>`).join('')}
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
  if (stan.etap === 'karta' && S.duet(stan)) return 'Jedna karta dla duetu. Zaznaczcie zaliczenie, gdy oboje spełnicie warunki, chyba że karta opisuje role zespołu.';
  if (stan.etap === 'karta' && S.swobodny(stan)) return 'Możesz zagrać tę kartę albo wylosować następną.';
  if (stan.etap === 'karta') return S.solowy(stan) ? 'Zagraj kartę i wpisz wynik po meczu.' : 'Ta sama karta obowiązuje obu graczy.';
  if (faza === 'zakryta') return 'Karta czeka w ramce. Odkryjcie ją razem.';
  if (faza === 'rozdawanie') return 'Losuję…';
  return 'Karta jest już wylosowana i zapisana. Dotknijcie talii.';
}

function akcjeStolu() {
  const s = stan;
  if (s.etap === 'odkrycie') {
    if (faza === 'zakryta') return `<button class="btn btn-glowny" type="button" data-akcja="odkryj">Odkryj kartę</button>
      <button class="btn btn-cichy" type="button" data-akcja="pomin">Pomiń animację</button>`;
    if (faza === 'rozdawanie' || faza === 'odkrywanie') return `<button class="btn btn-cichy" type="button" data-akcja="pomin">Pomiń animację</button>`;
    return `<button class="btn btn-glowny" type="button" data-akcja="losuj">Losuj kartę</button>
      <button class="btn btn-cichy" type="button" data-akcja="pomin">Pomiń animację</button>`;
  }
  if (S.swobodny(s)) return s.etap === 'mecz'
    ? '<button class="btn btn-glowny" type="button" data-akcja="kolejna-swobodna">Następna karta</button>'
    : `<button class="btn btn-glowny" type="button" data-akcja="graj">Zaczynamy mecz</button>
       <button class="btn btn-drugi" type="button" data-akcja="wymien">${IKONY.wymiana}Losuj nową kartę</button>`;
  const wymiana = S.mozeWymienic(s);
  const tekstWym = s.seria.wymiana && !s.wymianyDowolne ? 'Wymiana zużyta' : (wymiana ? 'Wymień kartę' : 'Brak kart do wymiany');
  if (s.etap === 'karta') return `
    <button class="btn btn-glowny" type="button" data-akcja="graj">Zaczynamy mecz</button>
    <div class="akcje-rzad">
      <button class="btn btn-drugi" type="button" data-akcja="wymien" ${wymiana ? '' : 'disabled'}>${IKONY.wymiana}<span>${tekstWym}</span>${wymiana && !s.wymianyDowolne ? '<span class="zeton" aria-label="zostało: 1">1</span>' : ''}</button>
      <button class="btn btn-drugi" type="button" data-akcja="uniewaznij">${IKONY.uniewaznij}<span>Karta niewykonalna</span></button>
    </div>
    <p class="akcje-nota">${s.wymianyDowolne ? 'Dowolna liczba wymian.' : 'Jedna wymiana na rundę.'} Niewykonalną kartę unieważniacie bez punktu i bez zużycia wymiany.</p>`;
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
      ${TRUDNOSCI.map(t => `<option value="${t.id}" ${t.id === stan.trudnosc ? 'selected' : ''} ${dostepne.has(t.id) ? '' : 'disabled'}>${t.nazwa}${S.swobodny(stan) ? '' : ` · ${PUNKTACJA[t.id]} pkt`}</option>`).join('')}
    </select></label>`;
}

function ustawieniaStolu() {
  const wLosowaniu = faza === 'rozdawanie' || faza === 'odkrywanie';
  return `${stan.etap !== 'mecz' && !wLosowaniu ? wyborTrudnosciRundy() : ''}
    ${!wLosowaniu && S.mozeWybracSpecjalna(stan) ? '<button class="btn btn-drugi specjalna-przycisk" type="button" data-akcja="legendarna-wybierz">Wybierz „Wygraj bez broni” · 25 pkt</button>' : ''}
    ${stan.etap === 'karta' || stan.etap === 'mecz' ? `<details class="karta-opinia"><summary>Oceń misję</summary>${formularzOpinii(S.runda(stan).karta)}</details>` : ''}
    ${S.swobodny(stan) ? '' : '<button class="btn btn-cichy" type="button" data-akcja="zakoncz">Zakończ serię i zobacz wynik</button>'}
    <button class="btn btn-cichy" type="button" data-akcja="konfiguracja">Od nowa</button>`;
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
  const m = S.misjaRundy(r);
  const nr = S.numerRundy(stan);
  const ost = S.ostatniaRunda(stan);
  return `<section class="widok widok-rozliczenie">
    <h2 class="sekcja-tytul" data-fokus tabindex="-1">Wyniki rundy ${nr}</h2>
    <div class="mini-karta t-${r.trudnosc}">
      ${INSYGNIA[r.trudnosc] ?? ODZNAKA}
      <div><p class="mini-tytul">${esc(m.tytul)} · ${cenaRundy(r)}</p><p class="mini-zal"><b>Zaliczasz, gdy:</b> ${esc(m.zaliczenie)}</p></div>
    </div>
    <p class="uczciwie">${S.duet(stan) ? 'Potwierdźcie jeden wynik zespołu. Zaliczenie daje punkty raz, dla całego duetu.' : S.solowy(stan) ? 'Potwierdź swój wynik po meczu.' : 'Każdy potwierdza swój wynik ręcznie. Oboje możecie zaliczyć tę samą kartę.'}</p>
    <div class="panele">${indeksy().map(panelGracza).join('')}</div>
    <div class="akcje">
      <button class="btn btn-glowny" type="button" data-akcja="zatwierdz" ${S.gotowe(stan) ? '' : 'disabled'}>${ost ? 'Zatwierdź i zobacz finał' : `Zatwierdź rundę ${nr}`}</button>
      <button class="btn btn-cichy" type="button" data-akcja="wroc">${IKONY.wstecz}<span>Wróć do karty</span></button>
    </div>
  </section>`;
}

function panelGracza(i) {
  const w = S.runda(stan).wyniki[i];
  const n = esc(nazwaWyniku(i));
  return `<div class="panel-gracza p${i}" data-wynik="${w ?? ''}">
    <div class="panel-glowa">${awatar(stan.gracze[i], i)}<span class="panel-nazwa">${n}</span></div>
    <div class="wybor" role="group" aria-label="Wynik gracza ${n}">
      <button class="opcja tak" type="button" data-akcja="wynik" data-g="${i}" data-w="1" aria-pressed="${w === 1}">${IKONY.zalicz}<span>Zaliczone</span></button>
      <button class="opcja nie" type="button" data-akcja="wynik" data-g="${i}" data-w="0" aria-pressed="${w === 0}">${IKONY.nie}<span>Nie tym razem</span></button>
    </div>
    <p class="etykieta-wyniku">${w === 1 ? `+${S.wartoscRundy(S.runda(stan))} pkt` : w === 0 ? '0 punktów, następnym razem' : 'Wybierz wynik'}</p>
    <div class="stempel" aria-hidden="true">Zaliczone</div>
  </div>`;
}

function aktualizujRozliczenie(stary) {
  const r = S.runda(stan), rs = S.runda(stary);
  indeksy().forEach(i => {
    const p = $(`.panel-gracza.p${i}`);
    const w = r.wyniki[i];
    p.dataset.wynik = w ?? '';
    $$('.opcja', p).forEach(b => b.setAttribute('aria-pressed', String(+b.dataset.w === w)));
    $('.etykieta-wyniku', p).textContent = w === 1 ? `+${S.wartoscRundy(S.runda(stan))} pkt` : w === 0 ? '0 punktów, następnym razem' : 'Wybierz wynik';
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
      <button class="btn btn-cichy" type="button" data-akcja="konfiguracja">Od nowa</button>
    </div>
  </section>`;
}

// ---------------- FINAŁ ----------------
function tytulFinalu() {
  const z = S.zwyciezca(stan);
  if (!S.rozegrane(stan).length) return 'Seria bez wyniku';
  if (S.duet(stan)) return 'Wynik drużyny';
  if (S.solowy(stan)) return 'Wynik solo';
  return z === null ? 'Remis!' : `Wygrywa ${esc(stan.gracze[z])}!`;
}

function widokFinal() {
  const p = S.punkty(stan);
  const z = S.zwyciezca(stan);
  const rundy = S.rozegrane(stan);
  const wynik = z === null ? 'remis' : String(z);
  return `<section class="widok widok-final" data-wynik="${wynik}">
    <h2 class="final-tytul" data-fokus tabindex="-1" id="finalTytul">${tytulFinalu()}</h2>
    <div class="podium ${S.liczbaWynikow(stan) === 1 ? 'podium-duet' : ''}">
      <div class="reflektor" aria-hidden="true"></div>
      ${indeksy().map(i => `
        <div class="kolumna p${i} ${z === i || (z === null && rundy.length) ? 'na-szczycie' : ''}">
          <div class="promienie" aria-hidden="true"></div>
          <div class="odznaka-miejsce" aria-hidden="true">${ODZNAKA}</div>
          ${awatar(stan.gracze[i], i, 'duzy')}
          <p class="kolumna-nazwa">${esc(nazwaWyniku(i))}</p>
          <p class="kolumna-pkt"><span class="beben" aria-hidden="true" data-punkty="${p[i]}">${p[i]}</span><span class="sr">${p[i]} pkt</span><span class="pkt-j" aria-hidden="true">pkt</span></p><p class="kolumna-zaliczenia">${zaliczenia(i)} zaliczeń</p>
        </div>`).join('<div class="final-vs" aria-hidden="true">:</div>')}
    </div>
    ${rundy.length ? `<table class="tabela-rund">
      <caption>Rundy. Dotknij wyniku, żeby go poprawić.</caption>
      <thead><tr><th scope="col">Misja</th>${indeksy().map(i => `<th scope="col">${esc(nazwaWyniku(i))}</th>`).join('')}</tr></thead>
      <tbody>${rundy.map((r, n) => `<tr class="wiersz">
        <th scope="row"><span class="nr">${n + 1}</span>${esc(S.misjaRundy(r).tytul)}<small>${trudnosc(r.trudnosc).nazwa} · ${cenaRundy(r)}</small></th>
        ${indeksy().map(i => `<td>${przyciskWyniku(r, n, i)}</td>`).join('')}
      </tr>`).join('')}</tbody>
    </table>` : ''}
    ${stan.seria.koniec === 'wczesniej' ? `<p class="nota">Seria zakończona wcześniej: ${rundy.length}${napisLimitu(stan)} rund.</p>` : ''}
    <div class="akcje">
      <button class="btn btn-glowny btn-rewanz" type="button" data-akcja="rewanz">Rewanż</button>
      <button class="btn btn-cichy" type="button" data-akcja="konfiguracja">Zmień graczy albo trudność</button>
    </div>
  </section>`;
}

function przyciskWyniku(r, n, i) {
  const w = r.wyniki[i];
  const nazwa = esc(nazwaWyniku(i));
  return `<button class="komorka ${w ? 'tak' : 'nie'}" type="button" data-akcja="popraw" data-r="${n}" data-g="${i}"
    aria-label="Runda ${n + 1}, ${nazwa}: ${w ? 'zaliczone' : 'niezaliczone'}. Zmień">${w ? `+${r.punkty}` : '0'} pkt</button>`;
}

function aktualizujFinal() {
  const sek = $('.widok-final');
  const p = S.punkty(stan), z = S.zwyciezca(stan), rundy = S.rozegrane(stan);
  sek.dataset.wynik = z === null ? 'remis' : String(z);
  $('#finalTytul').innerHTML = tytulFinalu();
  indeksy().forEach(i => {
    const k = $(`.kolumna.p${i}`);
    k.classList.toggle('na-szczycie', z === i || (z === null && rundy.length > 0));
    const liczba = $('.beben', k);
    fx.licznik(liczba, +liczba.dataset.punkty, p[i]);
    liczba.dataset.punkty = p[i];
    $('.kolumna-zaliczenia', k).textContent = `${zaliczenia(i)} zaliczeń`;
    $('.sr', k).textContent = `${p[i]} pkt`;
  });
  $$('.wiersz', sek).forEach((tr, n) => {
    $$('td', tr).forEach((td, i) => {
      const aktywny = td.contains(document.activeElement);
      td.innerHTML = przyciskWyniku(rundy[n], n, i);
      if (aktywny) td.firstElementChild.focus();
    });
  });
  oglos(`${tytulFinalu()} ${p.map((pkt, i) => `${nazwaWyniku(i)} ${pkt} pkt`).join(', ')}.`);
}

// ---------------------------------------------------------
// Po narysowaniu: animacje wejścia i sekwencje
// ---------------------------------------------------------
function podlacz(stary, losujPoWymianie) {
  const w = widok(stan);
  if (w === 'start') {
    aktualizujStart();
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
    $$('.kolumna').forEach((k, i) => fx.licznik($('.beben', k), 0, p[i]));
    if (stary && S.rozegrane(stan).length) {
      const kol = z === null ? ['#ff7a45', '#36d0ff', '#ffcf3a', '#eef1e6'] : [z ? '#36d0ff' : '#ff7a45', '#ffcf3a', '#eef1e6'];
      const zr = z === null ? [[.25, .42], [.75, .42]] : [[z ? .72 : .28, .4]];
      setTimeout(() => {
        if (stan.etap === 'final' && document.body.dataset.dzial === 'wyzwania') fx.konfetti(kol, zr);
      }, fx.reduced ? 0 : 420);
    }
    oglos(`${tytulFinalu()} ${p.map((pkt, i) => `${nazwaWyniku(i)} ${pkt} pkt`).join(', ')}.`);
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
  if (pominiecie) { odkryjTeraz(true); return; }
  $('.rewers')?.focus({ preventScroll: true });
}

async function odkryjTeraz(bezAnimacji = false) {
  if (stan.etap !== 'odkrycie' || faza === 'odkrywanie') return;
  faza = 'odkrywanie'; aktualizujStol();
  // stan zapisujemy od razu; animacja jest tylko dekoracją
  const nowy = S.odkryj(stan);
  stan = nowy; if (trwaly && !zapisz(stan)) { trwaly = false; pokazKomunikat(tekstBrakuZapisu); }
  const karta = $('#kartaWrap');
  const anim = bezAnimacji || fx.reduced || document.hidden ? null : fx.odkryj(karta, S.runda(stan).trudnosc);
  await anim;
  if (stan !== nowy) return;
  faza = 'odkryta';
  motyw(); renderHud(); aktualizujStol(); aktualizujPortal(stan);
  const m = S.misjaRundy(S.runda(stan));
  oglos(`Misja ${m.tytul}. ${m.cel} Od kiedy: ${m.odKiedy} Zaliczasz, gdy: ${m.zaliczenie}`);
  $('#kartaTytul')?.setAttribute('tabindex', '-1');
  if (document.body.dataset.dzial === 'wyzwania') $('#kartaTytul')?.focus({ preventScroll: true });
}

function pomin() {
  pominiecie = true;
  if (faza === 'rozdawanie' || faza === 'odkrywanie') { fx.dokoncz(); return; }
  if (faza === 'talia' || faza === 'zakryta') odkryjTeraz(true);
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

function potwierdzZmiane(tytul, opis, akcja, przycisk = 'Potwierdź') {
  const d = $('#potwierdz-serie');
  if (d.open) return;
  $('#potwierdz-tytul').textContent = tytul;
  $('p', d).textContent = opis;
  $('button[value="reset"]', d).textContent = przycisk;
  d.returnValue = '';
  d.addEventListener('close', () => {
    if (d.returnValue !== 'reset') return;
    const nastepny = akcja();
    if (nastepny === stan) return;
    ostatniaAkcja = null;
    faza = 'talia';
    ustaw(nastepny);
  }, { once: true });
  d.showModal();
}

function potwierdzZakonczenie(akcja) {
  const d = $('#potwierdz-serie');
  const ustawienia = akcja === 'konfiguracja';
  $('#potwierdz-tytul').textContent = ustawienia ? 'Zacząć od nowa?' : 'Zakończyć serię?';
  $('p', d).textContent = ustawienia
    ? 'Bieżąca karta zostanie porzucona. Ukończone rundy zostaną w historii.'
    : 'Podsumowanie zachowa ukończone rundy. Bieżąca runda zostanie zamknięta.';
  $('button[value="reset"]', d).textContent = ustawienia ? 'Od nowa' : 'Zakończ serię';
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
    case 'zaznacz-legendarna': {
      if (stan.etap !== 'start') {
        pokazKomunikat('Rozgrywka trwa. Dokończ ją albo wybierz misję specjalną przed następnym losowaniem.');
        przejdzDo('wyzwania');
        break;
      }
      legendarnaNaStart = true;
      const n = S.swobodny(stan) ? S.ustawFormat(stan, formaGry(stan)) : stan;
      if (!ustaw(n)) aktualizujStart();
      przejdzDo('wyzwania');
      $('#startSpecjalne').open = false;
      $('[data-akcja="rozpocznij"]')?.focus();
      break;
    }
    case 'anuluj-legendarna': {
      legendarnaNaStart = false;
      aktualizujStart();
      $('[data-akcja="rozpocznij"]')?.focus();
      break;
    }
    case 'legendarna-wybierz': {
      potwierdzZmiane('Wybrać misję legendarną?', 'Bieżącą kartę zastąpi „Wygraj bez broni” za 25 pkt. Rozegrane rundy zostają.', () => S.wybierzSpecjalna(stan));
      break;
    }
    case 'rozpocznij': {
      faza = 'talia';
      const konfiguracja = S.ustawFormat(stan, stan.sposob, stan.sklad);
      if (ustaw(S.rozpocznij(konfiguracja, konfiguracja.sposob, legendarnaNaStart))) legendarnaNaStart = false;
      break;
    }
    case 'graj-od-razu': {
      faza = 'talia';
      if (ustaw(S.rozpocznij(S.ustawFormat(stan, 'swobodny'), 'swobodny'))) przejdzDo('wyzwania');
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
      if (stan.etap === 'karta' && !S.swobodny(stan) && !potwierdz(b, 'Porzucić kartę? Dotknij ponownie')) break;
      const n = S.wymien(stan);
      if (n === stan) break;
      faza = 'talia'; ustaw(n);
      if (!S.swobodny(stan) && !stan.wymianyDowolne) pokazKomunikat('Wymiana w tej rundzie wykorzystana.', 3200);
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
    case 'od-nowa': {
      potwierdzZmiane('Zacząć od nowa?', 'Przerwiesz bieżącą grę. Ukończone rundy pozostaną w historii.', () => {
        const nowy = S.doKonfiguracji(stan);
        location.hash = 'wyzwania';
        return nowy;
      }, 'Od nowa');
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
  if (t.name === 'cel-gry') {
    if (t.value === 'swobodny') legendarnaNaStart = false;
    const forma = formaGry(stan);
    ustaw(t.value === 'swobodny'
      ? S.ustawFormat(stan, 'swobodny', forma === 'duet' ? 'duo' : 'solo')
      : S.ustawFormat(stan, forma === 'duet' ? 'duet' : 'solo'));
  }
  if (t.name === 'forma-gry') {
    ustaw(S.swobodny(stan) ? S.ustawFormat(stan, 'swobodny', t.value === 'duet' ? 'duo' : 'solo') : S.ustawFormat(stan, t.value));
  }
  if (t.name === 'tryb') ustaw(S.ustawTryb(stan, t.value));
  if (t.name === 'trud') ustaw(S.ustawTrudnosc(stan, t.value));
  if (['limit', 'wymianyDowolne'].includes(t.name)) {
    ustaw(S.ustawOpcje(stan, t.name, t.type === 'checkbox' ? t.checked : t.name === 'limit' ? +t.value : t.value));
  }
  if (t.name === 'trud-rundy') {
    const trud = t.value;
    const nowy = S.zmienTrudnosc(stan, trud);
    if (nowy === stan) return;
    if (stan.etap === 'karta') {
      t.value = stan.trudnosc;
      potwierdzZmiane('Zmienić trudność?', 'Porzucisz bieżącą kartę. Punkty i ukończone rundy zostają.', () => S.zmienTrudnosc(stan, trud));
    } else {
      ostatniaAkcja = null;
      faza = 'talia';
      ustaw(nowy);
    }
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
          <li>Wybierz szybkie wyzwanie bez punktów lub turniej na punkty.</li>
          <li>Wybierz granie solo, osobne mecze lub wspólny mecz.</li>
          <li>W osobnych meczach każdy zdobywa własne punkty za to samo zadanie. Wspólny mecz daje jeden wynik dla drużyny.</li>
          <li>Po meczu każdy zaznacza swój wynik. Zaliczenie daje 1, 3, 5, 7 lub 10 pkt według trudności. Brak zaliczenia daje 0.</li>
          <li>Wybierz 3, 5, 10 rund albo serię bez limitu. Możesz zakończyć serię i zobaczyć wynik w dowolnej chwili.</li>
        </ol>
        <p><b>Wymiana.</b> Domyślnie jedna na rundę. Przed serią możesz ustawić dowolną liczbę.</p>
        <p><b>Swobodne losowanie.</b> Zmieniaj trudność i losuj kolejne karty bez limitu. Ten tryb jest bez punktów.</p>
        <p><b>Trudność w serii.</b> Można ją zmienić przed meczem. Punkty ukończonych rund pozostają bez zmian. Legendarna karta daje 25 pkt za zaliczenie.</p>
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
    wyczyscOpinie();
    document.dispatchEvent(new CustomEvent('kilek:opinia'));
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
document.addEventListener('visibilitychange', () => {
  document.documentElement.classList.toggle('ukryta', document.hidden);
  if (document.hidden) fx.dokoncz();
});

podlaczOpinie();
uruchomPortal(() => stan);
render();
uruchomArene($('#arena-canvas'));
if (wczytane.uwaga === 'uszkodzony') pokazKomunikat('Zapis był uszkodzony. Zaczynacie od nowa.');
if (wczytane.uwaga === 'starszy') pokazKomunikat('Wczytano zapis ze starszej wersji.');
if (wczytane.uwaga === 'nowszy') pokazKomunikat('Zapis pochodzi z nowszej wersji strony. Nie nadpisujemy go, ta sesja nie będzie zapisana.');
if (wczytane.uwaga === 'brak-pamieci') pokazKomunikat(tekstBrakuZapisu, 8000);

// mapa po pierwszej klatce, żeby tytuł i przycisk były dostępne natychmiast
requestAnimationFrame(() => setTimeout(() => {
  const go = () => fx.zbudujMape();
  ('requestIdleCallback' in window) ? requestIdleCallback(go, { timeout: 120 }) : go();
}, 0));
