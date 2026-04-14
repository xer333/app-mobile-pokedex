import { Feather, Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { getCatalogPokemonBySlug, getDetailColors } from '../_shared/catalog';
import {
  teamLimit,
  useCollections,
} from '../_shared/collections';
import type { PokemonDetailData } from '../_shared/pokeapi';
import { appRoutes, compareRoute, detailRoute, mapRoute, moveRoute } from '../_shared/routes';
import { BottomDock } from '../_shared/ui';
import { AboutSection, EvolutionsSection, MovesSection, StatsSection } from './sections';
import { styles } from './styles';
import { detailTabs, type DetailTabId } from './tabs';
import { usePokemonDetail } from './usePokemonDetail';

export function DetailScene() {
  const router = useRouter();
  const params = useLocalSearchParams<{ slug?: string }>();
  const catalogPokemon = getCatalogPokemonBySlug(params.slug);
  const [activeTab, setActiveTab] = useState<DetailTabId>('stats');
  const [showShiny, setShowShiny] = useState(false);
  const { data, isLoading, error, reload } = usePokemonDetail(catalogPokemon.slug);
  const {
    comparisonTarget,
    isFavorite,
    isInTeam,
    setComparisonTarget,
    toggleFavorite,
    toggleTeamMember,
    team,
  } = useCollections();
  const gradientColors = useMemo(
    () => getDetailColors(catalogPokemon.color),
    [catalogPokemon.color],
  );

  useEffect(() => {
    setActiveTab('stats');
    setShowShiny(false);
  }, [catalogPokemon.slug]);

  const pokemon = data ?? createFallbackPokemon(catalogPokemon);
  const favorite = isFavorite(pokemon.slug);
  const inTeam = isInTeam(pokemon.slug);
  const teamIsFull = team.length >= teamLimit;
  const comparisonIsArmed = comparisonTarget === pokemon.slug;
  const comparisonReady = Boolean(comparisonTarget && comparisonTarget !== pokemon.slug);
  const displayedImage = showShiny && pokemon.shinyImage ? pokemon.shinyImage : pokemon.image;

  return (
    <LinearGradient colors={gradientColors} style={styles.screen}>
      <SafeAreaView style={styles.screen} edges={['top', 'left', 'right']}>
        <DetailBackdrop />

        <View style={styles.header}>
          <Pressable onPress={() => router.replace(appRoutes.discover)} style={styles.iconButton}>
            <Feather name="arrow-left" size={22} color="#ffffff" />
          </Pressable>
          <Text style={styles.title}>{pokemon.name}</Text>
          <Pressable onPress={() => toggleFavorite(pokemon.slug)} style={styles.iconButton}>
            <Ionicons
              name={favorite ? 'heart' : 'heart-outline'}
              size={24}
              color="#ffffff"
            />
          </Pressable>
        </View>

        {error && !data ? (
          <View style={styles.errorCard}>
            <Text style={styles.errorTitle}>Chargement impossible</Text>
            <Text style={styles.errorText}>{error}</Text>
            <Pressable onPress={reload} style={styles.retryButton}>
              <Text style={styles.retryButtonText}>Réessayer</Text>
            </Pressable>
          </View>
        ) : (
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
            <View style={styles.heroArea}>
              <View style={styles.heroGlow} />
              <Image source={{ uri: displayedImage }} style={styles.heroImage} />

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

              <View style={styles.actionRow}>
                <ActionButton
                  active={showShiny}
                  label={
                    pokemon.shinyImage
                      ? showShiny
                        ? 'Shiny activé'
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
                  active={inTeam}
                  label={
                    inTeam
                      ? `Dans l'équipe (${team.length}/${teamLimit})`
                      : teamIsFull
                        ? `Équipe pleine (${team.length}/${teamLimit})`
                        : `Ajouter à l'équipe (${team.length}/${teamLimit})`
                  }
                  onPress={() => toggleTeamMember(pokemon.slug)}
                />

                <ActionButton
                  label="Voir sur la carte"
                  onPress={() => router.push(mapRoute(pokemon.slug))}
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
                      router.push(compareRoute(comparisonTarget, pokemon.slug));
                      return;
                    }

                    setComparisonTarget(pokemon.slug);
                  }}
                />
              </View>

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
                <View style={styles.loadingWrap}>
                  <ActivityIndicator size="large" color="#ffffff" />
                  <Text style={styles.loadingText}>Chargement des données PokéAPI</Text>
                  <Text style={styles.loadingSubtext}>
                    On récupère les stats, les matchups, les rencontres, les formes et les
                    évolutions en direct.
                  </Text>
                </View>
              ) : (
                <DetailTabContent
                  activeTab={activeTab}
                  onOpenEvolution={(slug) => router.replace(detailRoute(slug))}
                  onOpenMove={(slug) => router.push(moveRoute(slug))}
                  pokemon={pokemon}
                />
              )}
            </View>
          </ScrollView>
        )}

        <BottomDock
          onMapPress={() => router.replace(mapRoute(pokemon.slug))}
          onHomePress={() => router.replace(appRoutes.dashboard)}
          onDiscoverPress={() => router.replace(appRoutes.discover)}
        />
      </SafeAreaView>
    </LinearGradient>
  );
}

function DetailTabContent({
  activeTab,
  onOpenEvolution,
  onOpenMove,
  pokemon,
}: {
  activeTab: DetailTabId;
  onOpenEvolution: (slug: string) => void;
  onOpenMove: (slug: string) => void;
  pokemon: PokemonDetailData;
}) {
  switch (activeTab) {
    case 'about':
      return <AboutSection pokemon={pokemon} />;
    case 'moves':
      return <MovesSection onOpenMove={onOpenMove} pokemon={pokemon} />;
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

function createFallbackPokemon(
  catalogPokemon: ReturnType<typeof getCatalogPokemonBySlug>,
): PokemonDetailData {
  return {
    slug: catalogPokemon.slug,
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
    evolutions: [],
    evolutionSteps: [],
    varieties: [],
    encounters: [],
  };
}

function DetailBackdrop() {
  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
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
