import { Feather, Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useMemo, useState } from 'react';
import {
  FlatList,
  Image,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Animated, { FadeInUp, LinearTransition } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import {
  findCatalogPokemonBySlug,
  getDetailColors,
  type PokemonCatalogItem,
} from '../_shared/catalog';
import { useActivity } from '../_shared/activity';
import { useAdventure } from '../_shared/adventure';
import {
  teamLimit,
  useCollections,
} from '../_shared/collections';
import type { PokemonDetailData } from '../_shared/pokeapi';
import { usePlanning } from '../_shared/planning-provider';
import {
  appRoutes,
  compareRoute,
  detailRoute,
  mapRoute,
  moveRoute,
  movesRoute,
  huntsRoute,
} from '../_shared/routes';
import { SkeletonBlock, SkeletonCard } from '../_shared/skeleton';
import { BottomDock } from '../_shared/ui';
import { AboutSection, EvolutionsSection, MovesSection, StatsSection } from './sections';
import { styles } from './styles';
import { detailTabs, type DetailTabId } from './tabs';
import { usePokemonDetail } from './usePokemonDetail';

export function DetailScene() {
  const params = useLocalSearchParams<{ slug?: string; tab?: string; species?: string }>();
  const requestedSlug = Array.isArray(params.slug) ? params.slug[0] : params.slug;
  const catalogPokemon =
    findCatalogPokemonBySlug(params.slug) ?? findCatalogPokemonBySlug(params.species);

  if (!catalogPokemon) {
    return <MissingPokemonScene requestedSlug={requestedSlug} />;
  }

  return (
    <PokemonDetailScene
      catalogPokemon={catalogPokemon}
      initialTab={resolveDetailTab(params.tab)}
      requestedSlug={requestedSlug ?? catalogPokemon.slug}
    />
  );
}

function PokemonDetailScene({
  catalogPokemon,
  initialTab,
  requestedSlug,
}: {
  catalogPokemon: PokemonCatalogItem;
  initialTab: DetailTabId;
  requestedSlug: string;
}) {
  const router = useRouter();
  const { activeGame } = useAdventure();
  const { addGoal, addTask } = usePlanning();
  const [activeTab, setActiveTab] = useState<DetailTabId>(initialTab);
  const [showShiny, setShowShiny] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [showTeamReplacement, setShowTeamReplacement] = useState(false);
  const [teamFeedback, setTeamFeedback] = useState<string | null>(null);
  const [lastAddedSpecimenId, setLastAddedSpecimenId] = useState<string | null>(null);
  const { data, isLoading, error, reload } = usePokemonDetail(
    requestedSlug,
    activeGame.versionGroup,
  );
  const {
    addSpecimen,
    comparisonTarget,
    isFavorite,
    isInTeam,
    setComparisonTarget,
    replaceTeamMember,
    persistenceError,
    retryPersistence,
    removeSpecimen,
    toggleFavorite,
    toggleTeamMember,
    team,
  } = useCollections();
  const { recordActivity } = useActivity();
  const gradientColors = useMemo(
    () => getDetailColors(catalogPokemon.color),
    [catalogPokemon.color],
  );

  useEffect(() => {
    setActiveTab(initialTab);
    setShowShiny(false);
    setLastAddedSpecimenId(null);
    setTeamFeedback(null);
  }, [initialTab, requestedSlug]);

  useEffect(() => {
    if (!isLoading && refreshing) {
      setRefreshing(false);
    }
  }, [isLoading, refreshing]);

  useEffect(() => {
    recordActivity({
      route: detailRoute(
        requestedSlug,
        activeTab,
        requestedSlug === catalogPokemon.slug ? undefined : catalogPokemon.slug,
      ),
      label: `Fiche de ${data?.name ?? catalogPokemon.nameFr}`,
      pokemonSlug: catalogPokemon.slug,
    });
  }, [activeTab, catalogPokemon.nameFr, catalogPokemon.slug, data?.name, recordActivity, requestedSlug]);

  const pokemon = data ?? createFallbackPokemon(catalogPokemon);
  const collectionSlug = pokemon.speciesSlug;
  const favorite = isFavorite(collectionSlug);
  const inTeam = isInTeam(collectionSlug);
  const teamIsFull = team.length >= teamLimit;
  const comparisonIsArmed = comparisonTarget === collectionSlug;
  const comparisonReady = Boolean(comparisonTarget && comparisonTarget !== collectionSlug);
  const displayedImage = showShiny && pokemon.shinyImage ? pokemon.shinyImage : pokemon.image;
  const teamPokemon = useMemo(
    () =>
      team
        .map((slug) => findCatalogPokemonBySlug(slug))
        .filter((entry): entry is PokemonCatalogItem => Boolean(entry)),
    [team],
  );

  return (
    <LinearGradient colors={gradientColors} style={styles.screen}>
      <SafeAreaView style={styles.screen} edges={['top', 'left', 'right']}>
        <DetailBackdrop />

        <FlatList
          data={['detail-body']}
          keyExtractor={(item) => item}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.content}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => {
                setRefreshing(true);
                reload();
              }}
              tintColor="#ffffff"
              progressBackgroundColor="#1f1f1f"
            />
          }
          initialNumToRender={1}
          maxToRenderPerBatch={2}
          windowSize={3}
          ListHeaderComponent={
            <View style={styles.header}>
              <Pressable
                onPress={() =>
                  router.canGoBack() ? router.back() : router.replace(appRoutes.discover)
                }
                style={styles.iconButton}
              >
                <Feather name="arrow-left" size={22} color="#ffffff" />
              </Pressable>
              <Text style={styles.title}>{pokemon.name}</Text>
              <Pressable onPress={() => toggleFavorite(collectionSlug)} style={styles.iconButton}>
                <Ionicons
                  name={favorite ? 'heart' : 'heart-outline'}
                  size={24}
                  color="#ffffff"
                />
              </Pressable>
            </View>
          }
          renderItem={() => (
            <Animated.View
              entering={FadeInUp.duration(260)}
              layout={LinearTransition.springify().damping(20).stiffness(170)}
            >
              {error && !data ? (
                <View style={styles.errorCard}>
                  <Text style={styles.errorTitle}>Chargement impossible</Text>
                  <Text style={styles.errorText}>{error}</Text>
                  <Pressable onPress={reload} style={styles.retryButton}>
                    <Text style={styles.retryButtonText}>Reessayer</Text>
                  </Pressable>
                </View>
              ) : (
                <>
                  <View style={styles.heroArea}>
                    <View style={styles.heroGlow} />
                    <Image source={{ uri: displayedImage }} style={styles.heroImage} resizeMode="contain" />

                    <View style={styles.heroMeta}>
                      <Text style={styles.heroId}>#{String(pokemon.id).padStart(4, '0')}</Text>
                      <View style={styles.heroTypeRow}>
                        {pokemon.types.map((type) => (
                          <View key={type} style={styles.heroTypePill}>
                            <Text style={styles.heroTypeText}>{type}</Text>
                          </View>
                        ))}
                      </View>
                    </View>
                  </View>

                  <View style={styles.sheet}>
                    <View style={styles.sheetHandle} />

                    <View style={styles.gameContextBar}>
                      <View style={styles.gameContextCopy}>
                        <Text style={styles.gameContextEyebrow}>Contexte actif</Text>
                        <Text style={styles.gameContextName}>{activeGame.label}</Text>
                      </View>
                      <Text style={styles.gameContextCoverage}>
                        {pokemon.isForm
                          ? 'Forme distincte'
                          : activeGame.coverage === 'partial'
                            ? 'Partiel'
                            : 'Général'}
                      </Text>
                    </View>

                    <View style={styles.actionRow}>
                      <ActionButton
                        active={showShiny}
                        label={
                          pokemon.shinyImage
                            ? showShiny
                              ? 'Shiny active'
                              : 'Voir shiny'
                            : 'Pas de shiny'
                        }
                        onPress={() => {
                          if (pokemon.shinyImage) {
                            setShowShiny((current) => !current);
                          }
                        }}
                      />

                      <ActionButton
                        label={showShiny ? 'Ajouter cet exemplaire shiny' : 'Ajouter un exemplaire'}
                        onPress={() => {
                          const specimenId = addSpecimen({
                            speciesSlug: pokemon.speciesSlug,
                            formSlug: pokemon.slug,
                            shiny: showShiny,
                            gameId: activeGame.id,
                            origin: 'unspecified',
                          });
                          setLastAddedSpecimenId(specimenId);
                          setTeamFeedback(
                            `${pokemon.name}${showShiny ? ' shiny' : ''} a été ajouté à tes exemplaires. Origine non renseignée.`,
                          );
                        }}
                      />

                      <ActionButton
                        active={inTeam}
                        label={
                          inTeam
                            ? `Dans l'equipe (${team.length}/${teamLimit})`
                            : teamIsFull
                              ? `Equipe pleine (${team.length}/${teamLimit})`
                              : `Ajouter a l'equipe (${team.length}/${teamLimit})`
                        }
                        onPress={() => {
                          setTeamFeedback(null);
                          setLastAddedSpecimenId(null);

                          if (!inTeam && teamIsFull) {
                            setShowTeamReplacement(true);
                            return;
                          }

                          const didUpdate = toggleTeamMember(collectionSlug);
                          if (didUpdate) {
                            setShowTeamReplacement(false);
                            setTeamFeedback(
                              inTeam
                                ? `${pokemon.name} a été retiré de l'équipe.`
                                : `${pokemon.name} a été ajouté à l'équipe.`,
                            );
                          }
                        }}
                      />

                      <ActionButton
                        label="Voir sur la carte"
                        onPress={() => router.push(mapRoute(collectionSlug))}
                      />

                      <ActionButton
                        label="Planifier son obtention"
                        onPress={() => {
                          const goalId = addGoal(`Obtenir ${pokemon.name}`, activeGame.id);
                          if (!goalId) return;
                          addTask(
                            goalId,
                            `Obtenir ${pokemon.name} dans ${activeGame.label}`,
                            `pokemon:${collectionSlug}`,
                          );
                          router.push(appRoutes.planner);
                        }}
                      />

                      <ActionButton
                        label="Démarrer une chasse shiny"
                        onPress={() => router.push(huntsRoute(collectionSlug))}
                      />

                      <ActionButton
                        active={comparisonIsArmed}
                        label={
                          comparisonReady
                            ? 'Comparer maintenant'
                            : comparisonIsArmed
                              ? 'Base de comparaison'
                              : 'Armer le comparateur'
                        }
                        onPress={() => {
                          if (comparisonReady && comparisonTarget) {
                            router.push(compareRoute(comparisonTarget, collectionSlug));
                            return;
                          }

                          setComparisonTarget(collectionSlug);
                        }}
                      />
                    </View>

                    {showTeamReplacement ? (
                      <View style={styles.replacementCard}>
                        <Text style={styles.replacementTitle}>Choisir le membre à remplacer</Text>
                        <Text style={styles.replacementText}>
                          L’équipe est pleine. Aucun membre ne sera supprimé sans ton choix.
                        </Text>
                        <View style={styles.replacementList}>
                          {teamPokemon.map((member) => (
                            <Pressable
                              key={member.slug}
                              onPress={() => {
                                if (replaceTeamMember(member.slug, collectionSlug)) {
                                  setShowTeamReplacement(false);
                                  setTeamFeedback(
                                    `${member.nameFr} a été remplacé par ${pokemon.name}.`,
                                  );
                                }
                              }}
                              style={styles.replacementOption}
                            >
                              <Image
                                source={{ uri: member.image }}
                                style={styles.replacementImage}
                                resizeMode="contain"
                              />
                              <Text style={styles.replacementOptionText}>{member.nameFr}</Text>
                            </Pressable>
                          ))}
                        </View>
                        <Pressable
                          onPress={() => setShowTeamReplacement(false)}
                          style={styles.replacementCancel}
                        >
                          <Text style={styles.replacementCancelText}>Annuler</Text>
                        </Pressable>
                      </View>
                    ) : null}

                    {teamFeedback ? (
                      <View style={styles.feedbackCard}>
                        <Text style={styles.feedbackText}>{teamFeedback}</Text>
                        {lastAddedSpecimenId ? (
                          <Pressable
                            onPress={() => {
                              removeSpecimen(lastAddedSpecimenId);
                              setLastAddedSpecimenId(null);
                              setTeamFeedback('Ajout de l’exemplaire annulé.');
                            }}
                            style={styles.feedbackUndo}
                          >
                            <Text style={styles.feedbackUndoText}>Annuler l’ajout</Text>
                          </Pressable>
                        ) : null}
                      </View>
                    ) : null}

                    {persistenceError ? (
                      <View style={styles.inlineErrorCard}>
                        <Text style={styles.inlineErrorText}>{persistenceError}</Text>
                        <Pressable onPress={retryPersistence} style={styles.inlineRetryButton}>
                          <Text style={styles.inlineRetryText}>Réessayer</Text>
                        </Pressable>
                      </View>
                    ) : null}

                    <View style={styles.tabsRow}>
                      {detailTabs.map((tab) => (
                        <Pressable
                          key={tab.id}
                          onPress={() => setActiveTab(tab.id)}
                          style={styles.tabButton}
                        >
                          <Text style={[styles.tabText, activeTab === tab.id && styles.activeTabText]}>
                            {tab.label}
                          </Text>
                          {activeTab === tab.id ? <View style={styles.activeTabDot} /> : null}
                        </Pressable>
                      ))}
                    </View>

                    {isLoading && !data ? (
                      <DetailSkeletonState />
                    ) : (
                      <DetailTabContent
                        activeTab={activeTab}
                        onOpenEvolution={(slug) => router.replace(detailRoute(slug))}
                        onOpenMove={(slug) => router.push(moveRoute(slug, collectionSlug))}
                        onOpenAllMoves={() => router.push(movesRoute(collectionSlug))}
                        onOpenVariant={(slug, speciesSlug) =>
                          router.push(detailRoute(slug, 'about', speciesSlug))
                        }
                        pokemon={pokemon}
                      />
                    )}
                  </View>
                </>
              )}
            </Animated.View>
          )}
        />

        <BottomDock
          activeTab="none"
          onMapPress={() => router.replace(mapRoute(collectionSlug))}
          onHomePress={() => router.replace(appRoutes.dashboard)}
          onDiscoverPress={() => router.replace(appRoutes.discover)}
        />
      </SafeAreaView>
    </LinearGradient>
  );
}

