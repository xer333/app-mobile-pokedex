import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useDeferredValue, useMemo, useState, type ReactNode } from 'react';
import {
  FlatList,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AccountAvatarButton } from '../_shared/account-ui';
import {
  pokemonCatalog,
  pokemonCatalogCount,
  pokemonGenerationFilters,
  pokemonRegionFilters,
  pokemonTypeFilters,
} from '../_shared/catalog';
import { useCollections } from '../_shared/collections';
import { appRoutes, detailRoute } from '../_shared/routes';
import { BottomDock, DiscoverPokemonTile } from '../_shared/ui';
import { styles } from './styles';

const frenchNumber = new Intl.NumberFormat('fr-FR');

type SpecialFilter = 'all' | 'favorites' | 'team' | 'legendary' | 'mythical';

export function DiscoverScene() {
  const router = useRouter();
  const { favorites, team } = useCollections();
  const [searchValue, setSearchValue] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedGeneration, setSelectedGeneration] = useState<string>('all');
  const [selectedRegion, setSelectedRegion] = useState<string>('all');
  const [specialFilter, setSpecialFilter] = useState<SpecialFilter>('all');
  const deferredSearchValue = useDeferredValue(searchValue);

  const pokemon = useMemo(() => {
    const normalized = deferredSearchValue.trim().toLowerCase();

    return pokemonCatalog.filter((entry) => {
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
    deferredSearchValue,
    favorites,
    selectedGeneration,
    selectedRegion,
    selectedType,
    specialFilter,
    team,
  ]);

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'left', 'right']}>
      <DarkBackdrop />

      <FlatList
        data={pokemon}
        keyExtractor={(item) => item.slug}
        numColumns={2}
        columnWrapperStyle={styles.gridRow}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        initialNumToRender={18}
        maxToRenderPerBatch={20}
        windowSize={7}
        ListHeaderComponent={
          <View>
            <View style={styles.topBar}>
              <Pressable
                onPress={() => router.replace(appRoutes.dashboard)}
                style={styles.iconButton}
              >
                <Feather name="menu" size={28} color="#ffffff" />
              </Pressable>

              <AccountAvatarButton onPress={() => router.push(appRoutes.profile)} />
            </View>

            <Text style={styles.title}>Pokédex complet</Text>
            <Text style={styles.subtitle}>
              {frenchNumber.format(pokemonCatalogCount)} Pokémon, traduits en français, filtrables
              par type, génération, région et collection.
            </Text>

            <View style={styles.searchShell}>
              <Feather name="search" size={22} color="#8d8d8d" />
              <TextInput
                value={searchValue}
                onChangeText={setSearchValue}
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
                onPress={() => setSpecialFilter('all')}
              />
              <FilterChip
                label={`Favoris (${favorites.length})`}
                active={specialFilter === 'favorites'}
                onPress={() => setSpecialFilter('favorites')}
              />
              <FilterChip
                label={`Équipe (${team.length}/6)`}
                active={specialFilter === 'team'}
                onPress={() => setSpecialFilter('team')}
              />
              <FilterChip
                label="Légendaires"
                active={specialFilter === 'legendary'}
                onPress={() => setSpecialFilter('legendary')}
              />
              <FilterChip
                label="Fabuleux"
                active={specialFilter === 'mythical'}
                onPress={() => setSpecialFilter('mythical')}
              />
            </FilterSection>

            <FilterSection title="Régions">
              <FilterChip
                label="Toutes"
                active={selectedRegion === 'all'}
                onPress={() => setSelectedRegion('all')}
              />
              {pokemonRegionFilters.map((filter) => (
                <FilterChip
                  key={filter.key}
                  label={filter.label}
                  active={selectedRegion === filter.key}
                  onPress={() => setSelectedRegion(filter.key)}
                />
              ))}
            </FilterSection>

            <FilterSection title="Générations">
              <FilterChip
                label="Toutes"
                active={selectedGeneration === 'all'}
                onPress={() => setSelectedGeneration('all')}
              />
              {pokemonGenerationFilters.map((filter) => (
                <FilterChip
                  key={filter.key}
                  label={filter.label}
                  active={selectedGeneration === filter.key}
                  onPress={() => setSelectedGeneration(filter.key)}
                />
              ))}
            </FilterSection>

            <FilterSection title="Types">
              <FilterChip
                label="Tous"
                active={selectedType === 'all'}
                onPress={() => setSelectedType('all')}
              />
              {pokemonTypeFilters.map((filter) => (
                <FilterChip
                  key={filter.key}
                  label={filter.label}
                  active={selectedType === filter.key}
                  onPress={() => setSelectedType(filter.key)}
                />
              ))}
            </FilterSection>

            <View style={styles.resultsHeader}>
              <Text style={styles.resultsTitle}>Résultats</Text>
              <Text style={styles.resultsCount}>{frenchNumber.format(pokemon.length)}</Text>
            </View>
          </View>
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>Aucun Pokémon trouvé</Text>
            <Text style={styles.emptyText}>
              Essaie un autre nom, change de région, ou enlève un filtre de collection.
            </Text>
          </View>
        }
        renderItem={({ item }) => (
          <DiscoverPokemonTile
            pokemon={item}
            onPress={() => router.push(detailRoute(item.slug))}
          />
        )}
      />

      <BottomDock
        activeTab="discover"
        onMapPress={() => router.replace(appRoutes.map)}
        onHomePress={() => router.replace(appRoutes.dashboard)}
        onDiscoverPress={() => router.replace(appRoutes.discover)}
      />
    </SafeAreaView>
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
    <View style={styles.filterSection}>
      <Text style={styles.filterTitle}>{title}</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterRow}
      >
        {children}
      </ScrollView>
    </View>
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
    <Pressable
      onPress={onPress}
      style={[styles.filterChip, active && styles.filterChipActive]}
    >
      <Text style={[styles.filterChipText, active && styles.filterChipTextActive]}>{label}</Text>
    </Pressable>
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
