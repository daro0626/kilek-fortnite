"""Testy przeglądarkowe KILEK CHALLENGE (Playwright, Chromium).

Najpierw uruchom podgląd pod prefiksem Pages:
    python3 testy/podglad.py 8010 --cicho &
    python3 testy/test_strona.py

Test niczego nie zapisuje w repozytorium.
"""
import os
import re
import sys

from playwright.sync_api import expect, sync_playwright

BASE = os.getenv('PODGLAD', 'http://127.0.0.1:8010')
URL = f'{BASE}/kilek-fortnite/'
ROZMIARY = [(320, 640, True), (390, 844, True), (430, 932, True), (1366, 820, False)]
wyniki = []


def ok(nazwa):
    wyniki.append(nazwa)
    print('✓', nazwa, flush=True)


def kontekst(browser, w, h, dotyk, **kw):
    return browser.new_context(viewport={'width': w, 'height': h}, has_touch=dotyk, is_mobile=dotyk, **kw)


def strona(ctx):
    page = ctx.new_page()
    bledy = []
    page.on('pageerror', lambda e: bledy.append(f'pageerror: {e}'))
    page.on('console', lambda m: bledy.append(f'console: {m.text}') if m.type == 'error' else None)
    page.on('response', lambda r: bledy.append(f'{r.status} {r.url}') if r.status >= 400 else None)
    page.on('request', lambda r: bledy.append(f'poza prefiksem: {r.url}')
            if r.url.startswith(BASE) and not r.url.startswith(f'{BASE}/kilek-fortnite/') else None)
    page.on('request', lambda r: bledy.append(f'zewnętrzne żądanie: {r.url}')
            if not r.url.startswith(BASE) and not r.url.startswith(('data:', 'blob:')) else None)
    return page, bledy


def bez_przewijania_w_bok(page, gdzie):
    # Na telefonie przepełnienie poszerza „layout viewport”, więc porównujemy z rozmiarem ekranu.
    w = page.viewport_size['width']
    sw, iw = page.evaluate('[document.documentElement.scrollWidth, innerWidth]')
    assert sw <= w and iw == w, f'{gdzie}: poziome przewijanie (scrollWidth {sw}, innerWidth {iw}, ekran {w})'


def klik(page, sel, dotyk, timeout=None):
    loc = page.locator(sel).first
    if dotyk:
        loc.tap(timeout=timeout)
    else:
        loc.click(timeout=timeout)


def odkryj_karte(page, dotyk):
    """Odkrywa bieżącą kartę niezależnie od tego, w której fazie losowania jest strona."""
    for _ in range(60):
        if page.evaluate('document.body.dataset.etap') in ('karta', 'mecz') and page.locator('#akcje [data-akcja=graj], #akcje [data-akcja=rozlicz]').count():
            return
        for sel in ('#akcje [data-akcja=pomin]', '#akcje [data-akcja=odkryj]'):
            if page.locator(sel).count():
                try:
                    klik(page, sel, dotyk, timeout=1500)
                except Exception:
                    pass  # przycisk zmienił się w trakcie dotknięcia; kolejna próba za chwilę
                break
        page.wait_for_timeout(100)
    raise AssertionError('karta się nie odkryła')


def karta_id(page):
    return page.evaluate("JSON.parse(localStorage.getItem('kc:fortnite')).seria.rundy.at(-1).karta")


def etap(page):
    return page.evaluate("JSON.parse(localStorage.getItem('kc:fortnite')).etap")


def wybierz_turniej(page, dotyk, forma='seria'):
    klik(page, 'label:has(input[name=cel-gry][value=turniej])', dotyk)
    page.locator('select[name=forma-gry]').select_option(forma)
    expect(page.locator('[data-akcja=rozpocznij]')).to_have_text('Rozpocznij turniej')


