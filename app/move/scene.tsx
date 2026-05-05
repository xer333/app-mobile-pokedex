import { Feather } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import {
  FlatList,
  Pressable,
  RefreshControl,
  Text,
  View,
} from 'react-native';
import Animated, { FadeInUp, LinearTransition } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { fetchMoveDetail, type MoveDetailData } from '../_shared/pokeapi';
import { SkeletonBlock, SkeletonCard } from '../_shared/skeleton';
import { styles } from './styles';

type MoveStatItem = {
  key: string;
  label: string;
  value: string;
};

export function MoveScene() {
  const router = useRouter();
  const params = useLocalSearchParams<{ slug?: string }>();
  const slug = typeof params.slug === 'string' ? params.slug : '';
  const [data, setData] = useState<MoveDetailData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [reloadToken, setReloadToken] = useState(0);

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
  }, [reloadToken, slug]);

  useEffect(() => {
    if (!isLoading && refreshing) {
      setRefreshing(false);
    }
  }, [isLoading, refreshing]);

  const statItems = useMemo<MoveStatItem[]>(
    () =>
      data
        ? [
            { key: 'power', label: 'Puissance', value: data.power },
            { key: 'accuracy', label: 'Precision', value: data.accuracy },
            { key: 'pp', label: 'PP', value: data.pp },
            { key: 'priority', label: 'Priorite', value: String(data.priority) },
          ]
        : [],
    [data],
  );

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'left', 'right']}>
      <FlatList
        data={statItems}
        keyExtractor={(item) => item.key}
        numColumns={2}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
        columnWrapperStyle={statItems.length > 1 ? { justifyContent: 'space-between' } : undefined}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              setReloadToken((current) => current + 1);
            }}
            tintColor="#ffffff"
            progressBackgroundColor="#1f1f1f"
          />
        }
        initialNumToRender={4}
        maxToRenderPerBatch={6}
        windowSize={4}
        ListHeaderComponent={
          <View>
            <View style={styles.header}>
              <Pressable onPress={() => router.back()} style={styles.iconButton}>
                <Feather name="arrow-left" size={22} color="#ffffff" />
              </Pressable>
              <Text numberOfLines={1} style={styles.title}>
                {data?.name ?? 'Attaque'}
              </Text>
              <View style={styles.iconButton} />
            </View>

            {data ? (
              <View style={styles.heroCard}>
                <View style={styles.heroMetaRow}>
                  <Pill label={data.type} />
                  <Pill label={data.category} />
                  <Pill label={data.generation} />
                </View>

                <Text style={styles.effectText}>{data.shortEffect}</Text>
              </View>
            ) : null}
          </View>
        }
        renderItem={({ item, index }) => (
          <Animated.View
            entering={FadeInUp.delay(index * 24).duration(220)}
            layout={LinearTransition.springify().damping(20).stiffness(170)}
            style={styles.statCell}
          >
            <StatCell label={item.label} value={item.value} />
          </Animated.View>
        )}
        ListEmptyComponent={
          isLoading || !data ? (
            isLoading ? (
              <MoveSkeletonState />
            ) : (
              <View style={styles.loadingWrap}>
                <Text style={styles.loadingText}>Attaque introuvable</Text>
                {error ? <Text style={styles.errorText}>{error}</Text> : null}
              </View>
            )
          ) : null
        }
        ListFooterComponent={
          data ? (
            <View style={{ gap: 18 }}>
              <View style={styles.effectCard}>
                <Text style={styles.sectionTitle}>Effet complet</Text>
                <Text style={styles.effectText}>{data.effect}</Text>
              </View>

              <View style={styles.effectCard}>
                <Text style={styles.sectionTitle}>Cible</Text>
                <Text style={styles.effectText}>{data.target}</Text>
              </View>
            </View>
          ) : error ? (
            <View style={styles.loadingWrap}>
              <Text style={styles.loadingText}>Attaque introuvable</Text>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null
        }
      />
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
    <View>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={styles.statValue}>{value}</Text>
    </View>
  );
}

function MoveSkeletonState() {
  return (
    <View style={{ gap: 18 }}>
      <SkeletonCard style={styles.heroCard}>
        <View style={styles.heroMetaRow}>
          <SkeletonBlock style={{ width: 84, height: 32, borderRadius: 999 }} />
          <SkeletonBlock style={{ width: 92, height: 32, borderRadius: 999 }} />
          <SkeletonBlock style={{ width: 78, height: 32, borderRadius: 999 }} />
        </View>
        <SkeletonBlock style={{ width: '90%', height: 16, borderRadius: 8 }} />
        <SkeletonBlock style={{ width: '72%', height: 16, borderRadius: 8 }} />
      </SkeletonCard>

      <View style={styles.statGrid}>
        {Array.from({ length: 4 }).map((_, index) => (
          <SkeletonCard key={`move-stat-${index}`} style={styles.statCell}>
            <SkeletonBlock style={{ width: '44%', height: 12, borderRadius: 6 }} />
            <SkeletonBlock style={{ width: '68%', height: 20, borderRadius: 8 }} />
          </SkeletonCard>
        ))}
      </View>
    </View>
  );
}
