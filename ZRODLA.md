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

Strona nie używa logo, czcionek, grafik, postaci ani dźwięków z Fortnite. Autorskie grafiki, schematy i scena są rysowane w kodzie `grafika.js`, `mapa-rys.js`, `dzialy.js` i `arena.js`.

## Czcionki
| Czcionka | Licencja | Plik |
|---|---|---|
| Barlow Condensed 700 i 800 italic (Jeremy Tribby, The Barlow Project), pakiet @fontsource/barlow-condensed 5.3.0 | SIL OFL 1.1 | `fonts/BARLOW-CONDENSED-OFL.txt` |
| Atkinson Hyperlegible 400 i 700 (Braille Institute), kopia plików z `assets/fonts/` | SIL OFL 1.1 | `fonts/ATKINSON-OFL.txt` |
