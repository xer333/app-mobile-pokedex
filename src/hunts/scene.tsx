import { Feather } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useMemo, useRef, useState } from 'react';
import { FlatList, Image, Pressable, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { gameOptions, useAdventure } from '../_shared/adventure';
import { findCatalogPokemonBySlug, pokemonCatalog } from '../_shared/catalog';
import { useCollections } from '../_shared/collections';
import { ConfirmDialog } from '../_shared/confirm-dialog';
import { useHuntFoundCoordinator } from '../_shared/hunt-found-coordinator';
import { useShinyHunts } from '../_shared/shiny-hunts-provider';
import { getHuntAttempts, getHuntProbability, getHuntSpecimenId, type ShinyHunt } from '../_shared/shiny-hunts';
import type { PokemonSpecimenOrigin } from '../_shared/specimens';
import { styles } from './styles';

type SegmentDraft = { method: string; odds: string };

export function HuntsScene() {
  const router = useRouter();
  const params = useLocalSearchParams<{ pokemon?: string }>();
  const requestedSlug = Array.isArray(params.pokemon) ? params.pokemon[0] : params.pokemon;
  const { activeGame, activeSave, activeSaveId, saves } = useAdventure();
  const hunts = useShinyHunts();
  const foundCoordinator = useHuntFoundCoordinator();
  const { addSpecimen, specimens, isReady: collectionReady } = useCollections();
  const [query, setQuery] = useState('');
  const [selectedSlug, setSelectedSlug] = useState(
    findCatalogPokemonBySlug(requestedSlug)?.slug ?? '',
  );
  const [method, setMethod] = useState('Rencontres');
  const [odds, setOdds] = useState('');
  const [drafts, setDrafts] = useState<Record<string, SegmentDraft>>({});
  const [scope, setScope] = useState<'active' | 'unassigned' | 'all'>('active');
  const [pendingAction, setPendingAction] = useState<{ kind: 'delete' | 'found'; huntId: string } | null>(null);
  const [foundFormSlug, setFoundFormSlug] = useState('');
  const [foundOrigin, setFoundOrigin] = useState<PokemonSpecimenOrigin>('unspecified');
  const [completionError, setCompletionError] = useState<string | null>(null);
  const undoStack = useRef<Array<{ label: string; snapshot: ShinyHunt }>>([]);
  const [undoLabel, setUndoLabel] = useState<string | null>(null);
  const pendingHunt = hunts.hunts.find((hunt) => hunt.id === pendingAction?.huntId);
  const selectedPokemon = findCatalogPokemonBySlug(selectedSlug);
  const visibleHunts = useMemo(() => hunts.hunts.filter((hunt) =>
    scope === 'all' || (scope === 'unassigned' ? !hunt.saveId : hunt.saveId === activeSaveId)),
  [activeSaveId, hunts.hunts, scope]);
  const rememberHunt = (snapshot: ShinyHunt, label: string) => {
    undoStack.current = [...undoStack.current.slice(-9), { label, snapshot }];
    setUndoLabel(label);
  };

  const undoLast = () => {
    if (!foundCoordinator.isReady) return;
    const action = undoStack.current.pop();
    if (action) hunts.restoreHuntSnapshot(action.snapshot);
    setUndoLabel(undoStack.current.at(-1)?.label ?? null);
  };
  const matches = useMemo(() => {
    const normalized = normalize(query);
    if (!normalized) return [];
    return pokemonCatalog
      .filter((pokemon) =>
        normalize(`${pokemon.nameFr} ${pokemon.nameEn} ${pokemon.id}`).includes(normalized),
      )
      .slice(0, 6);
  }, [query]);

  const createHunt = () => {
    if (!selectedPokemon) return;
    hunts.addHunt(selectedPokemon.slug, activeGame.id, method, parseOdds(odds));
    setSelectedSlug('');
    setQuery('');
    setMethod('Rencontres');
    setOdds('');
  };

  const confirmAction = async () => {
    if (!pendingAction || !pendingHunt) return;
    if (pendingAction.kind === 'delete') {
      if (!foundCoordinator.isReady) return;
      rememberHunt(pendingHunt, 'Suppression de chasse');
      hunts.removeHunt(pendingHunt.id);
      setPendingAction(null);
    } else if (pendingHunt.status !== 'found') {
      try {
        setCompletionError(null);
        await foundCoordinator.completeHunt(
          pendingHunt,
          foundFormSlug.trim() || pendingHunt.targetSlug,
          foundOrigin,
        );
        undoStack.current = [];
        setUndoLabel(null);
        setPendingAction(null);
      } catch (error) {
        setCompletionError(error instanceof Error ? error.message : 'Impossible de finaliser la trouvaille.');
      }
    }
  };

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'left', 'right']}>
      <ConfirmDialog
        visible={pendingAction !== null}
        title={pendingAction?.kind === 'delete' ? 'Supprimer la chasse ?' : 'Confirmer la trouvaille ?'}
        message={pendingAction?.kind === 'delete'
          ? 'Le compteur et ses segments seront perdus. L’exemplaire déjà ajouté à la collection restera conservé.'
          : 'La chasse sera clôturée et un exemplaire chromatique sera ajouté à ta collection.'}
        confirmLabel={pendingAction?.kind === 'delete' ? 'Supprimer' : 'Confirmer'}
        destructive={pendingAction?.kind === 'delete'}
        onCancel={() => setPendingAction(null)}
        onConfirm={() => { void confirmAction(); }}
      >
        {pendingAction?.kind === 'found' ? (
          <View style={styles.foundForm}>
            <Text style={styles.formLabel}>Forme ou variante</Text>
            <TextInput
              value={foundFormSlug}
              onChangeText={setFoundFormSlug}
              placeholder={pendingHunt?.targetSlug ?? 'Identifiant de forme'}
              placeholderTextColor="#777"
              autoCapitalize="none"
              style={styles.input}
            />
            <Text style={styles.formHint}>Laisse vide pour la forme de base. La forme saisie est conservée telle quelle.</Text>
            <Text style={styles.formLabel}>Mode d’obtention</Text>
            <View style={styles.originRow}>
              {([
                ['unspecified', 'Non renseigné'],
                ['captured', 'Capturé'],
                ['received', 'Reçu'],
                ['traded', 'Échangé'],
              ] as const).map(([key, label]) => (
                <Pressable
                  key={key}
                  accessibilityRole="button"
                  onPress={() => setFoundOrigin(key)}
                  style={[styles.originChip, foundOrigin === key && styles.originChipActive]}
                >
                  <Text style={[styles.originText, foundOrigin === key && styles.originTextActive]}>{label}</Text>
                </Pressable>
              ))}
            </View>
          </View>
        ) : null}
      </ConfirmDialog>
      <FlatList
        data={visibleHunts}
        keyExtractor={(hunt) => hunt.id}
        contentContainerStyle={styles.content}
        ListHeaderComponent={
          <View style={styles.headerStack}>
            <View style={styles.header}>
              <Pressable onPress={() => router.back()} style={styles.iconButton}>
                <Feather name="arrow-left" size={22} color="#fff" />
              </Pressable>
              <Text style={styles.title}>Chasses chromatiques</Text>
              <View style={styles.iconButton} />
            </View>
            <Text style={styles.subtitle}>
              Le compteur reste utile sans taux connu. Les probabilités affichées supposent des
              essais indépendants et ne prédisent jamais la prochaine rencontre.
            </Text>
            <View style={styles.originRow}>
              {([
                ['active', activeSave.name],
                ['unassigned', 'Sans partie'],
                ['all', 'Toutes'],
              ] as const).map(([key, label]) => (
                <Pressable
                  key={key}
                  accessibilityRole="button"
                  onPress={() => setScope(key)}
                  style={[styles.originChip, scope === key && styles.originChipActive]}
                >
                  <Text style={[styles.originText, scope === key && styles.originTextActive]}>{label}</Text>
                </Pressable>
              ))}
            </View>
            {foundCoordinator.pendingHuntId || foundCoordinator.error || completionError ? (
              <View style={styles.recoveryCard}>
                <Text style={styles.recoveryText}>
                  {completionError ?? foundCoordinator.error ?? 'Finalisation de la trouvaille en cours…'}
                </Text>
                {foundCoordinator.error ? (
                  <Pressable accessibilityRole="button" onPress={foundCoordinator.retryRecovery}>
                    <Text style={styles.recoveryAction}>Réessayer la récupération</Text>
                  </Pressable>
                ) : null}
              </View>
            ) : null}
            {undoLabel ? (
              <Pressable
                accessibilityRole="button"
                disabled={!foundCoordinator.isReady}
                onPress={undoLast}
                style={[styles.undoButton, !foundCoordinator.isReady && styles.disabledButton]}
              >
                <Text style={styles.undoText}>Annuler : {undoLabel}</Text>
              </Pressable>
            ) : null}
            <View style={styles.composer}>
              <Text style={styles.sectionTitle}>Nouvelle chasse · {activeSave.name} ({activeGame.shortLabel})</Text>
              {selectedPokemon ? (
                <View style={styles.selectedPokemon}>
                  <Image source={{ uri: selectedPokemon.image }} style={styles.selectedImage} />
                  <View style={styles.flex}>
                    <Text style={styles.selectedName}>{selectedPokemon.nameFr}</Text>
                    <Text style={styles.meta}>#{String(selectedPokemon.id).padStart(4, '0')}</Text>
                  </View>
                  <Pressable onPress={() => setSelectedSlug('')}>
                    <Feather name="x" size={20} color="#aaa" />
                  </Pressable>
                </View>
              ) : (
                <>
                  <TextInput
                    value={query}
                    onChangeText={setQuery}
                    placeholder="Pokémon cible"
                    placeholderTextColor="#666"
                    style={styles.input}
                  />
                  {matches.map((pokemon) => (
                    <Pressable
                      key={pokemon.slug}
                      onPress={() => {
                        setSelectedSlug(pokemon.slug);
                        setQuery('');
                      }}
                      style={styles.searchResult}
                    >
                      <Image source={{ uri: pokemon.image }} style={styles.resultImage} />
                      <Text style={styles.resultText}>{pokemon.nameFr}</Text>
                      <Text style={styles.meta}>#{pokemon.id}</Text>
                    </Pressable>
                  ))}
                </>
              )}
              <View style={styles.row}>
                <TextInput
                  value={method}
                  onChangeText={setMethod}
                  placeholder="Méthode"
                  placeholderTextColor="#666"
                  style={[styles.input, styles.flex]}
                />
                <TextInput
                  value={odds}
                  onChangeText={setOdds}
                  keyboardType="number-pad"
                  placeholder="Taux 1 sur…"
                  placeholderTextColor="#666"
                  style={[styles.input, styles.oddsInput]}
                />
              </View>
              <Pressable
                disabled={!selectedPokemon || !foundCoordinator.isReady}
                onPress={createHunt}
                style={[styles.primaryButton, (!selectedPokemon || !foundCoordinator.isReady) && styles.disabledButton]}
              >
                <Text style={styles.primaryButtonText}>Démarrer la chasse</Text>
              </Pressable>
            </View>
          </View>
        }
        renderItem={({ item }) => {
          const pokemon = findCatalogPokemonBySlug(item.targetSlug);
          const currentSegment = item.segments.at(-1)!;
          const probability = getHuntProbability(item);
          const draft = drafts[item.id] ?? {
            method: currentSegment.method,
            odds: currentSegment.odds?.toString() ?? '',
          };
          const recoveryLocked = !foundCoordinator.isReady;
          return (
            <View style={[styles.huntCard, item.status === 'found' && styles.foundCard]}>
              <View style={styles.huntTop}>
                {pokemon ? <Image source={{ uri: pokemon.image }} style={styles.huntImage} /> : null}
                <View style={styles.flex}>
                  <Text style={styles.huntName}>{pokemon?.nameFr ?? item.targetSlug}</Text>
                  <Text style={styles.meta}>
                    {gameOptions.find((game) => game.id === item.gameId)?.label ?? item.gameId} · {statusLabel(item.status)}
                  </Text>
                  <Text style={styles.meta}>
                    Partie : {saves.find((save) => save.id === item.saveId)?.name ?? 'non attribuée'}
                  </Text>
                </View>
                <Pressable
                  accessibilityRole="button"
                  disabled={recoveryLocked}
                  onPress={() => setPendingAction({ kind: 'delete', huntId: item.id })}
                >
                  <Feather name="trash-2" size={18} color="#ff9f9f" />
                </Pressable>
              </View>
              {item.status !== 'found' ? (
                <View style={styles.originRow}>
                  {saves.filter((save) => save.gameId === item.gameId).map((save) => (
                    <Pressable
                      key={save.id}
                      accessibilityRole="button"
                      disabled={recoveryLocked}
                      onPress={() => hunts.assignHuntToSave(item.id, save.id)}
                      style={[styles.originChip, item.saveId === save.id && styles.originChipActive]}
                    >
                      <Text style={[styles.originText, item.saveId === save.id && styles.originTextActive]}>{save.name}</Text>
                    </Pressable>
                  ))}
                  <Pressable
                    accessibilityRole="button"
                    disabled={recoveryLocked}
                    onPress={() => hunts.assignHuntToSave(item.id, null)}
                    style={[styles.originChip, !item.saveId && styles.originChipActive]}
                  >
                    <Text style={[styles.originText, !item.saveId && styles.originTextActive]}>Sans partie</Text>
                  </Pressable>
                </View>
              ) : null}
              <Text style={styles.attempts}>{getHuntAttempts(item).toLocaleString('fr-FR')}</Text>
              <Text style={styles.attemptLabel}>essais enregistrés</Text>
              <View style={styles.counterRow}>
                <CounterButton label="−10" onPress={() => { rememberHunt(item, 'Correction du compteur'); hunts.adjustAttempts(item.id, -10); }} disabled={item.status === 'found' || recoveryLocked} />
                <CounterButton label="−1" onPress={() => { rememberHunt(item, 'Correction du compteur'); hunts.adjustAttempts(item.id, -1); }} disabled={item.status === 'found' || recoveryLocked} />
                <CounterButton label="+1" onPress={() => { rememberHunt(item, 'Correction du compteur'); hunts.adjustAttempts(item.id, 1); }} primary disabled={item.status !== 'active' || recoveryLocked} />
                <CounterButton label="+10" onPress={() => { rememberHunt(item, 'Correction du compteur'); hunts.adjustAttempts(item.id, 10); }} disabled={item.status !== 'active' || recoveryLocked} />
              </View>
              <View style={styles.probabilityCard}>
                <Text style={styles.probabilityTitle}>Lecture théorique</Text>
                <Text style={styles.probabilityText}>
                  {probability === null
                    ? 'Probabilité cumulée non calculable : au moins un segment utilisé n’a pas de taux renseigné.'
                    : `${formatPercent(probability)} d’avoir obtenu au moins un succès sur les segments renseignés.`}
                </Text>
                <Text style={styles.disclaimer}>
                  Segment actuel : {currentSegment.method} · {currentSegment.odds ? `1/${currentSegment.odds}` : 'taux inconnu'} · {currentSegment.attempts} essais. Les échecs passés ne rendent pas le prochain essai plus favorable.
                </Text>
              </View>
              {item.status !== 'found' ? (
                <>
                  <View style={styles.row}>
                    <TextInput
                      value={draft.method}
                      onChangeText={(value) => setDrafts((current) => ({ ...current, [item.id]: { ...draft, method: value } }))}
                      placeholder="Nouvelle méthode"
                      placeholderTextColor="#666"
                      style={[styles.input, styles.flex]}
                    />
                    <TextInput
                      value={draft.odds}
                      onChangeText={(value) => setDrafts((current) => ({ ...current, [item.id]: { ...draft, odds: value } }))}
                      keyboardType="number-pad"
                      placeholder="1 sur…"
                      placeholderTextColor="#666"
                      style={[styles.input, styles.oddsInput]}
                    />
                  </View>
                  <Pressable
                    disabled={recoveryLocked}
                    onPress={() => {
                      rememberHunt(item, 'Changement de méthode');
                      hunts.changeMethod(item.id, draft.method, parseOdds(draft.odds));
                    }}
                    style={[styles.secondaryButton, recoveryLocked && styles.disabledButton]}
                  >
                    <Text style={styles.secondaryButtonText}>Commencer un nouveau segment</Text>
                  </Pressable>
                  <View style={styles.row}>
                    <Pressable disabled={recoveryLocked} onPress={() => { rememberHunt(item, 'Pause de chasse'); hunts.togglePause(item.id); }} style={[styles.secondaryButton, styles.flex, recoveryLocked && styles.disabledButton]}>
                      <Text style={styles.secondaryButtonText}>{item.status === 'paused' ? 'Reprendre' : 'Mettre en pause'}</Text>
                    </Pressable>
                    <Pressable
                      disabled={!foundCoordinator.isReady || !hunts.isReady || !collectionReady}
                      onPress={() => {
                        setFoundFormSlug('');
                        setFoundOrigin('unspecified');
                        setPendingAction({ kind: 'found', huntId: item.id });
                      }}
                      style={[styles.primaryButton, styles.flex, (!foundCoordinator.isReady || !hunts.isReady || !collectionReady) && styles.disabledButton]}
                    >
                      <Text style={styles.primaryButtonText}>Trouvé !</Text>
                    </Pressable>
                  </View>
                </>
              ) : (
                specimens.some((specimen) => specimen.id === getHuntSpecimenId(item)) ? (
                  <Text style={styles.foundText}>Chromatique ajouté à la collection.</Text>
                ) : (
                  <Pressable
                    accessibilityRole="button"
                    onPress={() => addSpecimen({
                      speciesSlug: item.targetSlug,
                      formSlug: item.foundFormSlug ?? item.targetSlug,
                      shiny: true,
                      gameId: item.gameId,
                      origin: item.foundOrigin ?? 'unspecified',
                    }, getHuntSpecimenId(item))}
                    style={styles.secondaryButton}
                  >
                    <Text style={styles.secondaryButtonText}>Exemplaire absent : le recréer</Text>
                  </Pressable>
                )
              )}
              <Text style={styles.segmentCount}>{item.segments.length} segment{item.segments.length > 1 ? 's' : ''} conservé{item.segments.length > 1 ? 's' : ''}</Text>
            </View>
          );
        }}
        ListEmptyComponent={<View style={styles.empty}><Text style={styles.emptyText}>
          {hunts.hunts.length === 0
            ? 'Aucune chasse. Choisis une cible pour commencer un compteur persistant.'
            : 'Aucune chasse dans ce filtre. Choisis une autre partie ou « Toutes ». '}
        </Text></View>}
      />
    </SafeAreaView>
  );
}

function CounterButton({ label, onPress, primary = false, disabled = false }: { label: string; onPress: () => void; primary?: boolean; disabled?: boolean }) {
  return (
    <Pressable disabled={disabled} onPress={onPress} style={[styles.counterButton, primary && styles.counterPrimary, disabled && styles.disabledButton]}>
      <Text style={[styles.counterText, primary && styles.counterPrimaryText]}>{label}</Text>
    </Pressable>
  );
}

function normalize(value: string) {
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim().toLocaleLowerCase('fr-FR');
}

function parseOdds(value: string) {
  const parsed = Number(value.replace(/\s/g, ''));
  return Number.isFinite(parsed) && parsed >= 1 ? Math.round(parsed) : null;
}

function formatPercent(value: number) {
  return new Intl.NumberFormat('fr-FR', { style: 'percent', maximumFractionDigits: 2 }).format(value);
}

function statusLabel(status: ShinyHunt['status']) {
  if (status === 'found') return 'trouvé';
  if (status === 'paused') return 'en pause';
  return 'active';
}
