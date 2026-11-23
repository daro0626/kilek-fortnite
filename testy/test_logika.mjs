// Testy logiki KILEK CHALLENGE. Uruchom: node testy/test_logika.mjs
// Nie potrzebują przeglądarki ani sieci. Niczego nie zapisują do repozytorium.
import assert from 'node:assert/strict';
import { MISJE, TRYBY, TRUDNOSCI, pula, dostepna, MIN_KART, SLOWNIK } from '../js/misje.js';
import * as S from '../js/seria.js';

let ok = 0;
const test = (nazwa, f) => { f(); ok++; console.log('✓ ' + nazwa); };

// Pamięć zastępująca localStorage
class Pamiec {
  constructor() { this.m = new Map(); this.blokada = false; }
  get length() { return this.m.size; }
  key(i) { return [...this.m.keys()][i] ?? null; }
  getItem(k) { if (this.blokada) throw new Error('SecurityError'); return this.m.has(k) ? this.m.get(k) : null; }
  setItem(k, v) { if (this.blokada) throw new Error('QuotaExceededError'); this.m.set(k, String(v)); }
  removeItem(k) { if (this.blokada) throw new Error('SecurityError'); this.m.delete(k); }
}
globalThis.localStorage = new Pamiec();
const Z = await import('../js/zapis.js');

// Deterministyczne losowanie
let ziarno = 7;
S.ustawLosowanie(() => { ziarno = (ziarno * 16807) % 2147483647; return (ziarno - 1) / 2147483646; });

const start = (tryb = 'build', trud = 'latwy') => {
  let s = S.nowyStan();
  s = S.ustawTryb(s, tryb); s = S.ustawTrudnosc(s, trud);
  return S.rozpocznij(s);
};
const rozegrajRunde = (s, a = 1, b = 0) => {
  s = S.odkryj(s); s = S.graj(s); s = S.doRozliczenia(s);
  s = S.ustawWynik(s, 0, a); s = S.ustawWynik(s, 1, b);
  return S.zatwierdz(s);
};

test('każda karta ma pełne i poprawne dane', () => {
  const ids = new Set();
  for (const m of MISJE) {
    assert.match(m.id, /^[LNTXE]\d\d$/);
    assert.ok(!ids.has(m.id), 'duplikat ' + m.id); ids.add(m.id);
    for (const pole of ['tytul', 'cel', 'odKiedy', 'zaliczenie', 'wskazowka', 'sprawdzono'])
      assert.ok(typeof m[pole] === 'string' && m[pole].length > 3, m.id + ' ' + pole);
    assert.ok(TRUDNOSCI.some(t => t.id === m.trudnosc), m.id);
    assert.ok(m.tryby.length && m.tryby.every(t => TRYBY[t]), m.id);
    assert.ok(m.zrodla.length, m.id + ' bez źródła');
    m.doprecyzowanie.forEach(d => assert.ok(SLOWNIK[d], m.id + ' ' + d));
    assert.equal(m.id[0], { latwy: 'L', normalny: 'N', trudny: 'T', ekspert: 'X', ekstremalny: 'E' }[m.trudnosc]);
  }
  assert.ok(MISJE.length >= 28, 'zachowana dotychczasowa pula i cztery nowe misje');
});

test('rodzina bez strzelby ma cztery progi w Build i Zero Build', () => {
  const rodzina = ['N06', 'T06', 'X06', 'E06'];
  for (const tryb of Object.keys(TRYBY)) for (const [index, id] of rodzina.entries()) {
    const m = pula(tryb, TRUDNOSCI[index + 1].id).find(k => k.id === id);
    assert.ok(m?.doprecyzowanie.includes('strzelba'), `${tryb}/${id}`);
  }
  assert.equal(S.misja('E06').tytul, 'Wygraj bez strzelby');
});

test('każda konfiguracja ma co najmniej 4 zgodne karty', () => {
  for (const t of Object.keys(TRYBY)) for (const d of TRUDNOSCI) {
    assert.ok(pula(t, d.id).length >= MIN_KART, `${t}/${d.id}: ${pula(t, d.id).length}`);
    assert.ok(dostepna(t, d.id));
    assert.ok(pula(t, d.id).every(m => m.tryby.includes(t) && m.trudnosc === d.id));
  }
  assert.ok(!pula('build', 'zero').length);
});

