# KILEK CHALLENGE — ZADANIE DLA CODEXA: UX, PRAWDZIWA ZBROJOWNIA, AKTUALNY SEZON

**Data zlecenia:** 23.11.2026
**Repozytorium:** https://github.com/daro0626/kilek-fortnite
**Strona:** https://daro0626.github.io/kilek-fortnite/
**Status:** ZLECENIE DO WYKONANIA, nie raport wykonania.
**Priorytet:** wysoki. Przeczytaj CAŁOŚĆ przed rozpoczęciem zmian.
**Model sugerowany:** Codex High.
**Zadanie:** samodzielnie ZIMPLEMENTUJ, PRZETESTUJ i OPUBLIKUJ jedną spójną poprawę portalu, a nie kolejny dokument lub makietę. Nie zatrzymuj się po kolejnych podetapach i nie wymagaj od właściciela ręcznej oceny każdej zmiany. Zachowaj istniejące działające funkcje i wyniki.

## 0. Dlaczego to robimy — problem zaobserwowany przez użytkownika

KILEK CHALLENGE już działa, ale dla użytkownika ekran „Wyzwania” jest przeładowany i nieczytelny:
- nie wie, czym różnią się „Losuj swobodnie”, „Rozpocznij serię” i „Wspólny duet”;
- u góry wybrano już „Duo”, a niżej nadal znajduje się osobny przycisk „Wspólny duet”, co wygląda jak powtórzony wybór;
- formularz łączy różne pojęcia (tryb Fortnite, sposób rozliczania graczy, tryb wyzwań i długość turnieju), zamiast jasno je rozdzielać;
- bardzo rozbudowana Zbrojownia zawiera fioletowe sylwetki/schematy broni, np. pistoletu, zamiast PRAWDZIWEGO WYGLĄDU BRONI Z FORTNITE;
- gracz chce zobaczyć miniaturkę z ekwipunku, dużą grafikę broni, jej wygląd w rękach postaci i/lub jako łup w świecie gry, a także różnice rzadkości (np. epicka, legendarna);
- portal ma opisywać, jaki sezon Fortnite trwa TERAZ, co nowego w nim występuje, jakie są bronie/przedmioty, czym sezon się wyróżnia, czego szukać i gdzie;
- grafika i animacje mają być porównywalnie imponujące z KILEKCRAFT (ruchome nagłówki, żywe sekcje, bogate sceny) — nie statyczna strona z samymi prostymi przyciskami i abstrakcyjnymi wektorami.

Użytkownik chce EFEKTU NA STRONIE, a nie przekonująco brzmiącego raportu. Wszelkie zapewnienia o „wow” muszą być poparte działającym ekranem.

## 1. Kontekst istniejącego kodu — obowiązkowy przegląd

Na starcie przejrzyj aktualny main i rzeczywiste moduły: index.html, js/app.js, js/portal.js, js/dzialy.js, js/wiedza-dane.js, js/seria.js, js/misje.js, css/, testy/, README.md i ZRODLA.md.

W aktualnej wersji:
- js/dzialy.js tworzy schematy SVG funkcją ilustracja() i wstawia je w Zbrojowni; obecny suwak „Obrót schematu” obraca wyłącznie schemat. To nie spełnia wymagania prawdziwych grafik.
- js/wiedza-dane.js trzyma 12 OGÓLNYCH rodzin sprzętu z umownymi skalami 1–5; ogólna rodzina nie jest tym samym, co konkretna broń w określonej rzadkości i sezonie.
- js/portal.js oraz js/app.js zarządzają nawigacją/ustawieniami; README obecnie rozróżnia swobodne losowanie, pojedynek, duet, tryb Build/Zero Build, skład Solo/Duo, turniej i kartę legendarną.
- Punkty 1/3/5/7/10 i legendarne 25 punktów już istnieją. Zachowaj je. Zachowaj 112 zwykłych + 1 legendarną misję, ocenianie zadań, zapisy, rankingi, akademię, aktualności i dotychczasowe testy.

Uwaga: NIE resetuj lokalnych wyników ani postępu przy migracji. Przed zmianą stanu przeanalizuj struktury danych i dopisz testy migracji. Nie wyłączaj działających funkcji tylko po to, żeby skrócić kod.

## 2. P0 — UPROSZCZENIE WYBORU GRY I NAWIGACJI

### Jedno znaczenie dla każdego wyboru

Zaprojektuj na nowo ekran startu wyzwania tak, aby gracz rozumiał go bez instrukcji:

