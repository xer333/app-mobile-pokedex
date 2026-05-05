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
import { appRoutes, detailRoute, moveRoute } from '../_shared/routes';
import { SkeletonBlock, SkeletonCard } from '../_shared/skeleton';
import { BottomDock } from '../_shared/ui';
import { usePokemonDetail } from '../detail/usePokemonDetail';
import { styles } from './styles';

export function MovesScene() {
  const router = useRouter();
  const [selectedPokemonSlug, setSelectedPokemonSlug] = useState('pikachu');
  const [pokemonSearchValue, setPokemonSearchValue] = useState('');
  const [moveSearchValue, setMoveSearchValue] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [refreshing, setRefreshing] = useState(false);
  const deferredPokemonSearch = useDeferredValue(pokemonSearchValue);
  const deferredMoveSearch = useDeferredValue(moveSearchValue);
  const selectedPokemon = getCatalogPokemonBySlug(selectedPokemonSlug);
  const { recordActivity } = useActivity();
  const gradientColors = useMemo(
    () => getDetailColors(selectedPokemon.color),
    [selectedPokemon.color],
  );
  const { data, isLoading, error, reload } = usePokemonDetail(selectedPokemon.slug);

  useEffect(() => {
    recordActivity({
      route: appRoutes.moves,
      label: `Attaques de ${selectedPokemon.nameFr}`,
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

  const categories = useMemo(() => {
    if (!data) {
      return [];
    }

    return uniqueStrings(data.moves.map((move) => move.category));
  }, [data]);

  const filteredMoves = useMemo(() => {
    if (!data) {
      return [];
    }

    const normalized = deferredMoveSearch.trim().toLowerCase();

    return data.moves.filter((move) => {
      if (selectedCategory !== 'all' && move.category !== selectedCategory) {
        return false;
      }

      if (!normalized) {
        return true;
      }

      return move.name.toLowerCase().includes(normalized) || move.type.toLowerCase().includes(normalized);
    });
  }, [data, deferredMoveSearch, selectedCategory]);

  const heroSummary = useMemo(() => {
    if (!data) {
      return [
        selectedPokemon.generationLabelFr,
        selectedPokemon.regionLabelsFr[0] ?? 'Pokedex',
      ];
    }

    return [
      `${data.moves.length} attaques chargees`,
      `${uniqueStrings(data.moves.map((move) => move.type)).length} types couverts`,
      `${categories.length || 1} categories`,
    ];
  }, [categories.length, data, selectedPokemon]);

  const handleSelectPokemon = (slug: string) => {
    setSelectedPokemonSlug(slug);
    setPokemonSearchValue('');
    setMoveSearchValue('');
    setSelectedCategory('all');
  };

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'left', 'right']}>
      <MovesBackdrop />

      <FlatList
        data={filteredMoves}
        keyExtractor={(item) => `${selectedPokemon.slug}-${item.slug}`}
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
        initialNumToRender={8}
        maxToRenderPerBatch={14}
        windowSize={6}
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
              <Text style={styles.title}>Attaques</Text>
              <Text style={styles.subtitle}>
                Choisis un Pokemon pour explorer ses attaques principales, puis ouvre chaque fiche
                pour voir la puissance, la precision et l&apos;effet complet.
              </Text>
            </View>

            <LinearGradient colors={gradientColors} style={styles.heroCard}>
              <View style={styles.heroGlow} />
              <View style={styles.heroMainRow}>
                <View style={styles.heroCopy}>
                  <Text style={styles.heroEyebrow}>Pokemon actif</Text>

                  <View style={styles.heroTitleRow}>
                    <Text style={styles.heroName}>{selectedPokemon.nameFr}</Text>
                    <View style={styles.heroTypeBadge}>
                      <Text style={styles.heroTypeBadgeText}>
                        {selectedPokemon.types.length} type{selectedPokemon.types.length > 1 ? 's' : ''}
                      </Text>
                    </View>
                  </View>

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

            <View style={styles.sectionBlock}>
              <Text style={styles.sectionTitle}>Filtrer les attaques</Text>

              <View style={styles.searchShell}>
                <Feather name="zap" size={22} color="#8d8d8d" />
                <TextInput
                  value={moveSearchValue}
                  onChangeText={setMoveSearchValue}
                  placeholder="Filtrer une attaque"
                  placeholderTextColor="#777777"
                  style={styles.searchInput}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
                {moveSearchValue ? (
                  <Pressable onPress={() => setMoveSearchValue('')}>
                    <Ionicons name="close-circle" size={20} color="#9e9e9e" />
                  </Pressable>
                ) : null}
              </View>

              {categories.length > 0 ? (
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.chipRow}
                >
                  <FilterChip
                    active={selectedCategory === 'all'}
                    label="Toutes"
                    onPress={() => setSelectedCategory('all')}
                  />
                  {categories.map((category) => (
                    <FilterChip
                      key={category}
                      active={selectedCategory === category}
                      label={category}
                      onPress={() => setSelectedCategory(category)}
                    />
                  ))}
                </ScrollView>
              ) : null}
            </View>

            <View style={styles.infoCard}>
              <Text style={styles.infoTitle}>Utilite rapide</Text>
              <Text style={styles.infoText}>
                Cet ecran sert de raccourci direct vers les attaques du Pokemon choisi. Tu peux filtrer,
                puis ouvrir chaque attaque pour sa fiche complete.
              </Text>
            </View>
          </View>
        }
        renderItem={({ item, index }) => (
          <Animated.View
            entering={FadeInUp.delay(index * 18).duration(220)}
            layout={LinearTransition.springify().damping(20).stiffness(170)}
          >
            <MoveCard
              category={item.category}
              name={item.name}
              onPress={() => router.push(moveRoute(item.slug))}
              type={item.type}
              power={item.power}
              accuracy={item.accuracy}
              pp={item.pp}
              level={item.level}
            />
          </Animated.View>
        )}
        ListEmptyComponent={
          isLoading && !data ? (
            <MovesSkeletonState />
          ) : error && !data ? (
            <ErrorState error={error} onRetry={reload} />
          ) : (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyTitle}>Aucune attaque sur ce filtre</Text>
              <Text style={styles.emptyText}>
                Essaie une autre categorie ou choisis un autre Pokemon pour afficher une autre liste.
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

function MoveCard({
  accuracy,
  category,
  level,
  name,
  onPress,
  power,
  pp,
  type,
}: {
  accuracy: string;
  category: string;
  level: number | null;
  name: string;
  onPress: () => void;
  power: string;
  pp: string;
  type: string;
}) {
  return (
    <Pressable onPress={onPress} style={styles.moveCard}>
      <View style={styles.moveHeader}>
        <View style={styles.moveNameWrap}>
          <Text style={styles.moveName}>{name}</Text>
          <Text style={styles.moveMetaLine}>
            {type} · {category}
          </Text>
        </View>

        <View style={styles.moveArrow}>
          <Ionicons name="arrow-forward" size={18} color="#ffffff" />
        </View>
      </View>

      <View style={styles.moveStatsRow}>
        <StatPill label={`Puissance ${power}`} />
        <StatPill label={`Precision ${accuracy}`} />
        <StatPill label={`PP ${pp}`} />
        <StatPill label={level !== null ? `Niveau ${level}` : 'Niveau variable'} />
      </View>
    </Pressable>
  );
}

function StatPill({ label }: { label: string }) {
  return (
    <View style={styles.moveStatPill}>
      <Text style={styles.moveStatText}>{label}</Text>
    </View>
  );
}

function MovesSkeletonState() {
  return (
    <View style={{ gap: 12 }}>
      {Array.from({ length: 4 }).map((_, index) => (
        <SkeletonCard key={`move-skeleton-${index}`} style={styles.moveCard}>
          <View style={styles.moveHeader}>
            <View style={[styles.moveNameWrap, { gap: 8 }]}>
              <SkeletonBlock style={{ height: 22, width: '56%', borderRadius: 8 }} />
              <SkeletonBlock style={{ height: 14, width: '40%', borderRadius: 7 }} />
            </View>
            <SkeletonBlock style={{ width: 34, height: 34, borderRadius: 17 }} />
          </View>
          <View style={styles.moveStatsRow}>
            <SkeletonBlock style={{ height: 32, width: 122, borderRadius: 999 }} />
            <SkeletonBlock style={{ height: 32, width: 128, borderRadius: 999 }} />
            <SkeletonBlock style={{ height: 32, width: 72, borderRadius: 999 }} />
            <SkeletonBlock style={{ height: 32, width: 118, borderRadius: 999 }} />
          </View>
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
      <Text style={styles.errorTitle}>Attaques indisponibles</Text>
      <Text style={styles.errorText}>{error ?? 'Erreur inconnue.'}</Text>
      <Pressable onPress={onRetry} style={styles.retryButton}>
        <Text style={styles.retryButtonText}>Reessayer</Text>
      </Pressable>
    </View>
  );
}

function MovesBackdrop() {
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

function uniqueStrings(values: string[]) {
  return Array.from(new Set(values.filter(Boolean)));
}
