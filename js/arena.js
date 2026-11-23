// Rysowana lokalnie arena: warstwy geometrii, perspektywa i niezależna orbita.
const TAU = 2 * Math.PI;
const pierscien = (r, y, n, od = 0, doKat = TAU) =>
  Array.from({ length: n + 1 }, (_, i) => {
    const a = od + (doKat - od) * i / n;
    return [Math.sin(a) * r, y, Math.cos(a) * r];
  });

const podstawa = [
  { p: pierscien(145, -92, 6), kolor: '#6339a7', wyp: '#170e30' },
  { p: pierscien(145, -75, 6), kolor: '#b38bff', wyp: '#251649' },
  { p: pierscien(125, -73, 6), kolor: '#8c57ea', wyp: '#110e2d' },
  { p: pierscien(106, -71, 40), kolor: '#8446f0' },
  { p: pierscien(94, -70, 40), kolor: '#35e4ff99' },
];
const prowadnice = Array.from({length: 6}, (_, i) => {
  const a = TAU * i / 6, punkty = [62, 99, 128, 158].map(r => [Math.sin(a) * r, -69, Math.cos(a) * r]);
  return { p: punkty, kolor: i % 2 ? '#ff96529e' : '#944ffb' };
});
const siatka = Array.from({length: 13}, (_, i) => (i - 6) * 31).flatMap(i => [
  { p: [[i, -105, -186], [i, -105, 186]], kolor: '#8b5cf625' },
  { p: [[-186, -105, i], [186, -105, i]], kolor: '#8b5cf625' },
]);
const orbity = [
  { p: pierscien(137, -27, 42, .2, 4.9), kolor: '#a977ff95' },
  { p: pierscien(153, -19, 36, 2.65, 5.6), kolor: '#ff9b5488' },
  { p: pierscien(118, 19, 24, .7, 3.3), kolor: '#35e4ff65' },
];
const odlamki = Array.from({length: 20}, (_, i) => ({ a: TAU * i / 20, r: 110 + (i * 31 % 54), y: -75 + (i * 29 % 141) }));

export function uruchomArene(canvas) {
  const ctx = canvas?.getContext('2d');
  if (!ctx) return;
  const scena = canvas.closest('.portal-scena');
  const ruch = matchMedia('(prefers-reduced-motion: reduce)');
  const gest = matchMedia('(pointer: coarse)');
  let szer = 0, wys = 0, dpr = 1, widoczna = false, klatka, obrot = -.52, celObrotu = -.52, przesuniecie = 0;
  let czas = 0, ostatnia = -Infinity;
  const barwy = ['#9e66ff', '#5d38aa', '#502e90', '#7154cc', '#ed8d50', '#583bad'];

  function rysuj(ms) {
    klatka = null;
    if (!widoczna || document.hidden || !szer) return;
    const uprosc = ruch.matches;
    if (ms - ostatnia < (gest.matches ? 30 : 15) && !uprosc) { odswiez(); return; }
    if (uprosc) czas = .9;
    else if (Number.isFinite(ostatnia)) czas += Math.min(ms - ostatnia, 50) / 1000;
    ostatnia = ms;
    obrot += (celObrotu - obrot) * (uprosc ? 1 : .12);
    const wejscie = 1 - Math.max(0, 1 - czas / .9) ** 3;
    const promien = Math.min(szer / 405, wys / 348);
    const yaw = obrot + (uprosc ? 0 : Math.sin(czas * .22) * .45), tilt = .57 + przesuniecie * .14;
    const cos = Math.cos(yaw), sin = Math.sin(yaw), ct = Math.cos(tilt), st = Math.sin(tilt);
    const rzut = ([x, y, z]) => {
      const X = x * cos - z * sin, Z = x * sin + z * cos;
      const glebia = y * st + Z * ct;
      const zoom = 420 / (480 + glebia);
      return [szer * .5 + X * zoom * promien, wys * .53 - (y * ct - Z * st) * zoom * promien, glebia];
    };
    const sciezka = ({p, kolor, wyp}) => {
      ctx.beginPath();
      for (let i = 0; i < p.length; i++) {
        const [x, y] = rzut(p[i]);
        if (i) ctx.lineTo(x, y); else ctx.moveTo(x, y);
      }
      if (wyp) { ctx.closePath(); ctx.fillStyle = wyp; ctx.fill(); }
      ctx.strokeStyle = kolor;
      ctx.stroke();
    };
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, szer, wys);
    ctx.lineWidth = 1.15;
    ctx.globalAlpha = wejscie;
    siatka.forEach(sciezka);
    podstawa.forEach(sciezka);
    prowadnice.forEach(sciezka);
    orbity.forEach(sciezka);

    // Ściany kryształu sortowane wg głębi, dolna część zanurzona w obręczy.
    const y = -11 + (uprosc ? 0 : Math.sin(czas * 1.8) * 7) - 90 * (1 - wejscie);
    const gora = [0, y + 78, 0], dol = [0, y - 65, 0];
    const pas = pierscien(54, y, 6, czas * .42, czas * .42 + TAU);
    const sciany = [];
    for (let i = 0; i < 6; i++) {
      sciany.push({ p: [gora, pas[i], pas[i+1]], kolor: '#f1d1ff', wyp: barwy[i] });
      sciany.push({ p: [dol, pas[i+1], pas[i]], kolor: '#ad84ff', wyp: barwy[(i + 2) % 6] });
    }
    sciany.sort((a, b) => b.p.reduce((sum, p) => sum + rzut(p)[2], 0) - a.p.reduce((sum, p) => sum + rzut(p)[2], 0));
    ctx.lineWidth = 1.5;
    sciany.forEach(sciezka);

    ctx.lineWidth = 1;
    for (const [i, d] of odlamki.entries()) {
      const a = d.a + czas * (i % 2 ? .3 : -.17);
      const [x, y] = rzut([Math.cos(a) * d.r, d.y, Math.sin(a) * d.r]);
      const k = (i % 3 ? 1.5 : 3) * promien;
      ctx.fillStyle = i % 3 ? '#b697ff' : '#ff9860';
      ctx.fillRect(x, y, k, k);
    }
    ctx.globalAlpha = 1;
    if (!uprosc) odswiez();
  }

  function odswiez() {
    if (klatka == null && widoczna && !document.hidden) klatka = requestAnimationFrame(rysuj);
  }
  new ResizeObserver(() => {
    szer = canvas.clientWidth; wys = canvas.clientHeight;
    if (!szer || !wys) return;
    dpr = Math.min(devicePixelRatio || 1, gest.matches ? 1.3 : 1.65);
    canvas.width = Math.round(szer * dpr); canvas.height = Math.round(wys * dpr);
    odswiez();
  }).observe(canvas);

  new IntersectionObserver(([wpis]) => {
    widoczna = wpis.isIntersecting;
    if (widoczna) odswiez();
    else zatrzymaj();
  }, { threshold: .03 }).observe(scena);
  function zatrzymaj() {
    if (klatka != null) cancelAnimationFrame(klatka);
    klatka = null;
    ostatnia = -Infinity;
  }
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) zatrzymaj();
    else odswiez();
  });
  ruch.addEventListener('change', odswiez);
  scena.addEventListener('pointermove', e => {
    if (e.pointerType === 'touch' && !e.buttons) return;
    const rect = scena.getBoundingClientRect();
    celObrotu = -.52 + 1.15 * ((e.clientX - rect.left) / rect.width - .5);
    przesuniecie = (e.clientY - rect.top) / rect.height - .5;
    odswiez();
  });
  scena.querySelector('button').addEventListener('click', () => { celObrotu += .72; odswiez(); });
}