def pelna_seria(browser, w, h, dotyk):
    ctx = kontekst(browser, w, h, dotyk)
    page, bledy = strona(ctx)
    page.goto(URL)
    expect(page.locator('#portal-tytul')).to_be_visible()
    bez_przewijania_w_bok(page, f'portal {w}')
    klik(page, '[data-nav=wyzwania]', dotyk)
    expect(page.locator('h1.gra-tytul')).to_be_visible()
    expect(page.locator('[data-akcja=rozpocznij]')).to_be_visible()
    expect(page.locator('footer')).to_contain_text('not endorsed by Epic')
    bez_przewijania_w_bok(page, f'start {w}')
    assert page.evaluate("""() => {
        const pozycja = sel => document.querySelector(sel).getBoundingClientRect();
        return pozycja('#opisFormy').bottom <= pozycja('.wybor-start-cta').top &&
            pozycja('.wybor-start-cta').bottom <= pozycja('#notaZapisu').top;
    }"""), 'przycisk startu nachodzi na tekst'
    wybierz_turniej(page, dotyk)
    klik(page, '#startWiecej summary', dotyk)
    page.fill('#g0', 'Gracz Alfa')
    page.fill('#g1', 'Gracz Beta')
    page.locator('select[name=tryb]').select_option('zero')
    page.locator('select[name=tryb]').select_option('build')
    page.locator('select[name=trud]').select_option('trudny')
    assert '5 pkt' in page.locator('select[name=trud] option:checked').inner_text()
    klik(page, '[data-akcja=rozpocznij]', dotyk)
    expect(page.locator('.runda-tytul')).to_contain_text('Runda 1')
    pierwsza = karta_id(page)
    # odświeżenie przed odkryciem: ta sama karta
    page.reload()
    assert karta_id(page) == pierwsza
    expect(page.locator('.talia')).to_be_visible()
    bez_przewijania_w_bok(page, f'talia {w}')
    klik(page, '.talia', dotyk)
    page.wait_for_timeout(250)
    bez_przewijania_w_bok(page, f'losowanie {w}')
    expect(page.locator('.rama')).to_have_attribute('data-faza', re.compile('zakryta|odkryta'), timeout=3000)
    if page.locator('.rama[data-faza=zakryta]').count():
        klik(page, '[data-akcja=odkryj]', dotyk)
    expect(page.locator('#kartaTytul')).to_be_visible()
    assert etap(page) == 'karta' and karta_id(page) == pierwsza
    bez_przewijania_w_bok(page, f'karta {w}')
    # wymiana wymaga potwierdzenia porzucenia karty
    klik(page, '[data-akcja=wymien]', dotyk)
    klik(page, '[data-akcja=wymien]', dotyk)
    expect(page.locator('.rama')).to_have_attribute('data-faza', re.compile('zakryta|odkryta|rozdawanie'), timeout=3000)
    page.wait_for_function("JSON.parse(localStorage.getItem('kc:fortnite')).seria.wymiana === true")
    druga = karta_id(page)
    assert druga != pierwsza
    odkryj_karte(page, dotyk)
    expect(page.locator('[data-akcja=wymien]')).to_be_disabled(timeout=3000)
    # odświeżenie na karcie
    page.reload()
    expect(page.locator('#kartaTytul')).to_be_visible()
    assert karta_id(page) == druga
    # unieważnienie (dwa dotknięcia: potwierdzenie)
    klik(page, '[data-akcja=uniewaznij]', dotyk)
    klik(page, '[data-akcja=uniewaznij]', dotyk)
    page.wait_for_function(f"JSON.parse(localStorage.getItem('kc:fortnite')).seria.rundy.at(-1).karta !== '{druga}'")
    assert page.evaluate("JSON.parse(localStorage.getItem('kc:fortnite')).seria.wymiana") is True
    for runda in range(3):
        page.wait_for_timeout(300)
        odkryj_karte(page, dotyk)
        expect(page.locator('[data-akcja=graj]')).to_be_visible(timeout=3000)
        klik(page, '[data-akcja=graj]', dotyk)
        assert etap(page) == 'mecz'
        page.reload()
        expect(page.locator('[data-akcja=rozlicz]')).to_be_visible()
        klik(page, '[data-akcja=rozlicz]', dotyk)
        expect(page.locator('.panel-gracza')).to_have_count(2)
        expect(page.locator('[data-akcja=zatwierdz]')).to_be_disabled()
        klik(page, '.panel-gracza.p0 .opcja.tak', dotyk)
        klik(page, '.panel-gracza.p0 .opcja.tak', dotyk)  # drugie dotknięcie: bez zmiany
        klik(page, '.panel-gracza.p1 .opcja.tak', dotyk)
        klik(page, '.panel-gracza.p1 .opcja.nie', dotyk)  # korekta
        page.reload()
        expect(page.locator('.panel-gracza.p1')).to_have_attribute('data-wynik', '0')
        bez_przewijania_w_bok(page, f'rozliczenie {w}')
        # podwójne dotknięcie zatwierdzenia
        page.locator('[data-akcja=zatwierdz]').dblclick()
        page.wait_for_timeout(400)
        assert page.evaluate("JSON.parse(localStorage.getItem('kc:fortnite')).seria.rundy.filter(r => !r.uniewazniona && r.wyniki.every(w => w !== null)).length") == runda + 1
        if runda == 0 and w == 390:
            page.locator('select[name=trud-rundy]').select_option('normalny')
            page.wait_for_function("JSON.parse(localStorage.getItem('kc:fortnite')).seria.rundy.at(-1).karta.startsWith('N')")
            expect(page.locator('.hud-gracz.p0 b')).to_have_text('5')
    expect(page.locator('.final-tytul')).to_have_text('Wygrywa Gracz Alfa!')
    page.wait_for_timeout(800)
    expect(page.locator('.kolumna.p0 .sr')).to_have_text('11 pkt' if w == 390 else '15 pkt')
    expect(page.locator('.kolumna.p1 .sr')).to_have_text('0 pkt')
    bez_przewijania_w_bok(page, f'finał {w}')
    # korekta w finale prowadzi do remisu
    for r in range(3):
        klik(page, f'[data-akcja=popraw][data-r="{r}"][data-g="1"]', dotyk)
    klik(page, '[data-akcja=popraw][data-r="0"][data-g="0"]', dotyk)
    klik(page, '[data-akcja=popraw][data-r="0"][data-g="1"]', dotyk)
    expect(page.locator('.final-tytul')).to_have_text('Remis!')
    expect(page.locator('.widok-final')).to_have_attribute('data-wynik', 'remis')
    page.reload()
    expect(page.locator('.final-tytul')).to_have_text('Remis!')
    ostatnia = page.evaluate("JSON.parse(localStorage.getItem('kc:fortnite')).ostatnia")
    klik(page, '[data-akcja=rewanz]', dotyk)
    expect(page.locator('.runda-tytul')).to_contain_text('Runda 1')
    st = page.evaluate("JSON.parse(localStorage.getItem('kc:fortnite'))")
    assert st['gracze'] == ['Gracz Alfa', 'Gracz Beta'] and st['tryb'] == 'build'
    assert st['trudnosc'] == ('normalny' if w == 390 else 'trudny')
    assert st['seria']['rundy'][0]['karta'] != ostatnia
    assert not bledy, bledy
    ctx.close()
    ok(f'pełna seria, wymiana, unieważnienie, korekta, remis, rewanż, odświeżanie ({w}×{h}, {"dotyk" if dotyk else "mysz"})')


