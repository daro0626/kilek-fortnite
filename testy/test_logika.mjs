// Testy logiki KILEK CHALLENGE. Uruchom: node testy/test_logika.mjs
// Nie potrzebują przeglądarki ani sieci. Niczego nie zapisują do repozytorium.
import assert from 'node:assert/strict';
import { MISJE, TRYBY, TRUDNOSCI, pula, dostepna, MIN_KART, SLOWNIK, PUNKTACJA, LEGENDARNA, SKLADY } from '../js/misje.js';
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
  assert.ok(MISJE.length >= 100);
  assert.equal(new Set(MISJE.map(m => [m.cel, m.zaliczenie].join('|'))).size, MISJE.length);
  assert.equal(new Set(MISJE.map(m => m.tytul)).size, MISJE.length);
  assert.ok(!ids.has(LEGENDARNA.id));
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
  for (const t of Object.keys(TRYBY)) for (const d of TRUDNOSCI) for (const sklad of Object.keys(SKLADY)) {
    assert.ok(pula(t, d.id, sklad).length >= MIN_KART, `${t}/${d.id}: ${pula(t, d.id).length}`);
    assert.ok(dostepna(t, d.id, sklad));
    assert.ok(pula(t, d.id, sklad).every(m => m.tryby.includes(t) && m.trudnosc === d.id && m.sklady.includes(sklad)));
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
    assert.deepEqual(S.punkty(s), [2 * PUNKTACJA[d.id], 2 * PUNKTACJA[d.id]]);
    assert.equal(S.zwyciezca(s), null, 'remis');
  }
});

test('wymiana: jedna na rundę, karta wraca dopiero po wykorzystaniu puli', () => {
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
  s = rozegrajRunde(s);
  assert.equal(s.seria.wymiana, false);
  assert.ok(S.mozeWymienic(S.odkryj(s)));
  for (let i = 0; i < 2; i++) s = rozegrajRunde(s);
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
  assert.deepEqual(S.punkty(s), [21, 21]);
  assert.equal(S.rozegrane(s).length, 3);
});

