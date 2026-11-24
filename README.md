# KILEK CHALLENGE

Nieoficjalny portal fanowski o Fortnite. Obejmuje Start, Wyzwania, Katalog misji, Zbrojownię, Akademię, Turnieje i wyniki oraz przewodnik po aktualnym sezonie. Działa jako statyczna strona GitHub Pages. [Otwórz portal](https://daro0626.github.io/kilek-fortnite/)

## Rozgrywka

- **Szybkie wyzwanie** losuje kartę bez punktów. **Turniej na punkty** ma 3, 5, 10 rund lub działa bez limitu. Solo ma jeden wynik, osobne mecze mają dwa indywidualne wyniki, a jeden wspólny mecz ma jeden wynik drużyny. Wybór wspólnego meczu automatycznie używa składu Duo. Build i Zero Build wybiera się osobno.
- Zwykłe karty dają **1, 3, 5, 7 lub 10 pkt** za zaliczenie. Brak zaliczenia daje 0. Przy zmianie trudności punkty poprzednich rund zostają. Domyślnie dostępna jest jedna wymiana na rundę. Można też ustawić dowolne wymiany. Karta niewykonalna wypada bez zużycia wymiany. Po wykorzystaniu zgodnej puli losowanie wraca do najdawniej pokazanych kart.
- **„Wygraj bez broni”** jest dostępna w katalogu i pod linkiem **Wybierz konkretną misję**. Solo ma jeden wynik, rywale mogą osobno zdobyć po 25 pkt, a drużyna dostaje jeden wspólny wynik 25 pkt. Kartę można wybrać jako samodzielną rozgrywkę albo raz w serii.
- Katalog zawiera **112 zwykłych kart i jedną legendarną**. Wyszukiwanie i filtry obejmują trudność, kategorię, Build/Zero Build i Solo/Duo. Oceny i notatki można zapisać lokalnie i skopiować z katalogu.
- Ukończone rundy zachowują ID, wersję reguł, treść, trudność i wartość. Zapis v1/v2 jest odczytywany z dawnym przelicznikiem 1 pkt i oznaczeniem **legacy**. Migracja v3 do v4 zachowuje treść karty, ustawienia aktywnej gry, punktację i historię.
- Wyniki są wpisywane ręcznie. Aktywna gra, historia, rankingi, odznaki i opinie pozostają w tej przeglądarce. Reset w **Zasady i zapis → Zapis i prywatność** usuwa tylko dane KILEK CHALLENGE.

## Zawartość i oprawa

Zbrojownia zawiera konkretne przedmioty i warianty. Można filtrować po okresie, rodzaju, playliście i rzadkości, porównywać parametry dwóch wariantów oraz powiększać dostępne rendery Epic. Osobny poradnik zachowuje 12 opisów rodzin sprzętu. Brakujące ujęcia ekwipunku, meczu i liczb pokazujemy jawnie. [Źródła i wykaz obrazów](ZRODLA.md)

**Aktualny sezon** opisuje Łowców Skarbów, Wyspę Kościotrupów, Dni Kapitanów, zmiany łupów i różnice playlist. Karty przedmiotów prowadzą do odpowiadających wpisów w Zbrojowni. Na stronie są daty ręcznej weryfikacji i odnośniki do materiałów Epic.

Akademia zawiera 10 lekcji, 4 demonstracje i quiz. Start korzysta z autorskiej sceny Canvas. Animacje interfejsu uwzględniają ustawienie ograniczonego ruchu, a losowanie można pominąć. Arena zatrzymuje odświeżanie poza ekranem.

## Uruchomienie i testy

Serwer testowy udostępnia aplikację razem z prefiksem GitHub Pages `/kilek-fortnite/`.

```bash
python3 testy/podglad.py 8010
```

W osobnym terminalu:

```bash
node testy/test_logika.mjs
python3 testy/test_strona.py
python3 testy/wydajnosc.py 4
npx lighthouse@13.6.0 http://127.0.0.1:8010/kilek-fortnite/ --only-categories=performance,accessibility --chrome-flags="--headless"
```

Testy przeglądarkowe wymagają Playwright z Chromium. Można wskazać dostępny Chromium przez `CHROMIUM_PATH`. Publikacja używa skonfigurowanego GitHub Pages z katalogu głównego `main`.