def klawiatura(browser):
    ctx = kontekst(browser, 1366, 820, False)
    page, bledy = strona(ctx)
    page.goto(URL + '#wyzwania')
    wybierz_turniej(page, False)
    page.reload()
    page.keyboard.press('Tab')
    expect(page.locator('.skip')).to_be_focused()
    # przejście klawiaturą do przycisku startu
    for _ in range(40):
        page.keyboard.press('Tab')
        if page.evaluate("document.activeElement.dataset.akcja") == 'rozpocznij':
            break
    assert page.evaluate("document.activeElement.dataset.akcja") == 'rozpocznij'
    outline = page.evaluate("getComputedStyle(document.activeElement).outlineStyle")
    assert outline != 'none', 'brak widocznego fokusu'
    page.keyboard.press('Enter')
    expect(page.locator('.runda-tytul')).to_be_focused()
    page.locator('[data-akcja=losuj]').first.focus()
    page.keyboard.press('Enter')
    expect(page.locator('.rewers')).to_be_focused(timeout=3000)
    page.keyboard.press('Enter')
    expect(page.locator('#kartaTytul')).to_be_focused(timeout=3000)
    page.locator('[data-akcja=graj]').focus()
    page.keyboard.press('Enter')
    page.locator('[data-akcja=rozlicz]').focus()
    page.keyboard.press('Enter')
    expect(page.locator('.sekcja-tytul')).to_be_focused()
    page.locator('.panel-gracza.p0 .opcja.tak').focus(); page.keyboard.press('Space')
    page.locator('.panel-gracza.p1 .opcja.nie').focus(); page.keyboard.press('Enter')
    expect(page.locator('[data-akcja=zatwierdz]')).to_be_enabled()
    # arkusz zasad: zakładki strzałkami, Escape zamyka
    page.locator('[data-akcja=info]').focus(); page.keyboard.press('Enter')
    expect(page.locator('#info')).to_be_visible()
    bez_przewijania_w_bok(page, 'arkusz')
    page.locator('#zk1').focus(); page.keyboard.press('ArrowRight')
    expect(page.locator('#zk2')).to_be_focused()
    expect(page.locator('#zp2')).to_be_visible()
    page.keyboard.press('Escape')
    expect(page.locator('#info')).to_be_hidden()
    assert not bledy, bledy
    ctx.close()
    ok('obsługa klawiaturą i widoczny fokus')


def ograniczony_ruch(browser):
    ctx = kontekst(browser, 390, 844, True, reduced_motion='reduce')
    page, bledy = strona(ctx)
    page.goto(URL + '#wyzwania')
    klik(page, '[data-akcja=rozpocznij]', True)
    # bez animacji: karta odkryta od razu
    expect(page.locator('#kartaTytul')).to_be_visible(timeout=500)
    expect(page.locator('#kartaTytul')).to_be_focused()
    assert etap(page) == 'karta'
    n = page.evaluate("document.getAnimations().filter(a => a.playState === 'running').length")
    assert n == 0, f'{n} animacji przy ograniczonym ruchu'
    assert not bledy, bledy
    ctx.close()
    ok('prefers-reduced-motion: wynik natychmiast, fokus na karcie, brak animacji')


