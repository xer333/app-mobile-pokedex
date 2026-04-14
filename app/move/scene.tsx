import { Feather } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { fetchMoveDetail, type MoveDetailData } from '../_shared/pokeapi';
import { styles } from './styles';

export function MoveScene() {
  const router = useRouter();
  const params = useLocalSearchParams<{ slug?: string }>();
  const slug = typeof params.slug === 'string' ? params.slug : '';
  const [data, setData] = useState<MoveDetailData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    setIsLoading(true);
    setError(null);

    fetchMoveDetail(slug)
      .then((response) => {
        if (cancelled) {
          return;
        }

        setData(response);
        setIsLoading(false);
      })
      .catch((currentError) => {
        if (cancelled) {
          return;
        }

        setError(
          currentError instanceof Error
            ? currentError.message
            : "Impossible de charger l'attaque.",
        );
        setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [slug]);

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'left', 'right']}>
      {isLoading || !data ? (
        <View style={styles.loadingWrap}>
          {isLoading ? <ActivityIndicator size="large" color="#ffffff" /> : null}
          <Text style={styles.loadingText}>
            {isLoading ? "Chargement de l'attaque" : 'Attaque introuvable'}
          </Text>
          {error ? <Text style={styles.errorText}>{error}</Text> : null}
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <Pressable onPress={() => router.back()} style={styles.iconButton}>
              <Feather name="arrow-left" size={22} color="#ffffff" />
            </Pressable>
            <Text numberOfLines={1} style={styles.title}>
              {data.name}
            </Text>
            <View style={styles.iconButton} />
          </View>

          <View style={styles.heroCard}>
            <View style={styles.heroMetaRow}>
              <Pill label={data.type} />
              <Pill label={data.category} />
              <Pill label={data.generation} />
            </View>

            <Text style={styles.effectText}>{data.shortEffect}</Text>
          </View>

          <View style={styles.statGrid}>
            <StatCell label="Puissance" value={data.power} />
            <StatCell label="Précision" value={data.accuracy} />
            <StatCell label="PP" value={data.pp} />
            <StatCell label="Priorité" value={String(data.priority)} />
          </View>

          <View style={styles.effectCard}>
            <Text style={styles.sectionTitle}>Effet complet</Text>
            <Text style={styles.effectText}>{data.effect}</Text>
          </View>

          <View style={styles.effectCard}>
            <Text style={styles.sectionTitle}>Cible</Text>
            <Text style={styles.effectText}>{data.target}</Text>
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

function Pill({ label }: { label: string }) {
  return (
    <View style={styles.pill}>
      <Text style={styles.pillText}>{label}</Text>
    </View>
  );
}

function StatCell({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.statCell}>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={styles.statValue}>{value}</Text>
    </View>
  );
}
