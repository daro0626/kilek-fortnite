const KLUCZ = 'kc:fortnite:opinie';
export const OCENY = ['za łatwa', 'w sam raz', 'za trudna', 'bez sensu'];
let dane = {};
try { dane = JSON.parse(localStorage.getItem(KLUCZ)) || {}; } catch { /* korzystamy z pamięci sesji */ }

export const esc = t => String(t ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
export const opinia = id => dane[id];
export const wyczyscOpinie = () => { dane = {}; };

export function formularzOpinii(id) {
  const wpis = opinia(id);
  return `<form class="opinia-form" data-opinia="${esc(id)}">
    <label>Ocena misji
      <select name="ocena" required>
        <option value="">Wybierz ocenę</option>
        ${OCENY.map(o => `<option ${o === wpis?.ocena ? 'selected' : ''}>${o}</option>`).join('')}
      </select>
    </label>
    <label>Krótka notatka <input name="notatka" value="${esc(wpis?.notatka)}" maxlength="180" autocomplete="off"></label>
    <button class="btn btn-drugi" type="submit">Zapisz opinię</button>
    <span role="status" class="opinia-status"></span>
  </form>`;
}

export function tekstOpinii(tytul) {
  return Object.entries(dane).filter(([, o]) => OCENY.includes(o?.ocena)).map(([id, o]) =>
    `${id} · ${tytul(id)} · ${o.ocena}${o.notatka ? ' · ' + o.notatka : ''}`).join('\n');
}

export function podlaczOpinie() {
  document.addEventListener('submit', e => {
    if (!e.target.matches('[data-opinia]')) return;
    e.preventDefault();
    const form = e.target;
    const { ocena, notatka } = Object.fromEntries(new FormData(form));
    if (!OCENY.includes(ocena)) return;
    const id = form.dataset.opinia;
    dane = { ...dane, [id]: { ocena, notatka: notatka.trim().slice(0, 180) } };
    let komunikat = 'Zapisano na tym urządzeniu.';
    try { localStorage.setItem(KLUCZ, JSON.stringify(dane)); }
    catch { komunikat = 'Ocena jest dostępna do zamknięcia strony.'; }
    form.querySelector('[role=status]').textContent = komunikat;
    document.dispatchEvent(new CustomEvent('kilek:opinia', { detail: { id } }));
  });
}