def zapis_zablokowany(browser):
    ctx = kontekst(browser, 390, 844, True)
    ctx.add_init_script("""
      Object.defineProperty(window, 'localStorage', { get() { throw new DOMException('zablokowane', 'SecurityError'); } });
    """)
    page, bledy = strona(ctx)
    page.goto(URL + '#wyzwania')
    expect(page.locator('#notaZapisu')).to_contain_text('odświeżenie strony ją skasuje')
    wybierz_turniej(page, True)
    klik(page, '[data-akcja=rozpocznij]', True)
    odkryj_karte(page, True)
    klik(page, '[data-akcja=graj]', True)
    klik(page, '[data-akcja=rozlicz]', True)
    klik(page, '.panel-gracza.p0 .opcja.tak', True)
    klik(page, '.panel-gracza.p1 .opcja.tak', True)
    klik(page, '[data-akcja=zatwierdz]', True)
    expect(page.locator('.runda-tytul')).to_contain_text('Runda 2')
    assert not bledy, bledy
    ctx.close()
    ok('zablokowany zapis: komunikat i gra w bieżącej karcie')


def zapis_uszkodzony_i_reset(browser):
    ctx = kontekst(browser, 390, 844, True)
    page, bledy = strona(ctx)
    page.goto(URL + '#wyzwania')
    page.evaluate("""() => {
      localStorage.setItem('kc:fortnite', '{zepsute');
      localStorage.setItem('kc:xp', '{"xp":12}');
      localStorage.setItem('kc:parkour:rekordy', '[1]');
    }""")
    page.reload()
    expect(page.locator('#komunikat')).to_contain_text('uszkodzony')
    expect(page.locator('[data-akcja=rozpocznij]')).to_be_visible()
    klik(page, '[data-akcja=rozpocznij]', True)
    klik(page, '[data-akcja=info]', True)
    klik(page, '#zk2', True)
    klik(page, '[data-reset]', True)
    klik(page, '[data-reset]', True)
    expect(page.locator('h1.gra-tytul')).to_be_visible()
    klucze = page.evaluate("Object.keys(localStorage).sort()")
    assert klucze == ['kc:parkour:rekordy', 'kc:xp'] or klucze == ['kc:fortnite', 'kc:parkour:rekordy', 'kc:xp'], klucze
    if 'kc:fortnite' in klucze:  # po resecie strona zapisuje czysty stan dopiero przy zmianie
        assert page.evaluate("JSON.parse(localStorage.getItem('kc:fortnite')).etap") == 'start'
    assert not bledy, bledy
    ctx.close()
    ok('uszkodzony zapis i reset tylko danych Fortnite')


def przerwanie_serii(browser):
    ctx = kontekst(browser, 390, 844, True, reduced_motion='reduce')
    page, bledy = strona(ctx)
    page.goto(URL + '#wyzwania')
    wybierz_turniej(page, True)
    klik(page, '[data-akcja=rozpocznij]', True)
    odkryj_karte(page, True)
    klik(page, '[data-akcja=graj]', True)
    klik(page, '[data-akcja=rozlicz]', True)
    klik(page, '.panel-gracza.p0 .opcja.tak', True)
    klik(page, '.panel-gracza.p1 .opcja.nie', True)
    klik(page, '[data-akcja=zatwierdz]', True)
    klik(page, '[data-akcja=zakoncz]', True)
    expect(page.locator('#potwierdz-serie')).to_be_visible()
    klik(page, '#potwierdz-serie [value=reset]', True)
    expect(page.locator('.final-tytul')).to_have_text('Wygrywa Gracz 1!')
    expect(page.locator('.widok-final .nota')).to_contain_text('1 z 3')
    page.reload()
    expect(page.locator('.kolumna.p0 .sr')).to_have_text('1 pkt')
    assert not bledy, bledy
    ctx.close()
    ok('przerwanie serii po potwierdzeniu i zachowanie rozegranej rundy')


def reset_nowszego_zapisu(browser):
    ctx = kontekst(browser, 390, 844, True, reduced_motion='reduce')
    page, bledy = strona(ctx)
    page.goto(URL + '#wyzwania')
    page.evaluate("localStorage.setItem('kc:fortnite', JSON.stringify({ v: 99 }))")
    page.reload()
    expect(page.locator('#komunikat')).to_contain_text('nowszej wersji')
    klik(page, '[data-akcja=info]', True)
    klik(page, '#zk2', True)
    klik(page, '[data-reset]', True)
    klik(page, '[data-reset]', True)
    klik(page, '[data-akcja=rozpocznij]', True)
    karta = karta_id(page)
    page.reload()
    assert karta_id(page) == karta
    assert not bledy, bledy
    ctx.close()
    ok('reset zapisu z nowszej wersji ponownie włącza zapis serii')


