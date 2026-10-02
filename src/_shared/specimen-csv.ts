import type { PokemonSpecimen, PokemonSpecimenOrigin } from './specimens.ts';
import { createSpeciesLookup, normalizeSpeciesKey, type LookupSpecies } from './catalog-species-lookup.ts';

type CsvContext = { gameId: string; saveId: string; catalog: LookupSpecies[] };
type CsvRow = { line: number; cells: string[] };

const columns: Record<string, string> = {
  species: 'species', specieslug: 'species', pokemon: 'species',
  shiny: 'shiny', chromatique: 'shiny',
  form: 'form', formslug: 'form', forme: 'form',
  origin: 'origin', origine: 'origin',
  date: 'date', obtainedat: 'date',
  nickname: 'nickname', surnom: 'nickname',
  box: 'box', boxname: 'box', boite: 'box',
  slot: 'slot', boxslot: 'slot', emplacement: 'slot',
  notes: 'notes',
};

export function parseSpecimenCsv(raw: string, context: CsvContext) {
  if (raw.length > 2_000_000) throw new Error('Le CSV dépasse la limite de 2 Mo.');
  const rows = parseRows(raw.replace(/^\uFEFF/, ''));
  const header = rows.shift();
  if (!header) throw new Error('Le CSV est vide.');
  const keys = header.cells.map((cell) => columns[normalize(cell)]);
  if (keys.some((key) => !key)) throw new Error(`Colonne CSV inconnue à la ligne ${header.line}.`);
  if (new Set(keys).size !== keys.length) throw new Error('Le CSV contient une colonne en double.');
  const speciesColumn = keys.indexOf('species');
  if (speciesColumn < 0) throw new Error('Le CSV doit contenir une colonne species.');

  const byName = createSpeciesLookup(context.catalog);

  const specimens: PokemonSpecimen[] = [];
  const occurrences = new Map<string, number>();
  let unknownDates = 0;
  for (const row of rows) {
    if (row.cells.every((cell) => !cell.trim())) continue;
    if (row.cells.length !== keys.length) throw new Error(`Ligne ${row.line} : ${keys.length} colonnes attendues, ${row.cells.length} reçues.`);
    const values = Object.fromEntries(keys.map((key, column) => [key, row.cells[column].trim()]));
    const matches = byName.get(normalizeSpeciesKey(values.species));
    if (!matches?.length) throw new Error(`Ligne ${row.line} : espèce inconnue « ${values.species} ».`);
    if (matches.length !== 1) throw new Error(`Ligne ${row.line} : nom d’espèce ambigu ; utilise son slug ou son numéro national.`);
    const species = matches[0];
    const shiny = parseShiny(values.shiny, row.line);
    const origin = parseOrigin(values.origin, row.line);
    const obtainedAt = parseDate(values.date, row.line);
    if (obtainedAt === 0) unknownDates += 1;
    const boxSlot = parseSlot(values.slot, row.line);
    if (boxSlot !== undefined && !values.box) throw new Error(`Ligne ${row.line} : une boîte est requise pour l’emplacement.`);
    const formSlug = values.form || species.slug;
    const identity = JSON.stringify([context.saveId, context.gameId, species.slug,
      formSlug, shiny, origin, obtainedAt, values.nickname, values.box, boxSlot, values.notes]);
    const occurrence = (occurrences.get(identity) ?? 0) + 1;
    occurrences.set(identity, occurrence);
    specimens.push({
      id: `csv-${context.saveId}-${hash(identity)}-${occurrence}`,
      speciesSlug: species.slug,
      formSlug,
      shiny,
      gameId: context.gameId,
      saveId: context.saveId,
      obtainedAt,
      origin,
      ...(values.nickname ? { nickname: values.nickname } : {}),
      ...(values.box ? { boxName: values.box } : {}),
      ...(boxSlot !== undefined ? { boxSlot } : {}),
      ...(values.notes ? { notes: values.notes } : {}),
    });
  }
  if (!specimens.length) throw new Error('Le CSV ne contient aucun exemplaire.');
  if (specimens.length > 10_000) throw new Error('Le CSV dépasse la limite de 10 000 exemplaires.');
  return { specimens, unknownDates };
}

