"""Pomiar płynności animacji przy spowolnionym procesorze (emulacja telefonu).

    python3 testy/podglad.py 8010 --cicho &
    python3 testy/wydajnosc.py 4     # 4× wolniejszy procesor (średni telefon)
    python3 testy/wydajnosc.py 6     # 6× (słabszy telefon)

Mierzy odstępy między klatkami (requestAnimationFrame) w każdej sekwencji
i długie zadania (>50 ms). 16,7 ms = 60 kl./s. To emulacja w Chromium,
nie zastępuje próby na prawdziwym telefonie.
"""
import os, sys
from playwright.sync_api import sync_playwright
URL=os.getenv('PODGLAD', 'http://127.0.0.1:8010') + '/kilek-fortnite/'
RATE=int(sys.argv[1]) if len(sys.argv)>1 else 4
PROBE='''
window.__f=[]; window.__lt=[]; window.__on=false;
new PerformanceObserver(l=>{for(const e of l.getEntries()) window.__lt.push([e.name,Math.round(e.duration)])}).observe({type:'longtask',buffered:true});
(function loop(t){ if(window.__on) window.__f.push(t); requestAnimationFrame(loop); })(performance.now());
'''
def stats(pg,label):
    f=pg.evaluate('window.__f'); pg.evaluate('window.__f=[]')
    d=[b-a for a,b in zip(f,f[1:])]
    if not d: print(label,'brak klatek'); return
    s=sorted(d); p95=s[int(len(s)*.95)-1]; mx=s[-1]
    dropped=sum(1 for x in d if x>34)
    print(f'{label:30s} klatek {len(d):4d}  średnio {sum(d)/len(d):5.1f} ms  p95 {p95:5.1f} ms  max {mx:5.1f} ms  >34ms: {dropped}')
with sync_playwright() as p:
    b=p.chromium.launch(executable_path=os.getenv('CHROMIUM_PATH'), args=['--enable-unsafe-swiftshader'])
    c=b.new_context(viewport={'width':390,'height':844},device_scale_factor=2.75,has_touch=True,is_mobile=True)
    pg=c.new_page(); cdp=c.new_cdp_session(pg)
    cdp.send('Emulation.setCPUThrottlingRate',{'rate':RATE})
    pg.add_init_script(PROBE)
    pg.goto(URL); pg.evaluate('window.__on=true'); pg.wait_for_timeout(1500); stats(pg,'start + układanie mapy')
    pg.locator('.t-ekstremalny').tap(); pg.wait_for_timeout(600); stats(pg,'zmiana trudności')
    # opóźnienie reakcji na dotyk
    lat=pg.evaluate('''()=>new Promise(r=>{const b=document.querySelector('[data-akcja=rozpocznij]');const t0=performance.now();
      b.addEventListener('pointerdown',()=>requestAnimationFrame(()=>r(Math.round(performance.now()-t0))),{once:true});
      b.dispatchEvent(new PointerEvent('pointerdown',{bubbles:true,clientX:10,clientY:10}));b.dispatchEvent(new PointerEvent('pointerup',{bubbles:true}));})''')
    print('reakcja przycisku (pointerdown → następna klatka):', lat, 'ms')
    pg.locator('[data-akcja=rozpocznij]').tap(); pg.wait_for_timeout(900); stats(pg,'przejście do talii')
    pg.locator('.talia').tap(); pg.wait_for_timeout(1000); stats(pg,'losowanie (rozdanie)')
    pg.wait_for_timeout(1000); stats(pg,'karta zakryta (skan)')
    pg.locator('.rewers').tap(); pg.wait_for_timeout(900); stats(pg,'odkrycie (ekstremalny)')
    for r in range(3):
        if r:
            pg.locator('#akcje [data-akcja=pomin]').tap(); pg.wait_for_timeout(500)
        pg.locator('[data-akcja=graj]').tap(); pg.locator('[data-akcja=rozlicz]').tap(); pg.wait_for_timeout(400)
        pg.evaluate('window.__f=[]')
        pg.locator('.panel-gracza.p0 .opcja.tak').tap(); pg.wait_for_timeout(500)
        if r==0: stats(pg,'stempel „Zaliczone”')
        pg.locator('.panel-gracza.p1 .opcja.nie').tap(); pg.wait_for_timeout(200)
        if r == 2:
            pg.evaluate('window.__f=[]')
        pg.locator('[data-akcja=zatwierdz]').tap()
        pg.wait_for_timeout(2600 if r == 2 else 400)
    stats(pg,'finał + konfetti')
    print('długie zadania (>50 ms):', pg.evaluate('window.__lt'))
    b.close()