**A. Co chcesz zrobić?** TYLKO dwie jasno nazwane opcje:
- **Szybkie wyzwanie** — losowanie karty do pojedynczego meczu, bez punktów i tabeli. Możesz ponawiać losowanie.
- **Turniej na punkty** — runda/seria, punktacja, ranking i finał.

**B. Jak gracie?** Warianty odpowiednie do liczby graczy:
- **Osobne mecze / pojedynek** — każdy realizuje to samo zadanie we własnym meczu; otrzymuje punkty osobno.
- **Razem w jednym meczu / drużyna** — wspólne wykonanie zadania; zespół zdobywa punkty tylko raz.
Jeśli jest tylko jeden gracz, pokaż czytelną opcję gry solo bez udawania dwóch osób.

**C. Tryb rozgrywki Fortnite:** **Build** lub **Zero Build** — osobny wybór, nie mieszać go ze sposobem naliczania punktów.

**D. Trudność:** pięć poziomów; wyraźny poziom punktów w turnieju (łatwy 1, normalny 3, trudny 5, ekspert 7, ekstremalny 10). Możliwość zmiany trudności między rundami i przed kolejnym losowaniem.

**E. Liczba rund:** pokazuj tylko przy **Turnieju** (np. 3 / 5 / 10 / bez limitu), bez zaśmiecania trybu szybkiego.

**Jedno główne CTA dynamiczne:** „Losuj wyzwanie” albo „Rozpocznij turniej”, w zależności od wybranej opcji. Nie wyświetlaj równolegle trzech prawie równoważnych wielkich przycisków: „Losuj swobodnie”, „Rozpocznij serię” i „Wspólny duet”.

Usuń zdublowane pojęcie **„Duo” + „Wspólny duet”**. Wspólne granie wybiera się JEDEN RAZ w prostym polu „Jak gracie?”. Zależne ustawienia playlisty (Solo/Duo, jeśli w ogóle potrzebne do walidacji kart) ustalaj automatycznie albo pokaż wewnątrz zaawansowanych ustawień tylko wtedy, kiedy mają rzeczywiste odrębne znaczenie. Nie ukrywaj ważnych rozróżnień między grą solo, dwoma osobnymi meczami i wspólnym meczem; wyjaśnij je jednym krótkim zdaniem.

Nie mnożymy trybów rozgrywki bez potrzeby. Skomplikowane ustawienia przenieś do rozwijanego „Więcej ustawień”, ale nie chowaj możliwości zmiany trudności, formy gry i punktacji.

### Legendarne zadania bez zamieszania

- „Wygraj bez broni — 25 pkt” MUSI być łatwe do znalezienia w katalogu/specjalnych wyzwaniach.
- Nie dokładaj osobnego wielkiego CTA do formularza obok przycisku startu; specjalne karty wybiera się np. z zakładki **Misje specjalne** albo z czytelnego, małego linku **Wybierz konkretną misję**.
- W pojedynku 25 pkt dla każdej osoby, która osobno zaliczyła; we wspólnym meczu 25 pkt JEDNORAZOWO dla drużyny, nie podwójnie.
- Zachowaj swobodne powtórne losowanie, wybór trudności i prosty powrót do głównego menu bez utraty aktywnej serii. Akcja usuwająca historię wymaga wyraźnego potwierdzenia.
- Nazwy, komunikaty i punkty mają być zrozumiałe również dla 11-latka. Prosty mikrocopy, żadnych ukrytych warunków.

### Kryterium UX

Na telefonie 390 px osoba, która pierwszy raz widzi portal, w maksymalnie trzech wyraźnych czynnościach od wejścia do „Wyzwań” rozpoczyna losowanie, a wybór **wspólny mecz** nie powoduje ponownego wyboru **Duo** w drugiej części formularza.

## 3. P0 — PRAWDZIWA ZBROJOWNIA FORTNITE, NIE SCHEMATY

### Wymagane obrazy

W obecnej Zbrojowni NIE WYSTARCZAJĄ abstrakcyjne SVG/sylwetki. Dla każdego rzeczywiście prezentowanego konkretnego przedmiotu pokaż:

1. **Dużą autentyczną grafikę konkretnej broni z Fortnite** (oficjalny render lub prawdziwy screen z gry) w głównym panelu, z opcją powiększenia.
2. **Miniaturę ekwipunkową/inwentarzową** tego samego przedmiotu, rozpoznawalną jak w Fortnite.
3. **Wygląd w rozgrywce**: screen przedstawiający broń trzymaną przez postać z widoku trzeciej osoby LUB widok łupu na ziemi. Najlepiej obydwa, jeśli mamy wiarygodne ujęcia.
4. Oryginalny opis i rozpoznawalny wygląd, bez zastępowania brakujących zdjęć pseudo-renderami ani generowanymi „podobnymi” obrazkami. Ujęcia należy uczciwie opisać (np. „model w rękach postaci” / „przedmiot leżący na mapie”).
5. Jeżeli konkretnego widoku nie ma w zgodnych z zasadami źródłach, nie udawaj, że jest: wyświetl jawnie „Brak potwierdzonego ujęcia” oraz wskaż w raporcie, jakiego screenshota z gry potrzebujemy. Nadal wdrażaj pozostałe dostępne obrazy.