function parseRows(raw: string): CsvRow[] {
  const firstLine = raw.split(/\r?\n/, 1)[0];
  const delimiter = countUnquoted(firstLine, ';') > countUnquoted(firstLine, ',') ? ';' : ',';
  const rows: CsvRow[] = [];
  let cells: string[] = [];
  let cell = '';
  let quoted = false;
  let closed = false;
  let line = 1;
  let rowLine = 1;
  for (let index = 0; index < raw.length; index += 1) {
    const char = raw[index];
    if (quoted) {
      if (char === '"' && raw[index + 1] === '"') { cell += '"'; index += 1; }
      else if (char === '"') { quoted = false; closed = true; }
      else { cell += char; if (char === '\n') line += 1; }
      continue;
    }
    if (char === '"' && !cell && !closed) { quoted = true; continue; }
    if (char === delimiter || char === '\n' || char === '\r') {
      cells.push(cell);
      cell = '';
      closed = false;
      if (char === delimiter) continue;
      if (char === '\r' && raw[index + 1] === '\n') index += 1;
      rows.push({ line: rowLine, cells });
      cells = [];
      line += 1;
      rowLine = line;
      continue;
    }
    if (closed && char !== ' ' && char !== '\t') throw new Error(`Ligne ${line} : caractère après un champ cité.`);
    if (char === '"') throw new Error(`Ligne ${line} : guillemet CSV mal placé.`);
    cell += char;
  }
  if (quoted) throw new Error(`Ligne ${rowLine} : guillemet CSV non fermé.`);
  if (cell || cells.length || closed) { cells.push(cell); rows.push({ line: rowLine, cells }); }
  return rows.filter((row) => row.cells.some((value) => value.trim()));
}

function countUnquoted(value: string, target: string) {
  let quoted = false;
  let count = 0;
  for (const char of value) {
    if (char === '"') quoted = !quoted;
    else if (char === target && !quoted) count += 1;
  }
  return count;
}

function normalize(value: string) {
  return value.trim().normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[\s_-]+/g, '');
}

function parseShiny(value: string | undefined, line: number) {
  if (!value || ['non', 'no', 'false', '0'].includes(normalize(value))) return false;
  if (['oui', 'yes', 'true', '1'].includes(normalize(value))) return true;
  throw new Error(`Ligne ${line} : chromatique doit valoir oui ou non.`);
}

function parseOrigin(value: string | undefined, line: number): PokemonSpecimenOrigin {
  if (!value || ['unspecified', 'inconnue', 'nonrenseignee'].includes(normalize(value))) return 'unspecified';
  const origins: Record<string, PokemonSpecimenOrigin> = {
    captured: 'captured', capture: 'captured', capturedfr: 'captured',
    received: 'received', recu: 'received',
    traded: 'traded', echange: 'traded',
  };
  const origin = origins[normalize(value)];
  if (!origin) throw new Error(`Ligne ${line} : origine inconnue.`);
  return origin;
}

function parseDate(value: string | undefined, line: number) {
  if (!value) return 0;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) throw new Error(`Ligne ${line} : date attendue au format AAAA-MM-JJ.`);
  const timestamp = Date.parse(`${value}T00:00:00.000Z`);
  if (!Number.isFinite(timestamp) || new Date(timestamp).toISOString().slice(0, 10) !== value) {
    throw new Error(`Ligne ${line} : date invalide.`);
  }
  return timestamp;
}

function parseSlot(value: string | undefined, line: number) {
  if (!value) return undefined;
  const slot = Number(value);
  if (!Number.isInteger(slot) || slot < 1) throw new Error(`Ligne ${line} : emplacement invalide.`);
  return slot;
}

function hash(value: string) {
  let result = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    result ^= value.charCodeAt(index);
    result = Math.imul(result, 16777619);
  }
  return (result >>> 0).toString(36);
}
