import { translateRegion } from '../_shared/pokedex';

export type MarkerPoint = {
  top: `${number}%`;
  left: `${number}%`;
};

export type RegionVisual = {
  key: string;
  label: string;
  colors: [string, string];
  accent: string;
  glow: string;
  points: MarkerPoint[];
};

export const atlasRegionOrder = [
  'kanto',
  'johto',
  'hoenn',
  'sinnoh',
  'unova',
  'kalos',
  'alola',
  'galar',
  'hisui',
  'paldea',
  'unknown',
] as const;

const regionVisuals: Record<string, RegionVisual> = {
  kanto: createRegion('kanto', ['#8fd6ff', '#25608f'], '#d7f3ff', 'rgba(91, 206, 255, 0.34)', [
    point(12, 26),
    point(28, 16),
    point(22, 43),
    point(46, 32),
    point(59, 18),
    point(63, 48),
    point(40, 56),
    point(73, 34),
  ]),
  johto: createRegion('johto', ['#ffd99d', '#8d5f2e'], '#fff0cb', 'rgba(255, 191, 84, 0.32)', [
    point(14, 44),
    point(26, 24),
    point(37, 51),
    point(49, 28),
    point(58, 46),
    point(72, 34),
    point(31, 66),
  ]),
  hoenn: createRegion('hoenn', ['#8df9b8', '#177847'], '#d8ffe6', 'rgba(65, 255, 157, 0.28)', [
    point(18, 24),
    point(24, 55),
    point(42, 18),
    point(40, 48),
    point(56, 34),
    point(62, 58),
    point(74, 28),
    point(79, 60),
  ]),
  sinnoh: createRegion('sinnoh', ['#b6c8ff', '#3b4f9e'], '#e1e8ff', 'rgba(140, 170, 255, 0.32)', [
    point(12, 29),
    point(18, 53),
    point(32, 20),
    point(39, 46),
    point(57, 27),
    point(66, 52),
    point(78, 35),
  ]),
  unova: createRegion('unova', ['#9ef4ff', '#1f6f7c'], '#d8fbff', 'rgba(91, 242, 255, 0.28)', [
    point(14, 28),
    point(22, 52),
    point(38, 32),
    point(46, 58),
    point(57, 22),
    point(67, 44),
    point(78, 29),
  ]),
  kalos: createRegion('kalos', ['#f9b0ff', '#8642b6'], '#fce1ff', 'rgba(235, 143, 255, 0.28)', [
    point(18, 35),
    point(28, 18),
    point(31, 55),
    point(49, 34),
    point(62, 17),
    point(70, 45),
    point(80, 30),
  ]),
  alola: createRegion('alola', ['#8fffd2', '#0e8b73'], '#dafef1', 'rgba(92, 255, 203, 0.28)', [
    point(16, 14),
    point(24, 40),
    point(36, 69),
    point(52, 27),
    point(64, 56),
    point(80, 41),
  ]),
  galar: createRegion('galar', ['#ffc1c1', '#9f2d52'], '#ffe6ea', 'rgba(255, 135, 170, 0.28)', [
    point(12, 41),
    point(23, 28),
    point(30, 53),
    point(43, 38),
    point(56, 29),
    point(64, 52),
    point(77, 37),
  ]),
  hisui: createRegion('hisui', ['#d5d0b5', '#6e6247'], '#f1ecd7', 'rgba(218, 201, 141, 0.24)', [
    point(15, 26),
    point(20, 54),
    point(36, 18),
    point(43, 49),
    point(58, 35),
    point(75, 44),
  ]),
  paldea: createRegion('paldea', ['#ffe794', '#b76f00'], '#fff3c6', 'rgba(255, 209, 102, 0.28)', [
    point(14, 23),
    point(26, 49),
    point(33, 70),
    point(44, 28),
    point(57, 50),
    point(68, 27),
    point(78, 57),
  ]),
  unknown: createRegion('unknown', ['#999999', '#3f3f3f'], '#f0f0f0', 'rgba(255, 255, 255, 0.14)', [
    point(18, 28),
    point(32, 56),
    point(48, 22),
    point(64, 49),
    point(77, 34),
  ]),
};

export function getRegionVisual(regionKey?: string) {
  return regionVisuals[regionKey ?? 'unknown'] ?? regionVisuals.unknown;
}

export function orderRegionKeys(left: string, right: string) {
  const leftIndex = atlasRegionOrder.indexOf(left as (typeof atlasRegionOrder)[number]);
  const rightIndex = atlasRegionOrder.indexOf(right as (typeof atlasRegionOrder)[number]);

  if (leftIndex === -1 && rightIndex === -1) {
    return translateRegion(left).localeCompare(translateRegion(right), 'fr');
  }
  if (leftIndex === -1) {
    return 1;
  }
  if (rightIndex === -1) {
    return -1;
  }

  return leftIndex - rightIndex;
}

export function getMarkerPositions(regionKey: string, count: number) {
  const visual = getRegionVisual(regionKey);
  if (count <= visual.points.length) {
    return visual.points.slice(0, count);
  }

  const generated = [...visual.points];
  const extraCount = count - visual.points.length;

  for (let index = 0; index < extraCount; index += 1) {
    generated.push(
      point(18 + ((index * 17) % 58), 14 + ((index * 23) % 68)),
    );
  }

  return generated.slice(0, count);
}

function createRegion(
  key: string,
  colors: [string, string],
  accent: string,
  glow: string,
  points: MarkerPoint[],
): RegionVisual {
  return {
    key,
    label: translateRegion(key),
    colors,
    accent,
    glow,
    points,
  };
}

function point(top: number, left: number): MarkerPoint {
  return {
    top: `${top}%`,
    left: `${left}%`,
  };
}
