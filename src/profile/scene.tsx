import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useMemo, useState } from 'react';
import {
  FlatList,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import Animated, { FadeInUp, LinearTransition } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import {
  getAccountDisplayName,
  getAccountInitials,
  useAccount,
  type AccountProfile,
} from '../_shared/account';
import { useActivity } from '../_shared/activity';
import { gameOptions, useAdventure } from '../_shared/adventure';
import { useCollections } from '../_shared/collections';
import { getGameCoverage } from '../_shared/game-coverage';
import { usePlanning } from '../_shared/planning-provider';
import { useShinyHunts } from '../_shared/shiny-hunts-provider';
import { BackupSection } from './backup-section';
import { styles } from './styles';
import { SaveManager } from './save-manager';

type FieldConfig = {
  key: string;
  label: string;
  value: string;
  placeholder: string;
  onChangeText: (value: string) => void;
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
};

export function ProfileScene() {
  const router = useRouter();
  const account = useAccount();
  const activity = useActivity();
  const adventure = useAdventure();
  const collections = useCollections();
  const planning = usePlanning();
  const shinyHunts = useShinyHunts();
  const { profile, replaceProfile, resetProfile } = account;
  const [draft, setDraft] = useState<AccountProfile>(profile);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    setDraft(profile);
  }, [profile]);

  const previewName = useMemo(() => getAccountDisplayName(draft), [draft]);
  const previewInitial = useMemo(() => getAccountInitials(draft), [draft]);

  const handleSave = () => {
    replaceProfile(draft);
  };

  const handleReset = () => {
    resetProfile();
  };

  const persistenceContexts = [account, activity, adventure, collections, planning, shinyHunts];
  const persistenceErrors = persistenceContexts
    .map((context) => context.persistenceError)
    .filter((message): message is string => Boolean(message));
  const isSaving = persistenceContexts.some(
    (context) => context.persistenceStatus === 'saving',
  );
  const persistenceMessage =
    persistenceErrors[0] ??
    (isSaving
      ? 'Sauvegarde locale en cours…'
      : 'Profil, collection, objectifs, chasses et activité sont enregistrés uniquement sur cet appareil.');

  const fields: FieldConfig[] = [
    {
      key: 'firstName',
      label: 'Prenom',
      value: draft.firstName,
      placeholder: 'Stanly',
      onChangeText: (value) => setDraft((current) => ({ ...current, firstName: value })),
    },
    {
      key: 'lastName',
      label: 'Nom',
      value: draft.lastName,
      placeholder: 'Ketchum',
      onChangeText: (value) => setDraft((current) => ({ ...current, lastName: value })),
    },
    {
      key: 'nickname',
      label: 'Pseudo',
      value: draft.nickname,
      placeholder: 'stanly',
      autoCapitalize: 'none',
      onChangeText: (value) => setDraft((current) => ({ ...current, nickname: value })),
    },
  ];

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'left', 'right']}>
      <ProfileBackdrop />

      <FlatList
        data={['account-form']}
        keyExtractor={(item) => item}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              setDraft(profile);
              setTimeout(() => setRefreshing(false), 260);
            }}
            tintColor="#ffffff"
            progressBackgroundColor="#1f1f1f"
          />
        }
        initialNumToRender={1}
        maxToRenderPerBatch={2}
        windowSize={3}
        ListHeaderComponent={
          <View>
            <View style={styles.header}>
              <Pressable onPress={() => router.back()} style={styles.iconButton}>
                <Feather name="arrow-left" size={22} color="#ffffff" />
              </Pressable>
              <View style={styles.headerSpacer} />
            </View>

            <View>
              <Text style={styles.title}>Profil</Text>
              <Text style={styles.subtitle}>
                Modifie ton profil et l&apos;accueil affichera automatiquement ton prenom.
              </Text>
            </View>

            <LinearGradient colors={['#26221a', '#161616', '#202020']} style={styles.heroCard}>
              <View style={styles.heroGlow} />

              <View style={styles.heroTopRow}>
                <View style={styles.avatarPreview}>
                  <Text style={styles.avatarPreviewText}>{previewInitial}</Text>
                </View>

                <View style={styles.heroCopy}>
                  <Text style={styles.heroEyebrow}>Profil dresseur</Text>
                  <Text style={styles.heroName}>{previewName}</Text>
                  <Text style={styles.heroMeta}>
                    {draft.nickname ? `@${draft.nickname}` : '@stanly'}
                  </Text>
                </View>
              </View>

              <View style={styles.previewCard}>
                <Text style={styles.previewLabel}>Apercu accueil</Text>
                <Text style={styles.previewGreeting}>Salut ! {previewName}</Text>
                <Text style={styles.previewSubheading}>Bon retour dans ton Pokedex</Text>
              </View>
            </LinearGradient>
          </View>
        }
        renderItem={() => (
          <Animated.View
            entering={FadeInUp.duration(260)}
            layout={LinearTransition.springify().damping(20).stiffness(170)}
          >
            <View style={styles.formCard}>
              <Text style={styles.sectionTitle}>Contexte de jeu actif</Text>
              <Text style={styles.helperText}>
                Ce choix contextualise progressivement les capacités et les futurs conseils. Une
                couverture partielle reste signalée comme telle.
              </Text>

              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.gameChipRow}
              >
                {gameOptions.map((game) => {
                  const active = adventure.activeGame.id === game.id;
                  return (
                    <Pressable
                      key={game.id}
                      onPress={() => adventure.setActiveGame(game.id)}
                      style={[styles.gameChip, active && styles.gameChipActive]}
                    >
                      <Text style={[styles.gameChipText, active && styles.gameChipTextActive]}>
                        {game.shortLabel}
                      </Text>
                    </Pressable>
                  );
                })}
              </ScrollView>

              <SaveManager />

              <View style={styles.gameContextCard}>
                <Text style={styles.noteTitle}>{adventure.activeGame.label}</Text>
                <Text style={styles.noteText}>
                  {adventure.activeGame.coverage === 'partial'
                    ? 'Couverture partielle : les capacités sont contextualisées lorsqu’elles existent dans PokéAPI ; rencontres, évolutions et disponibilité restent à vérifier.'
                    : 'Référentiel encyclopédique général : aucune disponibilité dans un jeu précis n’est déduite.'}
                </Text>
                <View style={styles.coverageList}>
                  {getGameCoverage(adventure.activeGame.id === 'national').map((row) => (
                    <View key={row.key} style={styles.coverageRow}>
                      <Text style={styles.coverageLabel}>{row.label}</Text>
                      <View
                        style={[
                          styles.coverageBadge,
                          row.level === 'partial' && styles.coverageBadgePartial,
                        ]}
                      >
                        <Text style={styles.coverageBadgeText}>{row.statusLabel}</Text>
                      </View>
                    </View>
                  ))}
                </View>
              </View>

              <Text style={styles.sectionTitle}>Informations du profil</Text>
              <Text style={styles.helperText}>
                Le prenom est prioritaire sur l&apos;accueil. Si tu le laisses vide, le pseudo sera utilise.
              </Text>

              {fields.map((field) => (
                <Field
                  key={field.key}
                  label={field.label}
                  value={field.value}
                  onChangeText={field.onChangeText}
                  placeholder={field.placeholder}
                  autoCapitalize={field.autoCapitalize}
                />
              ))}

              <View style={styles.noteCard}>
                <Text style={styles.noteTitle}>Ce qui change dans l&apos;app</Text>
                <Text style={styles.noteText}>
                  L&apos;initiale en haut a droite, le nom sur l&apos;accueil et l&apos;apercu du profil
                  utilisent ces donnees en direct.
                </Text>
              </View>

              <View
                style={[
                  styles.noteCard,
                  persistenceErrors.length > 0 && styles.storageErrorCard,
                ]}
              >
                <Text style={styles.noteTitle}>État des données locales</Text>
                <Text style={styles.noteText}>{persistenceMessage}</Text>
                {persistenceErrors.length > 0 ? (
                  <Pressable
                    onPress={() => {
                      account.retryPersistence();
                      activity.retryPersistence();
                      adventure.retryPersistence();
                      collections.retryPersistence();
                      planning.retryPersistence();
                      shinyHunts.retryPersistence();
                    }}
                    style={styles.storageRetryButton}
                  >
                    <Text style={styles.storageRetryButtonText}>Réessayer l’accès aux données</Text>
                  </Pressable>
                ) : null}
              </View>

              <BackupSection />

              <View style={styles.actionRow}>
                <Pressable onPress={handleReset} style={styles.secondaryButton}>
                  <Text style={styles.secondaryButtonText}>Reinitialiser</Text>
                </Pressable>

                <Pressable onPress={handleSave} style={styles.primaryButton}>
                  <Text style={styles.primaryButtonText}>Enregistrer le profil</Text>
                </Pressable>
              </View>
            </View>
          </Animated.View>
        )}
      />
    </SafeAreaView>
  );
}

function Field({
  label,
  value,
  onChangeText,
  placeholder,
  autoCapitalize = 'words',
}: {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  placeholder: string;
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
}) {
  return (
    <View style={styles.fieldGroup}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#7d7d7d"
        autoCapitalize={autoCapitalize}
        autoCorrect={false}
        style={styles.input}
      />
    </View>
  );
}

function ProfileBackdrop() {
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
