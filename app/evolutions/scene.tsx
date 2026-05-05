import { Feather, Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useDeferredValue, useEffect, useMemo, useState } from 'react';
import {
  FlatList,
  Image,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import Animated, { FadeInUp, LinearTransition } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AccountAvatarButton } from '../_shared/account-ui';
import { useActivity } from '../_shared/activity';
import {
  featuredPokemonSlugs,
  getCatalogPokemonBySlug,
  getDetailColors,
  pokemonCatalog,
} from '../_shared/catalog';
import { appRoutes, detailRoute, mapRoute } from '../_shared/routes';
import { SkeletonBlock, SkeletonCard } from '../_shared/skeleton';
import { BottomDock } from '../_shared/ui';
import { usePokemonDetail } from '../detail/usePokemonDetail';
import { styles } from './styles';

export function EvolutionsScene() {
  const router = useRouter();
  const [selectedPokemonSlug, setSelectedPokemonSlug] = useState('eevee');
  const [pokemonSearchValue, setPokemonSearchValue] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const deferredPokemonSearch = useDeferredValue(pokemonSearchValue);
  const selectedPokemon = getCatalogPokemonBySlug(selectedPokemonSlug);
  const { recordActivity } = useActivity();
  const gradientColors = useMemo(
    () => getDetailColors(selectedPokemon.color),
    [selectedPokemon.color],
  );
  const { data, isLoading, error, reload } = usePokemonDetail(selectedPokemon.slug);

  useEffect(() => {
    recordActivity({
      route: appRoutes.evolutions,
      label: `Evolutions de ${selectedPokemon.nameFr}`,
      pokemonSlug: selectedPokemon.slug,
    });
  }, [recordActivity, selectedPokemon.nameFr, selectedPokemon.slug]);

  useEffect(() => {
    if (!isLoading && refreshing) {
      setRefreshing(false);
    }
  }, [isLoading, refreshing]);

  const pokemonSuggestions = useMemo(() => {
    const normalized = deferredPokemonSearch.trim().toLowerCase();
    if (!normalized) {
      return [];
    }

    return pokemonCatalog
      .filter(
        (entry) =>
          entry.nameFr.toLowerCase().includes(normalized) ||
          entry.nameEn.toLowerCase().includes(normalized) ||
          entry.slug.toLowerCase().includes(normalized),
      )
      .slice(0, 8);
  }, [deferredPokemonSearch]);

  const heroSummary = useMemo(() => {
    if (!data) {
      return [
        selectedPokemon.generationLabelFr,
        selectedPokemon.regionLabelsFr[0] ?? 'Pokedex',
      ];
    }

    return [
      `${data.evolutions.length} membres dans la famille`,
      data.evolutionSteps.length > 0
        ? `${data.evolutionSteps.length} condition${data.evolutionSteps.length > 1 ? 's' : ''}`
        : 'Aucune condition speciale',
      data.varieties.length > 1 ? `${data.varieties.length} variantes` : 'Forme principale',
    ];
  }, [data, selectedPokemon]);

  const handleSelectPokemon = (slug: string) => {
    setSelectedPokemonSlug(slug);
    setPokemonSearchValue('');
  };

  const evolutionSteps = data?.evolutionSteps ?? [];

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'left', 'right']}>
      <EvolutionsBackdrop />

      <FlatList
        data={evolutionSteps}
        keyExtractor={(item) => `${item.fromSlug}-${item.toSlug}`}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
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
        initialNumToRender={6}
        maxToRenderPerBatch={10}
        windowSize={5}
        ListHeaderComponent={
          <View>
            <View style={styles.header}>
              <Pressable
                onPress={() => router.replace(appRoutes.dashboard)}
                style={styles.iconButton}
              >
                <Feather name="arrow-left" size={22} color="#ffffff" />
              </Pressable>

              <AccountAvatarButton
                onPress={() => router.push(appRoutes.profile)}
                size={40}
                textSize={16}
              />
            </View>

            <View>
              <Text style={styles.title}>Evolutions</Text>
              <Text style={styles.subtitle}>
                Choisis un Pokemon pour afficher sa famille complete et ses conditions
                d&apos;evolution en clair.
              </Text>
            </View>

            <LinearGradient colors={gradientColors} style={styles.heroCard}>
              <View style={styles.heroGlow} />
              <View style={styles.heroMainRow}>
                <View style={styles.heroCopy}>
                  <Text style={styles.heroEyebrow}>Famille active</Text>
                  <Text style={styles.heroName}>{selectedPokemon.nameFr}</Text>
                  <Text style={styles.heroMeta}>
                    #{String(selectedPokemon.id).padStart(4, '0')} · {selectedPokemon.generationLabelFr}
                  </Text>
                </View>

                <View style={styles.heroImageShell}>
                  <Image source={{ uri: selectedPokemon.image }} style={styles.heroImage} />
                </View>
              </View>

              <View style={styles.heroSummaryRow}>
                {heroSummary.map((item) => (
                  <View key={item} style={styles.summaryPill}>
                    <Text style={styles.summaryPillText}>{item}</Text>
                  </View>
                ))}
              </View>

              <View style={styles.heroActionRow}>
                <Pressable
                  onPress={() => router.push(detailRoute(selectedPokemon.slug))}
                  style={styles.heroButton}
                >
                  <Text style={styles.heroButtonText}>Voir la fiche Pokemon</Text>
                </Pressable>

                <Pressable
                  onPress={() => router.push(mapRoute(selectedPokemon.slug))}
                  style={styles.heroButton}
                >
                  <Text style={styles.heroButtonText}>Voir la carte des rencontres</Text>
                </Pressable>
              </View>
            </LinearGradient>

            <View style={styles.sectionBlock}>
              <Text style={styles.sectionTitle}>Choisir un Pokemon</Text>

              <View style={styles.searchShell}>
                <Feather name="search" size={22} color="#8d8d8d" />
                <TextInput
                  value={pokemonSearchValue}
                  onChangeText={setPokemonSearchValue}
                  placeholder="Rechercher un Pokemon"
                  placeholderTextColor="#777777"
                  style={styles.searchInput}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
                {pokemonSearchValue ? (
                  <Pressable onPress={() => setPokemonSearchValue('')}>
                    <Ionicons name="close-circle" size={20} color="#9e9e9e" />
                  </Pressable>
                ) : null}
              </View>

              {pokemonSuggestions.length > 0 ? (
                <View style={styles.suggestionWrap}>
                  {pokemonSuggestions.map((pokemon) => (
                    <SuggestionCard
                      key={pokemon.slug}
                      active={pokemon.slug === selectedPokemon.slug}
                      image={pokemon.image}
                      name={pokemon.nameFr}
                      meta={pokemon.generationLabelFr}
                      onPress={() => handleSelectPokemon(pokemon.slug)}
                    />
                  ))}
                </View>
              ) : (
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.chipRow}
                >
                  {featuredPokemonSlugs.map((slug) => {
                    const pokemon = getCatalogPokemonBySlug(slug);

                    return (
                      <FilterChip
                        key={pokemon.slug}
                        active={pokemon.slug === selectedPokemon.slug}
                        label={pokemon.nameFr}
                        onPress={() => handleSelectPokemon(pokemon.slug)}
                      />
                    );
                  })}
                </ScrollView>
              )}
            </View>

            <View style={styles.infoCard}>
              <Text style={styles.infoTitle}>Utilite rapide</Text>
              <Text style={styles.infoText}>
                Cet ecran sert a comprendre une famille d&apos;evolution sans devoir ouvrir chaque
                Pokemon un par un. Les cartes ouvrent les fiches detail.
              </Text>
            </View>

            {data ? (
              <View style={styles.sectionBlock}>
                <Text style={styles.sectionTitle}>Famille complete</Text>
                <View style={styles.evolutionList}>
                  {data.evolutions.map((evolution) => (
                    <EvolutionCard
                      key={evolution.slug}
                      active={evolution.slug === selectedPokemon.slug}
                      image={evolution.image}
                      name={evolution.name}
                      onPress={() => router.push(detailRoute(evolution.slug))}
                    />
                  ))}
                </View>
              </View>
            ) : null}

            {data?.evolutionSteps.length ? (
              <Text style={styles.sectionTitle}>Conditions d&apos;evolution</Text>
            ) : null}
          </View>
        }
        renderItem={({ item, index }) => (
          <Animated.View
            entering={FadeInUp.delay(index * 18).duration(220)}
            layout={LinearTransition.springify().damping(20).stiffness(170)}
          >
            <View style={styles.stepCard}>
              <Text style={styles.stepTitle}>
                {item.fromName}
                {' -> '}
                {item.toName}
              </Text>
              <Text style={styles.stepText}>{item.description}</Text>
            </View>
          </Animated.View>
        )}
        ListEmptyComponent={
          isLoading && !data ? (
            <EvolutionsSkeletonState />
          ) : error && !data ? (
            <ErrorState error={error} onRetry={reload} />
          ) : (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyTitle}>Pas d&apos;evolution supplementaire</Text>
              <Text style={styles.emptyText}>
                Ce Pokemon n&apos;a pas de chaine plus grande enregistree dans PokeAPI.
              </Text>
            </View>
          )
        }
      />

      <BottomDock
        activeTab="none"
        onMapPress={() => router.replace(appRoutes.map)}
        onHomePress={() => router.replace(appRoutes.dashboard)}
        onDiscoverPress={() => router.replace(appRoutes.discover)}
      />
    </SafeAreaView>
  );
}

