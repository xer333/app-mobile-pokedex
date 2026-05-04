import { Feather, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';

import { useCollections } from './collections';
import type { PokemonCatalogItem } from './catalog';
import {
  LiveBattleCard,
  ShortcutCard,
  UpcomingBattleCard,
} from './data';
import { getCardColors, getCatalogPokemonBySlug } from './catalog';

export function ShortcutTile({
  card,
  onPress,
}: {
  card: ShortcutCard;
  onPress: () => void;
}) {
  return (
    <Pressable onPress={onPress} style={styles.shortcutWrapper}>
      <LinearGradient colors={card.colors} style={styles.shortcutTile}>
        <Text style={styles.shortcutLabel}>{card.title}</Text>
        <View style={styles.shortcutGraphic}>{renderShortcutIcon(card.icon)}</View>
      </LinearGradient>
    </Pressable>
  );
}

export function BattleTile({
  card,
  onPress,
}: {
  card: LiveBattleCard;
  onPress: () => void;
}) {
  return (
    <Pressable onPress={onPress} style={styles.liveBattleCard}>
      <LinearGradient colors={card.colors} style={styles.liveBattleVisual}>
        {card.featured.map((slug, index) => {
          const pokemon = getCatalogPokemonBySlug(slug);
          return (
            <Image
              key={`${card.title}-${slug}`}
              source={{ uri: pokemon.image }}
              style={[
                styles.liveBattleImage,
                index === 0 ? styles.liveBattleImagePrimary : styles.liveBattleImageSecondary,
              ]}
            />
          );
        })}
      </LinearGradient>

      <View style={styles.liveBattleFooter}>
        <AudienceRow />
        <Text style={styles.liveBattleMeta}>{card.viewing}</Text>
        <View style={styles.playButton}>
          <Ionicons name="play" size={18} color="#111111" />
        </View>
      </View>
    </Pressable>
  );
}

export function UpcomingTile({
  card,
  onPress,
}: {
  card: UpcomingBattleCard;
  onPress: () => void;
}) {
  return (
    <Pressable onPress={onPress} style={styles.upcomingCard}>
      <LinearGradient colors={card.colors} style={styles.upcomingGradient}>
        {card.featured.map((slug, index) => {
          const pokemon = getCatalogPokemonBySlug(slug);
          return (
            <Image
              key={`${card.title}-${slug}`}
              source={{ uri: pokemon.image }}
              style={[
                styles.upcomingImage,
                index === 0 ? styles.upcomingImagePrimary : styles.upcomingImageSecondary,
              ]}
            />
          );
        })}
      </LinearGradient>
    </Pressable>
  );
}

export function DiscoverPokemonTile({
  pokemon,
  onPress,
}: {
  pokemon: PokemonCatalogItem;
  onPress: () => void;
}) {
  const { isFavorite, isInTeam } = useCollections();
  const favorite = isFavorite(pokemon.slug);
  const inTeam = isInTeam(pokemon.slug);

  return (
    <Pressable onPress={onPress} style={styles.discoverCard}>
      <LinearGradient colors={getCardColors(pokemon.color)} style={styles.discoverCardGradient}>
        <View style={styles.discoverBadgeStack}>
          {favorite ? (
            <View style={styles.discoverStatusBadge}>
              <Ionicons name="heart" size={12} color="#ffffff" />
            </View>
          ) : null}
          {inTeam ? (
            <View style={styles.discoverStatusBadge}>
              <Text style={styles.discoverStatusBadgeText}>6v6</Text>
            </View>
          ) : null}
        </View>

        <Image source={{ uri: pokemon.image }} style={styles.discoverPokemonImage} />

        <View style={styles.discoverCardFooter}>
          <View style={styles.discoverTextWrap}>
            <Text style={styles.discoverCardName}>{pokemon.nameFr}</Text>
            <Text style={styles.discoverCardMeta}>{pokemon.generationLabelFr}</Text>
          </View>

          <View style={styles.discoverArrowButton}>
            <Ionicons name="arrow-forward" size={18} color="#ffffff" />
          </View>
        </View>
      </LinearGradient>
    </Pressable>
  );
}

export function BottomDock({
  activeTab = 'none',
  onMapPress,
  onHomePress,
  onDiscoverPress,
}: {
  activeTab?: 'map' | 'home' | 'discover' | 'none';
  onMapPress: () => void;
  onHomePress: () => void;
  onDiscoverPress: () => void;
}) {
  const isMapActive = activeTab === 'map';
  const isHomeActive = activeTab === 'home';
  const isDiscoverActive = activeTab === 'discover';

  return (
    <View style={styles.dockOuter}>
      <LinearGradient
        colors={['rgba(83, 93, 70, 0.86)', 'rgba(47, 48, 57, 0.94)']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.dock}
      >
        <Pressable onPress={onMapPress} style={styles.dockAction}>
          <Ionicons
            name={isMapActive ? 'map' : 'map-outline'}
            size={24}
            color={isMapActive ? '#ffffff' : '#9f9f9f'}
          />
          <Text style={[styles.dockLabel, isMapActive ? styles.dockLabelActive : styles.dockLabelMuted]}>
            Carte
          </Text>
        </Pressable>

        <View style={styles.dockCenterSpacer} />

        <Pressable onPress={onDiscoverPress} style={styles.dockAction}>
          <Ionicons
            name={isDiscoverActive ? 'search' : 'search-outline'}
            size={24}
            color={isDiscoverActive ? '#ffffff' : '#9f9f9f'}
          />
          <Text
            style={[
              styles.dockLabel,
              isDiscoverActive ? styles.dockLabelActive : styles.dockLabelMuted,
            ]}
          >
            Explorer
          </Text>
        </Pressable>
      </LinearGradient>

      <Pressable onPress={onHomePress} style={styles.centerDockButton}>
        <View style={[styles.centerDockHalo, isHomeActive && styles.centerDockHaloActive]} />
        <Pokeball size={88} />
        <Text
          style={[
            styles.centerDockLabel,
            !isHomeActive && styles.centerDockLabelMuted,
          ]}
        >
          Accueil
        </Text>
      </Pressable>
    </View>
  );
}

function AudienceRow() {
  return (
    <View style={styles.audienceRow}>
      {['A', 'L', 'M'].map((letter, index) => (
        <View
          key={letter}
          style={[styles.audienceAvatar, { marginLeft: index === 0 ? 0 : -8 }]}
        >
          <Text style={styles.audienceAvatarText}>{letter}</Text>
        </View>
      ))}
    </View>
  );
}

function renderShortcutIcon(icon: ShortcutCard['icon']) {
  switch (icon) {
    case 'pokedex':
      return <Pokeball size={64} />;
    case 'moves':
      return <Ionicons name="flame" size={58} color="#fff2c0" />;
    case 'evolution':
      return <MaterialCommunityIcons name="dna" size={58} color="#7de0ff" />;
    case 'locations':
      return <Ionicons name="location" size={56} color="#9fffaf" />;
    default:
      return <Feather name="circle" size={40} color="#ffffff" />;
  }
}

function Pokeball({ size }: { size: number }) {
  const ring = size * 0.12;
  const center = size * 0.22;
  const offset = center / 2;

  return (
    <View
      style={[
        styles.pokeball,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
        },
      ]}
    >
      <View
        style={[
          styles.pokeballTop,
          {
            borderTopLeftRadius: size / 2,
            borderTopRightRadius: size / 2,
          },
        ]}
      />
      <View style={styles.pokeballBottom} />
      <View style={[styles.pokeballBand, { top: size / 2 - ring / 2, height: ring }]} />
      <View
        style={[
          styles.pokeballCenterOuter,
          {
            width: center,
            height: center,
            borderRadius: offset,
            marginLeft: -offset,
            marginTop: -offset,
          },
        ]}
      >
        <View
          style={[
            styles.pokeballCenterInner,
            {
              width: center * 0.45,
              height: center * 0.45,
              borderRadius: center * 0.225,
            },
          ]}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  shortcutWrapper: {
    width: '47.5%',
  },
  shortcutTile: {
    minHeight: 114,
    borderRadius: 24,
    paddingHorizontal: 20,
    paddingVertical: 18,
    justifyContent: 'space-between',
    overflow: 'hidden',
  },
  shortcutLabel: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
  },
  shortcutGraphic: {
    position: 'absolute',
    right: -2,
    top: 4,
    opacity: 0.95,
    transform: [{ scale: 0.95 }],
  },
  liveBattleCard: {
    width: 268,
    borderRadius: 28,
    overflow: 'hidden',
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  liveBattleVisual: {
    height: 128,
    overflow: 'hidden',
    justifyContent: 'center',
  },
  liveBattleImage: {
    position: 'absolute',
    width: 132,
    height: 132,
    resizeMode: 'contain',
  },
  liveBattleImagePrimary: {
    left: 10,
    bottom: -8,
  },
  liveBattleImageSecondary: {
    right: 18,
    bottom: -8,
  },
  liveBattleFooter: {
    minHeight: 62,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    gap: 10,
    backgroundColor: 'rgba(27,27,27,0.84)',
  },
  audienceRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  audienceAvatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#f2d2cf',
    borderWidth: 2,
    borderColor: '#3b3b3b',
    alignItems: 'center',
    justifyContent: 'center',
  },
  audienceAvatarText: {
    color: '#111111',
    fontSize: 10,
    fontWeight: '800',
  },
  liveBattleMeta: {
    color: '#ffffff',
    fontSize: 14,
    flex: 1,
  },
  playButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  upcomingCard: {
    width: 268,
    height: 112,
    borderRadius: 28,
    overflow: 'hidden',
  },
  upcomingGradient: {
    flex: 1,
  },
  upcomingImage: {
    position: 'absolute',
    resizeMode: 'contain',
  },
  upcomingImagePrimary: {
    width: 144,
    height: 144,
    left: 4,
    bottom: -20,
  },
  upcomingImageSecondary: {
    width: 118,
    height: 118,
    right: 4,
    bottom: -12,
  },
  discoverCard: {
    width: '47.5%',
  },
  discoverCardGradient: {
    height: 214,
    borderRadius: 28,
    overflow: 'hidden',
    justifyContent: 'flex-end',
    padding: 16,
  },
  discoverBadgeStack: {
    position: 'absolute',
    top: 12,
    right: 12,
    gap: 8,
    zIndex: 2,
  },
  discoverStatusBadge: {
    minWidth: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 10,
    backgroundColor: 'rgba(12,12,12,0.4)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  discoverStatusBadgeText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: '800',
  },
  discoverPokemonImage: {
    position: 'absolute',
    width: 176,
    height: 176,
    top: 10,
    left: -2,
    resizeMode: 'contain',
  },
  discoverCardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  discoverTextWrap: {
    flex: 1,
    gap: 2,
  },
  discoverCardName: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
  discoverCardMeta: {
    color: 'rgba(255,255,255,0.72)',
    fontSize: 12,
    fontWeight: '600',
  },
  discoverArrowButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 2,
    borderColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dockOuter: {
    position: 'absolute',
    left: 28,
    right: 28,
    bottom: 18,
    alignItems: 'center',
  },
  dock: {
    width: '100%',
    height: 82,
    borderRadius: 34,
    paddingHorizontal: 18,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  dockAction: {
    flex: 1,
    alignItems: 'center',
    gap: 7,
  },
  dockCenterSpacer: {
    width: 108,
  },
  dockLabel: {
    fontSize: 12,
    fontWeight: '700',
  },
  dockLabelActive: {
    color: '#ffffff',
  },
  dockLabelMuted: {
    color: '#a4a4a4',
  },
  centerDockButton: {
    position: 'absolute',
    top: -36,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 112,
  },
  centerDockHalo: {
    position: 'absolute',
    top: 6,
    width: 102,
    height: 102,
    borderRadius: 51,
    backgroundColor: 'rgba(255,255,255,0.04)',
    transform: [{ scale: 0.92 }],
  },
  centerDockHaloActive: {
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  centerDockLabel: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '800',
    marginTop: 4,
  },
  centerDockLabelMuted: {
    color: '#c2c2c2',
  },
  pokeball: {
    overflow: 'hidden',
    backgroundColor: '#f3f3f3',
    borderWidth: 4,
    borderColor: '#111111',
    shadowColor: '#000000',
    shadowOpacity: 0.24,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 8 },
    elevation: 10,
  },
  pokeballTop: {
    flex: 1,
    backgroundColor: '#e93240',
  },
  pokeballBottom: {
    flex: 1,
    backgroundColor: '#f7f7f7',
  },
  pokeballBand: {
    position: 'absolute',
    left: 0,
    right: 0,
    backgroundColor: '#111111',
  },
  pokeballCenterOuter: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    borderWidth: 4,
    borderColor: '#111111',
    backgroundColor: '#f7f7f7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pokeballCenterInner: {
    backgroundColor: '#d7d7d7',
  },
});
