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


def pelna_seria(browser, w, h, dotyk):
    ctx = kontekst(browser, w, h, dotyk)
    page, bledy = strona(ctx)
    page.goto(URL)
    expect(page.locator('h1.logo')).to_be_visible()
    expect(page.locator('[data-akcja=rozpocznij]')).to_be_visible()
    expect(page.locator('footer')).to_contain_text('not endorsed by Epic')
    bez_przewijania_w_bok(page, f'start {w}')
    page.fill('#g0', 'Gracz Alfa')
    page.fill('#g1', 'Gracz Beta')
    # Build/Trudny ma 5 kart: wymiana + unieważnienie + 3 rundy
    klik(page, 'label.tryb:has(input[value=zero])', dotyk)
    klik(page, 'label.tryb:has(input[value=build])', dotyk)
    klik(page, 'label.t-trudny', dotyk)
    expect(page.locator('#trudOpis')).to_contain_text('SZTURM')
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
    # wymiana
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
    expect(page.locator('.final-tytul')).to_have_text('Wygrywa Gracz Alfa!')
    page.wait_for_timeout(800)
    expect(page.locator('.kolumna.p0 .sr')).to_have_text('3 pkt')
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
    assert st['gracze'] == ['Gracz Alfa', 'Gracz Beta'] and st['tryb'] == 'build' and st['trudnosc'] == 'trudny'
    assert st['seria']['rundy'][0]['karta'] != ostatnia
    assert not bledy, bledy
    ctx.close()
    ok(f'pełna seria, wymiana, unieważnienie, korekta, remis, rewanż, odświeżanie ({w}×{h}, {"dotyk" if dotyk else "mysz"})')


def klawiatura(browser):
    ctx = kontekst(browser, 1366, 820, False)
    page, bledy = strona(ctx)
    page.goto(URL)
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
    page.goto(URL)
    klik(page, '[data-akcja=rozpocznij]', True)
    klik(page, '.talia', True)
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
    page.goto(URL)
    expect(page.locator('#notaZapisu')).to_contain_text('odświeżenie strony ją skasuje')
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
    page.goto(URL)
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
    expect(page.locator('h1.logo')).to_be_visible()
    klucze = page.evaluate("Object.keys(localStorage).sort()")
    assert klucze == ['kc:parkour:rekordy', 'kc:xp'] or klucze == ['kc:fortnite', 'kc:parkour:rekordy', 'kc:xp'], klucze
    if 'kc:fortnite' in klucze:  # po resecie strona zapisuje czysty stan dopiero przy zmianie
        assert page.evaluate("JSON.parse(localStorage.getItem('kc:fortnite')).etap") == 'start'
    assert not bledy, bledy
    ctx.close()
    ok('uszkodzony zapis i reset tylko danych Fortnite')


def brak_kart(browser):
    ctx = kontekst(browser, 390, 844, True)
    page, bledy = strona(ctx)
    page.goto(URL)
    klik(page, 'label.t-ekspert', True)  # Build/Ekspert ma dokładnie 4 karty
    klik(page, '[data-akcja=rozpocznij]', True)
    odkryj_karte(page, True)
    klik(page, '[data-akcja=graj]', True)
    klik(page, '[data-akcja=rozlicz]', True)
    klik(page, '.panel-gracza.p0 .opcja.tak', True)
    klik(page, '.panel-gracza.p1 .opcja.nie', True)
    klik(page, '[data-akcja=zatwierdz]', True)
    for _ in range(3):
        page.wait_for_timeout(300)
        odkryj_karte(page, True)
        expect(page.locator('[data-akcja=uniewaznij]')).to_be_visible(timeout=3000)
        klik(page, '[data-akcja=uniewaznij]', True)
        klik(page, '[data-akcja=uniewaznij]', True)
        page.wait_for_timeout(350)
    expect(page.locator('.widok-brak')).to_be_visible()
    page.reload()
    expect(page.locator('.widok-brak')).to_be_visible()
    klik(page, '[data-akcja=zakoncz]', True)
    expect(page.locator('.final-tytul')).to_have_text('Wygrywa Gracz 1!')
    expect(page.locator('.widok-final .nota')).to_contain_text('1 z 3')
    assert not bledy, bledy
    ctx.close()
    ok('brak kolejnej karty: zakończenie serii z zachowaniem wyniku')


def reset_nowszego_zapisu(browser):
    ctx = kontekst(browser, 390, 844, True, reduced_motion='reduce')
    page, bledy = strona(ctx)
    page.goto(URL)
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
        brak_kart(browser)
        browser.close()
    print(f'\n{len(wyniki)} testów przeglądarkowych: OK')
    sys.exit(0)
