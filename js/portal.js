import { MISJE, SLOWNIK, TRUDNOSCI, TRYBY, misja, trudnosc } from './misje.js';
import { runda, swobodny } from './seria.js';

const dzialy = new Map([...document.querySelectorAll('[data-dzial]')].map(el => [el.dataset.dzial, el]));
const menu = document.querySelectorAll('[data-nav]');
let dzial;

if (new URLSearchParams(location.search).get('motyw') === 'holo') {
  document.documentElement.dataset.motyw = 'holo';
}

function pokazDzial(fokus = false) {
  const hash = location.hash.slice(1);
  const nowy = dzialy.has(hash) ? hash : 'start';
  if (dzial === nowy) return;
  dzial = nowy;
  for (const [nazwa, sekcja] of dzialy) sekcja.hidden = nazwa !== dzial;
  for (const link of menu) {
    if (link.dataset.nav === dzial) link.setAttribute('aria-current', 'page');
    else link.removeAttribute('aria-current');
  }
  document.body.dataset.dzial = dzial;
  if (!fokus) return;
  const sekcja = dzialy.get(dzial);
  const cel = sekcja.querySelector('[data-portal-fokus], [data-fokus]') || sekcja.querySelector('#ekran');
  scrollTo({ top: 0, behavior: 'instant' });
  cel?.focus({ preventScroll: true });
}

export function przejdzDo(nazwa) {
  location.hash = nazwa;
  pokazDzial(true);
}

export function aktualizujPortal(stan) {
  const aktywna = stan.etap !== 'start';
  const kontynuuj = document.getElementById('kontynuuj');
  const opis = document.getElementById('portal-zapis');
  kontynuuj.hidden = !aktywna;
  kontynuuj.textContent = stan.etap === 'final' ? 'Zobacz wynik' : 'Kontynuuj';
  document.querySelector('[data-akcja="graj-od-razu"]').hidden = aktywna;
  document.querySelector('[data-ustawienia]').hidden = aktywna;
  opis.hidden = !aktywna;
  const karta = runda(stan);
  if (!aktywna) return;
  if (stan.etap === 'final') opis.textContent = 'Wynik ostatniej serii czeka na tym urządzeniu.';
  else if (karta?.odkryta && !karta.uniewazniona) opis.textContent = 'Twoja karta: ' + misja(karta.karta).tytul;
  else opis.textContent = swobodny(stan) ? 'Swobodne losowanie jest w toku.' : 'Seria jest w toku.';
}

function renderKatalog() {
  const lista = document.getElementById('katalog-lista');
  const szukaj = document.getElementById('katalog-szukaj').value.trim().toLocaleLowerCase('pl');
  const tryb = document.getElementById('katalog-tryb').value;
  const trud = document.getElementById('katalog-trud').value;
  const pasujace = MISJE.filter(m => (!tryb || m.tryby.includes(tryb)) && (!trud || m.trudnosc === trud) &&
    (!szukaj || [m.tytul, m.cel, m.zaliczenie, ...m.doprecyzowanie.map(k => SLOWNIK[k])]
      .some(tekst => tekst.toLocaleLowerCase('pl').includes(szukaj))));
  document.getElementById('katalog-licznik').textContent = pasujace.length ? `Liczba misji: ${pasujace.length}` : 'Brak pasujących misji.';
  lista.replaceChildren(...pasujace.map(m => {
    const karta = document.createElement('details');
    karta.className = `katalog-karta t-${m.trudnosc}`;
    const naglowek = document.createElement('summary');
    const poziom = document.createElement('span');
    poziom.className = 'katalog-poziom';
    poziom.textContent = trudnosc(m.trudnosc).nazwa;
    const tytul = document.createElement('strong');
    tytul.textContent = m.tytul;
    naglowek.append(poziom, tytul);
    const opis = document.createElement('p');
    opis.textContent = m.cel;
    const warunek = document.createElement('p');
    warunek.textContent = `${m.odKiedy} ${m.zaliczenie}`;
    const tryby = document.createElement('p');
    tryby.className = 'katalog-tryby';
    tryby.textContent = m.tryby.map(id => TRYBY[id].nazwa).join(' · ');
    karta.append(naglowek, opis, warunek, tryby);
    return karta;
  }));
}

export function uruchomPortal() {
  window.addEventListener('hashchange', () => pokazDzial(true));
  document.querySelector('.skip').addEventListener('click', e => {
    e.preventDefault();
    document.getElementById('tresc').focus();
  });
  const trud = document.getElementById('katalog-trud');
  for (const t of TRUDNOSCI) trud.add(new Option(t.nazwa, t.id));
  document.getElementById('katalog-szukaj').addEventListener('input', renderKatalog);
  for (const id of ['katalog-tryb', 'katalog-trud']) document.getElementById(id).addEventListener('change', renderKatalog);
  renderKatalog();
  pokazDzial();
}
