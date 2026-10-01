import type { PokemonAtlasLocation } from './pokeapi';

export function applyAtlasContext(
  locations: PokemonAtlasLocation[],
  selectedRegion: string,
  selectedVersion: string,
) {
  return locations.flatMap((location) => {
    if (selectedRegion !== 'all' && location.regionKey !== selectedRegion) {
      return [];
    }

    if (selectedVersion === 'all') {
      return [location];
    }

    const versionDetail = location.versionDetails.find(
      (detail) => detail.slug === selectedVersion,
    );
    if (!versionDetail) {
      return [];
    }

    return [
      {
        ...location,
        versions: [versionDetail.label],
        versionSlugs: [versionDetail.slug],
        methods: versionDetail.methods,
        minLevel: versionDetail.minLevel,
        maxLevel: versionDetail.maxLevel,
        chance: versionDetail.chance,
      },
    ];
  });
}