test('pełna seria: 3 rundy, karty bez powtórek, wynik i zwycięzca', () => {
  for (const t of Object.keys(TRYBY)) for (const d of TRUDNOSCI) {
    let s = start(t, d.id);
    assert.equal(s.etap, 'odkrycie');
    s = rozegrajRunde(s, 1, 0); s = rozegrajRunde(s, 1, 1); s = rozegrajRunde(s, 0, 1);
    assert.equal(s.etap, 'final');
    const karty = s.seria.rundy.map(r => r.karta);
    assert.equal(new Set(karty).size, 3);
    karty.forEach(id => assert.ok(pula(t, d.id).some(m => m.id === id)));
    assert.deepEqual(S.punkty(s), [2, 2]);
    assert.equal(S.zwyciezca(s), null, 'remis');
  }
});

test('wymiana: jedna na serię, karta wypada z puli, dostępna przed rundą', () => {
  let s = start('zero', 'trudny');
  const pierwsza = S.runda(s).karta;
  s = S.odkryj(s);
  assert.ok(S.mozeWymienic(s));
  s = S.wymien(s);
  assert.notEqual(S.runda(s).karta, pierwsza);
  assert.ok(s.seria.pokazane.includes(pierwsza));
  assert.equal(s.seria.wymiana, true);
  assert.equal(s.etap, 'odkrycie');
  const po = S.wymien(S.odkryj(s));
  assert.equal(po.seria.rundy[0].karta, S.runda(s).karta, 'druga wymiana zablokowana');
  // wymiana niedostępna w trakcie meczu
  let s2 = start('build', 'latwy'); s2 = S.graj(S.odkryj(s2));
  assert.equal(S.mozeWymienic(s2), false);
  // wymieniona karta nie wraca w tej serii
  for (let i = 0; i < 3; i++) s = rozegrajRunde(s);
  assert.ok(!s.seria.rundy.some(r => r.karta === pierwsza));
});

test('unieważnienie: bez punktu, bez zużycia wymiany, nowa karta', () => {
  let s = S.graj(S.odkryj(start('build', 'ekspert')));
  const zla = S.runda(s).karta;
  s = S.uniewaznij(s);
  assert.equal(s.etap, 'odkrycie');
  assert.equal(s.seria.wymiana, false);
  assert.notEqual(S.runda(s).karta, zla);
  assert.equal(S.numerRundy(s), 1);
  for (let i = 0; i < 3; i++) s = rozegrajRunde(s, 1, 1);
  assert.equal(s.etap, 'final');
  assert.deepEqual(S.punkty(s), [3, 3]);
  assert.equal(S.rozegrane(s).length, 3);
});

test('brak kolejnej karty: można zakończyć serię bez utraty wyników', () => {
  const ile = pula('zero', 'latwy').length;
  let s = rozegrajRunde(start('zero', 'latwy'), 1, 0);
  for (let i = 1; i < ile; i++) s = S.uniewaznij(S.odkryj(s));
  assert.equal(s.etap, 'brak');
  assert.equal(S.mozeWymienic(s), false);
  s = S.zakonczWczesniej(s);
  assert.equal(s.etap, 'final');
  assert.equal(s.seria.koniec, 'wczesniej');
  assert.deepEqual(S.punkty(s), [1, 0]);
  assert.equal(S.zwyciezca(s), 0);
});

test('zmiana trudności między rundami zachowuje poprzednią kartę i punktację', () => {
  let s = rozegrajRunde(start('zero', 'latwy'), 1, 0);
  const pierwsza = S.rozegrane(s)[0].karta;
  const poprzednia = S.runda(s).karta;
  s = S.zmienTrudnosc(s, 'ekstremalny');
  assert.equal(S.numerRundy(s), 2);
  assert.equal(S.rozegrane(s)[0].karta, pierwsza);
  assert.ok(s.seria.pokazane.includes(poprzednia));
  assert.equal(S.misja(S.runda(s).karta).trudnosc, 'ekstremalny');
  assert.deepEqual(S.punkty(s), [1, 0]);
  assert.ok(S.poprawny(s));
  s = S.graj(S.odkryj(s));
  assert.equal(S.zmienTrudnosc(s, 'normalny'), s);
});

