import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useMemo, useState } from 'react';
import {
  FlatList,
  Pressable,
  RefreshControl,
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
import { styles } from './styles';

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
  const { profile, replaceProfile, resetProfile } = useAccount();
  const [draft, setDraft] = useState<AccountProfile>(profile);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    setDraft(profile);
  }, [profile]);

  const previewName = useMemo(() => getAccountDisplayName(draft), [draft]);
  const previewInitial = useMemo(() => getAccountInitials(draft), [draft]);

  const handleSave = () => {
    replaceProfile(draft);
    router.back();
  };

  const handleReset = () => {
    resetProfile();
    router.back();
  };

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
              <Text style={styles.title}>Compte</Text>
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
              <Text style={styles.sectionTitle}>Informations du compte</Text>
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

              <View style={styles.actionRow}>
                <Pressable onPress={handleReset} style={styles.secondaryButton}>
                  <Text style={styles.secondaryButtonText}>Reinitialiser</Text>
                </Pressable>

                <Pressable onPress={handleSave} style={styles.primaryButton}>
                  <Text style={styles.primaryButtonText}>Enregistrer</Text>
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
