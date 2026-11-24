import { EPIC } from './wiedza-dane.js';

export const WERYFIKACJA = '23.11.2026';
export const RZADKOSCI = {
  zwykla: 'Zwykła', niepospolita: 'Niepospolita', rzadka: 'Rzadka',
  epicka: 'Epicka', legendarna: 'Legendarna', mityczna: 'Mityczna',
  nieznana: 'Brak potwierdzonej rzadkości',
};
export const PLAYLISTY = {
  br: 'Battle Royale', zero: 'Zero Build', reload: 'Reaktywacja', blitz: 'Blitz Royale',
};
export const ZRODLA_SPRZETU = {
  sezon: EPIC.sezon,
  br: EPIC.br,
  reload: EPIC.reload,
  blitz: EPIC.blitz,
  flint: 'https://www.fortnite.com/news/patch-notes-v8-11',
  hammer: 'https://www.fortnite.com/news/whats-new-in-fortnite-battle-royale-chapter-3-season-3-vibin?lang=en-US',
  flap: 'https://www.fortnite.com/news/whats-new-in-fortnite-battle-royale-chapter-4-season-3-wilds?lang=en-US',
};

export const METRYKI = [
  ['obrazenia', 'Obrażenia w korpus', ''],
  ['tempo', 'Strzały na sekundę', ''],
  ['magazynek', 'Pojemność', ''],
  ['przeladowanie', 'Przeładowanie', ' s'],
  ['pelny', 'Pełne obrażenia do', ' m'],
  ['daleko', 'Obrażenia po spadku', ''],
];

function daneBR(slug, parametry, zasieg, nota = 'Pula opisana w bieżącym sezonie.') {
  return parametry.map(([rzadkosc, obrazenia, tempo, magazynek, przeladowanie, daleko]) => ({
    id: 'br-' + rzadkosc,
    rzadkosc,
    tryby: ['br', 'zero'],
    status: 'potwierdzony',
    wersja: 'Łowcy Skarbów · odczyt puli 23.11',
    nota,
    statystyki: { obrazenia, tempo, magazynek, przeladowanie, pelny: zasieg[0], daleko },
    odlegloscSpadku: zasieg[1],
    zrodlo: 'https://fortnite.gg/weapons/weapon/' + slug + '?mode=battle-royale',
    nazwaZrodla: 'Fortnite.GG · Battle Royale',
  }));
}

function notatka(tryb, rzadkosc, tekst, wersja = 'v43.00') {
  return {
    id: tryb + '-' + rzadkosc,
    rzadkosc,
    tryby: [tryb],
    status: 'sprawdz',
    wersja,
    nota: tekst,
    zrodlo: ZRODLA_SPRZETU[tryb],
    nazwaZrodla: 'Notatki Epic · ' + PLAYLISTY[tryb],
  };
}

const zloteZrzuty = rzadkosc => notatka('blitz', rzadkosc,
  'Epic wymienił tę rzadkość w złotych zrzutach w v43.00. Sprawdź bieżącą rotację Blitz.');
const wReaktywacji = notatka('reload', 'nieznana',
  'Epic wymienił ten przedmiot w puli Reaktywacji v43.00. Sprawdź aktualną mapę i rotację łupów.');

