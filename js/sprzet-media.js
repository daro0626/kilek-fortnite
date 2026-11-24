import { EPIC } from './wiedza-dane.js';

// Katalog referencyjny materiałów, z którego powstaje galeria Zbrojowni.
export const POLITYKA_EPIC = 'https://legal.epicgames.com/epicgames/fan-art-policy';

const renderyEpic = [
  {
    przedmiot: 'flint', publikacja: 'v8.11 · rozdział 1, sezon 8', dataPublikacji: '2019-03-20',
    zrodlo: 'https://www.fortnite.com/news/patch-notes-v8-11',
    oryginal: 'https://cms-assets.unrealengine.com/cm6l5gfpm05kr07my04cqgy2x/cmw95vjcx0b9a06n4k23e6ygk',
    rozmiar: [918, 640], miniatura: [270, 188],
  },
  {
    przedmiot: 'hammer', publikacja: 'Vibin’ · rozdział 3, sezon 3', dataPublikacji: '2022-06-05',
    zrodlo: 'https://www.fortnite.com/news/whats-new-in-fortnite-battle-royale-chapter-3-season-3-vibin?lang=en-US',
    oryginal: 'https://cdn2.unrealengine.com/fortnite-hammer-assault-rifle-1900x600-3a992cfe78e2.jpg',
    rozmiar: [1000, 555], miniatura: [270, 150],
  },
  {
    przedmiot: 'flapjack', publikacja: 'Wilds · rozdział 4, sezon 3', dataPublikacji: '2023-06-09',
    zrodlo: 'https://www.fortnite.com/news/whats-new-in-fortnite-battle-royale-chapter-4-season-3-wilds?lang=en-US',
    oryginal: 'https://cdn2.unrealengine.com/fortnite-flapjack-rifle-1900x600-98e2ae8f7af5.jpg',
    rozmiar: [1000, 564], miniatura: [270, 152],
  },
  {
    przedmiot: 'furia-oscara', publikacja: 'Dzień Kapitana Oscara · 22.11.2026',
    zrodlo: EPIC.oscar,
    oryginal: 'https://communities.epicgames.com/api/community/image/9bba47c6-235c-4ec6-8da5-e194d8541d4e?resizingType=fit&width=2048&height=1152',
    rozmiar: [460, 320], miniatura: [270, 188],
  },
];

export const MATERIALY_SPRZETU = renderyEpic.flatMap(({ przedmiot, rozmiar, miniatura, ...pochodzenie }) => {
  const proweniencja = {
    przedmiot, ...pochodzenie, tworca: 'Epic Games', playlistaZrodla: 'Battle Royale',
    wariant: null, // źródło nie oznacza rzadkości renderu, więc służy jako referencja modelu
    podstawaUzycia: POLITYKA_EPIC, sprawdzono: '2026-11-24', stan: 'potwierdzony',
  };
  return [
    { ...proweniencja, typ: 'render', plik: `assets/fortnite/${przedmiot}-render.webp`, rozmiar },
    { ...proweniencja, typ: 'miniatura-renderu', plik: `assets/fortnite/${przedmiot}-mini.webp`, rozmiar: miniatura },
  ];
});

export function materialSprzetu(przedmiot, wariant, typ) {
  return MATERIALY_SPRZETU.find(m =>
    m.stan === 'potwierdzony' && m.przedmiot === przedmiot && m.typ === typ &&
    (m.wariant === wariant?.id || (m.wariant === null && ['render', 'miniatura-renderu'].includes(typ))));
}
