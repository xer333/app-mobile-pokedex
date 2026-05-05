import { Feather, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { useAccount } from './account';
import { formatActivityTime, useActivity } from './activity';
import { getCatalogPokemonBySlug, pokemonCatalog } from './catalog';
import { useCollections } from './collections';
import { appRoutes, detailRoute } from './routes';

type QuickMenuSection = 'home' | 'discover' | 'map' | 'other';

type QuickMenuSheetProps = {
  visible: boolean;
  currentSection?: QuickMenuSection;
  onClose: () => void;
};

type NavItem = {
  key: string;
  label: string;
  subtitle: string;
  route: string;
  icon: keyof typeof Ionicons.glyphMap;
  activeFor?: QuickMenuSection;
  mode?: 'push' | 'replace';
};

const navigationItems: NavItem[] = [
  {
    key: 'dashboard',
    label: 'Accueil',
    subtitle: 'Revenir a la home principale',
    route: appRoutes.dashboard,
    icon: 'home',
    activeFor: 'home',
    mode: 'replace',
  },
  {
    key: 'discover',
    label: 'Explorer',
    subtitle: 'Parcourir le Pokédex complet',
    route: appRoutes.discover,
    icon: 'search',
    activeFor: 'discover',
    mode: 'replace',
  },
  {
    key: 'map',
    label: 'Carte',
    subtitle: 'Atlas des rencontres Pokémon',
    route: appRoutes.map,
    icon: 'map',
    activeFor: 'map',
    mode: 'replace',
  },
  {
    key: 'locations',
    label: 'Lieux',
    subtitle: 'Maps des regions et villes',
    route: appRoutes.locations,
    icon: 'location',
    mode: 'push',
  },
  {
    key: 'moves',
    label: 'Attaques',
    subtitle: 'Explorer les moves en detail',
    route: appRoutes.moves,
    icon: 'flame',
    mode: 'push',
  },
  {
    key: 'evolutions',
    label: 'Evolutions',
    subtitle: 'Voir les familles et conditions',
    route: appRoutes.evolutions,
    icon: 'git-branch',
    mode: 'push',
  },
  {
    key: 'profile',
    label: 'Compte',
    subtitle: 'Modifier ton profil dresseur',
    route: appRoutes.profile,
    icon: 'person-circle',
    mode: 'push',
  },
];

export function QuickMenuSheet({
  visible,
  currentSection = 'other',
  onClose,
}: QuickMenuSheetProps) {
  const router = useRouter();
  const { displayName, initials, profile } = useAccount();
  const { favorites, team } = useCollections();
  const { lastLabel, lastPokemonSlug, lastRoute, recentPokemonSlugs, updatedAt } = useActivity();
  const [mounted, setMounted] = useState(visible);
  const progress = useRef(new Animated.Value(0)).current;
  const navigationTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const recentPokemon = useMemo(
    () => recentPokemonSlugs.slice(0, 4).map((slug) => getCatalogPokemonBySlug(slug)),
    [recentPokemonSlugs],
  );
  const lastPokemon = lastPokemonSlug ? getCatalogPokemonBySlug(lastPokemonSlug) : null;

  useEffect(() => {
    if (visible) {
      setMounted(true);
      Animated.spring(progress, {
        toValue: 1,
        damping: 22,
        stiffness: 220,
        mass: 0.88,
        useNativeDriver: true,
      }).start();
      return;
    }

    Animated.timing(progress, {
      toValue: 0,
      duration: 180,
      easing: Easing.in(Easing.cubic),
      useNativeDriver: true,
    }).start(({ finished }) => {
      if (finished) {
        setMounted(false);
      }
    });
  }, [progress, visible]);

  useEffect(() => {
    return () => {
      if (navigationTimeoutRef.current) {
        clearTimeout(navigationTimeoutRef.current);
      }
    };
  }, []);

  const closeMenu = () => {
    onClose();
  };

  const runAfterClose = (callback: () => void) => {
    closeMenu();

    if (navigationTimeoutRef.current) {
      clearTimeout(navigationTimeoutRef.current);
    }

    navigationTimeoutRef.current = setTimeout(() => {
      callback();
      navigationTimeoutRef.current = null;
    }, 155);
  };

  const navigate = (route: string, mode: 'push' | 'replace' = 'push') => {
    runAfterClose(() => {
      if (mode === 'replace') {
        router.replace(route);
        return;
      }

      router.push(route);
    });
  };

  const launchRandomPokemon = () => {
    const randomIndex = Math.floor(Math.random() * pokemonCatalog.length);
    const pokemon = pokemonCatalog[randomIndex];
    runAfterClose(() => {
      router.push(detailRoute(pokemon.slug));
    });
  };

  if (!mounted) {
    return null;
  }

  const overlayOpacity = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });
  const panelTranslateX = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [-38, 0],
  });
  const panelOpacity = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [0.82, 1],
  });
  const panelScale = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [0.985, 1],
  });

  return (
    <Modal visible={mounted} transparent animationType="none" onRequestClose={closeMenu}>
      <View style={styles.modalRoot}>
        <Animated.View style={[styles.overlay, { opacity: overlayOpacity }]}>
          <Pressable style={StyleSheet.absoluteFill} onPress={closeMenu} />
        </Animated.View>

        <Animated.View
          style={[
            styles.sheet,
            {
              opacity: panelOpacity,
              transform: [{ translateX: panelTranslateX }, { scale: panelScale }],
            },
          ]}
        >
          <View style={styles.sheetGlowPrimary} />
          <View style={styles.sheetGlowSecondary} />

          <View style={styles.header}>
            <View style={styles.headerCopy}>
              <Text style={styles.headerEyebrow}>PokeNav</Text>
              <Text style={styles.headerTitle}>Centre de commande</Text>
            </View>

            <Pressable onPress={closeMenu} style={styles.closeButton}>
              <Feather name="x" size={20} color="#ffffff" />
            </Pressable>
          </View>

          <View style={styles.profileCard}>
            <View style={styles.avatarCircle}>
              <Text style={styles.avatarText}>{initials}</Text>
            </View>

            <View style={styles.profileCopy}>
              <Text style={styles.profileTitle}>{displayName}</Text>
              <Text style={styles.profileSubtitle}>
                @{profile.nickname || displayName.toLowerCase()}
              </Text>
            </View>
          </View>

          <View style={styles.statsRow}>
            <StatChip label={`${favorites.length} favoris`} icon="heart" />
            <StatChip label={`${team.length}/6 equipe`} icon="people" />
            <StatChip label={`${recentPokemonSlugs.length} recents`} icon="time" />
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
            <SectionTitle title="Navigation" />

            <View style={styles.navList}>
              {navigationItems.map((item) => {
                const active = item.activeFor === currentSection;

                return (
                  <Pressable
                    key={item.key}
                    onPress={() => navigate(item.route, item.mode)}
                    style={[styles.navItem, active && styles.navItemActive]}
                  >
                    <View style={[styles.navIconWrap, active && styles.navIconWrapActive]}>
                      <Ionicons
                        name={item.icon}
                        size={18}
                        color={active ? '#111111' : '#ffffff'}
                      />
                    </View>

                    <View style={styles.navCopy}>
                      <Text style={styles.navLabel}>{item.label}</Text>
                      <Text style={styles.navSubtitle}>{item.subtitle}</Text>
                    </View>

                    {active ? (
                      <View style={styles.activePill}>
                        <Text style={styles.activePillText}>Ici</Text>
                      </View>
                    ) : (
                      <Feather name="chevron-right" size={18} color="#8e8e8e" />
                    )}
                  </Pressable>
                );
              })}
            </View>

            <SectionTitle title="Raccourcis intelligents" />

            <View style={styles.actionGrid}>
              <ActionTile
                title={lastRoute ? 'Reprendre' : 'Explorer'}
                subtitle={lastRoute ? lastLabel ?? 'Derniere activite' : 'Ouvrir le Pokédex'}
                icon="play-circle"
                onPress={() => navigate(lastRoute ?? appRoutes.discover)}
              />
              <ActionTile
                title="Surprise-moi"
                subtitle="Ouvrir un Pokémon aléatoire"
                icon="sparkles"
                onPress={launchRandomPokemon}
              />
              {lastPokemon ? (
                <ActionTile
                  title={lastPokemon.nameFr}
                  subtitle={formatActivityTime(updatedAt)}
                  icon="radio-button-on"
                  onPress={() => navigate(detailRoute(lastPokemon.slug))}
                />
              ) : (
                <ActionTile
                  title="Mon compte"
                  subtitle="Modifier le profil"
                  icon="person"
                  onPress={() => navigate(appRoutes.profile)}
                />
              )}
            </View>

            {recentPokemon.length > 0 ? (
              <>
                <SectionTitle title="Derniers Pokémon vus" />
                <View style={styles.recentRow}>
                  {recentPokemon.map((pokemon) => (
                    <Pressable
                      key={`menu-${pokemon.slug}`}
                      onPress={() => navigate(detailRoute(pokemon.slug))}
                      style={styles.recentCard}
                    >
                      <Text style={styles.recentName}>{pokemon.nameFr}</Text>
                      <Text style={styles.recentMeta}>{pokemon.generationLabelFr}</Text>
                    </Pressable>
                  ))}
                </View>
              </>
            ) : null}

            <View style={styles.footerCard}>
              <MaterialCommunityIcons name="pokeball" size={22} color="#ffe49a" />
              <Text style={styles.footerText}>
                Ce menu est ton hub rapide: navigation, reprise, profil et surprise en un seul
                geste.
              </Text>
            </View>
          </ScrollView>
        </Animated.View>
      </View>
    </Modal>
  );
}