export const SPRZET = [
  {
    id: 'flint', nazwa: 'Pistolet krzemieniowy', oryginal: 'Flint-Knock Pistol', typ: 'Pistolet',
    opis: 'Jednostrzałowy pistolet, którego odrzut może przemieścić gracza.',
    zalety: 'Silne pojedyncze trafienie. Odrzut przydaje się przy zmianie położenia.',
    ograniczenia: 'Po strzale musisz przeładować. Odrzut przy krawędzi może zrzucić cię niżej.',
    wskazowka: 'Przed strzałem sprawdź, gdzie wylądujesz. Kolejną próbę przygotuj za osłoną.',
    oficjalne: ['sezon', 'flint'],
    warianty: [
      ...daneBR('flint-knock-pistol', [
        ['zwykla',81,.33,1,3.19,40.5], ['niepospolita',86,.33,1,3.05,43],
        ['rzadka',90,.33,1,2.90,45], ['epicka',95,.33,1,2.76,47.5],
      ], [20,45]),
      ...[['zwykla',86],['niepospolita',90]].map(([rzadkosc, obrazenia]) => ({
        id: 'archiwum-' + rzadkosc, rzadkosc, tryby: ['br'], status: 'archiwum', wersja: 'v8.11 · 20.03.2019',
        nota: 'Dane z premiery pistoletu. W aktualnym sezonie sprawdź kartę Łowców Skarbów.',
        statystyki: { obrazenia, magazynek: 1, przeladowanie: 3 },
        zrodlo: ZRODLA_SPRZETU.flint, nazwaZrodla: 'Epic · premiera v8.11',
      })),
    ],
  },
  {
    id: 'flapjack', nazwa: 'Karabin naleśnikowy', oryginal: 'Flapjack Rifle', typ: 'Karabin',
    opis: 'Karabin z dużym magazynkiem. Epic zapowiedział jego powrót na Dzień Kapitana 15 listopada.',
    zalety: 'Długi ostrzał przed przeładowaniem.',
    ograniczenia: 'Przeładowanie zajmuje kilka sekund. Na dużej odległości spadają obrażenia.',
    wskazowka: 'Wypatruj go w puli łupów Battle Royale po zmianie z 15.11. Przeładowuj za osłoną.',
    oficjalne: ['br', 'flap'],
    warianty: daneBR('flapjack-rifle', [
      ['zwykla',25,6.3,45,3.58,21.3], ['niepospolita',27,6.3,45,3.41,23],
      ['rzadka',28,6.3,45,3.25,23.8], ['epicka',29,6.3,45,3.09,24.7],
      ['legendarna',31,6.3,45,2.93,26.4],
    ], [50,100], 'Epic potwierdził powrót do puli 15.11.2026.'),
  },
  {
    id: 'hammer', nazwa: 'Karabin szturmowy Młot', oryginal: 'Hammer Assault Rifle', typ: 'Karabin',
    opis: 'Automatyczny karabin, który wrócił do puli na starcie Łowców Skarbów.',
    zalety: 'Uniwersalny na średnim dystansie.',
    ograniczenia: 'Przy długim strzelaniu musisz kontrolować odrzut i zapas amunicji.',
    wskazowka: 'Zacznij od krótkich serii. W Blitz wypatruj mitycznej wersji tylko przy właściwej rotacji złotych zrzutów.',
    oficjalne: ['sezon','br','hammer'],
    warianty: [
      ...daneBR('hammer-assault-rifle', [
        ['zwykla',27,5.8,20,2.42,24.3], ['niepospolita',29,5.8,20,2.31,26.1],
        ['rzadka',30,5.8,20,2.20,27], ['epicka',32,5.8,20,2.09,28.8],
        ['legendarna',33,5.8,20,1.98,29.7],
      ], [50,100]),
      zloteZrzuty('mityczna'),
    ],
  },
  {
    id: 'dragoon', nazwa: 'Strzelba Gilded Dragoon', oryginal: 'Gilded Dragoon Shotgun', typ: 'Strzelba',
    opis: 'Jednostrzałowa strzelba z Łowców Skarbów.',
    zalety: 'Jeden celny strzał potrafi zadać duże obrażenia z bliska.',
    ograniczenia: 'Po każdym strzale musisz przeładować.',
    wskazowka: 'Przed wychyleniem wybierz miejsce, za które wrócisz po strzale.',
    oficjalne: ['sezon','reload','blitz'],
    warianty: [
      ...daneBR('gilded-dragoon-shotgun', [
        ['niepospolita',142,1,1,1.94,71], ['rzadka',149,1,1,1.85,74.5],
        ['epicka',156,1,1,1.76,78], ['legendarna',164,1,1,1.67,82],
      ], [8,22]), wReaktywacji, zloteZrzuty('legendarna'),
    ],
  },
  {
    id: 'bundlebuss', nazwa: 'Karabin powtarzalny Bundlebuss', oryginal: 'Bundlebuss Repeater Rifle', typ: 'Karabin',
    opis: 'Szybkostrzelny karabin automatyczny. Epic wskazuje średni dystans jako jego mocną stronę.',
    zalety: 'Sprawnie utrzymuje serię trafień na średnim dystansie.',
    ograniczenia: 'Wysokie tempo szybko zużywa amunicję.',
    wskazowka: 'Oszczędzaj amunicję, kończąc serię, gdy przeciwnik znika za osłoną.',
    oficjalne: ['sezon','reload','blitz'],
    warianty: [
      ...daneBR('bundlebuss-repeater-rifle', [
        ['niepospolita',20,8.5,32,2.89,16.5], ['rzadka',21,8.5,32,2.75,17.3],
        ['epicka',22,8.5,32,2.61,18.2], ['legendarna',23,8.5,32,2.48,19],
      ], [50,100]), wReaktywacji, zloteZrzuty('legendarna'),
    ],
  },
  {
    id: 'usopp', nazwa: 'Wyścigówa Usoppa', oryginal: 'Usopp’s Slingshot', typ: 'Broń specjalna',
    opis: 'Proca z One Piece. Epic opisuje naciągnięcie, wycelowanie i wypuszczenie ciężkiego pocisku.',
    zalety: 'Możesz przygotować celny strzał z dystansu.',
    ograniczenia: 'Naciąganie zabiera czas. Przedmiot i jego odmiany zależą od playlisty.',
    wskazowka: 'Naciągnij procę za osłoną. Sprawdź nazwę i rzadkość na karcie przedmiotu w grze.',
    oficjalne: ['sezon','br','reload','blitz'],
    warianty: [
      { ...notatka('br','nieznana','Epic wymienił procę na starcie sezonu. Dostępność w konkretnym meczu może się różnić.'),
        id: 'br-proca', tryby: ['br','zero'], zrodlo: EPIC.sezon, nazwaZrodla: 'Epic · start Łowców Skarbów', status: 'potwierdzony' },
      { ...notatka('br','nieznana','Epic opisał poprawkę automatycznego podnoszenia odmiany Galaxy. Bieżąca rotacja i parametry wymagają potwierdzenia.', 'v43.10'),
        id: 'br-galaxy', nazwa: 'Odmiana Galaxy', tryby: ['br','zero'] },
      wReaktywacji, zloteZrzuty('legendarna'),
    ],
  },
  {
    id: 'kula', nazwa: 'Wybuchowa kula armatnia', oryginal: 'Explosive Cannon Ball', typ: 'Przedmiot',
    opis: 'Przedmiot do rzucania, który w Battle Royale można też załadować do armaty.',
    zalety: 'Dwa zastosowania na Wyspie Kościotrupów.',
    ograniczenia: 'Epic podaje dostępność poza rozgrywkami rywalizacyjnymi.',
    wskazowka: 'Sprawdź, czy wybrano zwykły mecz. Miej plan zejścia z pokładu po użyciu armaty.',
    oficjalne: ['sezon','reload'],
    warianty: [
      { ...notatka('br','nieznana','Potwierdzona w publikacji startowej dla gry poza rywalizacją.'),
        id: 'br-kula', tryby: ['br','zero'], zrodlo: EPIC.sezon, nazwaZrodla: 'Epic · start Łowców Skarbów', status: 'potwierdzony' },
      notatka('reload','nieznana','W v43.00 dostępna w rozgrywce nierywalizacyjnej.'),
    ],
  },
];