test('losowanie swobodne krąży po całej puli bez bezpośrednich powtórek', () => {
  let s = S.rozpocznij(S.ustawTryb(S.nowyStan(), 'zero'), 'swobodny');
  const karty = [S.runda(s).karta];
  for (let i = 0; i < 24; i++) {
    s = S.wymien(S.odkryj(s));
    const id = S.runda(s).karta;
    assert.notEqual(id, karty.at(-1));
    assert.ok(S.poprawny(s));
    assert.equal(s.seria.rundy.length, 1);
    karty.push(id);
  }
  const rozmiar = pula('zero', 'latwy').length;
  assert.equal(new Set(karty.slice(0, rozmiar)).size, rozmiar);
  assert.equal(s.seria.pokazane.length, rozmiar);
  assert.deepEqual(S.punkty(s), [0, 0]);
  s = S.graj(S.odkryj(s));
  assert.equal(S.kolejnaSwobodna(s).etap, 'odkrycie');
});

test('zapis v1 zachowuje pseudonimy, rozegrane rundy i bieżącą kartę', () => {
  const s = rozegrajRunde(start(), 1, 0);
  const v1 = { ...s, v: 1 };
  delete v1.sposob;
  localStorage.setItem(Z.KLUCZ, JSON.stringify(v1));
  const wynik = Z.wczytaj();
  assert.equal(wynik.uwaga, 'starszy');
  assert.deepEqual(wynik.stan, s);
  assert.deepEqual(S.punkty(wynik.stan), [1, 0]);
  assert.equal(JSON.parse(localStorage.getItem(Z.KLUCZ)).v, 1);
});

test('pusta pula: konfiguracja bez kart nie startuje', () => {
  let s = S.nowyStan(); s.trudnosc = 'nieznana';
  assert.equal(S.rozpocznij(s), s);
  assert.equal(S.ustawTrudnosc(S.nowyStan(), 'nieznana').trudnosc, 'latwy');
});

test('podwójne dotknięcie nie nalicza punktów drugi raz', () => {
  let s = S.doRozliczenia(S.graj(S.odkryj(start())));
  s = S.ustawWynik(s, 0, 1);
  const raz = S.ustawWynik(s, 0, 1);
  assert.equal(raz, s, 'ten sam wynik nie zmienia stanu');
  s = S.ustawWynik(s, 1, 1);
  const po1 = S.zatwierdz(s);
  const po2 = S.zatwierdz(po1);
  assert.equal(po2, po1, 'drugie zatwierdzenie ignorowane');
  assert.deepEqual(S.punkty(po1), [1, 1]);
  assert.equal(S.numerRundy(po1), 2);
  assert.equal(S.zatwierdz(S.doRozliczenia(S.graj(S.odkryj(start())))).etap, 'rozliczenie', 'bez wyników nie zatwierdza');
});

test('korekta wyniku w rozliczeniu i w finale', () => {
  let s = S.doRozliczenia(S.graj(S.odkryj(start())));
  s = S.ustawWynik(s, 0, 1); s = S.ustawWynik(s, 0, 0); s = S.ustawWynik(s, 1, 1);
  s = S.zatwierdz(s);
  s = rozegrajRunde(s, 0, 0); s = rozegrajRunde(s, 0, 0);
  assert.deepEqual(S.punkty(s), [0, 1]);
  assert.equal(S.zwyciezca(s), 1);
  s = S.ustawWynik(s, 0, 1, 0); s = S.ustawWynik(s, 0, 1, 2);
  assert.deepEqual(S.punkty(s), [2, 1]);
  assert.equal(S.zwyciezca(s), 0);
  assert.equal(S.ustawWynik(s, 0, 1, 5), s, 'nieistniejąca runda');
});

test('rewanż: ci sami gracze, tryb, trudność; pierwsza karta inna niż ostatnia', () => {
  for (let proba = 0; proba < 40; proba++) {
    let s = S.nowyStan();
    s = S.ustawGracza(s, 0, 'Gracz Alfa'); s = S.ustawGracza(s, 1, 'Gracz Beta');
    s = S.ustawTryb(s, 'zero'); s = S.ustawTrudnosc(s, 'normalny');
    s = S.rozpocznij(s);
    for (let i = 0; i < 3; i++) s = rozegrajRunde(s);
    const ostatnia = s.ostatnia;
    assert.equal(ostatnia, s.seria.rundy[2].karta);
    const r = S.rewanz(s);
    assert.deepEqual(r.gracze, ['Gracz Alfa', 'Gracz Beta']);
    assert.equal(r.tryb, 'zero'); assert.equal(r.trudnosc, 'normalny');
    assert.notEqual(S.runda(r).karta, ostatnia);
    assert.equal(r.seria.rundy.length, 1); assert.equal(r.seria.wymiana, false);
  }
});

