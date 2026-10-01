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
import { useAdventure } from '../_shared/adventure';
import { getCatalogPokemonBySlug } from '../_shared/catalog';
import { useCollections } from '../_shared/collections';
import { getGoalProgress } from '../_shared/planning';
import { usePlanning } from '../_shared/planning-provider';
import { translateType } from '../_shared/pokedex';
import { QuickMenuSheet } from '../_shared/quick-menu';
import { shortcutCards } from '../_shared/data';
import { appRoutes, compareRoute, detailRoute, mapRoute } from '../_shared/routes';
import { analyzeTeamComposition } from '../_shared/team-analysis';
import { getHuntAttempts } from '../_shared/shiny-hunts';
import { useShinyHunts } from '../_shared/shiny-hunts-provider';
import { BottomDock, ShortcutTile } from '../_shared/ui';
import { styles } from './styles';

type DashboardSection = 'resume' | 'collections';

const sections: DashboardSection[] = ['resume', 'collections'];

export function DashboardScene() {
  const router = useRouter();
  const [menuVisible, setMenuVisible] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const { displayName } = useAccount();
  const { activeGame } = useAdventure();
  const { favorites, specimens, team } = useCollections();
  const { goals } = usePlanning();
  const { hunts } = useShinyHunts();
  const activeGoal = goals.find((goal) => getGoalProgress(goal).done < getGoalProgress(goal).total) ?? goals[0];
  const activeHunt = hunts.find((hunt) => hunt.status === 'active') ?? hunts.find((hunt) => hunt.status === 'paused');
  const activeHuntPokemon = activeHunt ? getCatalogPokemonBySlug(activeHunt.targetSlug) : null;
  const { lastLabel, lastPokemonSlug, lastRoute, recentPokemonSlugs, updatedAt } = useActivity();
  const resumePokemon = lastPokemonSlug ? getCatalogPokemonBySlug(lastPokemonSlug) : null;
  const favoritePokemon = favorites.slice(0, 4).map((slug) => getCatalogPokemonBySlug(slug));
  const teamPokemon = team.slice(0, 6).map((slug) => getCatalogPokemonBySlug(slug));
  const teamAnalysis = analyzeTeamComposition(teamPokemon);
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

        <Pressable onPress={() => router.push(appRoutes.profile)} style={styles.gameContextButton}>
          <View style={styles.gameContextIcon}>
            <Feather name="crosshair" size={15} color="#f8df94" />
          </View>
          <View style={styles.gameContextCopy}>
            <Text style={styles.gameContextLabel}>Contexte actif</Text>
            <Text style={styles.gameContextValue}>{activeGame.label}</Text>
          </View>
          <Feather name="chevron-right" size={18} color="#8e8e8e" />
        </Pressable>

        <Pressable onPress={() => router.push(appRoutes.planner)} style={styles.goalResumeCard}>
          <View style={styles.goalResumeIcon}>
            <Feather name="check-square" size={17} color="#73d178" />
          </View>
          <View style={styles.gameContextCopy}>
            <Text style={styles.gameContextLabel}>Objectif actif</Text>
            <Text style={styles.gameContextValue}>
              {activeGoal ? activeGoal.title : 'Créer mon premier objectif'}
            </Text>
            {activeGoal ? (
              <Text style={styles.goalResumeMeta}>
                {getGoalProgress(activeGoal).done}/{getGoalProgress(activeGoal).total} tâches terminées
              </Text>
            ) : null}
          </View>
          <Feather name="chevron-right" size={18} color="#8e8e8e" />
        </Pressable>

        <Pressable onPress={() => router.push(appRoutes.hunts)} style={styles.huntResumeCard}>
          <View style={styles.huntResumeIcon}>
            <Ionicons name="sparkles" size={17} color="#f8df94" />
          </View>
          <View style={styles.gameContextCopy}>
            <Text style={styles.gameContextLabel}>Chasse chromatique</Text>
            <Text style={styles.gameContextValue}>
              {activeHuntPokemon ? activeHuntPokemon.nameFr : 'Démarrer une première chasse'}
            </Text>
            {activeHunt ? (
              <Text style={styles.huntResumeMeta}>
                {getHuntAttempts(activeHunt).toLocaleString('fr-FR')} essais · {activeHunt.status === 'paused' ? 'en pause' : 'active'}
              </Text>
            ) : null}
          </View>
          <Feather name="chevron-right" size={18} color="#8e8e8e" />
        </Pressable>

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
    [activeGame.label, activeGoal, activeHunt, activeHuntPokemon, displayName, router],
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
                specimensCount={specimens.length}
                teamCount={team.length}
                teamPokemon={teamPokemon}
                teamAnalysis={teamAnalysis}
                onCompareTeam={() =>
                  team.length >= 2
                    ? router.push(compareRoute(team[0], team[1]))
                    : router.push(appRoutes.discover)
                }
                onOpenCollection={() => router.push(appRoutes.collection)}
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
              <Image source={{ uri: resumePokemon.image }} style={styles.resumeImage} resizeMode="contain" />
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
  specimensCount,
  teamCount,
  teamPokemon,
  teamAnalysis,
  onCompareTeam,
  onOpenCollection,
  onOpenDiscover,
  onOpenPokemon,
}: {
  favoritePokemon: Array<ReturnType<typeof getCatalogPokemonBySlug>>;
  favoritesCount: number;
  specimensCount: number;
  teamCount: number;
  teamPokemon: Array<ReturnType<typeof getCatalogPokemonBySlug>>;
  teamAnalysis: ReturnType<typeof analyzeTeamComposition>;
  onCompareTeam: () => void;
  onOpenCollection: () => void;
  onOpenDiscover: () => void;
  onOpenPokemon: (slug: string) => void;
}) {
  return (
    <>
      <SectionHeader title="Ma collection et mon équipe" />
      <View style={styles.collectionSection}>
        <View style={styles.collectionHeaderRow}>
          <Text style={styles.collectionLabel}>Mes exemplaires</Text>
          <Text style={styles.collectionCount}>{specimensCount}</Text>
        </View>
        <Pressable onPress={onOpenCollection} style={styles.specimenSummaryCard}>
          <Text style={styles.specimenSummaryText}>
            {specimensCount > 0
              ? `${specimensCount} exemplaire${specimensCount > 1 ? 's' : ''} possédé${specimensCount > 1 ? 's' : ''}, enregistrés séparément des favoris.`
              : 'Aucun exemplaire possédé enregistré. Ajoute-en depuis une fiche Pokémon ou une fiche de forme.'}
          </Text>
          <Text style={styles.specimenSummaryAction}>Gérer et sauvegarder →</Text>
        </Pressable>

        <View style={styles.collectionSpacer} />

        <View style={styles.collectionHeaderRow}>
          <Text style={styles.collectionLabel}>Mon equipe</Text>
          <Text style={styles.collectionCount}>{teamCount}/6</Text>
        </View>

        {teamPokemon.length > 0 ? (
          <>
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
            <Pressable onPress={onCompareTeam} style={styles.teamAnalysisCard}>
              <Text style={styles.teamAnalysisTitle}>Lecture rapide de l’équipe</Text>
              <Text style={styles.teamAnalysisText}>
                {teamAnalysis.distinctTypes} types distincts.{' '}
                {teamAnalysis.repeatedTypes.length > 0
                  ? `Types répétés : ${teamAnalysis.repeatedTypes.map((entry) => `${translateType(entry.type)} ×${entry.count}`).join(', ')}.`
                  : 'Aucun type répété.'}
              </Text>
              <Text style={styles.teamAnalysisNote}>
                Analyse des types déclarés uniquement · ouvrir le comparateur
              </Text>
            </Pressable>
          </>
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
      <Image source={{ uri: pokemon.image }} style={styles.smallCardImage} resizeMode="contain" />
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
    <View style={[StyleSheet.absoluteFill, { pointerEvents: 'none' }]}>
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