function FilterChip({
  active,
  label,
  onPress,
}: {
  active: boolean;
  label: string;
  onPress: () => void;
}) {
  return (
    <Pressable onPress={onPress} style={[styles.filterChip, active && styles.filterChipActive]}>
      <Text style={[styles.filterChipText, active && styles.filterChipTextActive]}>{label}</Text>
    </Pressable>
  );
}

function SuggestionCard({
  active,
  image,
  meta,
  name,
  onPress,
}: {
  active: boolean;
  image: string;
  meta: string;
  name: string;
  onPress: () => void;
}) {
  return (
    <Pressable onPress={onPress} style={styles.suggestionButton}>
      <View style={styles.suggestionImageShell}>
        <Image source={{ uri: image }} style={styles.suggestionImage} />
      </View>

      <View style={styles.suggestionCopy}>
        <Text style={styles.suggestionName}>{name}</Text>
        <Text style={styles.suggestionMeta}>{meta}</Text>
      </View>

      {active ? (
        <View style={styles.selectedPill}>
          <Text style={styles.selectedPillText}>Actif</Text>
        </View>
      ) : (
        <Ionicons name="arrow-forward-circle-outline" size={22} color="#ffffff" />
      )}
    </Pressable>
  );
}

function EvolutionCard({
  active,
  image,
  name,
  onPress,
}: {
  active: boolean;
  image: string;
  name: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={[styles.evolutionCard, active && styles.evolutionCardActive]}
    >
      <Image source={{ uri: image }} style={styles.evolutionImage} />

      <View style={styles.evolutionTextWrap}>
        <Text style={styles.evolutionName}>{name}</Text>
        <Text style={styles.evolutionMeta}>
          {active ? 'Pokemon actuellement consulte' : 'Ouvrir la fiche detail'}
        </Text>
      </View>

      <View style={styles.evolutionBadge}>
        <Text style={styles.evolutionBadgeText}>{active ? 'Actif' : 'Voir'}</Text>
      </View>
    </Pressable>
  );
}

