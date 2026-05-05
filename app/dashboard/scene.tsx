import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather, Ionicons } from '@expo/vector-icons';
import { useMemo, useState } from 'react';
import {
  FlatList,
  Image,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Animated, { FadeInUp, LinearTransition } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAccount } from '../_shared/account';
import { formatActivityTime, useActivity } from '../_shared/activity';
import { AccountAvatarButton } from '../_shared/account-ui';
import { getCatalogPokemonBySlug } from '../_shared/catalog';
import { useCollections } from '../_shared/collections';
import { QuickMenuSheet } from '../_shared/quick-menu';
import { shortcutCards } from '../_shared/data';
import { appRoutes, detailRoute, mapRoute } from '../_shared/routes';
import { BottomDock, ShortcutTile } from '../_shared/ui';
import { styles } from './styles';

type DashboardSection = 'resume' | 'collections';

const sections: DashboardSection[] = ['resume', 'collections'];

export function DashboardScene() {
  const router = useRouter();
  const [menuVisible, setMenuVisible] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const { displayName } = useAccount();
  const { favorites, team } = useCollections();
  const { lastLabel, lastPokemonSlug, lastRoute, recentPokemonSlugs, updatedAt } = useActivity();
  const resumePokemon = lastPokemonSlug ? getCatalogPokemonBySlug(lastPokemonSlug) : null;
  const favoritePokemon = favorites.slice(0, 4).map((slug) => getCatalogPokemonBySlug(slug));
  const teamPokemon = team.slice(0, 6).map((slug) => getCatalogPokemonBySlug(slug));
  const recentPokemon = recentPokemonSlugs.slice(0, 4).map((slug) => getCatalogPokemonBySlug(slug));

  const header = useMemo(
    () => (
      <View>
        <View style={styles.topBar}>
          <Pressable onPress={() => setMenuVisible(true)} style={styles.iconButton}>
            <Feather name="menu" size={28} color="#ffffff" />
          </Pressable>

          <AccountAvatarButton onPress={() => router.push(appRoutes.profile)} />
        </View>

        <Text style={styles.greeting}>
          <Text style={styles.greetingMuted}>Salut !</Text> {displayName}
        </Text>
        <Text style={styles.subheading}>Bon retour dans ton Pokédex</Text>

        <View style={styles.shortcutsGrid}>
          {shortcutCards.map((card) => (
            <ShortcutTile
              key={card.title}
              card={card}
              onPress={() => router.push(resolveShortcutRoute(card.action))}
            />
          ))}
        </View>
      </View>
    ),
    [displayName, router],
  );

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'left', 'right']}>
      <DarkBackdrop />

      <FlatList
        data={sections}
        keyExtractor={(item) => item}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
        ListHeaderComponent={header}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              setTimeout(() => setRefreshing(false), 450);
            }}
            tintColor="#ffffff"
            progressBackgroundColor="#1f1f1f"
          />
        }
        initialNumToRender={2}
        maxToRenderPerBatch={4}
        windowSize={5}
        renderItem={({ item, index }) => (
          <Animated.View
            entering={FadeInUp.delay(index * 40).duration(240)}
            layout={LinearTransition.springify().damping(20).stiffness(170)}
          >
            {item === 'resume' ? (
              <ResumeSection
                lastLabel={lastLabel}
                lastRoute={lastRoute}
                recentPokemon={recentPokemon}
                resumePokemon={resumePokemon}
                updatedAt={updatedAt}
                onOpenDiscover={() => router.push(appRoutes.discover)}
                onOpenPokemon={(slug) => router.push(detailRoute(slug))}
                onResume={() => router.push(lastRoute ?? appRoutes.discover)}
              />
            ) : (
              <CollectionsSection
                favoritePokemon={favoritePokemon}
                favoritesCount={favorites.length}
                teamCount={team.length}
                teamPokemon={teamPokemon}
                onOpenDiscover={() => router.push(appRoutes.discover)}
                onOpenPokemon={(slug) => router.push(detailRoute(slug))}
              />
            )}
          </Animated.View>
        )}
      />

      <BottomDock
        activeTab="home"
        onMapPress={() => router.replace(appRoutes.map)}
        onHomePress={() => router.replace(appRoutes.dashboard)}
        onDiscoverPress={() => router.replace(appRoutes.discover)}
      />

      <QuickMenuSheet
        visible={menuVisible}
        currentSection="home"
        onClose={() => setMenuVisible(false)}
      />
    </SafeAreaView>
  );
}