ŹRÓDŁA: oficjalne materiały Epic, dozwolone materiały prasowe, własne zrzuty z Fortnite i inne obrazy, dla których faktycznie można udokumentować prawo do użycia. **Nie kopiuj na ślepo plików z Google, nie hotlinkuj przypadkowych CDN-ów ani nie wyciągaj pakietów gry metodami naruszającymi warunki.** Lokalnie hostuj zoptymalizowane zasoby, zachowuj źródło, twórcę, datę dostępu i niezbędne informacje o prawach. Uwaga na prawa do zawartości One Piece. Sprawdź pełną politykę Epic przed publikacją.

### Nie mieszaj rodzin broni z konkretnymi wariantami

Zachowaj ogólne poradniki o rodzinach (pompka, SMG, karabin itd.), ale główna Zbrojownia ma katalogować **faktyczne przedmioty i warianty** w aktualnym sezonie, nie tylko 12 kategorii.

Dodaj filtrowanie:
- **Aktualny sezon** / **Archiwum** (jasno rozdzielone);
- rodzaj sprzętu;
- tryb gry (Battle Royale / Zero Build, a Reaktywacja i Blitz osobno, jeśli źródła potwierdzają);
- rzadkość, a także porównanie dwóch konkretnych wariantów.

**Rzadkości** pokazuj z właściwymi kolorami i nazwami Fortnite (np. zwykła, niepospolita, rzadka, epicka, legendarna, mityczna — tam, gdzie dany przedmiot rzeczywiście w tej wersji występuje). Nie twórz sztucznie wszystkich rzadkości dla każdego sprzętu. Przy różnych wariantach mają się zmieniać: podpis, obramowanie, statystyki, a jeżeli źródła to umożliwiają również miniatura i wizualizacja.

**Dane dla KONKRETNEGO wariantu**, a nie „pistoletów ogólnie”:
- rodzaj i nazwa, wersja/mode, status w sezonie, rzadkość;
- obrażenia, tempo strzału, pojemność magazynka, przeładowanie, zasięg / spadek obrażeń — TYLKO jeśli wiarygodne i aktualne dla wskazanego trybu i wariantu;
- plusy, minusy, zastosowanie i praktyczne wskazówki;
- źródło i data sprawdzenia każdej liczby;
- graficzne porównanie z drugim wariantem. Nie wpisuj udawanych cyferek ani arbitralnego wskaźnika 1–5 jako faktycznej „mocy”.

Rozważ utrzymywalny model danych w osobnym pliku modułowym/JSON ze strukturami obrazów, wariantów, źródeł, wersji i weryfikacji. Dodaj jasne znaczniki **„Potwierdzone” / „Do sprawdzenia” / „Archiwum”**. Brak wiarygodnej liczby = „Brak potwierdzonych danych”, nie zero.

**Minimum jakościowe:** kilka reprezentatywnych, rzeczywistych aktualnych przedmiotów w pełnych kartach z grafikami (nie 12 pustych szablonów); reszta może mieć krótsze, ALE RZETELNE karty i wyraźne luki, które można uzupełnić screenami. W raporcie podaj liczbę kart naprawdę posiadających: duży obraz, ikonę, screen gameplay. Nie ogłaszaj „kompletnej zbrojowni”, jeśli tych materiałów brak.

**Wyścigówa Usoppa:** obowiązkowa karta sezonowa. Weryfikuj dokładny wariant/nazwę i dostępność osobno w BR, Reaktywacji i Blitz; nie twierdź, że zawsze można ją znaleźć w każdym meczu albo że „jest najmocniejsza” bez porównywalnych danych. Jeśli nie ma wiarygodnego screena z ręki/ziemi, otwarcie wskaż brak. Uwaga: przedmioty z crossoveru One Piece mogą mieć dodatkowych właścicieli praw.

## 4. P0 — AKTUALNY SEZON JAKO PEŁNOWARTOŚCIOWY DZIAŁ