def portal_i_swobodne_losowanie(browser):
    ctx = kontekst(browser, 390, 844, True, reduced_motion='reduce')
    page, bledy = strona(ctx)
    page.goto(URL)
    klik(page, '[data-akcja=graj-od-razu]', True)
    odkryj_karte(page, True)
    pierwsza = karta_id(page)
    tytul = page.locator('#kartaTytul').inner_text()
    klik(page, '[data-nav=start]', True)
    expect(page.locator('#kontynuuj')).to_be_visible()
    expect(page.locator('#portal-zapis')).to_contain_text(tytul)
    klik(page, '[data-nav=misje]', True)
    page.locator('#katalog-szukaj').fill('Wygraj bez strzelby')
    page.locator('#katalog-tryb').select_option('zero')
    page.locator('#katalog-trud').select_option('ekstremalny')
    karta = page.locator('.katalog-karta')
    expect(karta).to_have_count(1)
    klik(page, '.katalog-karta summary', True)
    expect(karta).to_contain_text('Victory Royale')
    expect(karta).to_contain_text('Zero Build')
    page.go_back()
    expect(page.locator('#portal-tytul')).to_be_visible()
    klik(page, '#kontynuuj', True)
    expect(page.locator('#kartaTytul')).to_have_text(tytul)
    page.reload()
    expect(page.locator('#kartaTytul')).to_have_text(tytul)
    assert karta_id(page) == pierwsza
    for _ in range(7):
        poprzednia = karta_id(page)
        klik(page, '[data-akcja=wymien]', True)
        odkryj_karte(page, True)
        assert karta_id(page) != poprzednia
    klik(page, '[data-akcja=graj]', True)
    klik(page, '[data-akcja=kolejna-swobodna]', True)
    expect(page.locator('.rama')).to_have_attribute('data-faza', 'talia')
    page.locator('select[name=trud-rundy]').select_option('ekstremalny')
    odkryj_karte(page, True)
    assert karta_id(page).startswith('E')
    klik(page, '[data-akcja=konfiguracja]', True)
    expect(page.locator('#potwierdz-serie')).to_be_visible()
    page.keyboard.press('Escape')
    expect(page.locator('#kartaTytul')).to_be_visible()
    klik(page, '[data-akcja=konfiguracja]', True)
    klik(page, '#potwierdz-serie [value=reset]', True)
    expect(page.locator('h1.gra-tytul')).to_be_visible()
    assert etap(page) == 'start'
    assert not bledy, bledy
    ctx.close()
    ok('Start, katalog, Wstecz, ta sama karta, dowolna liczba losowań, trudność i potwierdzenie resetu')


def dzial(page, nazwa, dotyk):
    link = page.locator(f'[data-nav={nazwa}]')
    if not link.is_visible():
        klik(page, '.portal-menu-toggle', dotyk)
    klik(page, f'[data-nav={nazwa}]', dotyk)
    expect(page.locator(f'main section[data-dzial={nazwa}]')).to_be_visible()


def legendarne_wyniki(browser):
    ctx = kontekst(browser, 390, 844, True, reduced_motion='reduce')
    page, bledy = strona(ctx)
    page.goto(URL + '#wyzwania')
    for sposob, punkty in [('seria', [25, 25]), ('duet', [25])]:
        wybierz_turniej(page, True, sposob)
        klik(page, '#startSpecjalne summary', True)
        klik(page, '[data-akcja=zaznacz-legendarna]', True)
        expect(page.locator('#startLegenda')).to_contain_text('25 pkt')
        klik(page, '[data-akcja=rozpocznij]', True)
        expect(page.locator('.stol-stawka')).to_contain_text('25 pkt')
        odkryj_karte(page, True)
        expect(page.locator('#kartaTytul')).to_have_text('Wygraj bez broni')
        expect(page.locator('.karta')).to_contain_text('kilofem')
        klik(page, '[data-akcja=graj]', True)
        page.reload()
        assert karta_id(page) == 'S01'
        klik(page, '[data-akcja=rozlicz]', True)
        expect(page.locator('.panel-gracza')).to_have_count(len(punkty))
        for i in range(len(punkty)):
            klik(page, f'.panel-gracza.p{i} .opcja.tak', True)
        page.locator('[data-akcja=zatwierdz]').dblclick()
        expect(page.locator('.kolumna .sr')).to_have_text(['25 pkt'] * len(punkty))
        page.reload()
        zapis = page.evaluate("JSON.parse(localStorage.getItem('kc:fortnite'))")
        assert zapis['historia'][0]['punkty'] == punkty
        assert zapis['historia'][0]['rundy'][0]['punkty'] == 25
        assert len(zapis['historia']) == (1 if sposob == 'seria' else 2)
        dzial(page, 'turnieje', True)
        expect(page.locator('.odznaki').filter(has_text='Legendarne 25').first).to_be_visible()
        dzial(page, 'wyzwania', True)
        if sposob == 'seria':
            klik(page, '[data-akcja=popraw][data-g="1"]', True)
            expect(page.locator('.kolumna.p1 .sr')).to_have_text('0 pkt')
            klik(page, '[data-akcja=konfiguracja]', True)
            klik(page, '#potwierdz-serie [value=reset]', True)
    assert not bledy, bledy
    ctx.close()
    ok('Legendarna: remis 25:25, pojedyncze 25 duetu, korekta, odświeżenie i lokalny ranking')