function MissingPokemonScene({ requestedSlug }: { requestedSlug?: string }) {
  const router = useRouter();

  return (
    <View style={[styles.screen, { backgroundColor: '#050505' }]}>
      <SafeAreaView style={styles.screen} edges={['top', 'left', 'right']}>
        <View style={styles.errorCard}>
          <Text style={styles.errorTitle}>Pokémon introuvable</Text>
          <Text style={styles.errorText}>
            {requestedSlug
              ? `« ${requestedSlug} » ne correspond à aucune fiche du catalogue local.`
              : "L'adresse de cette fiche ne contient aucun Pokémon identifiable."}
          </Text>
          <Pressable
            onPress={() =>
              router.canGoBack() ? router.back() : router.replace(appRoutes.discover)
            }
            style={styles.retryButton}
          >
            <Text style={styles.retryButtonText}>Retourner au Pokédex</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    </View>
  );
}

function DetailTabContent({
  activeTab,
  onOpenEvolution,
  onOpenAllMoves,
  onOpenMove,
  onOpenVariant,
  pokemon,
}: {
  activeTab: DetailTabId;
  onOpenEvolution: (slug: string) => void;
  onOpenAllMoves: () => void;
  onOpenMove: (slug: string) => void;
  onOpenVariant: (slug: string, speciesSlug: string) => void;
  pokemon: PokemonDetailData;
}) {
  switch (activeTab) {
    case 'about':
      return <AboutSection onOpenVariant={onOpenVariant} pokemon={pokemon} />;
    case 'moves':
      return (
        <MovesSection
          onOpenAllMoves={onOpenAllMoves}
          onOpenMove={onOpenMove}
          pokemon={pokemon}
        />
      );
    case 'evolutions':
      return <EvolutionsSection pokemon={pokemon} onOpenEvolution={onOpenEvolution} />;
    case 'stats':
    default:
      return <StatsSection pokemon={pokemon} />;
  }
}