Na dzień 23.11.2026 oficjalne materiały Epic opisują sezon **Fortnite Treasure Hunters / Łowcy Skarbów** (start 1.11.2026), piracki motyw, współpracę One Piece i nowe przedmioty. Obecny portal ma jedynie kilka datowanych notatek. Zmień go w atrakcyjny dział **„Aktualny sezon”**:

- widowiskowy baner sezonu z realnym, dozwolonym materiałem graficznym lub autorskim materiałem opisowym, jasny numer/nazwa i daty (tylko potwierdzone);
- **Co jest nowego?** mapa / charakterystyczne miejsca, motyw przewodni, nowe mechaniki, wydarzenia, najważniejsze przedmioty i zmiany balansu;
- **Nowe bronie i przedmioty** jako konkretne klikalne karty połączone ze Zbrojownią, z miniaturą i zdjęciem;
- **Jak znaleźć / jak używać** — krótkie praktyczne wskazówki, a jeśli lokalizacja czy dostępność nie jest potwierdzona, wyraźne „sprawdź w grze”;
- **Co wyróżnia ten sezon** — kilka konkretnych, sprawdzonych ciekawostek i porad dla Piotrka, nie ogólniki o Battle Royale;
- **Różnice między playlistami**: Battle Royale/Zero Build, Reaktywacja i Blitz. Nie mieszaj ich pul łupów.
- **Ostatnio zaktualizowano: data** na każdej sekcji wrażliwej na zmiany; przy braku potwierdzenia oznacz „niezweryfikowane”, archiwizuj starszy sezon;
- przy każdej istotnej tezie link do źródła; pierwszeństwo Epic Games i oficjalnych patch notes, następnie inne wiarygodne serwisy z oznaczeniem poziomu pewności.

Aktualne materiały do weryfikacji (nie przepisuj ich bez samodzielnego odczytu i kontroli daty/trybu):
- Oficjalny opis sezonu: https://www.fortnite.com/news/fortnite-treasure-hunters-the-greatest-adventure-of-all-time
- Oficjalny tekst Epic Communities: https://communities.epicgames.com/thread/set-sail-for-fortnite-treasure-hunters-the-greatest-adventure-of-all-time/Pmud?lang=pl
- Epic Communities, update 43.10: https://communities.epicgames.com/thread/v43-10-fortnite-treasure-hunters-update-notes/CoOG
- Aktualny ZRODLA.md w repozytorium i istniejące EPIC w js/wiedza-dane.js.

Nie prezentuj niepotwierdzonych statystyk jako aktualnych. Nie buduj „aktualności” udających transmisję na żywo; statyczna witryna ma podawać datę ostatniej ręcznej weryfikacji.

## 5. P1 — SZATA GRAFICZNA, RUCH I JAKOŚĆ PREMIUM

Zachowaj uzgodnioną paletę: ciemny granat/fiolet, energetyczny fiolet, pomarańcz, neonowy róż, cyjan. Obecna Neon Arena jest bazą kolorystyczną, ale jakość wizualna nadal ma wzrosnąć.

Odniesienie jakościowe (TYLKO WIZUALNE): https://daro0626.github.io/kilekcraft/ — chodzi o bogactwo animacji, żywe napisy i interaktywne sceny. Nie kopiuj bezmyślnie Minecraftowego stylu. Zachowaj własną tożsamość KILEK CHALLENGE.

Wymagane:
- animowane nagłówki/napisy i przejścia między siedmioma działami, bez skakania układu;
- Zbrojownia: efektowne wejście obrazu broni, delikatny parallax, podświetlenie rzadkości, zmiana konkretnego wariantu z wizualnym przejściem, czytelny fullscreen/zoom, użyteczne na telefonie;
- dział sezonowy: kinowy, ale lekki hero, informacyjne panele z ruchomymi akcentami, zdjęcia z gry, spójna typografia;
- główna strona i losowanie: dopracowane animacje typografii, czytelne reakcje przycisków i nagrody bez nachalnych pętli;
- bez kiczowatego przesytu; stop animacji po przejściu na inną kartę; obsługa prefers-reduced-motion i „Pomiń animację”;
- żadnych atrap działających elementów: jeśli przycisk obraca jedynie SVG, nie nazywaj go obrotem modelu 3D;
- bez ekranu trwale blokującego obsługę przy gorszym telefonie.

Grafika MA być elementem treści, nie tylko ozdobnikiem. Szczególnie miniatury i obrazy broni muszą przypominać przedmioty, które gracz faktycznie widzi podczas meczu.

## 6. Prawa, źródła i prywatność

Najpierw przeczytaj: https://legal.epicgames.com/epicgames/fan-art-policy oraz https://www.epicgames.com/help/c-36624475/c-35761596/a25498694?lang=pl

