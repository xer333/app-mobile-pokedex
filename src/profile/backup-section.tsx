import AsyncStorage from '@react-native-async-storage/async-storage';
import { useState } from 'react';
import { ActivityIndicator, Modal, Pressable, Share, StyleSheet, Text, TextInput, View } from 'react-native';

import { useAccount } from '../_shared/account';
import { useActivity } from '../_shared/activity';
import { useAdventure } from '../_shared/adventure';
import { useCollections } from '../_shared/collections';
import { ConfirmDialog } from '../_shared/confirm-dialog';
import { useHuntFoundCoordinator } from '../_shared/hunt-found-coordinator';
import { replayRestoreJournal, restoreFullBackup } from '../_shared/backup-restore';
import { recoveryBackupKey, restoreJournalKey } from '../_shared/backup-storage-keys';
import {
  parsePortableBackup,
  serializeFullBackup,
  type FullBackupData,
  type PortableBackup,
} from '../_shared/full-backup';
import { usePlanning } from '../_shared/planning-provider';
import { useShinyHunts } from '../_shared/shiny-hunts-provider';

export function BackupSection() {
  const account = useAccount();
  const activity = useActivity();
  const adventure = useAdventure();
  const collections = useCollections();
  const planning = usePlanning();
  const shinyHunts = useShinyHunts();
  const foundCoordinator = useHuntFoundCoordinator();
  const [mode, setMode] = useState<'closed' | 'export' | 'import'>('closed');
  const [editorValue, setEditorValue] = useState('');
  const [preview, setPreview] = useState<PortableBackup | null>(null);
  const [recoverySource, setRecoverySource] = useState(false);
  const [confirmVisible, setConfirmVisible] = useState(false);
  const [restoring, setRestoring] = useState(false);
  const [pendingRestore, setPendingRestore] = useState(false);
  const [feedback, setFeedback] = useState<{ message: string; error: boolean } | null>(null);
  const ready = [account, activity, adventure, collections, planning, shinyHunts]
    .every((context) => context.isReady);
  const synced = [account, activity, adventure, collections, planning, shinyHunts]
    .every((context) => context.isSynced);
  const canRestore = ready && synced && foundCoordinator.isReady && !pendingRestore;

  const snapshot = (): FullBackupData => ({
    profile: account.profile,
    activity: {
      lastRoute: activity.lastRoute,
      lastLabel: activity.lastLabel,
      lastPokemonSlug: activity.lastPokemonSlug,
      recentPokemonSlugs: activity.recentPokemonSlugs,
      updatedAt: activity.updatedAt,
    },
    adventure: {
      activeGameId: adventure.activeGameId,
      activeSaveId: adventure.activeSaveId,
      saves: adventure.saves,
    },
    collections: {
      favorites: collections.favorites,
      team: collections.team,
      teamsBySaveId: collections.teamsBySaveId,
      comparisonTarget: collections.comparisonTarget,
      specimens: collections.specimens,
      projects: collections.projects,
    },
    planning: { goals: planning.goals },
    shinyHunts: { hunts: shinyHunts.hunts },
  });

  const exportBackup = async () => {
    if (!ready) return;
    const serialized = serializeFullBackup(snapshot());
    setMode('export');
    setEditorValue(serialized);
    setPreview(null);
    setFeedback(null);
    try {
      await Share.share({ message: serialized, title: 'Sauvegarde complète du carnet Pokémon' });
    } catch {
      setFeedback({ message: 'Le partage est indisponible. Le JSON reste visible ci-dessous.', error: true });
    }
  };

  const loadRecovery = async () => {
    try {
      const rawValue = await AsyncStorage.getItem(recoveryBackupKey);
      if (!rawValue) {
        setFeedback({ message: 'Aucune copie de secours disponible.', error: true });
        return;
      }
      const parsed = parsePortableBackup(rawValue);
      if (parsed.kind !== 'full') throw new Error('Copie de secours non reconnue.');
      setMode('import');
      setEditorValue(rawValue);
      setPreview(parsed);
      setRecoverySource(true);
      setFeedback(null);
    } catch (error) {
      setFeedback({ message: errorMessage(error), error: true });
    }
  };

  const inspectImport = () => {
    try {
      setPreview(parsePortableBackup(editorValue));
      setFeedback(null);
    } catch (error) {
      setPreview(null);
      setFeedback({ message: errorMessage(error), error: true });
    }
  };

  const applyImport = async () => {
    if (!preview || !canRestore || restoring) return;
    if (preview.kind === 'specimens') {
      const existingIds = new Set(collections.specimens.map((specimen) => specimen.id));
      const count = preview.backup.specimens.filter((specimen) => !existingIds.has(specimen.id)).length;
      collections.importSpecimens(preview.backup.specimens);
      setFeedback({ message: `${count} nouvel(s) exemplaire(s) importé(s). Les autres données sont inchangées.`, error: false });
      setPreview(null);
      return;
    }

    setConfirmVisible(false);
    setRestoring(true);
    try {
      await restoreFullBackup(
        preview.backup,
        snapshot(),
        (serialized) => AsyncStorage.setItem(recoveryBackupKey, serialized),
        AsyncStorage,
        {
          profile: account.replaceProfile,
          activity: activity.replaceActivity,
          adventure: adventure.replaceAdventure,
          collections: collections.replaceCollections,
          planning: (value) => planning.replaceGoals(value.goals),
          shinyHunts: (value) => shinyHunts.replaceHunts(value.hunts),
        },
        recoverySource,
      );
      setPreview(null);
      setPendingRestore(false);
      setFeedback({
        message: 'Restauration terminée sur le stockage local. Une copie de l’ancien carnet est conservée ; vérifie les données avant de fermer l’application.',
        error: false,
      });
    } catch (error) {
      const journal = await AsyncStorage.getItem(restoreJournalKey).catch(() => undefined);
      setPendingRestore(journal !== null);
      setFeedback({ message: journal === undefined
        ? `Restauration non confirmée et journal illisible : ${errorMessage(error)}. Réessaie ici avant de continuer.`
        : journal
          ? `Restauration incomplète : ${errorMessage(error)}. Réessaie ici ou redémarre l’application ; le journal conserve la cible.`
          : `Restauration non confirmée : ${errorMessage(error)}. Vérifie les données et la copie de secours avant de poursuivre.`, error: true });
    } finally {
      setConfirmVisible(false);
      setRestoring(false);
    }
  };

  const retryRestore = async () => {
    setRestoring(true);
    try {
      const replayed = await replayRestoreJournal(AsyncStorage);
      setPendingRestore(false);
      setFeedback({ message: replayed
        ? 'Restauration locale reprise et terminée.'
        : 'Aucun journal en attente : vérifie les données avant une nouvelle restauration.', error: false });
    } catch (error) {
      setFeedback({ message: `Reprise impossible : ${errorMessage(error)}. Le journal reste disponible au redémarrage.`, error: true });
    } finally {
      setRestoring(false);
    }
  };

  return (
    <View style={styles.card}>
      <Modal visible={restoring} transparent animationType="fade" onRequestClose={() => undefined}>
        <View style={styles.blockingOverlay}>
          <ActivityIndicator size="large" color="#f8df94" />
          <Text style={styles.blockingText}>Restauration du carnet en cours… Ne ferme pas l’application.</Text>
        </View>
      </Modal>
      <ConfirmDialog
        visible={confirmVisible}
        title="Remplacer tout le carnet ?"
        message="Le profil, le jeu actif, les favoris, l’équipe, les exemplaires, les objectifs, les chasses et l’activité seront remplacés. Une copie locale des données actuelles sera créée avant l’opération."
        confirmLabel="Restaurer tout"
        destructive
        onCancel={() => setConfirmVisible(false)}
        onConfirm={() => { void applyImport(); }}
      />
      <Text style={styles.title}>Sauvegarde complète</Text>
      <Text style={styles.description}>
        Exporte le carnet entier en JSON. Garde ce fichier dans un endroit sûr : il contient ton profil et toutes tes données personnelles.
      </Text>
      {!ready ? <Text style={styles.warning}>Attends le chargement des données avant d’exporter ou restaurer.</Text> : null}
      {ready && !synced ? <Text style={styles.warning}>Attends la fin des écritures locales avant de restaurer ; une modification non enregistrée pourrait être perdue.</Text> : null}
      {ready && !foundCoordinator.isReady ? <Text style={styles.warning}>Une trouvaille attend sa récupération. Termine-la avant toute restauration.</Text> : null}
      {pendingRestore ? <Action label="Reprendre la restauration" onPress={() => { void retryRestore(); }} disabled={restoring} /> : null}
      <View style={styles.actions}>
        <Action label="Exporter tout" onPress={() => { void exportBackup(); }} disabled={!ready || restoring} />
        <Action label="Importer" onPress={() => {
          setMode('import');
          setEditorValue('');
          setPreview(null);
          setRecoverySource(false);
          setFeedback(null);
        }} disabled={!canRestore || restoring} secondary />
        <Action label="Copie de secours" onPress={() => { void loadRecovery(); }} disabled={!canRestore || restoring} secondary />
      </View>
      {mode !== 'closed' ? (
        <TextInput
          multiline
          editable={mode === 'import' && !restoring}
          value={editorValue}
          onChangeText={(value) => {
            setEditorValue(value);
            setPreview(null);
            setRecoverySource(false);
          }}
          placeholder={mode === 'import' ? 'Colle une sauvegarde JSON complète ou un ancien export d’exemplaires…' : ''}
          placeholderTextColor="#777"
          style={styles.editor}
        />
      ) : null}
      {mode === 'import' ? <Action label="Vérifier le fichier" onPress={inspectImport} disabled={!canRestore || restoring || !editorValue.trim()} /> : null}
      {preview?.kind === 'full' ? (
        <View style={styles.preview}>
          <Text style={styles.previewTitle}>Aperçu de la sauvegarde complète</Text>
          <Text style={styles.description}>
            {preview.backup.collections.specimens.length} exemplaires · {preview.backup.collections.projects.length} projets · {preview.backup.collections.favorites.length} favoris · {preview.backup.collections.team.length} membres d’équipe active · {preview.backup.planning.goals.length} objectifs · {preview.backup.shinyHunts.hunts.length} chasses
          </Text>
          <Text style={styles.warning}>Mode remplacement : les données locales actuelles seront écrasées, pas fusionnées.</Text>
          <Action label="Restaurer tout…" onPress={() => setConfirmVisible(true)} disabled={!canRestore || restoring} destructive />
        </View>
      ) : null}
      {preview?.kind === 'specimens' ? (
        <View style={styles.preview}>
          <Text style={styles.previewTitle}>Ancien export de collection</Text>
          <Text style={styles.description}>{preview.backup.specimens.length} exemplaires. Les identifiants déjà présents seront ignorés ; aucune autre donnée ne sera remplacée.</Text>
          <Action label="Fusionner les exemplaires" onPress={() => { void applyImport(); }} disabled={!canRestore || restoring} />
        </View>
      ) : null}
      {feedback ? <Text style={[styles.feedback, feedback.error && styles.error]}>{feedback.message}</Text> : null}
    </View>
  );
}

