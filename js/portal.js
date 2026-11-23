import { MISJE, LEGENDARNA, PUNKTACJA, SLOWNIK, TRUDNOSCI, TRYBY, SKLADY, misja, trudnosc } from './misje.js';
import { runda, swobodny, misjaRundy } from './seria.js';
import { formularzOpinii, opinia, tekstOpinii } from './opinie.js';
import { pokazSekcje } from './dzialy.js';

const dzialy = new Map([...document.querySelectorAll('[data-dzial]')].map(el => [el.dataset.dzial, el]));
const menu = document.querySelectorAll('[data-nav]');
const toggle = document.querySelector('.portal-menu-toggle');
const pola = ['tryb', 'trud', 'sklad', 'kategoria'];
const el = id => document.getElementById(id);
const katalog = [...MISJE, LEGENDARNA];
let dzial, stanZrodlo;
const wejscia = new IntersectionObserver(wpisy => {
  for (const wpis of wpisy) {
    if (!wpis.isIntersecting) continue;
    wpis.target.dataset.wejscie = 'tak';
    wejscia.unobserve(wpis.target);
  }
}, { threshold: .14 });

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
  toggle.setAttribute('aria-expanded', 'false');
  document.body.dataset.dzial = dzial;
  if (dzial === 'misje' && !el('katalog-lista').childNodes.length) renderKatalog();
  pokazSekcje(dzial, stanZrodlo());
  dzialy.get(dzial).querySelectorAll('.portal-kafel, .wiedza-panel').forEach(panel => {
    if (!panel.dataset.wejscie) wejscia.observe(panel);
  });
  if (!fokus) return;
  const sekcja = dzialy.get(dzial);
  const cel = sekcja.querySelector('[data-portal-fokus], [data-fokus]') || sekcja.querySelector('#ekran');
  scrollTo({ top: 0, behavior: 'instant' });
  cel?.focus({ preventScroll: true });
  if (!document.hidden && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
    const naglowek = sekcja.querySelector('.dzial-naglowek,.portal-katalog h1,.gra-tytul');
    naglowek?.animate([{ transform: 'translateY(12px)', opacity: .25 }, { transform: 'none', opacity: 1 }],
      { duration: 360, easing: 'cubic-bezier(.19,1,.22,1)' });
  }
}

export function przejdzDo(nazwa) {
  location.hash = nazwa;
  pokazDzial(true);
}

export function aktualizujPortal(stan) {
  const aktywna = stan.etap !== 'start';
  const kontynuuj = el('kontynuuj');
  const opis = el('portal-zapis');
  kontynuuj.hidden = !aktywna;
  kontynuuj.textContent = stan.etap === 'final' ? 'Zobacz wynik' : 'Kontynuuj';
  document.querySelector('[data-akcja="graj-od-razu"]').hidden = aktywna;
  document.querySelector('[data-ustawienia]').hidden = aktywna;
  opis.hidden = !aktywna;
  if (dzial === 'turnieje') pokazSekcje(dzial, stan);
  if (!aktywna) return;
  const karta = runda(stan);
  if (stan.etap === 'final') opis.textContent = 'Wynik ostatniej serii czeka na tym urządzeniu.';
  else if (karta?.odkryta && !karta.uniewazniona) opis.textContent = 'Twoja karta: ' + misjaRundy(karta).tytul;
  else opis.textContent = swobodny(stan) ? 'Swobodne losowanie jest w toku.' : 'Seria jest w toku.';
}

const tekst = (tag, value, cls) => {
  const node = document.createElement(tag);
  node.textContent = value;
  if (cls) node.className = cls;
  return node;
};

