# KILEK CHALLENGE v0.1 (nieoficjalne wyzwania do meczów w Fortnite)

Strona na telefon, której używa się obok Fortnite na komputerze albo konsoli. Dwóch graczy losuje jedną kartę przed meczem, każdy gra swój mecz, a po meczu sami zaznaczają, kto dał radę. Seria ma trzy rundy, potem jest finał i rewanż.

> Nieoficjalna strona fanowska. Nie jest powiązana z Epic Games ani przez nią zatwierdzona.

## Podgląd lokalny
```bash
python3 testy/podglad.py 8010
# http://127.0.0.1:8010/kilek-fortnite/
```
Serwer podaje stronę pod prefiksem `/kilek-fortnite/`, tak jak GitHub Pages. Ścieżki spoza prefiksu zwracają 404. Przy zwykłym `python3 -m http.server` w katalogu repozytorium strona działa pod `/`.

Bez instalacji i bez budowania: statyczny HTML, CSS i moduły JS. Czcionki leżą w `fonts/`. Strona nie wysyła żadnych żądań poza własny katalog.

## GitHub Pages

W repozytorium `daro0626/kilek-fortnite` wybierz **Settings → Pages → Deploy from a branch → main → / (root) → Save**. Po wdrożeniu strona jest dostępna pod adresem https://daro0626.github.io/kilek-fortnite/.

## Zasady gry
1. Wpiszcie pseudonimy, wybierzcie Build albo Zero Build i jedną z pięciu trudności.
2. Losujcie kartę. Ta sama karta obowiązuje obu graczy. Karta jest zapisana przed animacją, więc odświeżenie pokazuje tę samą kartę.
3. Każdy gra jeden mecz w tym samym trybie (najlepiej Solo).
4. Po meczu każdy zaznacza wynik: zaliczenie to 1 punkt, brak to 0. Wynik można poprawić w rozliczeniu i w finale.
5. **Wymiana:** jedna wspólna na serię, przed rozpoczęciem rundy. Wymieniona karta nie wraca w tej serii.
6. **Karta niewykonalna:** unieważnienie bez punktu i bez zużycia wymiany, z nową kartą. Gdy kart zabraknie, serię można zakończyć z dotychczasowym wynikiem.
7. **Rewanż:** nowa seria z tymi samymi graczami, trybem i trudnością. Pierwsza karta jest inna niż ostatnia rozegrana.

### Trudności
| Trudność | Kod | Zasada kart |
|---|---|---|
| Łatwy | ZWIAD | jedna czynność pod kontrolą gracza |
| Normalny | PATROL | cel i krótka reguła |
| Trudny | SZTURM | mierzalny cel i ograniczenie |
| Ekspert | OPERACJA | warunki, które trzeba pogodzić |
| Ekstremalny | STREFA ZERO | reguła na cały mecz i wysoki próg |

Pula: 24 karty (`js/misje.js`). Kart w konfiguracji (Build / Zero Build): Łatwy 5/4, Normalny 5/4, Trudny 5/4, Ekspert 4/5, Ekstremalny 5/4. Przy 4 kartach wymiana i unieważnienie w jednej serii mogą wyczerpać pulę, wtedy strona proponuje zakończenie serii. Źródła i rzeczy do sprawdzenia w grze: `ZRODLA.md`.

## Pliki
```
index.html            szkielet; ekran startowy jest w HTML, żeby był widoczny od pierwszej klatki
css/fortnite.css      styl „Odprawa na mapie” i wszystkie przejścia CSS
js/misje.js           pula misji, trudności, słownik pojęć
js/seria.js           logika serii: czyste funkcje bez DOM (losowanie, wymiana, unieważnienie, wyniki, rewanż)
js/zapis.js           zapis w localStorage: klucz kc:fortnite, format z polem v (wersja 1)
js/app.js             interfejs: stan → widok, zdarzenia, fokus, komunikaty
js/fx.js              animacje (WAAPI), konfetti, mapa w kafelkach
js/mapa-rys.js        rysowanie warstwic (autorskie pole wysokości, marching squares)
js/mapa-worker.js     to samo w wątku roboczym (OffscreenCanvas), żeby nie blokować dotyku
js/grafika.js         autorskie SVG: insygnia trudności, ikony, awatary, odznaka
fonts/                Barlow Condensed i Atkinson Hyperlegible + licencje OFL
testy/                podgląd z prefiksem, testy logiki, testy przeglądarkowe, pomiar płynności
```