function Action({ label, onPress, disabled = false, secondary = false, destructive = false }: {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  secondary?: boolean;
  destructive?: boolean;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      onPress={onPress}
      style={[styles.button, secondary && styles.secondary, destructive && styles.destructive, disabled && styles.disabled]}
    >
      <Text style={[styles.buttonText, secondary && styles.secondaryText]}>{label}</Text>
    </Pressable>
  );
}

function errorMessage(error: unknown) {
  return error instanceof Error ? error.message : 'Erreur inconnue.';
}

const styles = StyleSheet.create({
  blockingOverlay: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 16, padding: 24, backgroundColor: 'rgba(0,0,0,0.9)' },
  blockingText: { color: '#fff', fontSize: 15, fontWeight: '800', textAlign: 'center' },
  card: { gap: 13, padding: 16, borderRadius: 22, backgroundColor: 'rgba(112,196,255,0.1)', borderWidth: 1, borderColor: 'rgba(112,196,255,0.2)' },
  title: { color: '#fff', fontSize: 19, fontWeight: '900' },
  description: { color: '#c8c8c8', fontSize: 13, lineHeight: 20 },
  warning: { color: '#f8df94', fontSize: 12, lineHeight: 18 },
  actions: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  button: { minHeight: 42, alignSelf: 'flex-start', justifyContent: 'center', paddingHorizontal: 13, borderRadius: 14, backgroundColor: '#f8df94' },
  secondary: { backgroundColor: '#343434' },
  destructive: { backgroundColor: '#ffadad' },
  disabled: { opacity: 0.4 },
  buttonText: { color: '#111', fontSize: 12, fontWeight: '900' },
  secondaryText: { color: '#fff' },
  editor: { minHeight: 150, maxHeight: 220, padding: 12, borderRadius: 14, backgroundColor: '#080808', color: '#fff', textAlignVertical: 'top', fontFamily: 'monospace', fontSize: 11 },
  preview: { gap: 9, padding: 12, borderRadius: 14, backgroundColor: 'rgba(0,0,0,0.25)' },
  previewTitle: { color: '#fff', fontSize: 14, fontWeight: '800' },
  feedback: { color: '#bff0cd', fontSize: 12, lineHeight: 18 },
  error: { color: '#ffb4b4' },
});
