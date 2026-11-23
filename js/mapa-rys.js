// KILEK CHALLENGE: rysowanie warstwic mapy. Działa w oknie i w wątku roboczym.
// ---------------------------------------------------------
// Mapa: warstwice z autorskiego pola wysokości (szum wartości, stałe ziarno).
// ---------------------------------------------------------
function szum(seed) {
  const N = 64, p = new Float32Array(N * N);
  let s = seed;
  for (let i = 0; i < p.length; i++) { s = (s * 16807) % 2147483647; p[i] = s / 2147483647; }
  const g = (x, y) => p[((y % N + N) % N) * N + ((x % N + N) % N)];
  const sm = t => t * t * (3 - 2 * t);
  return (x, y) => {
    const xi = Math.floor(x), yi = Math.floor(y), xf = sm(x - xi), yf = sm(y - yi);
    const a = g(xi, yi), b = g(xi + 1, yi), c = g(xi, yi + 1), d = g(xi + 1, yi + 1);
    return a + (b - a) * xf + (c - a) * yf + (a - b - c + d) * xf * yf;
  };
}

export function rysujWarstwice(cv, w, h, dpr) {
  cv.width = Math.round(w * dpr); cv.height = Math.round(h * dpr);
  const c = cv.getContext('2d');
  c.setTransform(dpr, 0, 0, dpr, 0, 0);
  c.clearRect(0, 0, w, h);
  const n1 = szum(1234567), n2 = szum(7654321);
  const krok = 9, kol = Math.ceil(w / krok) + 1, wier = Math.ceil(h / krok) + 1;
  const v = new Float32Array(kol * wier);
  for (let j = 0; j < wier; j++) for (let i = 0; i < kol; i++) {
    const x = i * krok / 230, y = j * krok / 230;
    v[j * kol + i] = n1(x, y) * .72 + n2(x * 2.3 + 9, y * 2.3 + 3) * .28;
  }
  const poziomy = 16;
  // marching squares
  for (let L = 1; L < poziomy; L++) {
    const t = .18 + L * (.66 / poziomy);
    const glowna = L % 5 === 0;
    c.lineWidth = glowna ? 1.7 : .8;
    c.globalAlpha = glowna ? .95 : .55;
    c.beginPath();
    for (let j = 0; j < wier - 1; j++) for (let i = 0; i < kol - 1; i++) {
      const a = v[j * kol + i], b = v[j * kol + i + 1], d = v[(j + 1) * kol + i], e = v[(j + 1) * kol + i + 1];
      const k = (a > t) | ((b > t) << 1) | ((e > t) << 2) | ((d > t) << 3);
      if (k === 0 || k === 15) continue;
      const x = i * krok, y = j * krok;
      const lerp = (p, q) => (t - p) / (q - p);
      const T = [x + krok * lerp(a, b), y], R = [x + krok, y + krok * lerp(b, e)];
      const B = [x + krok * lerp(d, e), y + krok], Lf = [x, y + krok * lerp(a, d)];
      const seg = (P, Q) => { c.moveTo(P[0], P[1]); c.lineTo(Q[0], Q[1]); };
      switch (k) {
        case 1: case 14: seg(Lf, T); break;
        case 2: case 13: seg(T, R); break;
        case 3: case 12: seg(Lf, R); break;
        case 4: case 11: seg(R, B); break;
        case 5: seg(Lf, T); seg(R, B); break;
        case 6: case 9: seg(T, B); break;
        case 7: case 8: seg(Lf, B); break;
        case 10: seg(T, R); seg(Lf, B); break;
      }
    }
    c.strokeStyle = '#fff';
    c.stroke();
  }
  // siatka kwadratów mapy i opisy pól
  c.globalAlpha = .38; c.lineWidth = 1;
  const pole = 150;
  c.beginPath();
  for (let x = pole; x < w; x += pole) { c.moveTo(x, 0); c.lineTo(x, h); }
  for (let y = pole; y < h; y += pole) { c.moveTo(0, y); c.lineTo(w, y); }
  c.stroke();
  c.globalAlpha = .7;
  c.font = 'bold 13px sans-serif';
  c.fillStyle = '#fff';
  for (let i = 0; i * pole < w; i++) for (let j = 0; j * pole < h; j++) {
    if ((i + j) % 2) continue;
    c.fillText(String.fromCharCode(65 + (i % 26)) + (j + 1), i * pole + 6, j * pole + 16);
  }
  // punkty wysokościowe na szczytach
  c.globalAlpha = .85;
  for (let j = 2; j < wier - 2; j += 3) for (let i = 2; i < kol - 2; i += 3) {
    const z = v[j * kol + i];
    if (z < .74) continue;
    let max = true;
    for (let dj = -2; dj <= 2 && max; dj++) for (let di = -2; di <= 2; di++) if (v[(j + dj) * kol + i + di] > z) { max = false; break; }
    if (!max) continue;
    const x = i * krok, y = j * krok;
    c.beginPath(); c.moveTo(x, y - 5); c.lineTo(x + 4.5, y + 3); c.lineTo(x - 4.5, y + 3); c.closePath(); c.fill();
    c.fillText(String(Math.round(z * 600)), x + 7, y + 4);
  }
  c.globalAlpha = 1;
}
