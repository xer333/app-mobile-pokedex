import assert from 'node:assert/strict';
import test from 'node:test';

import { parseSpecimenCsv } from '../src/_shared/specimen-csv.ts';
import { prepareSpecimenImport } from '../src/_shared/collection-import.ts';
import { isPokemonSpecimen } from '../src/_shared/specimens.ts';

const context = {
  gameId: 'violet', saveId: 'save-1',
  catalog: [
    { id: 133, slug: 'eevee', nameFr: 'Évoli', nameEn: 'Eevee' },
    { id: 25, slug: 'pikachu', nameFr: 'Pikachu', nameEn: 'Pikachu' },
  ],
};

test('une liste CSV française rejoint la partie active sans inventer de provenance ou de date', () => {
  const parsed = parseSpecimenCsv('species;shiny;origin;date;nickname\nÉvoli;oui;capturé;2026-10-02;Lumi\n25;;;;', context);
  assert.equal(parsed.specimens.length, 2);
  assert.equal(parsed.unknownDates, 1);
  assert.deepEqual(parsed.specimens.map((item) => [item.speciesSlug, item.shiny, item.origin, item.saveId]), [
    ['eevee', true, 'captured', 'save-1'],
    ['pikachu', false, 'unspecified', 'save-1'],
  ]);
  assert.equal(parsed.specimens[1].obtainedAt, 0);
  assert.ok(parsed.specimens.every(isPokemonSpecimen));
});

test('les champs cités, virgules et retours de ligne ne cassent pas les colonnes', () => {
  const parsed = parseSpecimenCsv('species,nickname,notes\nEevee,"A, B","note 1\nnote 2"', context);
  assert.equal(parsed.specimens[0].nickname, 'A, B');
  assert.equal(parsed.specimens[0].notes, 'note 1\nnote 2');
});

test('le même CSV réimporté ne crée pas de nouvel exemplaire', () => {
  const csv = 'species\nÉvoli\nÉvoli';
  const first = parseSpecimenCsv(csv, context).specimens;
  const second = parseSpecimenCsv(csv, context).specimens;
  assert.notEqual(first[0].id, first[1].id);
  assert.deepEqual(prepareSpecimenImport(first, second, 'skip').specimens, []);
});

test('réordonner des lignes distinctes conserve leurs identifiants', () => {
  const first = parseSpecimenCsv('species;shiny\nÉvoli;oui\nPikachu;non', context).specimens;
  const reordered = parseSpecimenCsv('species;shiny\nPikachu;non\nÉvoli;oui', context).specimens;
  assert.deepEqual(new Set(first.map((item) => item.id)), new Set(reordered.map((item) => item.id)));
});

test('les lignes invalides sont refusées avant toute importation', () => {
  assert.throws(() => parseSpecimenCsv('species;shiny\nÉvoli;peut-être', context), /Ligne 2/);
  assert.throws(() => parseSpecimenCsv('species;date\nÉvoli;2026-02-30', context), /Ligne 2/);
  assert.throws(() => parseSpecimenCsv('species;boxSlot\nÉvoli;2', context), /Ligne 2/);
  assert.throws(() => parseSpecimenCsv('species\nInconnu', context), /Ligne 2/);
  assert.throws(() => parseSpecimenCsv('species;notes\nÉvoli;"non fermé', context), /guillemet/);
});