function ActionButton({
  active,
  label,
  onPress,
}: {
  active?: boolean;
  label: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={[styles.actionButton, active && styles.actionButtonActive]}
    >
      <Text style={styles.actionButtonText}>{label}</Text>
    </Pressable>
  );
}

function DetailSkeletonState() {
  return (
    <View style={{ gap: 14 }}>
      <SkeletonCard style={styles.infoCard}>
        <SkeletonBlock style={{ width: '34%', height: 20, borderRadius: 8 }} />
        <SkeletonBlock style={{ width: '94%', height: 14, borderRadius: 7 }} />
        <SkeletonBlock style={{ width: '82%', height: 14, borderRadius: 7 }} />
      </SkeletonCard>

      <View style={styles.statsList}>
        {Array.from({ length: 5 }).map((_, index) => (
          <View key={`detail-skeleton-${index}`} style={styles.statRow}>
            <SkeletonBlock style={{ width: 82, height: 16, borderRadius: 8 }} />
            <SkeletonBlock style={{ width: 34, height: 16, borderRadius: 8 }} />
            <SkeletonBlock style={{ flex: 1, height: 6, borderRadius: 999 }} />
          </View>
        ))}
      </View>
    </View>
  );
}

function createFallbackPokemon(
  catalogPokemon: PokemonCatalogItem,
): PokemonDetailData {
  return {
    slug: catalogPokemon.slug,
    speciesSlug: catalogPokemon.slug,
    isForm: false,
    id: catalogPokemon.id,
    name: catalogPokemon.nameFr,
    image: catalogPokemon.image,
    shinyImage: null,
    description: catalogPokemon.flavorFr,
    genus: catalogPokemon.genusFr,
    habitat: catalogPokemon.habitat ?? 'Inconnu',
    generation: catalogPokemon.generation,
    generationLabel: catalogPokemon.generationLabelFr,
    regions: catalogPokemon.regionLabelsFr,
    eggGroups: catalogPokemon.eggGroups,
    growthRate: catalogPokemon.growthRate,
    gender: 'Inconnu',
    size: '—',
    weight: '—',
    baseExperience: 0,
    types: [],
    abilities: [],
    speciesFlags: [],
    stats: [],
    weaknesses: [],
    resistances: [],
    immunities: [],
    moves: [],
    moveSummaryTotal: 0,
    moveSummaryIsPartial: false,
    moveContextStatus: 'national',
    moveVersionGroup: null,
    evolutions: [],
    evolutionSteps: [],
    varieties: [],
    varietySummaryTotal: 0,
    varietySummaryIsPartial: false,
    encounters: [],
  };
}

function resolveDetailTab(value: string | string[] | undefined): DetailTabId {
  const normalized = Array.isArray(value) ? value[0] : value;
  return detailTabs.some((tab) => tab.id === normalized)
    ? (normalized as DetailTabId)
    : 'stats';
}

function DetailBackdrop() {
  return (
    <View style={[StyleSheet.absoluteFill, { pointerEvents: 'none' }]}>
      <View style={[styles.petal, { top: 106, left: 58, transform: [{ rotate: '-36deg' }] }]} />
      <View style={[styles.petal, { top: 118, right: 62, transform: [{ rotate: '26deg' }] }]} />
      <View style={[styles.petalLarge, { top: 158, left: -6, transform: [{ rotate: '18deg' }] }]} />
      <View
        style={[styles.petalLarge, { top: 168, right: -14, transform: [{ rotate: '-22deg' }] }]}
      />
      <View style={[styles.petal, { top: 270, left: 36, transform: [{ rotate: '54deg' }] }]} />
      <View style={[styles.petal, { top: 292, right: 28, transform: [{ rotate: '-44deg' }] }]} />
    </View>
  );
}
