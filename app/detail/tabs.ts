export type DetailTabId = 'about' | 'stats' | 'moves' | 'evolutions';

export const detailTabs: Array<{ id: DetailTabId; label: string }> = [
  { id: 'about', label: '\u00c0 propos' },
  { id: 'stats', label: 'Stats' },
  { id: 'moves', label: 'Attaques' },
  { id: 'evolutions', label: '\u00c9volutions' },
];
