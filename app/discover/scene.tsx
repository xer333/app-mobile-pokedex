import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useDeferredValue, useEffect, useMemo, useState, type ReactNode } from 'react';
import {
  FlatList,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import Animated, {
  FadeInUp,
  FadeOutDown,
  LinearTransition,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AccountAvatarButton } from '../_shared/account-ui';
import { useActivity } from '../_shared/activity';
import {
  pokemonGenerationFilters,
  pokemonRegionFilters,
  pokemonTypeFilters,
  type PokemonCatalogItem,
} from '../_shared/catalog';
import { useCollections } from '../_shared/collections';
import { QuickMenuSheet } from '../_shared/quick-menu';
import { appRoutes, detailRoute } from '../_shared/routes';
import { BottomDock, DiscoverPokemonTile } from '../_shared/ui';
import { DiscoverCardSkeleton, DiscoverHeaderSkeleton } from './skeletons';
import { styles } from './styles';
import { useDiscoverCatalog } from './useDiscoverCatalog';

const frenchNumber = new Intl.NumberFormat('fr-FR');

type SpecialFilter = 'all' | 'favorites' | 'team' | 'legendary' | 'mythical';

type DiscoverListItem =
  | {
      kind: 'pokemon';
      pokemon: PokemonCatalogItem;
    }
  | {
      kind: 'skeleton';
      key: string;
    };

const SKELETON_ITEMS: DiscoverListItem[] = Array.from({ length: 6 }, (_, index) => ({
  kind: 'skeleton',
  key: `skeleton-${index}`,
}));

export function DiscoverScene() {
  const router = useRouter();
  const [menuVisible, setMenuVisible] = useState(false);
  const { favorites, team } = useCollections();
  const { recordActivity } = useActivity();
  const [searchValue, setSearchValue] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedGeneration, setSelectedGeneration] = useState<string>('all');
  const [selectedRegion, setSelectedRegion] = useState<string>('all');
  const [specialFilter, setSpecialFilter] = useState<SpecialFilter>('all');
  const deferredSearchValue = useDeferredValue(searchValue);
  const {
    items: apiPokemon,
    apiTotalCount,
    error,
    isLoading,
    refreshing,
    refresh,
    retry,
  } = useDiscoverCatalog();

  const pokemon = useMemo(() => {
    const normalized = deferredSearchValue.trim().toLowerCase();

    return apiPokemon.filter((entry) => {
      if (
        normalized &&
        !entry.nameFr.toLowerCase().includes(normalized) &&
        !entry.nameEn.toLowerCase().includes(normalized) &&
        !entry.slug.toLowerCase().includes(normalized)
      ) {
        return false;
      }

      if (selectedType !== 'all' && !entry.types.includes(selectedType)) {
        return false;
      }

      if (selectedGeneration !== 'all' && entry.generation !== selectedGeneration) {
        return false;
      }

      if (selectedRegion !== 'all' && !entry.regions.includes(selectedRegion)) {
        return false;
      }

      switch (specialFilter) {
        case 'favorites':
          return favorites.includes(entry.slug);
        case 'team':
          return team.includes(entry.slug);
        case 'legendary':
          return entry.isLegendary;
        case 'mythical':
          return entry.isMythical;
        case 'all':
        default:
          return true;
      }
    });
  }, [
    apiPokemon,
    deferredSearchValue,
    favorites,
    selectedGeneration,
    selectedRegion,
    selectedType,
    specialFilter,
    team,
  ]);

  const listData = useMemo<DiscoverListItem[]>(
    () =>
      isLoading
        ? SKELETON_ITEMS
        : pokemon.map((entry) => ({
            kind: 'pokemon',
            pokemon: entry,
          })),
    [isLoading, pokemon],
  );

  useEffect(() => {
    recordActivity({
      route: appRoutes.discover,
      label: 'Explorer le Pokédex',
    });
  }, [recordActivity]);

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'left', 'right']}>
      <DarkBackdrop />

      <FlatList
        data={listData}
        keyExtractor={(item) => (item.kind === 'pokemon' ? item.pokemon.slug : item.key)}
        numColumns={2}
        columnWrapperStyle={styles.gridRow}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        removeClippedSubviews
        contentContainerStyle={styles.listContent}
        initialNumToRender={18}
        maxToRenderPerBatch={20}
        windowSize={7}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={refresh}
            tintColor="#ffffff"
            progressBackgroundColor="#1f1f1f"
          />
        }
        ListHeaderComponent={
          isLoading ? (
            <DiscoverHeaderSkeleton />
          ) : (
            <DiscoverHeader
              apiTotalCount={apiTotalCount}
              favoritesCount={favorites.length}
              filteredCount={pokemon.length}
              hasInlineError={Boolean(error && apiPokemon.length > 0)}
              searchValue={searchValue}
              selectedGeneration={selectedGeneration}
              selectedRegion={selectedRegion}
              selectedType={selectedType}
              specialFilter={specialFilter}
              teamCount={team.length}
              onChangeSearch={setSearchValue}
              onOpenMenu={() => setMenuVisible(true)}
              onOpenProfile={() => router.push(appRoutes.profile)}
              onSelectGeneration={setSelectedGeneration}
              onSelectRegion={setSelectedRegion}
              onSelectSpecialFilter={setSpecialFilter}
              onSelectType={setSelectedType}
            />
          )
        }
        ListEmptyComponent={
          error && apiPokemon.length === 0 ? (
            <ErrorState message={error} onRetry={retry} />
          ) : (
            <EmptyState />
          )
        }
        renderItem={({ index, item }) => {
          if (item.kind === 'skeleton') {
            return <DiscoverCardSkeleton />;
          }

          return (
            <Animated.View
              entering={FadeInUp.delay(Math.min(index, 10) * 34).duration(260)}
              exiting={FadeOutDown.duration(180)}
              layout={LinearTransition.springify().damping(18).stiffness(180)}
              style={styles.gridCell}
            >
              <DiscoverPokemonTile
                pokemon={item.pokemon}
                onPress={() => router.push(detailRoute(item.pokemon.slug))}
              />
            </Animated.View>
          );
        }}
      />

      <BottomDock
        activeTab="discover"
        onMapPress={() => router.replace(appRoutes.map)}
        onHomePress={() => router.replace(appRoutes.dashboard)}
        onDiscoverPress={() => router.replace(appRoutes.discover)}
      />

      <QuickMenuSheet
        visible={menuVisible}
        currentSection="discover"
        onClose={() => setMenuVisible(false)}
      />
    </SafeAreaView>
  );
}