function renderKatalog() {
  const lista = el('katalog-lista');
  const szukaj = el('katalog-szukaj').value.trim().toLocaleLowerCase('pl');
  const [tryb, trud, sklad, kategoria] = pola.map(id => el(`katalog-${id}`).value);
  const pasujace = katalog.filter(m =>
    (!tryb || m.tryby.includes(tryb)) && (!trud || m.trudnosc === trud) &&
    (!sklad || m.sklady.includes(sklad)) && (!kategoria || m.kategoria === kategoria) &&
    (!szukaj || [m.tytul, m.cel, m.zaliczenie, ...m.doprecyzowanie.map(k => SLOWNIK[k])]
      .some(t => t.toLocaleLowerCase('pl').includes(szukaj))));
  el('katalog-licznik').textContent = pasujace.length ? `Liczba misji: ${pasujace.length}` : 'Brak pasujących misji.';
  lista.replaceChildren(...pasujace.map(m => {
    const karta = document.createElement('details');
    karta.className = `katalog-karta t-${m.trudnosc}`;
    karta.dataset.misja = m.id;
    const naglowek = document.createElement('summary');
    naglowek.append(tekst('span', `${trudnosc(m.trudnosc).nazwa} · ${PUNKTACJA[m.trudnosc]} pkt`, 'katalog-poziom'), tekst('strong', m.tytul));
    const info = tekst('p', opinia(m.id) ? 'Moja ocena: ' + opinia(m.id).ocena : '', 'katalog-ocena');
    karta.append(naglowek, tekst('p', m.cel), tekst('p', m.odKiedy + ' ' + m.zaliczenie), tekst('p', m.wskazowka),
      tekst('p', `${m.kategoria} · ${m.tryby.map(id => TRYBY[id].nazwa).join(' / ')} · ${m.sklady.map(id => SKLADY[id]).join(' / ')}`, 'katalog-tryby'), info);
    karta.addEventListener('toggle', () => {
      if (karta.open && !karta.querySelector('form')) karta.insertAdjacentHTML('beforeend', formularzOpinii(m.id));
    });
    return karta;
  }));
}

function odswiezOpinie(id) {
  el('katalog-podsumowanie').value = tekstOpinii(id => misja(id)?.tytul ?? id);
  if (!id) {
    if (el('katalog-lista').childNodes.length) renderKatalog();
    return;
  }
  for (const karta of el('katalog-lista').children) {
    if (karta.dataset.misja === id) {
      karta.querySelector('.katalog-ocena').textContent = 'Moja ocena: ' + opinia(id).ocena;
    }
  }
}

export function uruchomPortal(pobierzStan) {
  stanZrodlo = pobierzStan;
  window.addEventListener('hashchange', () => pokazDzial(true));
  toggle.addEventListener('click', () => toggle.setAttribute('aria-expanded', String(toggle.getAttribute('aria-expanded') !== 'true')));
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') {
      toggle.setAttribute('aria-expanded', 'false');
      toggle.focus();
    }
  });
  document.querySelector('.portal-menu').addEventListener('click', e => {
    if (!e.target.closest('[data-nav]')) return;
    if (e.target.closest('#portal-menu-wiecej') && toggle.getAttribute('aria-expanded') === 'true') toggle.focus();
    toggle.setAttribute('aria-expanded', 'false');
  });
  document.querySelector('.skip').addEventListener('click', e => {
    e.preventDefault();
    el('tresc').focus();
  });
  const trud = el('katalog-trud');
  for (const t of [...TRUDNOSCI, trudnosc('specjalna')]) trud.add(new Option(t.nazwa, t.id));
  for (const kat of [...new Set(katalog.map(m => m.kategoria))].sort((a, b) => a.localeCompare(b, 'pl'))) el('katalog-kategoria').add(new Option(kat));
  el('katalog-szukaj').addEventListener('input', renderKatalog);
  for (const id of pola) el('katalog-' + id).addEventListener('change', renderKatalog);
  document.addEventListener('kilek:opinia', e => odswiezOpinie(e.detail?.id));
  el('katalog-kopiuj').addEventListener('click', async () => {
    const pole = el('katalog-podsumowanie');
    if (!pole.value) {
      el('katalog-kopia-status').textContent = 'Nie ma zapisanych opinii.';
      return;
    }
    try {
      await navigator.clipboard.writeText(pole.value);
      el('katalog-kopia-status').textContent = 'Skopiowano opinie.';
    } catch {
      pole.select();
      el('katalog-kopia-status').textContent = 'Tekst jest zaznaczony. Skopiuj go z menu przeglądarki.';
    }
  });
  odswiezOpinie();
  pokazDzial();
}