## Zapis i prywatność
- Bieżąca seria, wyniki i ustawienia są tylko w `localStorage` tej przeglądarki, pod jednym kluczem `kc:fortnite` (format JSON jak w `store` z `core.js`, pole `v` to wersja).
- Pusty zapis daje ekran startowy. Uszkodzony zapis albo zapis z nieznaną kartą daje start od nowa z komunikatem. Starszy format zachowuje graczy i ustawienia. Zapis z nowszej wersji nie zostaje nadpisany. Gdy przeglądarka blokuje zapis, seria działa w bieżącej karcie, a strona mówi, że odświeżenie ją skasuje.
- Reset (ikona (i) → „Zapis i prywatność”) usuwa tylko `kc:fortnite` i klucze `kc:fortnite:*`. Dane stron Minecrafta zostają.
- Bez kont, reklam, analityki, zdalnych czcionek i integracji z grą.

## Ruch
Animujemy tylko `transform` i `opacity` (WAAPI i CSS). Nie ma rozmyć ani stałych pętli poza ekranem startowym i oczekiwaniem na odkrycie (skaner, puls karty, burza na poziomie Ekstremalnym). Pętle zatrzymują się w ukrytej karcie przeglądarki. Przy `prefers-reduced-motion` wszystkie animacje są wyłączone, karta odkrywa się od razu, a fokus trafia na tytuł karty. Dźwięku nie ma.

| Moment | Co się dzieje | Czas |
|---|---|---|
| Start | 12 fragmentów mapy układa się wokół tytułu, znaczniki pulsują, po napisie KILEK przechodzi błysk. Tytuł i przycisk są dostępne od pierwszej klatki. | ok. 350 ms, raz na sesję |
| Trudność | Wskaźnik przesuwa się, insygnium podskakuje, mapa zmienia kolor jednym przemalowaniem przykrytym krótkim błyskiem warstwy. Opis zmienia się natychmiast. Ekstremalny włącza pierścień burzy, czerwoną mapę, pasy ostrzegawcze i „glitch” kodu STREFA ZERO. | 200 ms |
| Losowanie | Talia reaguje w tej samej klatce, rewersy tasują się na boki, a jedna karta leci łukiem do ramki, a narożniki ramki się domykają. Przez cały czas działa „Odkryj od razu”. | do 650 ms |
| Oczekiwanie | Zakryta karta pulsuje światłem, po rewersie przesuwa się linia skanera. | do odkrycia |
| Odkrycie | Rewers odsuwa się, jest błysk, fala i połysk po karcie, a znaczniki na mapie pulsują. Charakter trudności: Trudny wsuwa pasy, Ekspert zatrzaskuje narożniki, Ekstremalny ma czerwony błysk krawędzi, wstrząs ekranu i „glitch” tytułu. Tytuł i warunek pojawiają się razem, bez przesuwania układu. | 180 ms + efekty do 600 ms |
| Wynik | Stempel „Zaliczone” uderza w panel, awatar podskakuje. Przy niezaliczeniu zmienia się tylko etykieta. | 260 ms |
| Finał | Tytuł wpada z powiększenia, kolumny wjeżdżają z boków, liczby przewijają się jak bębny, a nad zwycięzcą pojawia się odznaka, promienie, reflektor i konfetti. Remis: obie kolumny mają równą rangę. „Rewanż” działa od razu. | ok. 450 ms + konfetti 1,9 s |

## Testy
```bash
# logika (Node 18+), bez przeglądarki
node testy/test_logika.mjs

# przeglądarka (Python + Playwright, Chromium), podgląd musi działać
python3 testy/podglad.py 8010 --cicho &
python3 testy/test_strona.py

# płynność animacji przy spowolnionym procesorze
python3 testy/wydajnosc.py 4

# Lighthouse mobile (jak w CI repozytorium)
npx lighthouse@13.6.0 http://127.0.0.1:8010/kilek-fortnite/ --only-categories=performance,accessibility --chrome-flags="--headless"
```
`test_strona.py` sprawdza 320, 390, 430 i 1366 px: pełną serię, wymianę, unieważnienie, korektę, remis, rewanż, podwójne dotknięcie, odtworzenie po odświeżeniu na każdym etapie, brak poziomego przewijania, klawiaturę i fokus, ograniczony ruch, zablokowany i uszkodzony zapis, reset, brak kart oraz konsolę i żądania (wszystko pod `/kilek-fortnite/`).

Testy niczego nie zapisują w repozytorium. Testy uruchamia się lokalnie.

## Test z dziećmi
Scenariusz obserwacji: `TEST_Z_DZIECMI.md`.