test('nieukończona runda nie trafia do historii po zakończeniu serii', () => {
  let s = rozegrajRunde(start('zero', 'latwy'), 1, 0);
  s = S.ustawWynik(S.doRozliczenia(S.odkryj(s)), 0, 1);
  assert.deepEqual(S.punkty(s), [1, 0]);
  s = S.zakonczWczesniej(s);
  assert.equal(s.etap, 'final');
  assert.equal(s.seria.koniec, 'wczesniej');
  assert.deepEqual(S.punkty(s), [1, 0]);
  assert.equal(s.historia[0].rundy.length, 1);
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

test('migracja v1 i v2 zamraża starsze warunki i rzeczywistą punktację legacy', () => {
  for (const v of [1, 2]) {
    const stary = { v, etap: 'karta', gracze: ['Alfa', 'Beta'], tryb: 'build', trudnosc: 'ekstremalny', ostatnia: 'E01',
      seria: { pokazane: ['E01', 'E02'], rundy: [{ karta: 'E01', wyniki: [1, 1], odkryta: true }, { karta: 'E02', wyniki: [null, null], odkryta: true }] }};
    if (v === 2) stary.sposob = 'seria';
    localStorage.setItem(Z.KLUCZ, JSON.stringify(stary));
    const wynik = Z.wczytaj();
    assert.equal(wynik.uwaga, 'starszy');
    assert.deepEqual(wynik.stan.gracze, ['Alfa', 'Beta']);
    assert.equal(S.runda(wynik.stan).karta, 'E02');
    assert.equal(S.runda(wynik.stan).wersjaZasad, 0);
    assert.match(S.misjaRundy(S.runda(wynik.stan)).zaliczenie, /1–5/);
    assert.deepEqual(S.punkty(wynik.stan), [1, 1]);
    assert.equal(JSON.parse(localStorage.getItem(Z.KLUCZ)).v, v);
    const nowy = rozegrajRunde(wynik.stan, 1, 0);
    assert.deepEqual(S.punkty(nowy), [2, 1]);
    assert.equal(S.wartoscRundy(S.runda(nowy)), 10);
  }
});

test('stara karta bez strzelby zachowuje warunek TOP 10 w aktywnej grze i archiwum', () => {
  const stary = { v: 2, etap: 'karta', tryb: 'build', trudnosc: 'ekstremalny',
    seria: { pokazane: ['E06'], rundy: [{ karta: 'E06', wyniki: [null, null], odkryta: true }] } };
  const stan = S.migruj(stary);
  assert.match(S.runda(stan).opis.cel, /TOP 10/);
  assert.equal(S.runda(stan).punkty, 1);
  const finisz = S.zakonczWczesniej(rozegrajRunde(stan, 1, 0));
  finisz.historia[0].rundy[0].opis.cel = 'Zdobądź Victory Royale bez strzału ze strzelby.';
  const naprawiony = S.migruj(finisz);
  assert.match(naprawiony.historia[0].rundy[0].opis.cel, /TOP 10/);
  assert.deepEqual(naprawiony.historia[0].punkty, [1, 0]);
});

test('legendarna: wybór ręczny, 25:25 i idempotentna korekta historii', () => {
  let s = S.rozpocznij(S.nowyStan(), 'seria', true);
  assert.equal(S.runda(s).karta, LEGENDARNA.id);
  assert.equal(S.wartoscRundy(S.runda(s)), 25);
  assert.equal(S.wybierzSpecjalna(s), s);
  assert.equal(S.mozeWymienic(S.odkryj(s)), false);
  s = rozegrajRunde(s, 1, 1);
  assert.deepEqual(S.punkty(s), [25, 25]);
  assert.equal(S.zatwierdz(s), s);
  const id = s.historia[0].id;
  s = S.ustawWynik(s, 1, 0, 0);
  assert.deepEqual(s.historia[0].punkty, [25, 0]);
  assert.equal(s.historia.length, 1);
  assert.equal(s.historia[0].id, id);
  const re = S.rewanz(s);
  assert.equal(S.runda(re).karta, LEGENDARNA.id);
  assert.deepEqual(S.punkty(re), [0, 0]);
  assert.equal(re.historia.length, 1);
});

test('duet: wspólny wynik daje 25 raz, a drużynowa pula nie trafia do Solo', () => {
  let s = S.rozpocznij(S.nowyStan(), 'duet', true);
  assert.equal(s.sklad, 'duo');
  assert.equal(S.liczbaWynikow(s), 1);
  s = S.doRozliczenia(S.graj(S.odkryj(s)));
  assert.equal(S.ustawWynik(s, 1, 1), s);
  s = S.zatwierdz(S.ustawWynik(s, 0, 1));
  assert.deepEqual(S.punkty(s), [25]);
  assert.deepEqual(s.historia[0].punkty, [25]);
  const druzynowe = MISJE.filter(m => !m.sklady.includes('solo'));
  assert.ok(druzynowe.length >= 10);
  assert.ok(druzynowe.every(m => !pula('build', m.trudnosc, 'solo').includes(m)));
});

test('limity 5, 10 i otwarta seria oraz dowolne wymiany', () => {
  for (const limit of [5, 10, 0]) {
    let s = S.rozpocznij(S.ustawOpcje(S.ustawOpcje(S.nowyStan(), 'limit', limit), 'wymianyDowolne', true));
    for (let i = 0; i < 3; i++) {
      assert.ok(S.mozeWymienic(s));
      s = S.wymien(s);
    }
    for (let i = 0; i < (limit || 20); i++) {
      assert.equal(s.etap, 'odkrycie');
      s = rozegrajRunde(s);
    }
    assert.equal(s.etap, limit ? 'final' : 'odkrycie');
    assert.deepEqual(S.punkty(s), [limit || 20, 0]);
  }
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
