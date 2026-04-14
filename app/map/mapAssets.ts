import type { ImageSourcePropType } from 'react-native';

export type RegionMapAsset = {
  image: ImageSourcePropType;
  sourceLabel: string;
  sourceUrl: string;
  variantLabel: string;
};

const regionMapAssets: Record<string, RegionMapAsset> = {
  kanto: {
    image: require('../../assets/maps/kanto.png'),
    sourceLabel: 'Bulbapedia / Bulbagarden Archives',
    sourceUrl: 'https://bulbapedia.bulbagarden.net/wiki/Kanto',
    variantLabel: 'Carte Kanto (Lets Go)',
  },
  johto: {
    image: require('../../assets/maps/johto.png'),
    sourceLabel: 'Bulbapedia / Bulbagarden Archives',
    sourceUrl: 'https://bulbapedia.bulbagarden.net/wiki/Johto',
    variantLabel: 'Carte Johto',
  },
  hoenn: {
    image: require('../../assets/maps/hoenn.png'),
    sourceLabel: 'Bulbapedia / Bulbagarden Archives',
    sourceUrl: 'https://bulbapedia.bulbagarden.net/wiki/Hoenn',
    variantLabel: 'Carte Hoenn (ORAS)',
  },
  sinnoh: {
    image: require('../../assets/maps/sinnoh.png'),
    sourceLabel: 'Bulbapedia / Bulbagarden Archives',
    sourceUrl: 'https://bulbapedia.bulbagarden.net/wiki/Sinnoh',
    variantLabel: 'Carte Sinnoh (BDSP)',
  },
  unova: {
    image: require('../../assets/maps/unova.png'),
    sourceLabel: 'Bulbapedia / Bulbagarden Archives',
    sourceUrl: 'https://bulbapedia.bulbagarden.net/wiki/Unova',
    variantLabel: 'Carte Unys (N2/B2)',
  },
  kalos: {
    image: require('../../assets/maps/kalos.png'),
    sourceLabel: 'Bulbapedia / Bulbagarden Archives',
    sourceUrl: 'https://bulbapedia.bulbagarden.net/wiki/Draft:Region_image_maps',
    variantLabel: 'Carte Kalos',
  },
  alola: {
    image: require('../../assets/maps/alola.png'),
    sourceLabel: 'Bulbapedia / Bulbagarden Archives',
    sourceUrl: 'https://bulbapedia.bulbagarden.net/wiki/Draft:Region_image_maps',
    variantLabel: 'Carte Alola',
  },
  galar: {
    image: require('../../assets/maps/galar.png'),
    sourceLabel: 'Bulbapedia / Bulbagarden Archives',
    sourceUrl: 'https://bulbapedia.bulbagarden.net/wiki/Galar',
    variantLabel: 'Artwork Galar',
  },
  hisui: {
    image: require('../../assets/maps/hisui.png'),
    sourceLabel: 'Bulbapedia / Bulbagarden Archives',
    sourceUrl: 'https://bulbapedia.bulbagarden.net/wiki/Hisui',
    variantLabel: 'Carte Hisui (Legends: Arceus)',
  },
  paldea: {
    image: require('../../assets/maps/paldea.png'),
    sourceLabel: 'Bulbapedia / Bulbagarden Archives',
    sourceUrl: 'https://bulbapedia.bulbagarden.net/wiki/Paldea',
    variantLabel: 'Artwork Paldea',
  },
};

export function getRegionMapAsset(regionKey: string) {
  return regionMapAssets[regionKey];
}