def dzialy_i_opinie(browser):
    for w, h, dotyk in ROZMIARY:
        ctx = kontekst(browser, w, h, dotyk, reduced_motion='reduce')
        page, bledy = strona(ctx)
        page.goto(URL)
        expect(page.locator('.arena-obrot')).to_be_visible()
        page.wait_for_function("""() => {
            const canvas = document.querySelector('#arena-canvas');
            const pixels = canvas.getContext('2d').getImageData(0, 0, canvas.width, canvas.height).data;
            return pixels.some((value, i) => i % 4 === 3 && value > 100);
        }""", timeout=6000)
        obraz = page.locator('#arena-canvas').evaluate('(el) => el.toDataURL()')
        klik(page, '.arena-obrot', dotyk)
        page.wait_for_function("(obraz) => document.querySelector('#arena-canvas').toDataURL() !== obraz", arg=obraz)
        klik(page, '[data-akcja=graj-od-razu]', dotyk)
        odkryj_karte(page, dotyk)
        misja = karta_id(page)
        dzial(page, 'zbrojownia', dotyk)
        bez_przewijania_w_bok(page, f'zbrojownia {w}')
        expect(page.locator('#arsenal-karty a')).to_have_count(7)
        expect(page.locator('#arsenal-widok h2')).to_have_text('Pistolet krzemieniowy')
        assert page.evaluate("document.querySelector('.arsenal-gora .znacznik').getBoundingClientRect().bottom <= document.querySelector('.arsenal-gora h2').getBoundingClientRect().top")
        page.wait_for_function("document.querySelector('#arsenal-foto img').naturalWidth > 500")
        expect(page.locator('#arsenal-foto img')).to_have_attribute('src', re.compile('flint-render'))
        klik(page, '[data-zoom]', dotyk)
        expect(page.locator('.arsenal-dialog')).to_be_visible()
        page.keyboard.press('Escape')
        expect(page.locator('.arsenal-dialog')).to_be_hidden()
        klik(page, '[data-ujecie=gra]', dotyk)
        expect(page.locator('#arsenal-foto')).to_contain_text('Brak potwierdzonego ujęcia')
        page.locator('#arsenal-wariant').select_option('flint/br-epicka')
        expect(page.locator('.arsenal-gora .arsenal-rzadkosc')).to_have_text('Epicka')
        expect(page.locator('.arsenal-parametry')).to_contain_text('95')
        page.locator('[data-porownaj]').first.select_option('usopp/blitz-legendarna')
        expect(page.locator('#arsenal-porownanie')).to_contain_text('Wyścigówa Usoppa')
        expect(page.locator('#arsenal-porownanie')).to_contain_text('Brak potwierdzonych danych')
        page.locator('[name=okres]').select_option('archiwum')
        expect(page.locator('#arsenal-karty a')).to_have_count(1)
        expect(page.locator('.arsenal-status')).to_have_text('Archiwum')
        page.locator('[name=okres]').select_option('sezon')
        page.locator('[name=playlista]').select_option('blitz')
        expect(page.locator('#arsenal-karty a')).to_have_count(4)
        page.locator('[name=rzadkosc]').select_option('mityczna')
        expect(page.locator('#arsenal-widok h2')).to_have_text('Karabin szturmowy Młot')
        expect(page.locator('#arsenal-widok')).to_contain_text('Blitz Royale')
        dzial(page, 'akademia', dotyk)
        bez_przewijania_w_bok(page, f'akademia {w}')
        expect(page.locator('[data-lekcja]')).to_have_count(10)
        for i, id in [(0, 'strefa'), (2, 'cel'), (3, 'dystans'), (4, 'oslona')]:
            klik(page, f'[data-lekcja="{i}"]', dotyk)
            expect(page.locator(f'.demo-scena.demo-{id}')).to_be_visible()
            suwak = page.locator('#lekcja-demo input')
            suwak.press('Home')
            suwak.press('ArrowRight')
            if id == 'cel':
                suwak.evaluate("(el) => { el.value = 74; el.dispatchEvent(new Event('input', { bubbles: true })); }")
                klik(page, '#lekcja-demo button', dotyk)
                expect(page.locator('#lekcja-demo [role=status]')).to_contain_text('Trafienie · 1/1')
        for i in range(3):
            klik(page, f'#quiz-form label:has(input[name="quiz-{i}"][value="{i}"])', dotyk)
        klik(page, '#quiz-form button', dotyk)
        expect(page.locator('#quiz-wynik')).to_contain_text('3/3')
        dzial(page, 'aktualnie', dotyk)
        bez_przewijania_w_bok(page, f'aktualnie {w}')
        expect(page.locator('.sezon-hero h1')).to_have_text('Łowcy Skarbów')
        assert page.evaluate("document.querySelector('.sezon-hero .znacznik').getBoundingClientRect().bottom <= document.querySelector('.sezon-hero h1').getBoundingClientRect().top")
        expect(page.locator('.sezon-playlisty article')).to_have_count(4)
        expect(page.locator('.sezon-hero img')).to_be_visible()
        klik(page, '.sezon-przedmiot[href="#zbrojownia/flapjack"]', dotyk)
        expect(page.locator('#arsenal-widok h2')).to_have_text('Karabin naleśnikowy')
        page.reload()
        expect(page.locator('#arsenal-widok h2')).to_have_text('Karabin naleśnikowy')
        dzial(page, 'turnieje', dotyk)
        bez_przewijania_w_bok(page, f'turnieje {w}')
        dzial(page, 'wyzwania', dotyk)
        assert karta_id(page) == misja
        expect(page.locator('#kartaTytul')).to_be_visible()
        dzial(page, 'misje', dotyk)
        bez_przewijania_w_bok(page, f'katalog {w}')
        page.locator('#katalog-kategoria').select_option('Bez broni')
        expect(page.locator('.katalog-karta')).to_have_count(1)
        klik(page, '[data-misja=S01] summary', dotyk)
        page.locator('[data-misja=S01] select[name=ocena]').select_option('w sam raz')
        page.locator('[data-misja=S01] input[name=notatka]').fill('Próba lokalna')
        klik(page, '[data-misja=S01] button[type=submit]', dotyk)
        expect(page.locator('[data-misja=S01] .katalog-ocena')).to_have_text('Moja ocena: w sam raz')
        assert 'Próba lokalna' in page.locator('#katalog-podsumowanie').input_value()
        page.reload()
        assert 'Próba lokalna' in page.locator('#katalog-podsumowanie').input_value()
        assert not bledy, bledy
        ctx.close()
    ok('siedem działów, arena, porównanie, cztery demonstracje, quiz i opinie na czterech ekranach')