function DiscoverHeader({
  apiTotalCount,
  favoritesCount,
  filteredCount,
  hasInlineError,
  searchValue,
  selectedGeneration,
  selectedRegion,
  selectedType,
  specialFilter,
  teamCount,
  onChangeSearch,
  onOpenMenu,
  onOpenProfile,
  onSelectGeneration,
  onSelectRegion,
  onSelectSpecialFilter,
  onSelectType,
}: {
  apiTotalCount: number;
  favoritesCount: number;
  filteredCount: number;
  hasInlineError: boolean;
  searchValue: string;
  selectedGeneration: string;
  selectedRegion: string;
  selectedType: string;
  specialFilter: SpecialFilter;
  teamCount: number;
  onChangeSearch: (value: string) => void;
  onOpenMenu: () => void;
  onOpenProfile: () => void;
  onSelectGeneration: (value: string) => void;
  onSelectRegion: (value: string) => void;
  onSelectSpecialFilter: (value: SpecialFilter) => void;
  onSelectType: (value: string) => void;
}) {
  return (
    <Animated.View layout={LinearTransition.springify().damping(20).stiffness(170)}>
      <View style={styles.topBar}>
        <Pressable onPress={onOpenMenu} style={styles.iconButton}>
          <Feather name="menu" size={28} color="#ffffff" />
        </Pressable>

        <AccountAvatarButton onPress={onOpenProfile} />
      </View>

      <Text style={styles.title}>Pokédex complet</Text>
      <Text style={styles.subtitle}>
        {`${frenchNumber.format(apiTotalCount)} Pokémon chargés depuis PokéAPI, traduits en français et filtrables par type, génération, région et collection.`}
      </Text>

      {hasInlineError ? (
        <StatusBanner
          tone="error"
          text={
            "La dernière actualisation a échoué. La liste affichée reste utilisable et tu peux tirer vers le bas pour réessayer."
          }
        />
      ) : (
        <StatusBanner
          text={
            'Tire vers le bas pour rafraîchir la liste API sans casser le scroll ni les filtres.'
          }
        />
      )}

      <View style={styles.searchShell}>
        <Feather name="search" size={22} color="#8d8d8d" />
        <TextInput
          value={searchValue}
          onChangeText={onChangeSearch}
          placeholder="Rechercher un Pokémon"
          placeholderTextColor="#777777"
          style={styles.searchInput}
          autoCapitalize="none"
          autoCorrect={false}
        />
      </View>

      <FilterSection title="Collections">
        <FilterChip
          label="Tout"
          active={specialFilter === 'all'}
          onPress={() => onSelectSpecialFilter('all')}
        />
        <FilterChip
          label={`Favoris (${favoritesCount})`}
          active={specialFilter === 'favorites'}
          onPress={() => onSelectSpecialFilter('favorites')}
        />
        <FilterChip
          label={`Équipe (${teamCount}/6)`}
          active={specialFilter === 'team'}
          onPress={() => onSelectSpecialFilter('team')}
        />
        <FilterChip
          label="Légendaires"
          active={specialFilter === 'legendary'}
          onPress={() => onSelectSpecialFilter('legendary')}
        />
        <FilterChip
          label="Fabuleux"
          active={specialFilter === 'mythical'}
          onPress={() => onSelectSpecialFilter('mythical')}
        />
      </FilterSection>

      <FilterSection title="Régions">
        <FilterChip
          label="Toutes"
          active={selectedRegion === 'all'}
          onPress={() => onSelectRegion('all')}
        />
        {pokemonRegionFilters.map((filter) => (
          <FilterChip
            key={filter.key}
            label={filter.label}
            active={selectedRegion === filter.key}
            onPress={() => onSelectRegion(filter.key)}
          />
        ))}
      </FilterSection>

      <FilterSection title="Générations">
        <FilterChip
          label="Toutes"
          active={selectedGeneration === 'all'}
          onPress={() => onSelectGeneration('all')}
        />
        {pokemonGenerationFilters.map((filter) => (
          <FilterChip
            key={filter.key}
            label={filter.label}
            active={selectedGeneration === filter.key}
            onPress={() => onSelectGeneration(filter.key)}
          />
        ))}
      </FilterSection>

      <FilterSection title="Types">
        <FilterChip
          label="Tous"
          active={selectedType === 'all'}
          onPress={() => onSelectType('all')}
        />
        {pokemonTypeFilters.map((filter) => (
          <FilterChip
            key={filter.key}
            label={filter.label}
            active={selectedType === filter.key}
            onPress={() => onSelectType(filter.key)}
          />
        ))}
      </FilterSection>

      <Animated.View
        layout={LinearTransition.springify().damping(20).stiffness(170)}
        style={styles.resultsHeader}
      >
        <Text style={styles.resultsTitle}>Résultats</Text>
        <Text style={styles.resultsCount}>{frenchNumber.format(filteredCount)}</Text>
      </Animated.View>
    </Animated.View>
  );
}

