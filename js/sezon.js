import { AKTUALNOSCI, EPIC } from './wiedza-dane.js';
import { PLAYLISTY, SPRZET } from './sprzet-dane.js';
import { miniaturaSprzetu } from './zbrojownia.js';

const zapowiedz = 'https://www.fortnite.com/news/fortnite-treasure-hunters-the-greatest-adventure-of-all-time';
const link = (url, tekst) => `<a href="${url}">${tekst}</a>`;
const sprawdzono = '<p class="sezon-data">Ostatnia weryfikacja 24.11.2026</p>';
const szczegoly = [
  ['Wyspa Kościotrupów', 'Fortuna, porty i ukryte przejścia', 'Crossbones Isle ma mecze dla 80 graczy. W Fort Fortuna szukaj łupu w bastionach. Na Captain’s Cenote wypatruj zapadliska z basenem.', 'wyspa-kosci', 'Skaliste wybrzeże Wyspy Kościotrupów i wielka czaszka', EPIC.sezon],
  ['Ślad ukrytego skarbu', 'List gończy prowadzi dalej', 'Rozglądaj się za listem gończym na ścianie. Zerwanie listu daje Duszkową Mapę Skarbów, która prowadzi do zakopanej skrzyni. W aktualizacji 43.10 Epic poprawił końcowe uderzenie przy odkopywaniu.', 'wyspa-fort', 'Zabudowania na Wyspie Kościotrupów po zmroku', EPIC.sezon],
];
const osCzasu = [
  ['01.11','Start Łowców Skarbów','Nowa wyspa, armaty i współpraca z One Piece. Epic zapowiedział rotacje sprzętu w ramach Dni Kapitana.', zapowiedz],
  ['12.11','Buggy i zmiana łupów','W v43.10 broń pokonanego bossa wypada gwarantowanie. Część egzotycznych broni może pojawiać się w skrzyniach.', EPIC.br],
  ['15.11','Dzień Kapitana w Friendship Villa','Epic podał powrót karabinu naleśnikowego, pojawienie się Leekcappera i trzeci fragment mapy.', EPIC.br],
  ['22.11','Dzień Kapitana Oscara','Epic zapowiedział Oscara na The Tiger’s Eye. Jego strzelba Furia i duszek Sir Oscar II pojawiły się w ogłoszeniu wydarzenia.', EPIC.oscar],
  ['28.11','Start Złotego Tygodnia','Epic zapowiedział w Battle Royale powrót złotych nagród ze wcześniejszych tygodni. Wydarzenie rusza o 15:00 czasu polskiego i potrwa do finału rozdziału.', EPIC.zlotyTydzien],
  ['05.12','Zapowiedziany finał rozdziału 7','Epic zapowiedział finał i Złoty Dzień Społeczności. Godzina 15:00 w ogłoszeniu dotyczy startu nagród dnia.', EPIC.zlotyTydzien],
];
const playlisty = [
  ['br','Wyspa, armaty i skrzynie', 'Na Wyspie Kościotrupów wracają niektóre bronie, a skrzynie z czasem uzupełniają łup. Epic podał, że sztabki złota wycofano. W v43.10 zmieniły się też nagrody od bossów.', EPIC.sezon],
  ['zero','Osłony z terenu i przedmioty kieszonkowe', 'W notatkach startowych Epic zostawił kieszonkomaty w Zero Build. Wśród przedmiotów kieszonkowych wymienił granat szokofalowy, Port-A-Bunkier i Małą Bańkosłonę.', EPIC.sezon],
  ['reload','Osobna rotacja map', 'W v43.00 Epic wymienia Wyścigówę Usoppa, Bundlebussa i Gilded Dragoon. Aktualną mapę i łup sprawdź w Reaktywacji.', EPIC.reload],
  ['blitz','Złote skrzynie i zrzuty', 'W v43.00 złote zrzuty zawierały m.in. legendarne warianty Wyścigówy, Bundlebussa i Gilded Dragoon. Przed meczem sprawdź aktualną rotację Blitz.', EPIC.blitz],
];

export function sezon(root) {
  if (root.firstElementChild) return;
  const kolekcja = ['furia-oscara','flapjack','flint','hammer','dragoon','bundlebuss','usopp','kula'].map(id => SPRZET.find(s => s.id === id));
  root.innerHTML = `
  <section class="sezon-sekcja" aria-labelledby="sezon-miejsca">
    <header><h2 id="sezon-miejsca">Co odkryjesz na wyspie</h2>${sprawdzono}</header>
    <div class="sezon-pola">${szczegoly.map(([n,t,o,p,alt,url]) => `<article class="sezon-miejsce wiedza-panel">
      <img width="1240" height="698" loading="lazy" decoding="async" src="assets/fortnite/${p}.webp" alt="${alt}">
      <div><p class="znacznik">${n}</p><h3>${t}</h3><p>${o}</p>${link(url,'Źródło Epic')}</div>
    </article>`).join('')}</div>
    <p class="nota">Grafiki wyspy opublikował Epic Games w ${link(zapowiedz,'zapowiedzi Łowców Skarbów')}. Poprawki odkopywania opisano w ${link(EPIC.br,'notatkach v43.10')}.</p>
  </section>
  <section class="sezon-sekcja" aria-labelledby="sezon-sprzet">
    <header><h2 id="sezon-sprzet">Broń i przedmioty sezonu</h2>${sprawdzono}</header>
    <div class="sezon-sprzet">${kolekcja.map(s => `<a class="sezon-przedmiot" href="#zbrojownia/${s.id}">
      ${miniaturaSprzetu(s)}<span><strong>${s.nazwa}</strong><small>${s.typ}</small></span>
    </a>`).join('')}</div>
  </section>
  <section class="sezon-sekcja" aria-labelledby="sezon-playlisty">
    <header><h2 id="sezon-playlisty">Co znajdziesz w swoim trybie</h2>${sprawdzono}</header>
    <div class="sezon-playlisty">${playlisty.map(([id,n,o,url]) => `<article class="wiedza-panel">
      <p class="znacznik">${PLAYLISTY[id]}</p><h3>${n}</h3><p>${o}</p>${link(url,'Notatki Epic')}
    </article>`).join('')}</div>
  </section>
  <section class="sezon-sekcja" aria-labelledby="sezon-daty">
    <header><h2 id="sezon-daty">Dni Kapitanów i finał</h2>${sprawdzono}</header>
    <ol class="sezon-os">${osCzasu.map(([d,n,o,url]) => `<li><span>${d}</span><div><h3>${n}</h3><p>${o}</p>${link(url,'Ogłoszenie Epic')}</div></li>`).join('')}</ol>
  </section>
  <details class="sezon-archiwum wiedza-panel"><summary>Archiwum notatek sezonu</summary>
    <ul>${AKTUALNOSCI.map(n => `<li><strong>${n.data} · ${n.tryb}</strong> — ${n.opis} ${link(n.zrodlo,'Notatka Epic')}</li>`).join('')}</ul>
  </details>`;
}
