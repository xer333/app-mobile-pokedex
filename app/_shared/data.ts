export type AppScreen = 'dashboard' | 'discover' | 'detail';

export type ShortcutCard = {
  title: string;
  colors: [string, string];
  icon: 'pokedex' | 'moves' | 'evolution' | 'locations';
  action: AppScreen;
};

export type LiveBattleCard = {
  title: string;
  viewing: string;
  colors: [string, string];
  featured: string[];
};

export type UpcomingBattleCard = {
  title: string;
  colors: [string, string];
  featured: string[];
};

export const shortcutCards: ShortcutCard[] = [
  { title: 'Pok\u00e9dex', colors: ['#c60303', '#ff1307'], icon: 'pokedex', action: 'discover' },
  { title: 'Attaques', colors: ['#c08a00', '#f0bb08'], icon: 'moves', action: 'discover' },
  {
    title: '\u00c9volutions',
    colors: ['#0a7bb4', '#28c2ff'],
    icon: 'evolution',
    action: 'discover',
  },
  {
    title: 'Lieux',
    colors: ['#119100', '#20dd18'],
    icon: 'locations',
    action: 'discover',
  },
];

export const liveBattleCards: LiveBattleCard[] = [
  {
    title: 'Combat en direct',
    viewing: '+ 568 spectateurs',
    colors: ['#ffe13d', '#49d6f5'],
    featured: ['pikachu', 'squirtle'],
  },
  {
    title: 'Ar\u00e8ne spectre',
    viewing: '+ 64 spectateurs',
    colors: ['#5e1f93', '#18d34f'],
    featured: ['gengar'],
  },
];

export const upcomingBattleCards: UpcomingBattleCard[] = [
  {
    title: 'Coupe des starters',
    colors: ['#2ef56e', '#f9c4db'],
    featured: ['bulbasaur', 'jigglypuff'],
  },
  {
    title: 'Ru\u00e9e aquatique',
    colors: ['#87ebff', '#44c7f2'],
    featured: ['squirtle'],
  },
];
