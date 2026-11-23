# KILEK CHALLENGE

Nieoficjalny portal fanowski o Fortnite. Obejmuje Start, Wyzwania, Katalog misji, Zbrojownię, Akademię, Turnieje i wyniki oraz datowane informacje o grze. Działa jako statyczna strona GitHub Pages. [Otwórz portal](https://daro0626.github.io/kilek-fortnite/)

## Rozgrywka

- **Graj od razu** uruchamia swobodne losowanie bez punktów. W **Wyzwaniach** można ustawić pojedynek, wspólny duet, Build lub Zero Build, Solo albo Duo, 3/5/10 rund albo serię bez limitu. Wspólny duet ustawia skład Duo.
- Zwykłe karty dają **1, 3, 5, 7 lub 10 pkt** za zaliczenie. Brak zaliczenia daje 0. Przy zmianie trudności punkty poprzednich rund zostają. Domyślnie dostępna jest jedna wymiana na rundę. Można też ustawić dowolne wymiany. Karta niewykonalna wypada bez zużycia wymiany. Po wykorzystaniu zgodnej puli losowanie wraca do najdawniej pokazanych kart.
- **„Wygraj bez broni”** to osobna karta wybierana ręcznie. Każdy rywal może osobno zdobyć 25 pkt w pojedynku, a duet dostaje jednorazowe 25 pkt za wspólne zaliczenie. Kartę można wybrać jako samodzielną rozgrywkę albo raz w serii.
- Katalog zawiera **112 zwykłych kart i jedną legendarną**. Wyszukiwanie i filtry obejmują trudność, kategorię, Build/Zero Build i Solo/Duo. Oceny i notatki można zapisać lokalnie i skopiować z katalogu.
- Ukończone rundy zachowują ID, wersję reguł, treść, trudność i wartość. Zapis v1/v2 jest odczytywany z dawnym przelicznikiem 1 pkt i oznaczeniem **legacy**. Po migracji następne przydzielone karty używają nowej skali.
- Wyniki są wpisywane ręcznie. Aktywna gra, historia, rankingi, odznaki i opinie pozostają w tej przeglądarce. Reset w **Zasady i zapis → Zapis i prywatność** usuwa tylko dane KILEK CHALLENGE.

## Zawartość i oprawa

Zbrojownia ma 12 kart, obracane schematy i porównanie dwóch pozycji na skali dydaktycznej. Akademia zawiera 10 lekcji, 4 demonstracje i quiz. Karta Wyścigówy Usoppa oraz notatki sezonowe podają osobne źródła i tryby. [Źródła](ZRODLA.md)

Start wykorzystuje autorską scenę Canvas z projekcją przestrzenną, obracanym kryształem i orbitalnymi warstwami. Tasowanie i odkrycie korzystają z CSS i WAAPI. Interfejs respektuje ustawienie ograniczonego ruchu. Arena zatrzymuje odświeżanie po opuszczeniu ekranu.

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
