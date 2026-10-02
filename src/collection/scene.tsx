import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useMemo, useRef, useState } from 'react';
import {
  FlatList,
  Image,
  Pressable,
  Share,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { gameOptions, useAdventure } from '../_shared/adventure';
import { ConfirmDialog } from '../_shared/confirm-dialog';
import { getCatalogPokemonBySlug, pokemonCatalog } from '../_shared/catalog';
import { appRoutes } from '../_shared/routes';
import {
  parseCollectionBackup,
  serializeCollectionBackup,
} from '../_shared/collection-backup';
import { prepareSpecimenImport, reviewSpecimenImport, type SpecimenImportReview } from '../_shared/collection-import';
import { useCollections } from '../_shared/collections';
import { parseSpecimenCsv } from '../_shared/specimen-csv';
import type { PokemonSpecimen, PokemonSpecimenOrigin } from '../_shared/specimens';
import { SpecimenDetailsEditor } from './specimen-details-editor';
import { styles } from './styles';

const originOptions: Array<{ key: PokemonSpecimenOrigin; label: string }> = [
  { key: 'unspecified', label: 'Non renseignée' },
  { key: 'captured', label: 'Capturé' },
  { key: 'received', label: 'Reçu' },
  { key: 'traded', label: 'Échangé' },
];

export function CollectionScene() {
  const router = useRouter();
  const adventure = useAdventure();
  const { importSpecimens, isReady: collectionsReady, removeSpecimen, specimens, updateSpecimen } = useCollections();
  const [editorMode, setEditorMode] = useState<'closed' | 'export' | 'import'>('closed');
  const [editorValue, setEditorValue] = useState('');
  const [importReview, setImportReview] = useState<{
    specimens: PokemonSpecimen[];
    summary: SpecimenImportReview;
    source: 'json' | 'csv';
    unknownDates: number;
    saveId: string | null;
  } | null>(null);
  const [feedback, setFeedback] = useState<{ text: string; error: boolean } | null>(null);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  const [editingGameId, setEditingGameId] = useState<string | null>(null);
  const [editingDetailsId, setEditingDetailsId] = useState<string | null>(null);
  const [editingSaveId, setEditingSaveId] = useState<string | null>(null);
  const [scope, setScope] = useState<'active' | 'unassigned' | 'all'>('active');
  const [search, setSearch] = useState('');
  const undoStack = useRef<Array<{ label: string; undo: () => void }>>([]);
  const [undoLabel, setUndoLabel] = useState<string | null>(null);
  const orderedSpecimens = useMemo(() => {
    const term = normalizeSearch(search);
    return specimens
      .filter((specimen) => {
        if (scope === 'active' && specimen.saveId !== adventure.activeSaveId) return false;
        if (scope === 'unassigned' && specimen.saveId) return false;
        if (!term) return true;
        const pokemon = getCatalogPokemonBySlug(specimen.speciesSlug);
        const content = [pokemon.nameFr, specimen.nickname, specimen.speciesSlug,
          specimen.formSlug, specimen.boxName, specimen.ball, specimen.obtainedPlace,
          gameOptions.find((option) => option.id === specimen.gameId)?.label]
          .filter(Boolean).join(' ');
        return normalizeSearch(content).includes(term);
      })
      .sort((left, right) => right.obtainedAt - left.obtainedAt);
  }, [adventure.activeSaveId, scope, search, specimens]);
  const shinyCount = specimens.filter((specimen) => specimen.shiny).length;
  const speciesCount = new Set(specimens.map((specimen) => specimen.speciesSlug)).size;

  const remember = (label: string, undo: () => void) => {
    undoStack.current = [...undoStack.current.slice(-9), { label, undo }];
    setUndoLabel(label);
  };

  const undoLast = () => {
    const action = undoStack.current.pop();
    action?.undo();
    setUndoLabel(undoStack.current.at(-1)?.label ?? null);
  };

  const editSpecimen = (item: typeof specimens[number], changes: Parameters<typeof updateSpecimen>[1]) => {
    remember('Modification d’exemplaire', () => updateSpecimen(item.id, {
      origin: item.origin, gameId: item.gameId, saveId: item.saveId, shiny: item.shiny,
      nickname: item.nickname, boxName: item.boxName, boxSlot: item.boxSlot,
      ball: item.ball, language: item.language,
      obtainedPlace: item.obtainedPlace, notes: item.notes,
    }));
    updateSpecimen(item.id, changes);
  };

  const showExport = async () => {
    const serialized = serializeCollectionBackup(specimens);
    setEditorValue(serialized);
    setEditorMode('export');
    setImportReview(null);
    setFeedback(null);
    try {
      await Share.share({ message: serialized, title: 'Sauvegarde de ma collection' });
    } catch {
      setFeedback({ text: 'Le partage est indisponible. Le JSON reste sélectionnable ci-dessous.', error: true });
    }
  };

  const inspectImport = () => {
    if (!collectionsReady || !adventure.isReady) {
      setFeedback({ text: 'Attends le chargement de la collection et de la partie avant l’import.', error: true });
      return;
    }
    try {
      const isJson = editorValue.trimStart().startsWith('{');
      const parsed = isJson
        ? { specimens: parseCollectionBackup(editorValue).specimens, unknownDates: 0 }
        : parseSpecimenCsv(editorValue, {
          gameId: adventure.activeSave.gameId,
          saveId: adventure.activeSaveId,
          catalog: pokemonCatalog,
        });
      setImportReview({
        ...parsed,
        summary: reviewSpecimenImport(specimens, parsed.specimens),
        source: isJson ? 'json' : 'csv',
        saveId: isJson ? null : adventure.activeSaveId,
      });
      setFeedback(null);
    } catch (error) {
      setImportReview(null);
      setFeedback({
        text: error instanceof Error ? error.message : 'Sauvegarde invalide.',
        error: true,
      });
    }
  };

  const applyImport = (collisionAction: 'skip' | 'copy') => {
    if (!importReview) return;
    if (!collectionsReady || !adventure.isReady) {
      setFeedback({ text: 'Les données ne sont pas encore prêtes pour l’import.', error: true });
      return;
    }
    if (importReview.saveId && importReview.saveId !== adventure.activeSaveId) {
      setImportReview(null);
      setFeedback({ text: 'La partie active a changé. Examine à nouveau le CSV avant de confirmer.', error: true });
      return;
    }
    const currentSummary = reviewSpecimenImport(specimens, importReview.specimens);
    if (JSON.stringify(currentSummary) !== JSON.stringify(importReview.summary)) {
      setImportReview({ ...importReview, summary: currentSummary });
      setFeedback({ text: 'La collection a changé. Vérifie le nouvel aperçu avant de confirmer.', error: true });
      return;
    }
    const prepared = prepareSpecimenImport(specimens, importReview.specimens, collisionAction);
    importSpecimens(prepared.specimens);
    const importedCount = prepared.specimens.length;
    setImportReview(null);
    setFeedback({
      text: `${importedCount} exemplaire${importedCount > 1 ? 's' : ''} ajouté${importedCount > 1 ? 's' : ''}${prepared.copies ? `, dont ${prepared.copies} copie${prepared.copies > 1 ? 's' : ''} de collision` : ''}.`,
      error: false,
    });
  };

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'left', 'right']}>
      <ConfirmDialog
        visible={pendingDeleteId !== null}
        title="Supprimer cet exemplaire ?"
        message="Les autres exemplaires de la même espèce seront conservés."
        confirmLabel="Supprimer"
        destructive
        onCancel={() => setPendingDeleteId(null)}
        onConfirm={() => {
          const specimen = specimens.find((item) => item.id === pendingDeleteId);
          if (specimen) {
            remember('Suppression d’exemplaire', () => importSpecimens([specimen]));
            removeSpecimen(specimen.id);
          }
          setPendingDeleteId(null);
        }}
      />
      <FlatList
        data={orderedSpecimens}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.content}
        ListHeaderComponent={
          <View style={{ gap: 18 }}>
            <View style={styles.header}>
              <Pressable onPress={() => router.back()} style={styles.iconButton}>
                <Feather name="arrow-left" size={22} color="#fff" />
              </Pressable>
              <Text style={styles.title}>Ma collection</Text>
              <View style={styles.iconButton} />
            </View>
            <Text style={styles.subtitle}>
              Les exemplaires sont indépendants des favoris. Une origine non renseignée n’est jamais
              interprétée comme une capture.
            </Text>
            <View style={styles.summary}>
              <Summary value={specimens.length} label="Exemplaires" />
              <Summary value={speciesCount} label="Espèces" />
              <Summary value={shinyCount} label="Shiny" />
            </View>
            <Pressable
              accessibilityRole="button"
              onPress={() => router.push(appRoutes.projects)}
              style={styles.projectLink}
            >
              <Text style={styles.projectLinkText}>Projets de collection · suivre les manquants</Text>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              onPress={() => router.push(appRoutes.registered)}
              style={styles.projectLink}
            >
              <Text style={styles.projectLinkText}>Pokédex de la partie · enregistrés et manquants</Text>
            </Pressable>
            {undoLabel ? (
              <Pressable accessibilityRole="button" onPress={undoLast} style={styles.undoButton}>
                <Text style={styles.undoText}>Annuler : {undoLabel}</Text>
              </Pressable>
            ) : null}
            <View style={styles.toolCard}>
              <Text style={styles.subtitle}>Sauvegarde des exemplaires uniquement : favoris, équipe, objectifs et chasses ne sont pas inclus.</Text>
              <View style={styles.toolRow}>
                <Button label="Exporter les exemplaires" onPress={showExport} />
                <Button
                  label="Importer des exemplaires"
                  secondary
                  onPress={() => {
                    setEditorMode('import');
                    setEditorValue('');
                    setImportReview(null);
                    setFeedback(null);
                  }}
                />
              </View>
              {editorMode !== 'closed' ? (
                <>
                  {editorMode === 'import' ? (
                    <>
                      <Text style={styles.noteText}>
                        Colle un ancien export JSON ou une liste CSV avec en-tête. Les lignes CSV rejoignent « {adventure.activeSave.name} » comme exemplaires possédés, pas comme simples enregistrements du Pokédex. Espèce : slug, nom exact ou numéro national ; shiny vide = non, origine vide = non renseignée, date vide = inconnue. Date au format AAAA-MM-JJ. Une forme fournie n’est pas vérifiée pour le jeu.
                      </Text>
                      <Button label="Insérer un modèle CSV" secondary onPress={() => {
                        setEditorValue('species;shiny;origin;date;nickname;box;slot;notes\n');
                        setImportReview(null);
                        setFeedback(null);
                      }} />
                    </>
                  ) : null}
                  <TextInput
                    multiline
                    editable={editorMode === 'import'}
                    value={editorValue}
                    onChangeText={(value) => { setEditorValue(value); setImportReview(null); }}
                    placeholder={editorMode === 'import' ? 'JSON ou CSV : species;shiny;origin;date\nÉvoli;oui;capturé;2026-10-02' : ''}
                    placeholderTextColor="#666"
                    style={styles.editor}
                  />
                  {editorMode === 'import' ? (
                    <Button label="Examiner l’import" onPress={inspectImport} />
                  ) : null}
                  {editorMode === 'import' && importReview ? (
                    <View style={styles.importReview}>
                      <Text style={styles.importReviewTitle}>Aperçu avant import</Text>
                      <Text style={styles.noteText}>Source : {importReview.source === 'csv' ? `CSV vers ${adventure.activeSave.name}` : 'ancien export JSON'}</Text>
                      <Text style={styles.noteText}>
                        {importReview.summary.additions} nouvel(s) exemplaire(s) · {importReview.summary.identical} identique(s) ignoré(s) · {importReview.summary.collisions} collision(s) d’identifiant
                      </Text>
                      {importReview.summary.possibleDuplicates ? (
                        <Text style={styles.noteText}>
                          {importReview.summary.possibleDuplicates} ajout(s) ressemblent à des exemplaires existants (même espèce, forme, jeu et date). Vérifie-les après l’import.
                        </Text>
                      ) : null}
                      {importReview.unknownDates ? (
                        <Text style={styles.noteText}>{importReview.unknownDates} date(s) inconnue(s) dans le CSV : aucune date d’obtention n’est inventée.</Text>
                      ) : null}
                      <Text style={styles.noteText}>
                        Une collision désigne un même identifiant avec des données différentes. Les données existantes ne seront jamais écrasées.
                      </Text>
                      <View style={styles.toolRow}>
                        <Button label="Importer sans collisions" onPress={() => applyImport('skip')} />
                        {importReview.summary.collisions ? (
                          <Button label="Conserver aussi des copies" secondary onPress={() => applyImport('copy')} />
                        ) : null}
                      </View>
                    </View>
                  ) : null}
                </>
              ) : null}
              {feedback ? (
                <Text style={[styles.feedback, feedback.error && styles.error]}>{feedback.text}</Text>
              ) : null}
            </View>
            <Text style={styles.subtitle}>Exemplaires enregistrés</Text>
            <View style={styles.chips}>
              {([
                ['active', adventure.activeSave.name],
                ['unassigned', 'Sans partie'],
                ['all', 'Tous'],
              ] as const).map(([key, label]) => (
                <Pressable
                  key={key}
                  accessibilityRole="button"
                  onPress={() => setScope(key)}
                  style={[styles.chip, scope === key && styles.chipActive]}
                >
                  <Text style={[styles.chipText, scope === key && styles.chipTextActive]}>{label}</Text>
                </Pressable>
              ))}
            </View>
            <TextInput
              value={search}
              onChangeText={setSearch}
              placeholder="Rechercher un Pokémon, un surnom, une boîte…"
              placeholderTextColor="#777"
              style={styles.searchInput}
            />
            <Text style={styles.meta}>{orderedSpecimens.length} résultat{orderedSpecimens.length > 1 ? 's' : ''}</Text>
          </View>
        }
        renderItem={({ item }) => {
          const pokemon = getCatalogPokemonBySlug(item.speciesSlug);
          const game = gameOptions.find((option) => option.id === item.gameId);
          return (
            <View style={styles.card}>
              <View style={styles.cardTop}>
                <Image source={{ uri: pokemon.image }} style={styles.image} resizeMode="contain" />
                <View style={styles.cardCopy}>
                  <Text style={styles.name}>{item.nickname ? `${item.nickname} · ` : ''}{pokemon.nameFr}{item.shiny ? ' ✨' : ''}</Text>
                  <Text style={styles.meta}>{item.formSlug}</Text>
                  <Text style={styles.meta}>
                    {game?.shortLabel ?? 'Jeu non reconnu'} · {item.obtainedAt === 0 ? 'date inconnue' : new Date(item.obtainedAt).toLocaleDateString('fr-FR')}
                  </Text>
                  {item.boxName ? (
                    <Text style={styles.meta}>Boîte {item.boxName}{item.boxSlot ? ` · emplacement ${item.boxSlot}` : ''}</Text>
                  ) : null}
                  <Text style={styles.meta}>
                    Partie : {adventure.saves.find((save) => save.id === item.saveId)?.name ?? 'non attribuée'}
                  </Text>
                  {item.ball || item.language || item.obtainedPlace ? (
                    <Text style={styles.meta}>
                      {[item.ball, item.language, item.obtainedPlace].filter(Boolean).join(' · ')}
                    </Text>
                  ) : null}
                </View>
              </View>
              <View style={styles.chips}>
                {originOptions.map((origin) => {
                  const active = item.origin === origin.key;
                  return (
                    <Pressable
                      key={origin.key}
                      onPress={() => { if (!active) editSpecimen(item, { origin: origin.key }); }}
                      style={[styles.chip, active && styles.chipActive]}
                    >
                      <Text style={[styles.chipText, active && styles.chipTextActive]}>{origin.label}</Text>
                    </Pressable>
                  );
                })}
              </View>
              <View style={styles.chips}>
                <Pressable
                  accessibilityRole="button"
                  onPress={() => editSpecimen(item, { shiny: !item.shiny })}
                  style={[styles.chip, item.shiny && styles.chipActive]}
                >
                  <Text style={[styles.chipText, item.shiny && styles.chipTextActive]}>
                    {item.shiny ? 'Chromatique : oui' : 'Chromatique : non'}
                  </Text>
                </Pressable>
                <Pressable
                  accessibilityRole="button"
                  onPress={() => setEditingGameId(editingGameId === item.id ? null : item.id)}
                  style={styles.chip}
                >
                  <Text style={styles.chipText}>Jeu : {game?.shortLabel ?? item.gameId} ▾</Text>
                </Pressable>
              </View>
              {editingGameId === item.id ? (
                <View style={styles.chips}>
                  {gameOptions.map((option) => (
                    <Pressable
                      key={option.id}
                      accessibilityRole="button"
                      onPress={() => {
                        if (option.id !== item.gameId) editSpecimen(item, { gameId: option.id, saveId: null });
                        setEditingGameId(null);
                      }}
                      style={[styles.chip, option.id === item.gameId && styles.chipActive]}
                    >
                      <Text style={[styles.chipText, option.id === item.gameId && styles.chipTextActive]}>
                        {option.label}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              ) : null}
              <Pressable
                accessibilityRole="button"
                onPress={() => setEditingSaveId(editingSaveId === item.id ? null : item.id)}
                style={styles.detailsButton}
              >
                <Text style={styles.detailsText}>Attribuer à une partie ▾</Text>
              </Pressable>
              {editingSaveId === item.id ? (
                <View style={styles.chips}>
                  {adventure.saves.filter((save) => save.gameId === item.gameId).map((save) => (
                    <Pressable
                      key={save.id}
                      accessibilityRole="button"
                      onPress={() => {
                        if (item.saveId !== save.id) editSpecimen(item, { saveId: save.id });
                        setEditingSaveId(null);
                      }}
                      style={[styles.chip, item.saveId === save.id && styles.chipActive]}
                    >
                      <Text style={[styles.chipText, item.saveId === save.id && styles.chipTextActive]}>{save.name}</Text>
                    </Pressable>
                  ))}
                  <Pressable
                    accessibilityRole="button"
                    onPress={() => {
                      if (item.saveId) editSpecimen(item, { saveId: null });
                      setEditingSaveId(null);
                    }}
                    style={[styles.chip, !item.saveId && styles.chipActive]}
                  >
                    <Text style={[styles.chipText, !item.saveId && styles.chipTextActive]}>Sans partie</Text>
                  </Pressable>
                </View>
              ) : null}
              <Pressable
                accessibilityRole="button"
                onPress={() => setEditingDetailsId(editingDetailsId === item.id ? null : item.id)}
                style={styles.detailsButton}
              >
                <Text style={styles.detailsText}>{editingDetailsId === item.id ? 'Fermer le passeport' : 'Passeport et rangement'}</Text>
              </Pressable>
              {editingDetailsId === item.id ? (
                <SpecimenDetailsEditor
                  key={item.id}
                  specimen={item}
                  onSave={(changes) => editSpecimen(item, changes)}
                  onClose={() => setEditingDetailsId(null)}
                />
              ) : null}
              {item.notes ? <Text style={styles.noteText}>{item.notes}</Text> : null}
              <Pressable
                accessibilityRole="button"
                onPress={() => setPendingDeleteId(item.id)}
                style={styles.deleteButton}
              >
                <Text style={styles.deleteText}>Supprimer cet exemplaire</Text>
              </Pressable>
            </View>
          );
        }}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyText}>
              {specimens.length === 0
                ? 'Aucun exemplaire. Ouvre une fiche Pokémon et utilise « Ajouter un exemplaire ». '
                : 'Aucun exemplaire dans ce filtre. Vérifie la partie ou la recherche.'}
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

function normalizeSearch(value: string) {
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim().toLocaleLowerCase('fr-FR');
}

function Summary({ label, value }: { label: string; value: number }) {
  return (
    <View style={styles.summaryCard}>
      <Text style={styles.summaryValue}>{value}</Text>
      <Text style={styles.summaryLabel}>{label}</Text>
    </View>
  );
}

function Button({ label, onPress, secondary = false }: { label: string; onPress: () => void; secondary?: boolean }) {
  return (
    <Pressable onPress={onPress} style={[styles.button, secondary && styles.secondaryButton]}>
      <Text style={[styles.buttonText, secondary && styles.secondaryButtonText]}>{label}</Text>
    </Pressable>
  );
}