function ResumeSection({
  lastLabel,
  lastRoute,
  recentPokemon,
  resumePokemon,
  updatedAt,
  onOpenDiscover,
  onOpenPokemon,
  onResume,
}: {
  lastLabel: string | null;
  lastRoute: string | null;
  recentPokemon: Array<ReturnType<typeof getCatalogPokemonBySlug>>;
  resumePokemon: ReturnType<typeof getCatalogPokemonBySlug> | null;
  updatedAt: number | null;
  onOpenDiscover: () => void;
  onOpenPokemon: (slug: string) => void;
  onResume: () => void;
}) {
  return (
    <>
      <SectionHeader title="Reprendre ou tu t'es arrete" />
      <View style={styles.resumeCard}>
        {resumePokemon ? (
          <View style={styles.resumeTopRow}>
            <View style={styles.resumeImageShell}>
              <Image source={{ uri: resumePokemon.image }} style={styles.resumeImage} />
            </View>

            <View style={styles.resumeCopy}>
              <Text style={styles.resumeEyebrow}>Derniere activite</Text>
              <Text style={styles.resumeTitle}>{lastLabel ?? `Fiche de ${resumePokemon.nameFr}`}</Text>
              <Text style={styles.resumeMeta}>{formatActivityTime(updatedAt)}</Text>
              <Text style={styles.resumeMetaMuted}>
                {resumePokemon.nameFr} • {resumePokemon.generationLabelFr}
              </Text>
            </View>
          </View>
        ) : (
          <View style={styles.resumeEmptyWrap}>
            <Text style={styles.resumeEyebrow}>Pret a explorer</Text>
            <Text style={styles.resumeTitle}>Aucune reprise enregistree</Text>
            <Text style={styles.resumeMetaMuted}>
              Ouvre une fiche, une carte ou un module pour faire apparaitre un raccourci ici.
            </Text>
          </View>
        )}

        <View style={styles.resumeActions}>
          <Pressable onPress={onResume} style={styles.primaryAction}>
            <Text style={styles.primaryActionText}>
              {lastRoute ? 'Reprendre maintenant' : 'Ouvrir le Pokédex'}
            </Text>
          </Pressable>

          {resumePokemon ? (
            <Pressable
              onPress={() => onOpenPokemon(resumePokemon.slug)}
              style={styles.secondaryAction}
            >
              <Text style={styles.secondaryActionText}>Voir la fiche</Text>
            </Pressable>
          ) : null}
        </View>

        {recentPokemon.length > 0 ? (
          <View style={styles.resumeRecentBlock}>
            <Text style={styles.resumeRecentTitle}>Derniers Pokémon vus</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.smallCardRow}
            >
              {recentPokemon.map((pokemon) => (
                <SmallPokemonCard
                  key={`recent-${pokemon.slug}`}
                  pokemon={pokemon}
                  badge="Recent"
                  onPress={() => onOpenPokemon(pokemon.slug)}
                />
              ))}
            </ScrollView>
          </View>
        ) : (
          <View style={styles.resumeRecentBlock}>
            <EmptyCollectionCard
              body="Tu n'as pas encore d'historique recent. Explore le Pokédex pour commencer."
              cta="Explorer"
              onPress={onOpenDiscover}
            />
          </View>
        )}
      </View>
    </>
  );
}