test('pseudonimy: puste pole wraca do „Gracz N”, długość ograniczona', () => {
  let s = S.ustawGracza(S.nowyStan(), 0, '   ');
  s = S.ustawGracza(s, 1, 'BardzoDlugiPseudonimGracza');
  assert.equal(S.nazwaGracza(s, 0), 'Gracz 1');
  assert.equal(s.gracze[1].length, 16);
  assert.equal(S.rozpocznij(s).gracze[0], 'Gracz 1');
});

test('zapis: odtworzenie każdego etapu po „odświeżeniu”', () => {
  localStorage.m.clear();
  let s = start('zero', 'ekstremalny');
  const etapy = [];
  const sprawdz = () => {
    assert.ok(Z.zapisz(s));
    const { stan, uwaga } = Z.wczytaj();
    assert.equal(uwaga, null);
    assert.deepEqual(stan, s);
    etapy.push(stan.etap);
  };
  sprawdz(); s = S.odkryj(s); sprawdz(); s = S.graj(s); sprawdz();
  s = S.doRozliczenia(s); s = S.ustawWynik(s, 0, 1); sprawdz();
  s = S.ustawWynik(s, 1, 0); s = S.zatwierdz(s); sprawdz();
  s = rozegrajRunde(s); s = rozegrajRunde(s); sprawdz();
  s = S.doKonfiguracji(s); sprawdz();
  assert.deepEqual([...new Set(etapy)], ['odkrycie', 'karta', 'mecz', 'rozliczenie', 'final', 'start']);
});

test('zapis: pusty, uszkodzony, starszy, nowszy i zablokowany', () => {
  localStorage.m.clear();
  assert.deepEqual(Z.wczytaj(), { stan: S.nowyStan(), uwaga: null, trwaly: true });
  localStorage.setItem(Z.KLUCZ, '{to nie json');
  assert.equal(Z.wczytaj().uwaga, 'uszkodzony');
  localStorage.setItem(Z.KLUCZ, JSON.stringify({ v: 1, etap: 'karta', gracze: ['a', 'b'], tryb: 'build', trudnosc: 'latwy', seria: { rundy: [{ karta: 'X99', wyniki: [null, null] }], pokazane: ['X99'] } }));
  assert.equal(Z.wczytaj().uwaga, 'uszkodzony', 'nieznana karta');
  localStorage.setItem(Z.KLUCZ, JSON.stringify({ gracze: ['Ola', 'Ala'], tryb: 'zero', trudnosc: 'trudny' }));
  const st = Z.wczytaj();
  assert.equal(st.uwaga, 'starszy'); assert.deepEqual(st.stan.gracze, ['Ola', 'Ala']); assert.equal(st.stan.trudnosc, 'trudny');
  localStorage.setItem(Z.KLUCZ, JSON.stringify({ v: 99 }));
  const nw = Z.wczytaj();
  assert.equal(nw.uwaga, 'nowszy'); assert.equal(nw.trwaly, false);
  localStorage.blokada = true;
  const zb = Z.wczytaj();
  assert.equal(zb.uwaga, 'brak-pamieci'); assert.equal(zb.trwaly, false);
  assert.equal(Z.zapisz(S.nowyStan()), false);
  localStorage.blokada = false;
});

test('reset usuwa tylko dane modułu Fortnite', () => {
  localStorage.m.clear();
  localStorage.setItem('kc:xp', '{"xp":40}');
  localStorage.setItem('kc:parkour', '[]');
  localStorage.setItem('kc:fortnite', '{}');
  localStorage.setItem('kc:fortnite:test', '1');
  localStorage.setItem('kc:fortniteowy', 'obcy klucz');
  assert.ok(Z.wyczysc());
  assert.deepEqual([...localStorage.m.keys()].sort(), ['kc:fortniteowy', 'kc:parkour', 'kc:xp']);
});

console.log(`\n${ok} testów logiki: OK`);
