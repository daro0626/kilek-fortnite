import { DODATKOWE_MISJE } from './misje-dodatkowe.js';

// =========================================================
// KILEK CHALLENGE: pula misji (v0.1, stan na 2026-11-23).
// Każda misja opiera się wyłącznie na mechanikach opisanych w ZRODLA.md.
// Bez nazwanego łupu sezonowego, lokacji i rzadkich zdarzeń.
// =========================================================

export const TRYBY = {
  build: { id: 'build', nazwa: 'Build', opis: 'Z budowaniem.' },
  zero: { id: 'zero', nazwa: 'Zero Build', opis: 'Bez budowania.' },
};

export const PUNKTACJA = Object.freeze({ latwy: 1, normalny: 3, trudny: 5, ekspert: 7, ekstremalny: 10, specjalna: 25 });
export const WERSJA_ZASAD = 1;
export const SKLADY = { solo: 'Solo', duo: 'Duo' };

export const TRUDNOSCI = [
  { id: 'latwy', nazwa: 'Łatwy', kod: 'ZWIAD', stopien: 1,
    opis: 'Jedna prosta czynność. Masz ją pod kontrolą.' },
  { id: 'normalny', nazwa: 'Normalny', kod: 'PATROL', stopien: 2,
    opis: 'Cel i jedna krótka reguła.' },
  { id: 'trudny', nazwa: 'Trudny', kod: 'SZTURM', stopien: 3,
    opis: 'Mierzalny cel i ograniczenie, które go utrudnia.' },
  { id: 'ekspert', nazwa: 'Ekspert', kod: 'OPERACJA', stopien: 4,
    opis: 'Warunki się gryzą. Bez planu nie przejdziesz.' },
  { id: 'ekstremalny', nazwa: 'Ekstremalny', kod: 'STREFA ZERO', stopien: 5,
    opis: 'Reguła na cały mecz i bardzo wysoki próg.' },
];

// Wspólne definicje, do których odsyłają karty.
export const SLOWNIK = {
  leczenie: 'Leczenie zdrowia = każdy przedmiot albo zdolność, którą sam uruchamiasz i która dodaje zdrowie. Podnosić wolno, używać nie. Samoczynna regeneracja się nie liczy.',
  tarcza: 'Tarcza = każdy przedmiot albo zdolność, którą sam uruchamiasz i która dodaje tarczę. Samoczynna nadtarcza w Zero Build się nie liczy.',
  skrzynia: 'Otwarcie skrzyni = przytrzymanie przycisku interakcji przy skrzyni do końca. Łup z ziemi, z pokonanych i z innych pojemników jest dozwolony.',
  miejsce: 'Miejsce odczytujesz z ekranu końca meczu. W trybie drużynowym liczy się miejsce drużyny.',
  bron: 'Broń startowa, którą gra daje wszystkim na początku, nie liczy się jako podniesiona.',
  strzelba: '„Pompa” to potocznie strzelba typu pump. W tych misjach zakaz obejmuje strzał z dowolnej strzelby, nawet jeśli spudłujesz. Podniesienie, noszenie i oddanie jej są dozwolone.',
};

const S = '2026-11-23';
const BR = ['epic-br', 'epic-zb-2026'];

