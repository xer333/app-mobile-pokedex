import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useMemo, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { pokemonCatalog, pokemonCatalogCount } from '../_shared/catalog';
import { appRoutes, detailRoute } from '../_shared/routes';
import { BottomDock, DiscoverPokemonTile } from '../_shared/ui';
import { styles } from './styles';

const frenchNumber = new Intl.NumberFormat('fr-FR');

export function DiscoverScene() {
  const router = useRouter();
  const [searchValue, setSearchValue] = useState('');

  const pokemon = useMemo(() => {
    const normalized = searchValue.trim().toLowerCase();
    if (!normalized) {
      return pokemonCatalog;
    }

    return pokemonCatalog.filter(
      (entry) =>
        entry.nameFr.toLowerCase().includes(normalized) ||
        entry.nameEn.toLowerCase().includes(normalized) ||
        entry.slug.toLowerCase().includes(normalized),
    );
  }, [searchValue]);

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

              <View style={styles.avatarCircle}>
                <Text style={styles.avatarText}>S</Text>
              </View>
            </View>

            <Text style={styles.title}>Que recherches-tu ?</Text>
            <Text style={styles.subtitle}>
              {frenchNumber.format(pokemonCatalogCount)} Pok\u00e9mon disponibles, tous traduits en
              fran\u00e7ais.
            </Text>

            <View style={styles.searchShell}>
              <Feather name="search" size={22} color="#8d8d8d" />
              <TextInput
                value={searchValue}
                onChangeText={setSearchValue}
                placeholder="Rechercher un Pok\u00e9mon"
                placeholderTextColor="#777777"
                style={styles.searchInput}
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>
          </View>
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>Aucun Pok\u00e9mon trouv\u00e9</Text>
            <Text style={styles.emptyText}>
              Essaie un nom comme Pikachu, Rondoudou ou Bulbizarre.
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
        onHomePress={() => router.replace(appRoutes.dashboard)}
        onDiscoverPress={() => router.replace(appRoutes.discover)}
      />
    </SafeAreaView>
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