function SectionTitle({ title }: { title: string }) {
  return <Text style={styles.sectionTitle}>{title}</Text>;
}

function StatChip({
  icon,
  label,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
}) {
  return (
    <View style={styles.statChip}>
      <Ionicons name={icon} size={13} color="#ffffff" />
      <Text style={styles.statChipText}>{label}</Text>
    </View>
  );
}

function ActionTile({
  icon,
  onPress,
  subtitle,
  title,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
  subtitle: string;
  title: string;
}) {
  return (
    <Pressable onPress={onPress} style={styles.actionTile}>
      <View style={styles.actionIconWrap}>
        <Ionicons name={icon} size={18} color="#111111" />
      </View>
      <Text style={styles.actionTitle}>{title}</Text>
      <Text style={styles.actionSubtitle}>{subtitle}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  modalRoot: {
    flex: 1,
    justifyContent: 'flex-start',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.58)',
  },
  sheet: {
    flex: 1,
    width: '84%',
    maxWidth: 360,
    paddingTop: 56,
    paddingHorizontal: 22,
    paddingBottom: 24,
    backgroundColor: '#101010',
    borderRightWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    overflow: 'hidden',
  },
  sheetGlowPrimary: {
    position: 'absolute',
    top: 92,
    left: -68,
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: 'rgba(227, 72, 60, 0.18)',
  },
  sheetGlowSecondary: {
    position: 'absolute',
    bottom: 120,
    right: -54,
    width: 190,
    height: 190,
    borderRadius: 95,
    backgroundColor: 'rgba(255, 214, 104, 0.12)',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 18,
  },
  headerCopy: {
    flex: 1,
    gap: 4,
    paddingRight: 12,
  },
  headerEyebrow: {
    color: '#a9a9a9',
    fontSize: 12,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 2.2,
  },
  headerTitle: {
    color: '#ffffff',
    fontSize: 30,
    fontWeight: '800',
    letterSpacing: -1,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    padding: 16,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.07)',
  },
  avatarCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f8df94',
  },
  avatarText: {
    color: '#111111',
    fontSize: 22,
    fontWeight: '800',
  },
  profileCopy: {
    flex: 1,
    gap: 3,
  },
  profileTitle: {
    color: '#ffffff',
    fontSize: 19,
    fontWeight: '800',
  },
  profileSubtitle: {
    color: '#a8a8a8',
    fontSize: 14,
  },
  statsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 14,
    marginBottom: 18,
  },
  statChip: {
    minHeight: 34,
    borderRadius: 17,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  statChipText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '700',
  },
  scrollContent: {
    paddingBottom: 12,
  },
  sectionTitle: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 12,
  },
  navList: {
    gap: 10,
    marginBottom: 22,
  },
  navItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  navItemActive: {
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderColor: 'rgba(255,255,255,0.16)',
  },
  navIconWrap: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  navIconWrapActive: {
    backgroundColor: '#f8df94',
  },
  navCopy: {
    flex: 1,
    gap: 2,
  },
  navLabel: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '800',
  },
  navSubtitle: {
    color: '#9f9f9f',
    fontSize: 12,
    lineHeight: 18,
  },
  activePill: {
    minHeight: 28,
    borderRadius: 14,
    paddingHorizontal: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffff',
  },
  activePillText: {
    color: '#111111',
    fontSize: 11,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  actionGrid: {
    gap: 10,
    marginBottom: 22,
  },
  actionTile: {
    borderRadius: 22,
    padding: 16,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  actionIconWrap: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f8df94',
    marginBottom: 10,
  },
  actionTitle: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '800',
  },
  actionSubtitle: {
    color: '#a2a2a2',
    fontSize: 13,
    lineHeight: 20,
    marginTop: 4,
  },
  recentRow: {
    gap: 10,
    marginBottom: 22,
  },
  recentCard: {
    borderRadius: 18,
    padding: 14,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  recentName: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '800',
  },
  recentMeta: {
    color: '#9f9f9f',
    fontSize: 12,
    marginTop: 4,
  },
  footerCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    borderRadius: 20,
    padding: 14,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  footerText: {
    flex: 1,
    color: '#b4b4b4',
    fontSize: 13,
    lineHeight: 20,
  },
});
