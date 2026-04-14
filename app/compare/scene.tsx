import { Feather } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  ActivityIndicator,
  Image,
  Pressable,
  ScrollView,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import type { PokemonDamageBucket, PokemonDetailData } from '../_shared/pokeapi';
import { styles } from './styles';
import { usePokemonDetail } from '../detail/usePokemonDetail';

export function CompareScene() {
  const router = useRouter();
  const params = useLocalSearchParams<{ left?: string; right?: string }>();
  const leftSlug = typeof params.left === 'string' ? params.left : 'pikachu';
  const rightSlug = typeof params.right === 'string' ? params.right : 'bulbasaur';
  const left = usePokemonDetail(leftSlug);
  const right = usePokemonDetail(rightSlug);

  const isLoading = left.isLoading || right.isLoading;
  const error = left.error || right.error;

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'left', 'right']}>
      {isLoading || !left.data || !right.data ? (
        <View style={styles.loadingWrap}>
          {isLoading ? <ActivityIndicator size="large" color="#ffffff" /> : null}
          <Text style={styles.loadingText}>Chargement du comparateur</Text>
          {error ? <Text style={styles.errorText}>{error}</Text> : null}
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <Pressable onPress={() => router.back()} style={styles.iconButton}>
              <Feather name="arrow-left" size={22} color="#ffffff" />
            </Pressable>
            <Text style={styles.title}>Comparateur</Text>
            <View style={styles.iconButton} />
          </View>

          <View style={styles.compareRow}>
            <PokemonSummaryCard pokemon={left.data} />
            <PokemonSummaryCard pokemon={right.data} />
          </View>

          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Stats côte à côte</Text>
            {left.data.stats.map((stat, index) => (
              <StatComparisonRow
                key={stat.label}
                label={stat.label}
                leftValue={stat.value}
                rightValue={right.data?.stats[index]?.value ?? 0}
              />
            ))}
          </View>

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
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

function PokemonSummaryCard({ pokemon }: { pokemon: PokemonDetailData }) {
  return (
    <View style={styles.compareCard}>
      <Image source={{ uri: pokemon.image }} style={styles.compareImage} />
      <Text style={styles.compareName}>{pokemon.name}</Text>
      <Text style={styles.compareSubtext}>
        {pokemon.generationLabel} • {pokemon.weight}
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
        <Text style={styles.matchupTitle}>Résistances</Text>
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
