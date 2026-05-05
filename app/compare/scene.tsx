import { Feather } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  ActivityIndicator,
  FlatList,
  Image,
  Pressable,
  RefreshControl,
  Text,
  View,
} from 'react-native';
import Animated, { FadeInUp, LinearTransition } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import type { PokemonDamageBucket, PokemonDetailData } from '../_shared/pokeapi';
import { SkeletonBlock, SkeletonCard } from '../_shared/skeleton';
import { usePokemonDetail } from '../detail/usePokemonDetail';
import { styles } from './styles';
import { useEffect, useState } from 'react';

export function CompareScene() {
  const router = useRouter();
  const params = useLocalSearchParams<{ left?: string; right?: string }>();
  const leftSlug = typeof params.left === 'string' ? params.left : 'pikachu';
  const rightSlug = typeof params.right === 'string' ? params.right : 'bulbasaur';
  const left = usePokemonDetail(leftSlug);
  const right = usePokemonDetail(rightSlug);
  const [refreshing, setRefreshing] = useState(false);

  const isLoading = left.isLoading || right.isLoading;
  const error = left.error || right.error;
  const stats = left.data?.stats ?? [];

  useEffect(() => {
    if (!isLoading && refreshing) {
      setRefreshing(false);
    }
  }, [isLoading, refreshing]);

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'left', 'right']}>
      <FlatList
        data={stats}
        keyExtractor={(item) => item.label}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              left.reload();
              right.reload();
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
              <Pressable onPress={() => router.back()} style={styles.iconButton}>
                <Feather name="arrow-left" size={22} color="#ffffff" />
              </Pressable>
              <Text style={styles.title}>Comparateur</Text>
              <View style={styles.iconButton} />
            </View>

            {left.data && right.data ? (
              <View style={styles.compareRow}>
                <PokemonSummaryCard pokemon={left.data} />
                <PokemonSummaryCard pokemon={right.data} />
              </View>
            ) : null}

            {left.data && right.data ? (
              <View style={styles.sectionCard}>
                <Text style={styles.sectionTitle}>Stats cote a cote</Text>
              </View>
            ) : null}
          </View>
        }
        renderItem={({ item, index }) =>
          left.data && right.data ? (
            <Animated.View
              entering={FadeInUp.delay(index * 18).duration(220)}
              layout={LinearTransition.springify().damping(20).stiffness(170)}
              style={styles.sectionCard}
            >
              <StatComparisonRow
                label={item.label}
                leftValue={item.value}
                rightValue={right.data?.stats[index]?.value ?? 0}
              />
            </Animated.View>
          ) : null
        }
        ListEmptyComponent={
          isLoading ? (
            <CompareSkeletonState />
          ) : error ? (
            <View style={styles.loadingWrap}>
              <Text style={styles.loadingText}>Chargement du comparateur</Text>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null
        }
        ListFooterComponent={
          left.data && right.data ? (
            <View style={styles.sectionCard}>
              <Text style={styles.sectionTitle}>Matchups</Text>
              <View style={styles.matchupRow}>
                <MatchupColumn
                  title={left.data.name}
                  weaknesses={left.data.weaknesses}
                  resistances={left.data.resistances}
                />
                <MatchupColumn
                  title={right.data.name}
                  weaknesses={right.data.weaknesses}
                  resistances={right.data.resistances}
                />
              </View>
            </View>
          ) : null
        }
      />
    </SafeAreaView>
  );
}

function PokemonSummaryCard({ pokemon }: { pokemon: PokemonDetailData }) {
  return (
    <View style={styles.compareCard}>
      <Image source={{ uri: pokemon.image }} style={styles.compareImage} />
      <Text style={styles.compareName}>{pokemon.name}</Text>
      <Text style={styles.compareSubtext}>
        {pokemon.generationLabel} · {pokemon.weight}
      </Text>
      <View style={styles.compareTypeRow}>
        {pokemon.types.map((type) => (
          <View key={type} style={styles.typePill}>
            <Text style={styles.typePillText}>{type}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

function StatComparisonRow({
  label,
  leftValue,
  rightValue,
}: {
  label: string;
  leftValue: number;
  rightValue: number;
}) {
  return (
    <View style={styles.statRow}>
      <View style={styles.statHeader}>
        <Text style={styles.statLabel}>{label}</Text>
        <View style={styles.statValueRow}>
          <Text style={styles.statValue}>{leftValue}</Text>
          <Text style={styles.statValue}>{rightValue}</Text>
        </View>
      </View>
      <View style={styles.statTracksRow}>
        <Track value={leftValue} color="#69d0ff" />
        <Track value={rightValue} color="#ff84bd" />
      </View>
    </View>
  );
}

function Track({ value, color }: { value: number; color: string }) {
  const fill = Math.min(100, Math.max(10, Math.round((value / 160) * 100)));

  return (
    <View style={styles.statTrack}>
      <View style={[styles.statFill, { width: `${fill}%`, backgroundColor: color }]} />
    </View>
  );
}

function MatchupColumn({
  title,
  weaknesses,
  resistances,
}: {
  title: string;
  weaknesses: PokemonDamageBucket[];
  resistances: PokemonDamageBucket[];
}) {
  return (
    <View style={styles.matchupColumn}>
      <Text style={styles.matchupTitle}>{title}</Text>

      <View>
        <Text style={styles.matchupTitle}>Faiblesses</Text>
        <View style={styles.matchupWrap}>
          {weaknesses.slice(0, 6).map((entry) => (
            <MatchupPill key={`${title}-weak-${entry.type}`} label={`${entry.type} x${entry.multiplier}`} />
          ))}
        </View>
      </View>

      <View>
        <Text style={styles.matchupTitle}>Resistances</Text>
        <View style={styles.matchupWrap}>
          {resistances.slice(0, 6).map((entry) => (
            <MatchupPill
              key={`${title}-resist-${entry.type}`}
              label={`${entry.type} x${entry.multiplier}`}
            />
          ))}
        </View>
      </View>
    </View>
  );
}

function MatchupPill({ label }: { label: string }) {
  return (
    <View style={styles.matchupPill}>
      <Text style={styles.matchupText}>{label}</Text>
    </View>
  );
}

function CompareSkeletonState() {
  return (
    <View style={{ gap: 18 }}>
      <View style={styles.compareRow}>
        {Array.from({ length: 2 }).map((_, index) => (
          <SkeletonCard key={`compare-hero-${index}`} style={styles.compareCard}>
            <SkeletonBlock style={{ width: 120, height: 120, borderRadius: 60 }} />
            <SkeletonBlock style={{ width: '64%', height: 20, borderRadius: 8 }} />
            <SkeletonBlock style={{ width: '48%', height: 14, borderRadius: 7 }} />
          </SkeletonCard>
        ))}
      </View>

      <SkeletonCard style={styles.sectionCard}>
        {Array.from({ length: 4 }).map((_, index) => (
          <View key={`compare-row-${index}`} style={styles.statRow}>
            <View style={styles.statHeader}>
              <SkeletonBlock style={{ width: 86, height: 16, borderRadius: 8 }} />
              <View style={styles.statValueRow}>
                <SkeletonBlock style={{ width: 44, height: 16, borderRadius: 8 }} />
                <SkeletonBlock style={{ width: 44, height: 16, borderRadius: 8 }} />
              </View>
            </View>
            <View style={styles.statTracksRow}>
              <SkeletonBlock style={{ flex: 1, height: 8, borderRadius: 999 }} />
              <SkeletonBlock style={{ flex: 1, height: 8, borderRadius: 999 }} />
            </View>
          </View>
        ))}
      </SkeletonCard>
    </View>
  );
}