function CollectionsSection({
  favoritePokemon,
  favoritesCount,
  teamCount,
  teamPokemon,
  onOpenDiscover,
  onOpenPokemon,
}: {
  favoritePokemon: Array<ReturnType<typeof getCatalogPokemonBySlug>>;
  favoritesCount: number;
  teamCount: number;
  teamPokemon: Array<ReturnType<typeof getCatalogPokemonBySlug>>;
  onOpenDiscover: () => void;
  onOpenPokemon: (slug: string) => void;
}) {
  return (
    <>
      <SectionHeader title="Mes favoris / Mon equipe" />
      <View style={styles.collectionSection}>
        <View style={styles.collectionHeaderRow}>
          <Text style={styles.collectionLabel}>Mon equipe</Text>
          <Text style={styles.collectionCount}>{teamCount}/6</Text>
        </View>

        {teamPokemon.length > 0 ? (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.smallCardRow}
          >
            {teamPokemon.map((pokemon) => (
              <SmallPokemonCard
                key={`team-${pokemon.slug}`}
                pokemon={pokemon}
                badge="Equipe"
                onPress={() => onOpenPokemon(pokemon.slug)}
              />
            ))}
          </ScrollView>
        ) : (
          <EmptyCollectionCard
            body="Ajoute des Pokémon a ton equipe depuis leurs fiches detail pour les retrouver ici."
            cta="Composer mon equipe"
            onPress={onOpenDiscover}
          />
        )}

        <View style={styles.collectionSpacer} />

        <View style={styles.collectionHeaderRow}>
          <Text style={styles.collectionLabel}>Mes favoris</Text>
          <Text style={styles.collectionCount}>{favoritesCount}</Text>
        </View>

        {favoritePokemon.length > 0 ? (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.smallCardRow}
          >
            {favoritePokemon.map((pokemon) => (
              <SmallPokemonCard
                key={`favorite-${pokemon.slug}`}
                pokemon={pokemon}
                badge="Favori"
                onPress={() => onOpenPokemon(pokemon.slug)}
              />
            ))}
          </ScrollView>
        ) : (
          <EmptyCollectionCard
            body="Ajoute des favoris pour creer ton espace perso et revenir dessus en un geste."
            cta="Parcourir le Pokédex"
            onPress={onOpenDiscover}
          />
        )}
      </View>
    </>
  );
}

function SectionHeader({ title }: { title: string }) {
  return <Text style={styles.sectionTitle}>{title}</Text>;
}

function SmallPokemonCard({
  badge,
  onPress,
  pokemon,
}: {
  badge: string;
  onPress: () => void;
  pokemon: ReturnType<typeof getCatalogPokemonBySlug>;
}) {
  return (
    <Pressable onPress={onPress} style={styles.smallCard}>
      <View style={styles.smallCardBadge}>
        <Text style={styles.smallCardBadgeText}>{badge}</Text>
      </View>
      <Image source={{ uri: pokemon.image }} style={styles.smallCardImage} />
      <Text style={styles.smallCardName}>{pokemon.nameFr}</Text>
      <Text style={styles.smallCardMeta}>{pokemon.generationLabelFr}</Text>
    </Pressable>
  );
}

function EmptyCollectionCard({
  body,
  cta,
  onPress,
}: {
  body: string;
  cta: string;
  onPress: () => void;
}) {
  return (
    <View style={styles.emptyCollectionCard}>
      <Text style={styles.emptyCollectionText}>{body}</Text>
      <Pressable onPress={onPress} style={styles.emptyCollectionAction}>
        <Ionicons name="arrow-forward" size={16} color="#ffffff" />
        <Text style={styles.emptyCollectionActionText}>{cta}</Text>
      </Pressable>
    </View>
  );
}

function resolveShortcutRoute(action: (typeof shortcutCards)[number]['action']) {
  switch (action) {
    case 'locations':
      return appRoutes.locations;
    case 'moves':
      return appRoutes.moves;
    case 'evolutions':
      return appRoutes.evolutions;
    case 'map':
      return mapRoute();
    case 'dashboard':
      return appRoutes.dashboard;
    case 'detail':
      return detailRoute('pikachu');
    case 'discover':
    default:
      return appRoutes.discover;
  }
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
