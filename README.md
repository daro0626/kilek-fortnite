# KILEK CHALLENGE — etap A

Fanowskie wyzwania do meczów w Fortnite, na telefon lub komputer. Z menu przejdziesz do swobodnego losowania, trzyrundowej serii i katalogu misji z wyszukiwaniem.

> Nieoficjalna strona fanowska. Nie jest powiązana z Epic Games ani przez nią zatwierdzona.

## Podgląd lokalny
```bash
python3 testy/podglad.py 8010
# http://127.0.0.1:8010/kilek-fortnite/
```
Porównanie wyglądu w lokalnym podglądzie: otwórz adres podstawowy dla **Neon Arena** lub dodaj `?motyw=holo`, żeby zobaczyć **Holographic Battle Hub**. Oba warianty mają te same funkcje.

Serwer podaje stronę pod prefiksem `/kilek-fortnite/`, tak jak GitHub Pages. Ścieżki spoza prefiksu zwracają 404. Przy zwykłym `python3 -m http.server` w katalogu repozytorium strona działa pod `/`.

Bez instalacji i bez budowania: statyczny HTML, CSS i moduły JS. Czcionki leżą w `fonts/`. Strona nie wysyła żadnych żądań poza własny katalog.

## GitHub Pages

W repozytorium `daro0626/kilek-fortnite` wybierz **Settings → Pages → Deploy from a branch → main → / (root) → Save**. Po wdrożeniu strona jest dostępna pod adresem https://daro0626.github.io/kilek-fortnite/.

## Zasady gry

- **Graj od razu** uruchamia swobodne losowanie bez punktów i bez limitu wymian. Przy wyborze w pierwszej kolejności dostajesz niewidziane karty z bieżącej puli. Potem wracają te najdawniej widziane.
- **Start**, **Wyzwania** i **Katalog misji** są dostępne z każdego ekranu. Z przyciskiem **Kontynuuj** wrócisz do tej samej karty. Zakończenie i powrót do ustawień przy aktywnej grze wymagają potwierdzenia.

### Seria trzech rund

1. Wpiszcie pseudonimy, wybierzcie Build albo Zero Build i jedną z pięciu trudności.
2. Losujcie kartę. Ta sama karta obowiązuje obu graczy. Karta jest zapisana przed animacją, więc odświeżenie pokazuje tę samą kartę. Trudność można zmienić przed meczem bez utraty zliczonych rund.
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

Pula obejmuje 28 kart, w tym cztery wyzwania bez strzelby dla Build i Zero Build. Przy wyczerpaniu puli w serii można zmienić trudność lub zakończyć grę z dotychczasowym wynikiem. Źródła i rzeczy do sprawdzenia w grze są w `ZRODLA.md`.

## Pliki
```
index.html            szkielet; ekran startowy jest w HTML, żeby był widoczny od pierwszej klatki
css/fortnite.css      komponenty gry i ich animacje
css/portal.css        wspólny portal i dwa warianty oprawy
js/misje.js           pula misji, trudności, słownik pojęć
js/seria.js           logika serii: czyste funkcje bez DOM (losowanie, wymiana, unieważnienie, wyniki, rewanż)
js/zapis.js           zapis w localStorage: klucz kc:fortnite, format v2, odczyt także v1
js/portal.js          nawigacja po działach i katalog misji
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
- Pusty zapis daje ekran startowy. Uszkodzony zapis albo zapis z nieznaną kartą daje start od nowa z komunikatem. Format v1 zachowuje graczy, ustawienia, bieżącą serię i wyniki. Import z formatu v0 obejmuje graczy i ustawienia. Zapis z nowszej wersji nie zostaje nadpisany. Gdy przeglądarka blokuje zapis, seria działa w bieżącej karcie, a strona mówi, że odświeżenie ją skasuje.
- Reset (ikona (i) → „Zapis i prywatność”) usuwa tylko `kc:fortnite` i klucze `kc:fortnite:*`. Dane stron Minecrafta zostają.
- Bez kont, reklam, analityki, zdalnych czcionek i integracji z grą.

## Ruch
Ruch opiera się głównie na `transform` i `opacity` (WAAPI i CSS). Nie ma rozmyć ani stałych pętli poza ekranem startowym i oczekiwaniem na odkrycie (skaner, puls karty, burza na poziomie Ekstremalnym). Pętle zatrzymują się w ukrytej karcie przeglądarki. Przy `prefers-reduced-motion` wszystkie animacje są wyłączone, karta odkrywa się od razu, a fokus trafia na tytuł karty. Dźwięku nie ma.

| Moment | Co się dzieje | Czas |
|---|---|---|
| Start | Litery wpadają kolejno, przez logo przechodzi fala światła, a przestrzenna talia wchodzi na podest. Talia reaguje na kursor i dotyk. | do ok. 1,5 s |
| Trudność | Wskaźnik przesuwa się, insygnium podskakuje, mapa zmienia kolor jednym przemalowaniem przykrytym krótkim błyskiem warstwy. Opis zmienia się natychmiast. Ekstremalny włącza pierścień burzy, różowy akcent mapy, pasy ostrzegawcze i „glitch” kodu STREFA ZERO. | 200 ms |
| Losowanie | Talia reaguje w tej samej klatce, rewersy tasują się na boki, a jedna karta leci łukiem do ramki, a narożniki ramki się domykają. Tasowanie można pominąć poleceniem „Odkryj od razu”. | do 760 ms |
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
`test_strona.py` sprawdza 320, 390, 430 i 1366 px: pełną serię, wymianę, unieważnienie, korektę, remis, rewanż, podwójne dotknięcie, odtworzenie po odświeżeniu na każdym etapie, brak poziomego przewijania, klawiaturę i fokus, ograniczony ruch, zablokowany i uszkodzony zapis, reset, brak kart oraz nawigację, katalog, swobodne losowanie, zmianę trudności, potwierdzenie i migrację zapisu (wszystko pod `/kilek-fortnite/`).

Testy niczego nie zapisują w repozytorium. Testy uruchamia się lokalnie.

## Test z dziećmi
Scenariusz obserwacji: `TEST_Z_DZIECMI.md`.