Fanowska, bezpłatna, niekomercyjna strona; wyraźnie nieoficjalna. Zachowaj wymagane oznaczenie Epic na każdej stronie/sekcji zgodnie z polityką. Nie stylizuj portalu na oficjalną stronę Epic. Prawa do materiałów crossoverów mogą należeć również do osób trzecich. Nie używaj przypadkowych cudzych zdjęć bez sprawdzenia możliwości użycia. Nie zamieniaj istniejących rzetelnych informacji w niezweryfikowaną reklamę produktów.

Brak kont, analityki, reklam i danych osobowych dzieci. Obrazki zoptymalizowane, hostowane lokalnie, bez niepotrzebnych skryptów zewnętrznych.

## 7. JEDEN PRZEBIEG — plan wykonawczy, testy, publikacja

**Pracuj autonomicznie od początku do końca w jednym zleceniu:**
1. Zrób audyt aktualnego main i zapisz krótką listę decyzji w raporcie końcowym.
2. Zaimplementuj P0: uproszczony przepływ gry, Zbrojownię rzeczywistych przedmiotów, pełny dział sezonowy i nawigację.
3. Zaimplementuj P1: grafiki, animacje i dopracowanie mobile/desktop.
4. Zaktualizuj testy, README, ZRODLA.md, strukturę danych i opis źródeł zdjęć.
5. Samodzielnie przejdź ekran po ekranie, wykonaj testy i popraw zauważone regresje.
6. Po pozytywnych testach zaktualizuj main oraz opublikuj GitHub Pages. Jeśli narzędzia nie pozwolą scalić lub wdrożyć, przygotuj PR i podaj dokładnie, co blokuje publikację. Nie zgłaszaj wdrożenia, którego nie potwierdziłeś.

**Testy odbiorowe obowiązkowe:**
- 320, 390, 430 i 1366 px, bez przewijania poziomego i nakładających się etykiet;
- szybkie wyzwanie: jeden rozpoznawalny przycisk startu, bez punktów;
- turniej: punktacja 1/3/5/7/10, 25 dla legendy, wynik poprawny osobno i w drużynie;
- nie można pomylić „Duo” z osobnym drugim przyciskiem „Wspólny duet”; brak zdublowanych decyzji;
- zmiana trudności i nawigacja możliwa bez utraty rozpoczętej gry; odświeżenie zachowuje kartę;
- karty zbrojowni: obraz i miniatura faktycznie pokazują właściwy przedmiot; zbliżenie działa; źródła/tryby/rarity jasne;
- dział sezonowy: datowane, aktualne i wiarygodne informacje; linki do źródeł; przejścia do konkretnych broni;
- testy logiki i przeglądarkowe, kontrola błędów konsoli, 404 assetów, zewnętrznych żądań, regresji zapisu;
- Lighthouse MOBILE performance cel co najmniej 90 i accessibility co najmniej 95 dla Startu, Zbrojowni, Sezonu; nie upiększaj pomiarów; podawaj rzeczywiste wyniki;
- test na prawdziwym telefonie pozostaje testem użytkownika — emulacja nie zastępuje urządzenia.

**Wynik końcowy powinien zawierać:**
- działający link do gotowego portalu;
- listę faktycznie wdrożonych funkcji;
- minimum kilka aktualnych zrzutów: uproszczony ekran Wyzwań, Zbrojownia z prawdziwą bronią, miniatury/rzadkości, dział sezonowy (desktop i mobile);
- krótki pokaz animacji/wideo, jeśli środowisko na to pozwala; w przeciwnym razie konkretne opisanie sposobu ich sprawdzenia;
- rzeczywiste wyniki testów oraz jasną listę niezdobytych assetów/niepotwierdzonych danych. Nie pisz, że „wszystko wykonano”, jeśli rzeczywiste obrazy broni są niekompletne.

## 8. Gotowy kierunek decyzji — bez marnowania limitu na konsultacje

Właściciel NIE chce kolejnej rundy 5–10 pytań ani trzech odmiennych makiet. Wybierz sam jeden spójny UX według wymagań, zrealizuj go i przetestuj. Jeśli brakuje materiału do jednego widoku broni, kontynuuj wszystkie pozostałe prace, pozostaw widoczny opis luki i wymagania do ewentualnego własnego screenshota. Zadanie kończy się dopiero, gdy powstanie działająca strona, nie gdy powstanie plan.

**Najważniejsze:** mniej mylących kontrolek, WIĘCEJ prawdziwej zawartości Fortnite, poprawne rzadkości i konkretne bronie, aktualny sezon oraz grafika/animacje realnie lepsze niż teraz.