def szybki_start_i_turniej_solo(browser):
    ctx = kontekst(browser, 390, 844, True, reduced_motion='reduce')
    page, bledy = strona(ctx)
    page.goto(URL + '#wyzwania')
    expect(page.locator('input[name=cel-gry][value=swobodny]')).to_be_checked()
    expect(page.locator('#startRundy')).to_be_hidden()
    expect(page.locator('[data-akcja=rozpocznij]')).to_have_text('Losuj wyzwanie')
    page.locator('select[name=forma-gry]').select_option('duet')
    expect(page.locator('select[name=sklad]')).to_have_count(0)
    klik(page, '[data-akcja=rozpocznij]', True)
    expect(page.locator('#kartaTytul')).to_be_visible()
    expect(page.locator('#hud')).to_be_hidden()
    assert 'pkt' not in page.locator('.karta-meta').inner_text()
    assert page.evaluate("JSON.parse(localStorage.getItem('kc:fortnite')).sklad") == 'duo'
    klik(page, '[data-akcja=konfiguracja]', True)
    klik(page, '#potwierdz-serie [value=reset]', True)
    wybierz_turniej(page, True, 'solo')
    for nazwa in ['1 pkt','3 pkt','5 pkt','7 pkt','10 pkt']:
        assert any(nazwa in t for t in page.locator('select[name=trud] option').all_text_contents())
    dzial(page, 'misje', True)
    page.locator('#katalog-kategoria').select_option('Bez broni')
    klik(page, '[data-misja=S01] summary', True)
    klik(page, '[data-misja=S01] [data-akcja=zaznacz-legendarna]', True)
    expect(page.locator('#startLegenda')).to_be_visible()
    klik(page, '[data-akcja=rozpocznij]', True)
    odkryj_karte(page, True)
    klik(page, '[data-akcja=graj]', True)
    klik(page, '[data-akcja=rozlicz]', True)
    expect(page.locator('.panel-gracza')).to_have_count(1)
    klik(page, '.opcja.tak', True)
    klik(page, '[data-akcja=zatwierdz]', True)
    expect(page.locator('.final-tytul')).to_have_text('Wynik solo')
    expect(page.locator('.kolumna .sr')).to_have_text('25 pkt')
    dzial(page, 'turnieje', True)
    expect(page.locator('.wiedza-panel').filter(has=page.get_by_role('heading', name='Ranking solo')).locator('.ranking')).to_contain_text('25 pkt')
    assert not bledy, bledy
    ctx.close()
    ok('jedno CTA szybkiej gry, wspólny mecz bez drugiego wyboru i turniej solo z katalogu')


