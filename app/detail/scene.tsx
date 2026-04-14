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
import type { PokemonDetailData } from '../_shared/pokeapi';
import { appRoutes, detailRoute } from '../_shared/routes';
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
  const { data, isLoading, error, reload } = usePokemonDetail(catalogPokemon.slug);
  const gradientColors = useMemo(
    () => getDetailColors(catalogPokemon.color),
    [catalogPokemon.color],
  );

  useEffect(() => {
    setActiveTab('stats');
  }, [catalogPokemon.slug]);

  const pokemon = data ?? {
    slug: catalogPokemon.slug,
    id: catalogPokemon.id,
    name: catalogPokemon.nameFr,
    image: catalogPokemon.image,
    description: catalogPokemon.flavorFr,
    genus: catalogPokemon.genusFr,
    habitat: catalogPokemon.habitat ?? 'Inconnu',
    size: '\u2014',
    weight: '\u2014',
    baseExperience: 0,
    types: [],
    abilities: [],
    stats: [],
    moves: [],
    evolutions: [],
  };

  return (
    <LinearGradient colors={gradientColors} style={styles.screen}>
      <SafeAreaView style={styles.screen} edges={['top', 'left', 'right']}>
        <DetailBackdrop />

        <View style={styles.header}>
          <Pressable onPress={() => router.replace(appRoutes.discover)} style={styles.iconButton}>
            <Feather name="arrow-left" size={22} color="#ffffff" />
          </Pressable>
          <Text style={styles.title}>{pokemon.name}</Text>
          <Pressable style={styles.iconButton}>
            <Ionicons name="heart-outline" size={24} color="#ffffff" />
          </Pressable>
        </View>

        {error && !data ? (
          <View style={styles.errorCard}>
            <Text style={styles.errorTitle}>Chargement impossible</Text>
            <Text style={styles.errorText}>
              {error}
            </Text>
            <Pressable
              onPress={reload}
              style={styles.retryButton}
            >
              <Text style={styles.retryButtonText}>R\u00e9essayer</Text>
            </Pressable>
          </View>
        ) : (
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
            <View style={styles.heroArea}>
              <View style={styles.heroGlow} />
              <Image source={{ uri: pokemon.image }} style={styles.heroImage} />

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

              <View style={styles.tabsRow}>
                {detailTabs.map((tab) => (
                  <Pressable
                    key={tab.id}
                    onPress={() => setActiveTab(tab.id)}
                    style={styles.tabButton}
                  >
                    <Text
                      style={[
                        styles.tabText,
                        activeTab === tab.id && styles.activeTabText,
                      ]}
                    >
                      {tab.label}
                    </Text>
                    {activeTab === tab.id ? <View style={styles.activeTabDot} /> : null}
                  </Pressable>
                ))}
              </View>

              {isLoading && !data ? (
                <View style={styles.loadingWrap}>
                  <ActivityIndicator size="large" color="#ffffff" />
                  <Text style={styles.loadingText}>Chargement des donn\u00e9es Pok\u00e9API</Text>
                  <Text style={styles.loadingSubtext}>
                    On r\u00e9cup\u00e8re les stats, attaques, types et \u00e9volutions en direct.
                  </Text>
                </View>
              ) : (
                <DetailTabContent
                  activeTab={activeTab}
                  onOpenEvolution={(slug) => router.replace(detailRoute(slug))}
                  pokemon={pokemon}
                />
              )}
            </View>
          </ScrollView>
        )}

        <BottomDock
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
  pokemon,
}: {
  activeTab: DetailTabId;
  onOpenEvolution: (slug: string) => void;
  pokemon: PokemonDetailData;
}) {
  switch (activeTab) {
    case 'about':
      return <AboutSection pokemon={pokemon} />;
    case 'moves':
      return <MovesSection pokemon={pokemon} />;
    case 'evolutions':
      return <EvolutionsSection pokemon={pokemon} onOpenEvolution={onOpenEvolution} />;
    case 'stats':
    default:
      return <StatsSection pokemon={pokemon} />;
  }
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
