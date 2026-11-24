# Źródła KILEK CHALLENGE (stan: 23 listopada 2026)

Identyfikatory w polu `zrodla` w katalogu misji odsyłają do poniższych materiałów. Cele i zasady punktowane są autorskimi wyzwaniami.

## Fakty o grze

| Klucz | Fakt | Źródło | Zakres | Sprawdzono |
|---|---|---|---|---|
| `epic-br` | Battle Royale: zamykająca się burza, cel to zostać ostatnim i zdobyć Victory Royale. Zero Build to ta sama rozgrywka bez budowania. W trybie rankingowym liczą się eliminacje i miejsce. | https://www.fortnite.com/@epic/battle-royale (oficjalny opis wyspy) | wszystkie karty | 2026-11-23 |
| `epic-zb-2026` | W opisywanym eksperymencie Zero Build gracz zaczyna z pistoletem, małą miksturą tarczy i „Pocket Item” (np. granat z leczącą mgiełką). Eliminacje odnawiają nadtarczę. Śmiertelny upadek w meczach nierankingowych już nie eliminuje (Build i Zero Build). | https://communities.epicgames.com/thread/showdown-act-iii-moving-into-the-next-era-for-zero-build/5FiD (wpis zespołu Epic, sezon 2 rozdziału 7) | definicje „broń startowa”, „leczenie”, „tarcza” | 2026-11-23, wpis opisuje eksperyment, **może się zmienić** |
| `epic-skrzynie` | W Battle Royale są skrzynie ze skarbami, które się otwiera; łup leży też na ziemi. | https://www.fortnite.com/patch-notes/v4-3 ; https://www.fortnite.com/news/v3-4-patch-notes | L03, N03, T02, X03, E02 | 2026-11-23; oficjalne, ale z 2018 r. **Potwierdzić w pierwszym meczu** |
| `epic-zbieranie` | W trybie Build zbierasz materiały kilofem (narzędzie do zbierania) i stawiasz z nich konstrukcje. | https://www.fortnite.com/patch-notes/v4-3 ; https://www.fortnite.com/news/v3-4-patch-notes ; https://store.epicgames.com/p/fortnite („build up in Fortnite Battle Royale or go no-builds in Fortnite Zero Build”) | L05, N05, T05, E05 | 2026-11-23 |
| `epic-strzelby` | Epic wyróżnia rodzinę Shotguns i typ Pump Shotgun. Karty zabraniają strzału z całej rodziny w Build i Zero Build. | https://www.fortnite.com/news/fortnite-battle-royale-v20-30-update-the-battle-for-tilted-towers-plus-unvault-the-choppa (archiwum Epic jako potwierdzenie kategorii, bez twierdzeń o bieżącej puli) | N06, T06, X06, E06 | 2026-11-23 |

### Stan gry, który wpływa na karty
| Fakt | Źródło | Skutek | Sprawdzono |
|---|---|---|---|
| Od 1.11.2026 (aktualizacja 43.00, minisezon Treasure Hunters) mecze na wyspie Crossbones Isle mają 80 graczy zamiast 100. | https://communities.epicgames.com/thread/set-sail-for-fortnite-treasure-hunters-the-greatest-adventure-of-all-time/Pmud?lang=pl | Karty nie podają liczby graczy, tylko miejsce. Progi (25., 20., 15., 10., 5., 3.) działają przy 80 i 100 graczach. | 2026-11-23 |
| Oficjalny opis Battle Royale wymienia Zero Build jako wariant bez budowania. | https://www.fortnite.com/@epic/battle-royale (Epic) | Oba tryby w konfiguracji. | 2026-11-23 |

### Wyścigówa Usoppa

Sprawdzone 23.11.2026. Epic opisuje naciągnięcie, wycelowanie i wypuszczenie ciężkiego pocisku. W portalu nie ma liczbowych parametrów ani rankingu tej broni. Zakres potwierdzenia dotyczy wymienionych aktualizacji.