def migracja_legacy_w_ui(browser):
    ctx = kontekst(browser, 390, 844, True, reduced_motion='reduce')
    page, bledy = strona(ctx)
    page.goto(URL)
    page.evaluate("""localStorage.setItem('kc:fortnite', JSON.stringify({
      v:2, etap:'karta', tryb:'build', trudnosc:'ekstremalny', sposob:'seria', gracze:['Iskra','Błysk'],
      seria:{pokazane:['E01','E04'],rundy:[{karta:'E01',wyniki:[1,1],odkryta:true},{karta:'E04',wyniki:[null,null],odkryta:true}]}
    }))""")
    page.goto(URL + '#wyzwania')
    page.reload()
    expect(page.locator('#kartaTytul')).to_have_text('Oko burzy')
    expect(page.locator('.karta-meta')).to_contain_text('1 pkt · legacy')
    expect(page.locator('.hud-gracz.p0 b')).to_have_text('1')
    page.locator('select[name=trud-rundy]').select_option('normalny')
    expect(page.locator('#potwierdz-serie')).to_be_visible()
    klik(page, '#potwierdz-serie [value=reset]', True)
    odkryj_karte(page, True)
    expect(page.locator('.karta-meta')).to_contain_text('3 pkt')
    expect(page.locator('.hud-gracz.p0 b')).to_have_text('1')
    assert not bledy, bledy
    ctx.close()
    ok('migracja legacy, potwierdzenie porzucenia i punktacja następnej rundy')


def od_nowa_i_tryb_gry(browser):
    """Nowa gra musi być osiągalna z ekranu Start bez szukania ukrytego resetu."""
    ctx = kontekst(browser, 390, 844, True, reduced_motion='reduce')
    page, bledy = strona(ctx)
    page.goto(URL + '#wyzwania')
    expect(page.get_by_text('Tryb gry', exact=True)).to_be_visible()
    nazwy = page.locator('select[name=forma-gry]').inner_text()
    assert 'Solo' in nazwy and 'Duo' in nazwy, nazwy
    expect(page.get_by_text('Budowanie', exact=True)).to_be_visible()
    klik(page, '[data-akcja=rozpocznij]', True)
    dzial(page, 'start', True)
    expect(page.locator('#kontynuuj')).to_be_visible()
    expect(page.locator('#od-nowa')).to_be_visible()
    page.reload()
    expect(page.locator('#od-nowa')).to_be_visible()
    klik(page, '#od-nowa', True)
    expect(page.locator('#potwierdz-serie')).to_be_visible()
    expect(page.locator('#potwierdz-tytul')).to_have_text('Zacząć od nowa?')
    klik(page, '#potwierdz-serie button[value=reset]', True)
    expect(page.locator('[data-akcja=rozpocznij]')).to_be_visible()
    assert etap(page) == 'start'
    assert page.evaluate('location.hash') == '#wyzwania'
    assert not bledy, bledy
    ctx.close()
    ok('widoczne Od nowa z potwierdzeniem i nazwy Solo/Duo na telefonie')


if __name__ == '__main__':
    with sync_playwright() as pw:
        browser = pw.chromium.launch(executable_path=os.getenv('CHROMIUM_PATH'), args=['--enable-unsafe-swiftshader'])
        for w, h, dotyk in ROZMIARY:
            pelna_seria(browser, w, h, dotyk)
        klawiatura(browser)
        ograniczony_ruch(browser)
        zapis_zablokowany(browser)
        zapis_uszkodzony_i_reset(browser)
        reset_nowszego_zapisu(browser)
        przerwanie_serii(browser)
        portal_i_swobodne_losowanie(browser)
        legendarne_wyniki(browser)
        dzialy_i_opinie(browser)
        migracja_legacy_w_ui(browser)
        szybki_start_i_turniej_solo(browser)
        od_nowa_i_tryb_gry(browser)
        browser.close()
    print(f'\n{len(wyniki)} testów przeglądarkowych: OK')
    sys.exit(0)