function EvolutionsSkeletonState() {
  return (
    <View style={{ gap: 12 }}>
      {Array.from({ length: 3 }).map((_, index) => (
        <SkeletonCard key={`evolution-skeleton-${index}`} style={styles.stepCard}>
          <SkeletonBlock style={{ width: '58%', height: 20, borderRadius: 8 }} />
          <SkeletonBlock style={{ width: '86%', height: 15, borderRadius: 8 }} />
          <SkeletonBlock style={{ width: '68%', height: 15, borderRadius: 8 }} />
        </SkeletonCard>
      ))}
    </View>
  );
}

function ErrorState({
  error,
  onRetry,
}: {
  error: string | null;
  onRetry: () => void;
}) {
  return (
    <View style={styles.errorCard}>
      <Text style={styles.errorTitle}>Evolutions indisponibles</Text>
      <Text style={styles.errorText}>{error ?? 'Erreur inconnue.'}</Text>
      <Pressable onPress={onRetry} style={styles.retryButton}>
        <Text style={styles.retryButtonText}>Reessayer</Text>
      </Pressable>
    </View>
  );
}

function EvolutionsBackdrop() {
  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      <LinearGradient
        colors={['#101010', '#222222', '#141414', '#242424', '#111111']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={StyleSheet.absoluteFill}
      />
      <View style={[styles.backdropStripe, { left: '18%' }]} />
      <View style={[styles.backdropStripe, { left: '44%' }]} />
      <View style={[styles.backdropStripe, { left: '70%' }]} />
    </View>
  );
}