const dotychczasowe = [
  // ---------------- ŁATWY ----------------
  { id: 'L01', trudnosc: 'latwy', tryby: ['build', 'zero'], tytul: 'Pierwsza krew',
    cel: 'Wyeliminuj jednego przeciwnika.',
    odKiedy: 'Od wylądowania do końca twojego meczu.',
    zaliczenie: 'Na ekranie końca meczu masz co najmniej 1 eliminację.',
    doprecyzowanie: [], wskazowka: 'Ląduj tam, gdzie widzisz kilka spadochronów, ale nie w samym tłumie.',
    zrodla: BR, sprawdzono: S },
  { id: 'L02', trudnosc: 'latwy', tryby: ['build', 'zero'], tytul: 'Najlepsza dwudziestka piątka',
    cel: 'Zajmij 25. miejsce albo wyższe.',
    odKiedy: 'Cały mecz.',
    zaliczenie: 'Ekran końca meczu pokazuje miejsce od 1 do 25.',
    doprecyzowanie: ['miejsce'], wskazowka: 'Burza zmusza do ruchu. Idź do bezpiecznej strefy wcześniej niż inni.',
    zrodla: BR, sprawdzono: S },
  { id: 'L03', trudnosc: 'latwy', tryby: ['build', 'zero'], tytul: 'Trzy skrzynie',
    cel: 'Otwórz 3 skrzynie w jednym meczu.',
    odKiedy: 'Od wylądowania.',
    zaliczenie: 'Otworzyłeś trzecią skrzynię, zanim odpadłeś.',
    doprecyzowanie: ['skrzynia'], wskazowka: 'Skrzynie słychać z bliska. Wejdź do budynku i nasłuchuj.',
    zrodla: ['epic-skrzynie', ...BR], sprawdzono: S },
  { id: 'L04', trudnosc: 'latwy', tryby: ['build', 'zero'], tytul: 'Pełny arsenał',
    cel: 'Miej naraz 3 różne bronie w ekwipunku.',
    odKiedy: 'Od wylądowania.',
    zaliczenie: 'W jednej chwili w pasku ekwipunku są 3 różne bronie.',
    doprecyzowanie: [], wskazowka: 'Broń startowa też się liczy, jeśli ją masz.',
    zrodla: BR, sprawdzono: S },
  { id: 'L05', trudnosc: 'latwy', tryby: ['build'], tytul: 'Kilof w ruchu',
    cel: 'Zbierz 200 materiałów kilofem.',
    odKiedy: 'Od wylądowania.',
    zaliczenie: 'Suma drewna, kamienia i metalu na ekranie wynosi co najmniej 200.',
    doprecyzowanie: [], wskazowka: 'Drewno idzie najszybciej. Celuj w znacznik na obiekcie.',
    zrodla: ['epic-zbieranie', 'epic-br'], sprawdzono: S },

  // ---------------- NORMALNY ----------------
  { id: 'N01', trudnosc: 'normalny', tryby: ['build', 'zero'], tytul: 'Bez apteczki',
    cel: 'Zajmij 20. miejsce albo wyższe.',
    odKiedy: 'Reguła od wylądowania: nie leczysz zdrowia.',
    zaliczenie: 'Miejsce 1–20 i ani razu nie użyłeś leczenia zdrowia.',
    doprecyzowanie: ['leczenie', 'miejsce'], wskazowka: 'Tarcze wolno pić. Zbieraj je jak najwcześniej.',
    zrodla: BR, sprawdzono: S },
  { id: 'N02', trudnosc: 'normalny', tryby: ['build', 'zero'], tytul: 'Pierwsza znaleziona',
    cel: 'Zdobądź eliminację pierwszą podniesioną bronią.',
    odKiedy: 'Od pierwszego podniesienia broni.',
    zaliczenie: 'Eliminacja padła z broni, którą podniosłeś jako pierwszą.',
    doprecyzowanie: ['bron'], wskazowka: 'Pierwszej broni nie wyrzucaj. Inne możesz mieć, ale strzelaj tą.',
    zrodla: BR, sprawdzono: S },
  { id: 'N03', trudnosc: 'normalny', tryby: ['build', 'zero'], tytul: 'Zamknięte wieka',
    cel: 'Zajmij 25. miejsce albo wyższe.',
    odKiedy: 'Reguła od wylądowania: nie otwierasz skrzyń.',
    zaliczenie: 'Miejsce 1–25 i żadnej otwartej skrzyni.',
    doprecyzowanie: ['skrzynia', 'miejsce'], wskazowka: 'Szukaj łupu na podłodze w budynkach.',
    zrodla: ['epic-skrzynie', ...BR], sprawdzono: S },
  { id: 'N04', trudnosc: 'normalny', tryby: ['build', 'zero'], tytul: 'Dwie ręce',
    cel: 'Zdobądź eliminację.',
    odKiedy: 'Reguła od wylądowania: najwyżej 2 bronie naraz.',
    zaliczenie: 'Co najmniej 1 eliminacja i nigdy więcej niż 2 bronie w ekwipunku.',
    doprecyzowanie: ['bron'], wskazowka: 'Wybierz jedną broń na bliski i jedną na daleki dystans.',
    zrodla: BR, sprawdzono: S },
  { id: 'N05', trudnosc: 'normalny', tryby: ['build'], tytul: 'Wysoka pozycja',
    cel: 'Wyeliminuj przeciwnika, stojąc na własnej budowli.',
    odKiedy: 'Od wylądowania.',
    zaliczenie: 'W chwili eliminacji stoisz na konstrukcji, którą sam postawiłeś.',
    doprecyzowanie: [], wskazowka: 'Dwie rampy i podłoga wystarczą, żeby patrzeć z góry.',
    zrodla: ['epic-zbieranie', 'epic-br'], sprawdzono: S },
  { id: 'N06', trudnosc: 'normalny', tryby: ['build', 'zero'], tytul: 'Bez pompy',
    cel: 'Dokończ mecz bez strzału z jakiejkolwiek strzelby.',
    odKiedy: 'Od początku do końca meczu.',
    zaliczenie: 'Mecz kończy się eliminacją albo zwycięstwem i masz zero strzałów ze strzelby.',
    doprecyzowanie: ['strzelba'], wskazowka: 'Zdecyduj przed lądowaniem, czym wypełnisz wolne miejsce w ekwipunku.',
    zrodla: ['epic-strzelby', 'epic-br'], sprawdzono: S },

  // ---------------- TRUDNY ----------------
  { id: 'T01', trudnosc: 'trudny', tryby: ['build', 'zero'], tytul: 'Twarda skóra',
    cel: 'Zdobądź 2 eliminacje.',
    odKiedy: 'Reguła od wylądowania: nie leczysz zdrowia i nie używasz tarcz.',
    zaliczenie: '2 eliminacje i ani jednego użytego leczenia albo tarczy.',
    doprecyzowanie: ['leczenie', 'tarcza'], wskazowka: 'Walcz z ukrycia. Każda rana zostaje do końca.',
    zrodla: BR, sprawdzono: S },
  { id: 'T02', trudnosc: 'trudny', tryby: ['build', 'zero'], tytul: 'Dziesiątka bez skrzyń',
    cel: 'Zajmij 10. miejsce albo wyższe.',
    odKiedy: 'Reguła od wylądowania: nie otwierasz skrzyń.',
    zaliczenie: 'Miejsce 1–10 i żadnej otwartej skrzyni.',
    doprecyzowanie: ['skrzynia', 'miejsce'], wskazowka: 'Łup z pokonanych jest dozwolony. To twoje główne źródło.',
    zrodla: ['epic-skrzynie', ...BR], sprawdzono: S },
  { id: 'T03', trudnosc: 'trudny', tryby: ['build', 'zero'], tytul: 'Lekki bagaż',
    cel: 'Zajmij 15. miejsce albo wyższe.',
    odKiedy: 'Reguła od wylądowania: najwyżej 2 bronie naraz.',
    zaliczenie: 'Miejsce 1–15 i nigdy więcej niż 2 bronie w ekwipunku.',
    doprecyzowanie: ['miejsce', 'bron'], wskazowka: 'Puste miejsca zajmij tarczami i leczeniem.',
    zrodla: BR, sprawdzono: S },
  { id: 'T04', trudnosc: 'trudny', tryby: ['build', 'zero'], tytul: 'Sucha stopa',
    cel: 'Zajmij 15. miejsce albo wyższe.',
    odKiedy: 'Reguła od wylądowania: ani raz nie wchodzisz do burzy.',
    zaliczenie: 'Miejsce 1–15 i ani jednego punktu obrażeń od burzy.',
    doprecyzowanie: ['miejsce'], wskazowka: 'Patrz na mapę po każdej walce. Następny krąg pokazuje się z wyprzedzeniem.',
    zrodla: BR, sprawdzono: S },
  { id: 'T05', trudnosc: 'trudny', tryby: ['build'], tytul: 'Budowniczy na urlopie',
    cel: 'Zdobądź 2 eliminacje i zajmij 20. miejsce albo wyższe.',
    odKiedy: 'Reguła od wylądowania: nie stawiasz żadnej konstrukcji.',
    zaliczenie: '2 eliminacje, miejsce 1–20 i ani jednej postawionej konstrukcji.',
    doprecyzowanie: ['miejsce'], wskazowka: 'Zbieranie materiałów jest dozwolone. Budowanie nie.',
    zrodla: ['epic-zbieranie', 'epic-br'], sprawdzono: S },
  { id: 'T06', trudnosc: 'trudny', tryby: ['build', 'zero'], tytul: 'Bez strzelby',
    cel: 'Wejdź do TOP 10 bez strzelania ze strzelby.',
    odKiedy: 'Od początku do końca meczu.',
    zaliczenie: 'Miejsce 1–10 i zero strzałów ze strzelby.',
    doprecyzowanie: ['strzelba', 'miejsce'], wskazowka: 'Wybierz trasę z osłonami, żeby móc samodzielnie decydować o dystansie w grze.',
    zrodla: ['epic-strzelby', 'epic-br'], sprawdzono: S },

  // ---------------- EKSPERT ----------------
  { id: 'X01', trudnosc: 'ekspert', tryby: ['build', 'zero'], tytul: 'Cień',
    cel: 'Zajmij 10. miejsce albo wyższe bez żadnej eliminacji.',
    odKiedy: 'Cały mecz.',
    zaliczenie: 'Miejsce 1–10 i dokładnie 0 eliminacji.',
    doprecyzowanie: ['miejsce'], wskazowka: 'Uciekaj z walk, zanim się zaczną. Strzelać możesz, wykańczać nie.',
    zrodla: BR, sprawdzono: S },
  { id: 'X02', trudnosc: 'ekspert', tryby: ['build', 'zero'], tytul: 'Łowca bez apteczki',
    cel: 'Zdobądź 3 eliminacje i zajmij 10. miejsce albo wyższe.',
    odKiedy: 'Reguła od wylądowania: nie leczysz zdrowia.',
    zaliczenie: '3 eliminacje, miejsce 1–10 i ani jednego leczenia zdrowia.',
    doprecyzowanie: ['leczenie', 'miejsce'], wskazowka: 'Tarcza to twoje jedyne życie zapasowe. Zbieraj każdą.',
    zrodla: BR, sprawdzono: S },
  { id: 'X03', trudnosc: 'ekspert', tryby: ['build', 'zero'], tytul: 'Jedna skrzynia',
    cel: 'Zdobądź 2 eliminacje, otwierając dokładnie 1 skrzynię.',
    odKiedy: 'Reguła od wylądowania.',
    zaliczenie: '2 eliminacje i dokładnie 1 otwarta skrzynia w całym meczu.',
    doprecyzowanie: ['skrzynia'], wskazowka: 'Zaplanuj, którą skrzynię otworzysz. Nie zużyj jej od razu.',
    zrodla: ['epic-skrzynie', ...BR], sprawdzono: S },
  { id: 'X04', trudnosc: 'ekspert', tryby: ['build', 'zero'], tytul: 'Dwa miejsca w plecaku',
    cel: 'Zajmij 10. miejsce albo wyższe.',
    odKiedy: 'Reguła od wylądowania: najwyżej 2 zajęte miejsca w pasku ekwipunku.',
    zaliczenie: 'Miejsce 1–10 i nigdy więcej niż 2 zajęte miejsca w pasku.',
    doprecyzowanie: ['miejsce'], wskazowka: 'Broń i tarcza czy dwie bronie? Zdecyduj przed lądowaniem.',
    zrodla: BR, sprawdzono: S },
  { id: 'X05', trudnosc: 'ekspert', tryby: ['zero'], tytul: 'Bez osłony',
    cel: 'Zdobądź 3 eliminacje i zajmij 15. miejsce albo wyższe.',
    odKiedy: 'Reguła od wylądowania: nie używasz tarcz.',
    zaliczenie: '3 eliminacje, miejsce 1–15 i ani jednej użytej tarczy.',
    doprecyzowanie: ['tarcza', 'miejsce'], wskazowka: 'Samoczynna nadtarcza Zero Build działa. Daj jej czas po walce.',
    zrodla: BR, sprawdzono: S },
  { id: 'X06', trudnosc: 'ekspert', tryby: ['build', 'zero'], tytul: 'Bez strzelby, z eliminacjami',
    cel: 'Zdobądź 3 eliminacje i wejdź do TOP 10 bez strzelby.',
    odKiedy: 'Od początku do końca meczu.',
    zaliczenie: 'Co najmniej 3 eliminacje, miejsce 1–10 i zero strzałów ze strzelby.',
    doprecyzowanie: ['strzelba', 'miejsce'], wskazowka: 'Dobierz wyposażenie na więcej niż jedną odległość.',
    zrodla: ['epic-strzelby', 'epic-br'], sprawdzono: S },

  // ---------------- EKSTREMALNY ----------------
  { id: 'E01', trudnosc: 'ekstremalny', tryby: ['build', 'zero'], tytul: 'Korona bez apteczki',
    cel: 'Wygraj bez leczenia zdrowia i zdobądź co najmniej 4 eliminacje.',
    odKiedy: 'Reguła przez cały mecz.',
    zaliczenie: 'Victory Royale, co najmniej 4 eliminacje i ani jednego leczenia zdrowia.',
    doprecyzowanie: ['leczenie'], wskazowka: 'Graj na tarczach i unikaj otwartego terenu.',
    zrodla: BR, sprawdzono: S },
  { id: 'E02', trudnosc: 'ekstremalny', tryby: ['build', 'zero'], tytul: 'Piątka bez skrzyń',
    cel: 'Zdobądź co najmniej 5 eliminacji i miejsce 1–2 bez otwierania skrzyń.',
    odKiedy: 'Reguła przez cały mecz: nie otwierasz skrzyń.',
    zaliczenie: 'Minimum 5 eliminacji, miejsce 1–2 i żadnej samodzielnie otwartej skrzyni.',
    doprecyzowanie: ['skrzynia', 'miejsce'], wskazowka: 'Pierwszą walkę wygraj łupem z podłogi. Potem żyj z pokonanych.',
    zrodla: ['epic-skrzynie', ...BR], sprawdzono: S },
  { id: 'E03', trudnosc: 'ekstremalny', tryby: ['build', 'zero'], tytul: 'Wierny jednej broni',
    cel: 'Wygraj i zdobądź co najmniej 3 eliminacje, strzelając wyłącznie z pierwszej podniesionej broni.',
    odKiedy: 'Reguła od pierwszego podniesienia broni do końca meczu.',
    zaliczenie: 'Victory Royale, minimum 3 eliminacje i zero strzałów z innych broni.',
    doprecyzowanie: ['bron', 'miejsce'], wskazowka: 'Inne bronie możesz nosić. Strzelać nimi nie.',
    zrodla: BR, sprawdzono: S },
  { id: 'E04', trudnosc: 'ekstremalny', tryby: ['build', 'zero'], tytul: 'Oko burzy',
    cel: 'Zajmij miejsce 1–2 z co najmniej 4 eliminacjami.',
    odKiedy: 'Reguła przez cały mecz: bez obrażeń od burzy i bez leczenia zdrowia.',
    zaliczenie: 'Miejsce 1–2, minimum 4 eliminacje, zero obrażeń od burzy i ani jednego leczenia zdrowia.',
    doprecyzowanie: ['leczenie', 'miejsce'], wskazowka: 'Wejdź w środek kręgu wcześnie i trzymaj pozycję.',
    zrodla: BR, sprawdzono: S },
  { id: 'E05', trudnosc: 'ekstremalny', tryby: ['build'], tytul: 'Zero w trybie Build',
    cel: 'Wygraj Build z co najmniej 4 eliminacjami bez budowania.',
    odKiedy: 'Reguła przez cały mecz: nie stawiasz żadnej konstrukcji.',
    zaliczenie: 'Victory Royale, minimum 4 eliminacje i ani jednej postawionej konstrukcji.',
    doprecyzowanie: ['miejsce'], wskazowka: 'Inni budują. Ty szukasz naturalnych osłon i flanek.',
    zrodla: ['epic-zbieranie', 'epic-br'], sprawdzono: S },
  { id: 'E06', trudnosc: 'ekstremalny', tryby: ['build', 'zero'], tytul: 'Wygraj bez strzelby',
    cel: 'Zdobądź Victory Royale bez strzału ze strzelby.',
    odKiedy: 'Od początku do końca meczu.',
    zaliczenie: 'Victory Royale i zero strzałów z jakiejkolwiek strzelby.',
    doprecyzowanie: ['strzelba'], wskazowka: 'Ułóż ekwipunek z myślą o końcówce, zanim strefa zmusi cię do zmiany pozycji.',
    zrodla: ['epic-strzelby', 'epic-br'], sprawdzono: S },
];