| Tryb | Potwierdzenie | Źródło Epic |
|---|---|---|
| Battle Royale | Materiały startu Łowców Skarbów z 1.11.2026 wymieniają Wyścigówę. Notatki v43.10 z 12.11 wskazują poprawkę odmiany Galaxy. | [Start sezonu](https://communities.epicgames.com/thread/set-sail-for-fortnite-treasure-hunters-the-greatest-adventure-of-all-time/Pmud?lang=pl) · [v43.10](https://communities.epicgames.com/thread/v43-10-fortnite-treasure-hunters-update-notes/CoOG) |
| Reaktywacja | Notatki v43.00 wymieniają procę w łupach. Nowsze v43.10 są rozpatrywane osobno. Bieżąca rotacja wymaga sprawdzenia w grze. | [v43.00](https://communities.epicgames.com/thread/fortnite-reload-43-00-update-notes/oxqw?lang=pl) · [v43.10](https://communities.epicgames.com/thread/fortnite-reload-43-10-update-notes/SWuy) |
| Blitz Royale | Notatki v43.00 wymieniają ją w złotych zrzutach. Bieżąca rotacja wymaga sprawdzenia w grze. | [v43.00](https://communities.epicgames.com/thread/v43-00-blitz-royale-update-notes/RnOd) |

### Do potwierdzenia w grze (pierwszy mecz testowy)
Przed testem sprawdźcie w jednym meczu Solo, czy:
1. Ekran końca meczu pokazuje miejsce i liczbę eliminacji (L01, L02 i wszystkie karty z miejscem).
2. W trybie Build widać licznik drewna, kamienia i metalu (L05).
3. Da się otworzyć skrzynię i zobaczyć, że to skrzynia (karty ze skrzyniami).
4. Widać obrażenia od burzy (T04, E04).
5. Pasek ekwipunku pozwala policzyć bronie (L04, N04, T03, X04, E03).

Jeśli któryś punkt się nie potwierdzi, usuń tę kartę z `MISJE` albo zostaw w niej tylko pasujące `tryby`. Polecenie `node testy/test_logika.mjs` sprawdza, czy każda konfiguracja ma jeszcze co najmniej 4 karty.

## Marka i zasady Epic

| Fakt | Źródło | Sprawdzono |
|---|---|---|
| Treści fanowskie są dozwolone bez celu zarobkowego (1.4), bez sugerowania poparcia Epic (1.6), bez wyglądu oficjalnej strony (1.8). Wymagany dopisek (1.10): „Portions of the materials used are trademarks and/or copyrighted works of Epic Games, Inc. All rights reserved by Epic. This material is not official and is not endorsed by Epic.” Znaki (np. „Fortnite”) tylko do opisu gry, nie do nazwania własnej treści; w nazwie strony tylko, gdy nazwa jasno mówi, że strona jest nieoficjalna (1.11). | https://legal.epicgames.com/epicgames/fan-art-policy | 2026-11-23 |

Strona jest bezpłatna i niekomercyjna. Zasady użycia materiałów Epic wyjaśnia także [pomoc techniczna Epic po polsku](https://www.epicgames.com/help/c-36624475/c-35761596/a25498694?lang=pl). Grafiki portalu, karty wyzwań i arena mają autorską oprawę. Footer z wymaganym dopiskiem jest wspólny dla wszystkich działów.

## Łowcy Skarbów i dane Zbrojowni

- Wersje sezonu, mapa 80 graczy, mechanika skrzyń i kalendarz pochodzą z oficjalnej zapowiedzi Epic oraz aktualizacji 43.10. Stan odczytu 23.11.2026. [Zapowiedź](https://www.fortnite.com/news/fortnite-treasure-hunters-the-greatest-adventure-of-all-time) · [Szczegółowy wpis po polsku](https://communities.epicgames.com/thread/set-sail-for-fortnite-treasure-hunters-the-greatest-adventure-of-all-time/Pmud?lang=pl) · [Aktualizacja 43.10](https://communities.epicgames.com/thread/v43-10-fortnite-treasure-hunters-update-notes/CoOG)
- Liczby dla puli Battle Royale odczytano według rzadkości 23.11.2026. Źródło wtórne jest podane przy tabeli oraz przy porównaniu każdego wariantu. Warianty z Reaktywacji i Blitz mają oddzielny zakres, oparty o notatki Epic dla wersji 43.00. [Pistolet](https://fortnite.gg/weapons/weapon/flint-knock-pistol?mode=battle-royale) · [Karabin naleśnikowy](https://fortnite.gg/weapons/weapon/flapjack-rifle?mode=battle-royale) · [Młot](https://fortnite.gg/weapons/weapon/hammer-assault-rifle?mode=battle-royale) · [Gilded Dragoon](https://fortnite.gg/weapons/weapon/gilded-dragoon-shotgun?mode=battle-royale) · [Bundlebuss](https://fortnite.gg/weapons/weapon/bundlebuss-repeater-rifle?mode=battle-royale)
- Archiwalne warianty pistoletu opisują stan z jego premiery 20.03.2019. [Oficjalne notatki v8.11](https://www.fortnite.com/news/patch-notes-v8-11)

### Obrazy

Twórcą i publikującym poniższe materiały jest Epic Games. Źródła renderów sprawdzono 24.11.2026. [Rejestr używany przez galerię](js/sprzet-media.js) przechowuje też typ ujęcia, zakres wariantu, playlistę, plik i podstawę użycia. Obrazy mają lokalne kopie WebP. Render broni jest kadrowany i wykorzystywany w dużym rozmiarze oraz jako pomniejszenie. Ujęcia wyspy pochodzą z zapowiedzi sezonu.

| Plik w `assets/fortnite/` | Rodzaj materiału | Pochodzenie |
| --- | --- | --- |
| `flint-render.webp`, `flint-mini.webp` | Render pistoletu z premiery v8.11 | [Publikacja Epic](https://www.fortnite.com/news/patch-notes-v8-11) · [Plik Epic](https://cms-assets.unrealengine.com/cm6l5gfpm05kr07my04cqgy2x/cmw95vjcx0b9a06n4k23e6ygk) |
| `hammer-render.webp`, `hammer-mini.webp` | Render karabinu Młot z sezonu Vibin’ | [Publikacja Epic](https://www.fortnite.com/news/whats-new-in-fortnite-battle-royale-chapter-3-season-3-vibin?lang=en-US) · [Plik Epic](https://cdn2.unrealengine.com/fortnite-hammer-assault-rifle-1900x600-3a992cfe78e2.jpg) |
| `flapjack-render.webp`, `flapjack-mini.webp` | Render karabinu naleśnikowego z sezonu Wilds | [Publikacja Epic](https://www.fortnite.com/news/whats-new-in-fortnite-battle-royale-chapter-4-season-3-wilds?lang=en-US) · [Plik Epic](https://cdn2.unrealengine.com/fortnite-flapjack-rifle-1900x600-98e2ae8f7af5.jpg) |
| `furia-oscara-render.webp`, `furia-oscara-mini.webp` | Kadr broni z oficjalnej zapowiedzi Battle Royale, Dzień Kapitana 22.11.2026 | [Ogłoszenie Epic](https://communities.epicgames.com/thread/captains-day-oscar-november-22/eOQD) · [Plik Epic](https://communities.epicgames.com/api/community/image/9bba47c6-235c-4ec6-8da5-e194d8541d4e?resizingType=fit&width=2048&height=1152) |
| `wyspa-port.webp`, `wyspa-port-mobile.webp` | Widok zabudowań nad wodą | [Publikacja Epic](https://www.fortnite.com/news/fortnite-treasure-hunters-the-greatest-adventure-of-all-time) · [Plik Epic](https://cms-assets.unrealengine.com/cm6l5gfpm05kr07my04cqgy2x/cmvr484lv2gci07n1iliazrdd) |
| `wyspa-kosci.webp` | Widok skalistego wybrzeża i czaszki | [Publikacja Epic](https://www.fortnite.com/news/fortnite-treasure-hunters-the-greatest-adventure-of-all-time) · [Plik Epic](https://cms-assets.unrealengine.com/cm6l5gfpm05kr07my04cqgy2x/cmvr4845f2gss06og2m8iwecf) |
| `wyspa-fort.webp` | Widok zabudowań po zmroku | [Publikacja Epic](https://www.fortnite.com/news/fortnite-treasure-hunters-the-greatest-adventure-of-all-time) · [Plik Epic](https://cms-assets.unrealengine.com/cm6l5gfpm05kr07my04cqgy2x/cmvr484gu2gt806og21ybi37n) |

Miniatury listy pokazują pomniejszone rendery prasowe. Brakuje potwierdzonych ikon ekwipunku i ujęć przedmiotu w rękach albo na ziemi dla prezentowanych wariantów. Dla Gilded Dragoon, Bundlebussa, Wyścigówy Usoppa i Wybuchowej kuli armatniej brakuje także dużych renderów dostępnych do publikacji na ustalonych zasadach. Przy materiałach One Piece trzeba zachować prawa właścicieli crossoveru. Każdy z ośmiu przedmiotów wymaga osobnego kadru ekwipunku z nazwą, widoczną rzadkością i trybem oraz osobnego kadru w rękach postaci lub jako łup. Ujęcia z potwierdzoną rzadkością należy przypisać do identyfikatora wariantu.

Rzadkość wynika z danych karty. UI używa szarości, zieleni, błękitu, fioletu i odcieni złota, a mityczną dodatkowo opisuje tekstem o sześciu gwiazdkach. [Epic o poziomach i gwiazdkach](https://dev.epicgames.com/documentation/en-us/fortnite/fortnite-weapons-primer)

Sezon sprawdzono ponownie 24.11.2026, w tym Dzień Kapitana Oscara i zapowiedź Złotego Tygodnia w Battle Royale od 28.11 do finału 5.12. Opublikowane wcześniej statystyki konkretnych wariantów mają nadal datę ich odczytu. [Ogłoszenie o Oscarze](https://communities.epicgames.com/thread/captains-day-oscar-november-22/eOQD) · [Złoty Tydzień](https://communities.epicgames.com/thread/golden-week-starts-november-28/MuNA)

## Czcionki
| Czcionka | Licencja | Plik |
|---|---|---|
| Barlow Condensed 700 i 800 italic (Jeremy Tribby, The Barlow Project), pakiet @fontsource/barlow-condensed 5.3.0 | SIL OFL 1.1 | `fonts/BARLOW-CONDENSED-OFL.txt` |
| Atkinson Hyperlegible 400 i 700 (Braille Institute), kopia plików z `assets/fonts/` | SIL OFL 1.1 | `fonts/ATKINSON-OFL.txt` |
