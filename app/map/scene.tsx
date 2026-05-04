import { Feather, Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import {
  startTransition,
  useDeferredValue,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import {
  ActivityIndicator,
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AccountAvatarButton } from '../_shared/account-ui';
import {
  featuredPokemonSlugs,
  getCatalogPokemonBySlug,
  getDetailColors,
  pokemonCatalog,
} from '../_shared/catalog';
import type { PokemonAtlasData, PokemonAtlasLocation } from '../_shared/pokeapi';
import { appRoutes, detailRoute, mapRoute } from '../_shared/routes';
import { BottomDock } from '../_shared/ui';
import { getRegionMapAsset } from './mapAssets';
import { atlasRegionOrder, getMarkerPositions, getRegionVisual, orderRegionKeys } from './regions';
import { styles } from './styles';
import { usePokemonAtlas } from './usePokemonAtlas';

const defaultAtlasPokemonSlug = 'pikachu';
const atlasGridColumns = ['16%', '36%', '56%', '76%'] as const;

export function MapScene() {
  const router = useRouter();
  const params = useLocalSearchParams<{ pokemon?: string; region?: string }>();
  const [selectedPokemonSlug, setSelectedPokemonSlug] = useState(() =>
    resolvePokemonSlug(params.pokemon),
  );
  const [selectedRegion, setSelectedRegion] = useState(() => resolveRegionKey(params.region));
  const [selectedVersion, setSelectedVersion] = useState<string>('all');
  const [searchValue, setSearchValue] = useState('');
  const deferredSearchValue = useDeferredValue(searchValue);
  const selectedPokemon = getCatalogPokemonBySlug(selectedPokemonSlug);
  const gradientColors = useMemo(
    () => getDetailColors(selectedPokemon.color),
    [selectedPokemon.color],
  );
  const { data, error, isLoading, reload } = usePokemonAtlas(selectedPokemon.slug);

  useEffect(() => {
    setSelectedPokemonSlug(resolvePokemonSlug(params.pokemon));
  }, [params.pokemon]);

  useEffect(() => {
    setSelectedRegion(resolveRegionKey(params.region));
  }, [params.region]);

  useEffect(() => {
    if (!data) {
      return;
    }

    if (selectedRegion !== 'all' && !data.regions.some((region) => region.key === selectedRegion)) {
      setSelectedRegion('all');
    }
  }, [data, selectedRegion]);

  useEffect(() => {
    if (!data) {
      return;
    }

    if (selectedVersion !== 'all' && !data.versions.includes(selectedVersion)) {
      setSelectedVersion('all');
    }
  }, [data, selectedVersion]);

  const suggestions = useMemo(() => {
    const normalized = deferredSearchValue.trim().toLowerCase();
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
  }, [deferredSearchValue]);

  const regionOptions = useMemo(() => {
    if (!data) {
      return [];
    }

    return [...data.regions].sort((left, right) => orderRegionKeys(left.key, right.key));
  }, [data]);

  const filteredLocations = useMemo(() => {
    if (!data) {
      return [];
    }

    return data.locations.filter((location) => {
      if (selectedRegion !== 'all' && location.regionKey !== selectedRegion) {
        return false;
      }

      if (selectedVersion !== 'all' && !location.versions.includes(selectedVersion)) {
        return false;
      }

      return true;
    });
  }, [data, selectedRegion, selectedVersion]);

  const focusedRegionKey = useMemo(() => {
    if (selectedRegion !== 'all') {
      return selectedRegion;
    }

    const counts = new Map<string, number>();
    filteredLocations.forEach((location) => {
      counts.set(location.regionKey, (counts.get(location.regionKey) ?? 0) + 1);
    });

    const ranked = Array.from(counts.entries()).sort((left, right) => {
      if (right[1] !== left[1]) {
        return right[1] - left[1];
      }

      return orderRegionKeys(left[0], right[0]);
    });

    return ranked[0]?.[0] ?? data?.regions[0]?.key ?? 'unknown';
  }, [data, filteredLocations, selectedRegion]);

  const focusedRegionLocations = useMemo(
    () =>
      filteredLocations
        .filter((location) => location.regionKey === focusedRegionKey)
        .slice(0, 12),
    [filteredLocations, focusedRegionKey],
  );

  const focusedRegionLabel =
    focusedRegionLocations[0]?.regionLabel ??
    data?.regions.find((region) => region.key === focusedRegionKey)?.label ??
    getRegionVisual(focusedRegionKey).label;

  const heroSummary = useMemo(() => {
    if (!data) {
      return [
        `Pokemon #${selectedPokemon.id}`,
        selectedPokemon.generationLabelFr,
        selectedPokemon.regionLabelsFr[0] ?? 'Aucune region',
      ];
    }

    return [
      `${data.locations.length} lieux repertories`,
      data.regions.length > 0
        ? `${data.regions.length} region${data.regions.length > 1 ? 's' : ''}`
        : 'Aucune region',
      data.versions.length > 0
        ? `${data.versions.length} version${data.versions.length > 1 ? 's' : ''}`
        : 'Aucune version',
    ];
  }, [data, selectedPokemon]);

  const handleSelectPokemon = (slug: string) => {
    startTransition(() => {
      setSelectedPokemonSlug(slug);
      setSelectedRegion('all');
      setSelectedVersion('all');
      setSearchValue('');
    });

    router.replace(mapRoute(slug));
  };

  const handleSelectRegion = (regionKey: string) => {
    startTransition(() => {
      setSelectedRegion(regionKey);
      setSelectedVersion('all');
    });

    router.replace(mapRoute(selectedPokemon.slug, regionKey === 'all' ? undefined : regionKey));
  };

  const handleSelectVersion = (version: string) => {
    startTransition(() => {
      setSelectedVersion(version);
    });
  };

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'left', 'right']}>
      <AtlasBackdrop />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Pressable
            onPress={() => router.replace(appRoutes.dashboard)}
            style={styles.headerButton}
          >
            <Feather name="menu" size={24} color="#ffffff" />
          </Pressable>

          <AccountAvatarButton
            onPress={() => router.push(appRoutes.profile)}
            size={40}
            textSize={16}
          />
        </View>

        <View>
          <Text style={styles.title}>Atlas des rencontres</Text>
          <Text style={styles.subtitle}>
            Choisis un Pokemon et affiche les regions, versions et lieux ou il peut etre rencontre
            dans les jeux Pokemon console quand PokéAPI les connait.
          </Text>
        </View>

        <LinearGradient colors={gradientColors} style={styles.heroCard}>
          <View style={styles.heroGlow} />

          <View style={styles.heroRow}>
            <View style={styles.heroImageShell}>
              <Image source={{ uri: selectedPokemon.image }} style={styles.heroImage} />
            </View>

            <View style={styles.heroCopy}>
              <Text style={styles.heroEyebrow}>Pokemon suivi</Text>
              <Text style={styles.heroName}>{selectedPokemon.nameFr}</Text>
              <Text style={styles.heroMeta}>
                #{String(selectedPokemon.id).padStart(4, '0')} • {selectedPokemon.generationLabelFr}
              </Text>
              <Text style={styles.heroMeta}>{selectedPokemon.regionLabelsFr.join(' • ')}</Text>
            </View>
          </View>

          <View style={styles.heroSummaryRow}>
            {heroSummary.map((item) => (
              <View key={item} style={styles.summaryPill}>
                <Text style={styles.summaryPillText}>{item}</Text>
              </View>
            ))}
          </View>

          <Pressable
            onPress={() => router.push(detailRoute(selectedPokemon.slug))}
            style={styles.heroCta}
          >
            <Text style={styles.heroCtaText}>Voir la fiche complete</Text>
          </Pressable>
        </LinearGradient>

        <View style={styles.sectionBlock}>
          <Text style={styles.sectionTitle}>Choisir un Pokemon</Text>

          <View style={styles.searchShell}>
            <Feather name="search" size={22} color="#8d8d8d" />
            <TextInput
              value={searchValue}
              onChangeText={setSearchValue}
              placeholder="Rechercher un Pokemon"
              placeholderTextColor="#777777"
              style={styles.searchInput}
              autoCapitalize="none"
              autoCorrect={false}
            />
            {searchValue ? (
              <Pressable onPress={() => setSearchValue('')}>
                <Ionicons name="close-circle" size={20} color="#9e9e9e" />
              </Pressable>
            ) : null}
          </View>

          {suggestions.length > 0 ? (
            <View style={styles.suggestionWrap}>
              {suggestions.map((pokemon) => (
                <SuggestionCard
                  key={pokemon.slug}
                  isSelected={pokemon.slug === selectedPokemon.slug}
                  meta={pokemon.generationLabelFr}
                  name={pokemon.nameFr}
                  onPress={() => handleSelectPokemon(pokemon.slug)}
                  image={pokemon.image}
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

        <SectionBlock title="Regions">
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.chipRow}
          >
            <FilterChip
              active={selectedRegion === 'all'}
              label="Toutes"
              onPress={() => handleSelectRegion('all')}
            />
            {regionOptions.map((region) => (
              <FilterChip
                key={region.key}
                active={selectedRegion === region.key}
                label={`${region.label} (${region.count})`}
                onPress={() => handleSelectRegion(region.key)}
              />
            ))}
          </ScrollView>
        </SectionBlock>

        {data?.versions.length ? (
          <SectionBlock title="Versions">
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.chipRow}
            >
              <FilterChip
                active={selectedVersion === 'all'}
                label="Toutes"
                onPress={() => handleSelectVersion('all')}
              />
              {data.versions.map((version) => (
                <FilterChip
                  key={version}
                  active={selectedVersion === version}
                  label={version}
                  onPress={() => handleSelectVersion(version)}
                />
              ))}
            </ScrollView>
          </SectionBlock>
        ) : null}

        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>Comment lire cette carte</Text>
          <Text style={styles.infoText}>
            Les lieux, versions et methodes viennent de PokéAPI. Les cartes visuelles viennent de
            Bulbapedia / Bulbagarden Archives et sont integrees localement dans le projet pour te
            donner un vrai rendu de region a la place du fond abstrait.
          </Text>
        </View>

        {isLoading && !data ? (
          <LoadingState />
        ) : error && !data ? (
          <ErrorState error={error} onRetry={reload} />
        ) : data ? (
          <>
            {data.encounterable ? (
              <>
                {filteredLocations.length > 0 ? (
                  <>
                    <MapRegionCard
                      atlas={data}
                      focusedRegionKey={focusedRegionKey}
                      focusedRegionLabel={focusedRegionLabel}
                      locations={focusedRegionLocations}
                      selectedRegion={selectedRegion}
                    />

                    <SectionBlock title={`Lieux confirmes (${filteredLocations.length})`}>
                      <View style={styles.locationList}>
                        {filteredLocations.map((location) => (
                          <LocationCard key={location.key} location={location} />
                        ))}
                      </View>
                    </SectionBlock>
                  </>
                ) : (
                  <View style={styles.emptyCard}>
                    <Text style={styles.emptyTitle}>Aucun spot sur ce filtre</Text>
                    <Text style={styles.emptyText}>
                      Aucun lieu ne correspond a la combinaison region/version actuelle. Retire un
                      filtre ou change de version pour retrouver des rencontres.
                    </Text>
                  </View>
                )}
              </>
            ) : (
              <View style={styles.emptyCard}>
                <Text style={styles.emptyTitle}>Aucun lieu renseigne</Text>
                <Text style={styles.emptyText}>
                  PokéAPI ne reference pas encore de lieu de rencontre console pour ce Pokemon.
                  Essaie avec Pikachu, Magicarpe, Roucool ou Nosferapti pour voir l&apos;atlas en
                  action.
                </Text>
              </View>
            )}
          </>
        ) : null}
      </ScrollView>

      <BottomDock
        activeTab="map"
        onMapPress={() => router.replace(mapRoute(selectedPokemon.slug, selectedRegion === 'all' ? undefined : selectedRegion))}
        onHomePress={() => router.replace(appRoutes.dashboard)}
        onDiscoverPress={() => router.replace(appRoutes.discover)}
      />
    </SafeAreaView>
  );
}

function SectionBlock({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <View style={styles.sectionBlock}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {children}
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
    <Pressable onPress={onPress} style={[styles.filterChip, active && styles.filterChipActive]}>
      <Text style={[styles.filterChipText, active && styles.filterChipTextActive]}>{label}</Text>
    </Pressable>
  );
}

function SuggestionCard({
  image,
  isSelected,
  meta,
  name,
  onPress,
}: {
  image: string;
  isSelected: boolean;
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

      {isSelected ? (
        <View style={styles.selectedPill}>
          <Text style={styles.selectedPillText}>Actif</Text>
        </View>
      ) : (
        <Ionicons name="arrow-forward-circle-outline" size={22} color="#ffffff" />
      )}
    </Pressable>
  );
}

function MapRegionCard({
  atlas,
  focusedRegionKey,
  focusedRegionLabel,
  locations,
  selectedRegion,
}: {
  atlas: PokemonAtlasData;
  focusedRegionKey: string;
  focusedRegionLabel: string;
  locations: PokemonAtlasLocation[];
  selectedRegion: string;
}) {
  const visual = getRegionVisual(focusedRegionKey);
  const mapAsset = getRegionMapAsset(focusedRegionKey);
  const markers = getMarkerPositions(focusedRegionKey, locations.length);
  const highlightedMethods = uniqueStrings(locations.flatMap((location) => location.methods)).slice(
    0,
    6,
  );
  const highlightedVersions = uniqueStrings(
    locations.flatMap((location) => location.versions),
  ).slice(0, 6);

  return (
    <LinearGradient colors={visual.colors} style={styles.mapCard}>
      <View style={styles.mapHeader}>
        <View style={{ flex: 1 }}>
          <Text style={styles.mapTitle}>{focusedRegionLabel}</Text>
          <Text style={styles.mapSubtitle}>
            {selectedRegion === 'all'
              ? "Vue principale de la region la plus presente pour ce filtre."
              : 'Points de rencontre regroupes sur la region selectionnee.'}
          </Text>
        </View>

        <View style={styles.mapCountBadge}>
          <Text style={styles.mapCountValue}>{locations.length}</Text>
          <Text style={styles.mapCountLabel}>spots</Text>
        </View>
      </View>

      <View style={styles.mapSurface}>
        {mapAsset ? (
          <>
            <Image source={mapAsset.image} style={styles.mapImage} resizeMode="contain" />
            <View style={styles.mapImageDimmer} />
          </>
        ) : (
          <>
            <View style={[styles.mapBlobLarge, { backgroundColor: visual.glow }]} />
            <View style={[styles.mapBlobMedium, { backgroundColor: 'rgba(255,255,255,0.14)' }]} />
            <View style={[styles.mapBlobSmall, { backgroundColor: 'rgba(255,255,255,0.12)' }]} />
          </>
        )}
        <View style={[styles.mapGrid, { left: '24%' }]} />
        <View style={[styles.mapGrid, { left: '49%' }]} />
        <View style={[styles.mapGrid, { left: '74%' }]} />

        {locations.map((location, index) => (
          <View
            key={location.key}
            style={[
              styles.mapMarker,
              {
                top: markers[index]?.top ?? '50%',
                left: markers[index]?.left ?? '50%',
              },
            ]}
          >
            <View style={[styles.mapMarkerDot, { backgroundColor: visual.accent }]} />
            <Text style={styles.mapMarkerLabel}>{shortLabel(location.locationName)}</Text>
          </View>
        ))}
      </View>

      <View style={styles.mapFooter}>
        {mapAsset ? (
          <View style={styles.mapSourceRow}>
            <Text style={styles.mapSourceText}>
              {mapAsset.variantLabel} • Source visuelle: {mapAsset.sourceLabel}
            </Text>
            <Pressable onPress={() => Linking.openURL(mapAsset.sourceUrl)}>
              <Text style={styles.mapSourceLink}>Voir la source</Text>
            </Pressable>
          </View>
        ) : null}
        {highlightedMethods.length ? (
          <PillGroup title="Methodes" values={highlightedMethods} />
        ) : null}
        {highlightedVersions.length ? (
          <PillGroup title="Versions visibles" values={highlightedVersions} />
        ) : null}
        {atlas.regions.length > 1 ? (
          <PillGroup
            title="Autres regions detectees"
            values={atlas.regions
              .filter((region) => region.key !== focusedRegionKey)
              .sort((left, right) => orderRegionKeys(left.key, right.key))
              .map((region) => `${region.label} (${region.count})`)
              .slice(0, 6)}
          />
        ) : null}
      </View>
    </LinearGradient>
  );
}

function PillGroup({
  title,
  values,
}: {
  title: string;
  values: string[];
}) {
  if (!values.length) {
    return null;
  }

  return (
    <View>
      <Text style={styles.mapLegendTitle}>{title}</Text>
      <View style={styles.pillWrap}>
        {values.map((value) => (
          <View key={`${title}-${value}`} style={styles.detailPill}>
            <Text style={styles.detailPillText}>{value}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

function LocationCard({ location }: { location: PokemonAtlasLocation }) {
  const subtitle =
    location.areaName !== location.locationName
      ? `${location.areaName} • ${location.regionLabel}`
      : location.regionLabel;

  return (
    <View style={styles.locationCard}>
      <View style={styles.locationHeader}>
        <View style={styles.locationCopy}>
          <Text style={styles.locationTitle}>{location.locationName}</Text>
          <Text style={styles.locationSubtitle}>{subtitle}</Text>
        </View>

        <View style={styles.chanceBadge}>
          <Text style={styles.chanceValue}>{location.chance}%</Text>
          <Text style={styles.chanceLabel}>chance max</Text>
        </View>
      </View>

      <Text style={styles.levelsText}>{formatLevelLabel(location)}</Text>
      <PillGroup title="Methodes" values={location.methods} />
      <PillGroup title="Versions" values={location.versions} />
    </View>
  );
}

function LoadingState() {
  return (
    <View style={styles.loadingWrap}>
      <ActivityIndicator size="large" color="#ffffff" />
      <Text style={styles.loadingText}>Chargement de l&apos;atlas</Text>
      <Text style={styles.loadingSubtext}>
        On assemble les lieux, les versions, les methodes et les regions depuis PokéAPI.
      </Text>
    </View>
  );
}

function ErrorState({
  error,
  onRetry,
}: {
  error: string;
  onRetry: () => void;
}) {
  return (
    <View style={styles.errorCard}>
      <Text style={styles.errorTitle}>Atlas indisponible</Text>
      <Text style={styles.errorText}>{error}</Text>
      <Pressable onPress={onRetry} style={styles.retryButton}>
        <Text style={styles.retryButtonText}>Reessayer</Text>
      </Pressable>
    </View>
  );
}

function AtlasBackdrop() {
  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      <LinearGradient
        colors={['#090909', '#171717', '#0b0b0b']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      <View style={styles.backdropGlowA} />
      <View style={styles.backdropGlowB} />
      {atlasGridColumns.map((left) => (
        <View key={left} style={[styles.backdropGrid, { left }]} />
      ))}
    </View>
  );
}

function resolvePokemonSlug(param: string | string[] | undefined) {
  const candidate = Array.isArray(param) ? param[0] : param;
  if (!candidate) {
    return defaultAtlasPokemonSlug;
  }

  return pokemonCatalog.find((pokemon) => pokemon.slug === candidate)?.slug ?? defaultAtlasPokemonSlug;
}

function resolveRegionKey(param: string | string[] | undefined) {
  const candidate = Array.isArray(param) ? param[0] : param;
  if (!candidate) {
    return 'all';
  }

  return atlasRegionOrder.includes(candidate as (typeof atlasRegionOrder)[number]) ? candidate : 'all';
}

function shortLabel(value: string) {
  const words = value.split(' ');
  if (words.length <= 2) {
    return value;
  }

  return `${words[0]} ${words[1]}`;
}

function formatLevelLabel(location: PokemonAtlasLocation) {
  if (location.minLevel === null && location.maxLevel === null) {
    return 'Niveaux non renseignes';
  }

  if (location.minLevel === location.maxLevel) {
    return `Niveau ${location.minLevel}`;
  }

  if (location.minLevel === null) {
    return `Jusqu'au niveau ${location.maxLevel}`;
  }

  if (location.maxLevel === null) {
    return `A partir du niveau ${location.minLevel}`;
  }

  return `Niveaux ${location.minLevel} a ${location.maxLevel}`;
}

function uniqueStrings(values: string[]) {
  return Array.from(new Set(values.filter(Boolean)));
}
