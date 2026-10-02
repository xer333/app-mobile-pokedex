import type { PokemonSpecimenOrigin } from './specimens';

export type ShinyHuntStatus = 'active' | 'paused' | 'found';

export type ShinyHuntSegment = {
  id: string;
  method: string;
  odds: number | null;
  attempts: number;
  startedAt: number;
  endedAt: number | null;
};

export type ShinyHunt = {
  id: string;
  targetSlug: string;
  gameId: string;
  saveId?: string | null;
  status: ShinyHuntStatus;
  createdAt: number;
  foundAt: number | null;
  foundSpecimenId: string | null;
  foundFormSlug?: string;
  foundOrigin?: PokemonSpecimenOrigin;
  segments: ShinyHuntSegment[];
};

export function createShinyHunt(
  targetSlug: string,
  gameId: string,
  method = 'Rencontres',
  odds: number | null = null,
  now = Date.now(),
  saveId?: string,
): ShinyHunt {
  return {
    id: `hunt-${now}-${Math.random().toString(36).slice(2, 8)}`,
    targetSlug,
    gameId,
    ...(saveId !== undefined ? { saveId } : {}),
    status: 'active',
    createdAt: now,
    foundAt: null,
    foundSpecimenId: null,
    segments: [createHuntSegment(method, odds, now)],
  };
}

export function createHuntSegment(
  method: string,
  odds: number | null,
  now = Date.now(),
): ShinyHuntSegment {
  return {
    id: `segment-${now}-${Math.random().toString(36).slice(2, 8)}`,
    method: method.trim() || 'Méthode non renseignée',
    odds: normalizeOdds(odds),
    attempts: 0,
    startedAt: now,
    endedAt: null,
  };
}

export function getHuntAttempts(hunt: ShinyHunt) {
  return hunt.segments.reduce((total, segment) => total + segment.attempts, 0);
}

export function getHuntProbability(hunt: ShinyHunt) {
  if (hunt.segments.some((segment) => segment.attempts > 0 && segment.odds === null)) {
    return null;
  }

  const failureProbability = hunt.segments.reduce((product, segment) => {
    if (!segment.odds || segment.attempts === 0) return product;
    return product * Math.pow(1 - 1 / segment.odds, segment.attempts);
  }, 1);

  return 1 - failureProbability;
}

export function adjustCurrentSegment(hunt: ShinyHunt, delta: number): ShinyHunt {
  if (hunt.status === 'found' || hunt.segments.length === 0) return hunt;
  const lastIndex = hunt.segments.length - 1;
  return {
    ...hunt,
    segments: hunt.segments.map((segment, index) =>
      index === lastIndex
        ? { ...segment, attempts: Math.max(0, segment.attempts + delta) }
        : segment,
    ),
  };
}

export function startHuntSegment(
  hunt: ShinyHunt,
  method: string,
  odds: number | null,
  now = Date.now(),
): ShinyHunt {
  if (hunt.status === 'found') return hunt;
  const current = hunt.segments.at(-1);
  const normalizedMethod = method.trim() || 'Méthode non renseignée';
  const normalizedOdds = normalizeOdds(odds);
  if (current?.method === normalizedMethod && current.odds === normalizedOdds) return hunt;

  return {
    ...hunt,
    segments: [
      ...hunt.segments.map((segment, index) =>
        index === hunt.segments.length - 1 ? { ...segment, endedAt: now } : segment,
      ),
      createHuntSegment(normalizedMethod, normalizedOdds, now),
    ],
  };
}

export function getHuntSpecimenId(hunt: ShinyHunt) {
  return hunt.foundSpecimenId ?? `specimen-hunt-${hunt.id}`;
}

export function finishShinyHunt(
  hunt: ShinyHunt,
  formSlug: string,
  origin: PokemonSpecimenOrigin,
  now = Date.now(),
): ShinyHunt {
  if (hunt.status === 'found') return hunt;
  return {
    ...hunt,
    status: 'found',
    foundAt: now,
    foundSpecimenId: getHuntSpecimenId(hunt),
    foundFormSlug: formSlug.trim() || hunt.targetSlug,
    foundOrigin: origin,
    segments: hunt.segments.map((segment, index) =>
      index === hunt.segments.length - 1 ? { ...segment, endedAt: now } : segment,
    ),
  };
}

export function isShinyHunt(value: unknown): value is ShinyHunt {
  if (!value || typeof value !== 'object') return false;
  const hunt = value as Partial<ShinyHunt>;
  return (
    typeof hunt.id === 'string' &&
    typeof hunt.targetSlug === 'string' &&
    typeof hunt.gameId === 'string' &&
    (hunt.saveId === undefined || hunt.saveId === null
      || (typeof hunt.saveId === 'string' && hunt.saveId.length > 0)) &&
    ['active', 'paused', 'found'].includes(hunt.status ?? '') &&
    typeof hunt.createdAt === 'number' &&
    (hunt.foundAt === null || typeof hunt.foundAt === 'number') &&
    (hunt.foundSpecimenId === null || typeof hunt.foundSpecimenId === 'string') &&
    (hunt.foundFormSlug === undefined || typeof hunt.foundFormSlug === 'string') &&
    (hunt.foundOrigin === undefined || ['unspecified', 'captured', 'received', 'traded'].includes(hunt.foundOrigin)) &&
    Array.isArray(hunt.segments) &&
    hunt.segments.length > 0 &&
    hunt.segments.every(isHuntSegment)
  );
}

function isHuntSegment(value: unknown): value is ShinyHuntSegment {
  if (!value || typeof value !== 'object') return false;
  const segment = value as Partial<ShinyHuntSegment>;
  return (
    typeof segment.id === 'string' &&
    typeof segment.method === 'string' &&
    (segment.odds === null || (typeof segment.odds === 'number' && segment.odds >= 1)) &&
    typeof segment.attempts === 'number' &&
    Number.isInteger(segment.attempts) &&
    segment.attempts >= 0 &&
    typeof segment.startedAt === 'number' &&
    (segment.endedAt === null || typeof segment.endedAt === 'number')
  );
}

function normalizeOdds(odds: number | null) {
  if (odds === null || !Number.isFinite(odds) || odds < 1) return null;
  return Math.round(odds);
}