export const MISJE = [
  ...dotychczasowe.map(m => ({
    ...m,
    sklady: ['solo', 'duo'],
    kategoria: m.doprecyzowanie.includes('strzelba') ? 'Bez strzelby'
      : m.tryby.length === 1 ? TRYBY[m.tryby[0]].nazwa : 'Taktyka',
    weryfikacja: 'Mechaniki Battle Royale udokumentowane w źródłach. Wynik oceniają gracze.',
  })),
  ...DODATKOWE_MISJE,
];

export const LEGENDARNA = Object.freeze({
  id: 'S01', tytul: 'Wygraj bez broni', trudnosc: 'specjalna', kategoria: 'Bez broni',
  tryby: ['build', 'zero'], sklady: ['solo', 'duo'], odKiedy: 'Od początku do końca meczu.',
  cel: 'Zdobądź Victory Royale bez podnoszenia ani noszenia broni i bez atakowania rywali.',
  zaliczenie: 'Victory Royale, żadnej podniesionej broni i zero ataków lub obrażeń przeciwników bronią, kilofem, ofensywnym przedmiotem albo zdolnością.',
  wskazowka: 'Automatycznie przyznaną broń natychmiast odrzuć bez użycia. Leczenie, osłony i mobilność są dozwolone, o ile nie służą do zaatakowania rywala.',
  doprecyzowanie: [], zrodla: ['epic-br'], sprawdzono: '2026-11-23',
  weryfikacja: 'Solo i Duo w Battle Royale. Zasady specjalne rozliczane ręcznie. Karta niewykonalna może zostać pominięta.',
});

const poId = new Map([...MISJE, LEGENDARNA].map(m => [m.id, m]));
export const MIN_KART = 4;
export const misja = id => poId.get(id) ?? null;
export const trudnosc = id => TRUDNOSCI.find(t => t.id === id) ||
  (id === 'specjalna' ? { id, nazwa: 'Legendarna', kod: 'MISJA SPECJALNA' } : null);
export const pula = (tryb, trud, sklad = 'solo') => MISJE.filter(m =>
  m.trudnosc === trud && m.tryby.includes(tryb) && m.sklady.includes(sklad));
export const dostepna = (tryb, trud, sklad = 'solo') => pula(tryb, trud, sklad).length >= MIN_KART;