function FilterSection({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <Animated.View
      layout={LinearTransition.springify().damping(20).stiffness(170)}
      style={styles.filterSection}
    >
      <Text style={styles.filterTitle}>{title}</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterRow}
      >
        {children}
      </ScrollView>
    </Animated.View>
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
    <Animated.View layout={LinearTransition.springify().damping(20).stiffness(170)}>
      <Pressable onPress={onPress} style={[styles.filterChip, active && styles.filterChipActive]}>
        <Text style={[styles.filterChipText, active && styles.filterChipTextActive]}>{label}</Text>
      </Pressable>
    </Animated.View>
  );
}

function StatusBanner({
  text,
  tone = 'default',
}: {
  text: string;
  tone?: 'default' | 'error';
}) {
  return (
    <Animated.View
      layout={LinearTransition.springify().damping(18).stiffness(180)}
      style={[styles.statusBanner, tone === 'error' && styles.statusBannerError]}
    >
      <Text style={styles.statusBannerText}>{text}</Text>
    </Animated.View>
  );
}

function EmptyState() {
  return (
    <View style={styles.emptyState}>
      <Text style={styles.emptyTitle}>Aucun Pokémon trouvé</Text>
      <Text style={styles.emptyText}>
        {"Essaie un autre nom, change de région, ou enlève un filtre de collection."}
      </Text>
    </View>
  );
}

function ErrorState({
  message,
  onRetry,
}: {
  message: string;
  onRetry: () => void;
}) {
  return (
    <View style={styles.errorState}>
      <Text style={styles.emptyTitle}>{'La liste API est indisponible'}</Text>
      <Text style={styles.emptyText}>{message}</Text>
      <Pressable onPress={onRetry} style={styles.retryButton}>
        <Text style={styles.retryButtonText}>Réessayer</Text>
      </Pressable>
    </View>
  );
}

function DarkBackdrop() {
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
