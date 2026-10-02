import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { gameOptions, useAdventure } from '../_shared/adventure';
import { useCollections } from '../_shared/collections';
import { usePlanning } from '../_shared/planning-provider';
import { useShinyHunts } from '../_shared/shiny-hunts-provider';
import { ConfirmDialog } from '../_shared/confirm-dialog';

export function SaveManager() {
  const adventure = useAdventure();
  const collections = useCollections();
  const planning = usePlanning();
  const hunts = useShinyHunts();
  const [newName, setNewName] = useState('');
  const [nameDraft, setNameDraft] = useState(adventure.activeSave.name);
  const [dlcDraft, setDlcDraft] = useState(adventure.activeSave.dlcIds.join(', '));
  const [showArchived, setShowArchived] = useState(false);
  const [confirmArchive, setConfirmArchive] = useState(false);
  const activeSaves = adventure.saves.filter((save) => save.archivedAt === undefined);
  const archivedSaves = adventure.saves.filter((save) => save.archivedAt !== undefined);
  const linkedCount = collections.specimens.filter((item) => item.saveId === adventure.activeSaveId).length
    + collections.projects.filter((item) => item.saveId === adventure.activeSaveId).length
    + planning.goals.filter((item) => item.saveId === adventure.activeSaveId).length
    + hunts.hunts.filter((item) => item.saveId === adventure.activeSaveId).length;

  useEffect(() => {
    setNameDraft(adventure.activeSave.name);
    setDlcDraft(adventure.activeSave.dlcIds.join(', '));
  }, [adventure.activeSave.id, adventure.activeSave.name, adventure.activeSave.dlcIds]);

  return (
    <View style={styles.card}>
      <ConfirmDialog
        visible={confirmArchive}
        title={`Archiver « ${adventure.activeSave.name} » ?`}
        message={`La partie disparaîtra de la liste active, mais ses ${linkedCount} exemplaire(s), projet(s), objectif(s) et chasse(s) liés resteront intacts, comme son équipe et son Pokédex. Tu pourras la restaurer ici. Une autre partie deviendra active.`}
        confirmLabel="Archiver"
        onCancel={() => setConfirmArchive(false)}
        onConfirm={() => { adventure.archiveSave(adventure.activeSaveId); setConfirmArchive(false); }}
      />
      <Text style={styles.title}>Mes parties</Text>
      <Text style={styles.hint}>
        Plusieurs parties d’un même jeu gardent une équipe, un Pokédex enregistré et des préférences distincts. L’archivage masque une partie sans supprimer ses données.
      </Text>
      <View style={styles.saveList}>
        {activeSaves.map((save) => {
          const active = save.id === adventure.activeSaveId;
          const game = gameOptions.find((entry) => entry.id === save.gameId);
          return (
            <Pressable
              key={save.id}
              accessibilityRole="button"
              onPress={() => adventure.setActiveSave(save.id)}
              style={[styles.saveChip, active && styles.saveChipActive]}
            >
              <Text style={[styles.saveLabel, active && styles.activeText]}>{save.name}</Text>
              <Text style={[styles.saveMeta, active && styles.activeText]}>
                {game?.shortLabel ?? save.gameId} · {save.registeredSlugs.length} enregistrés
              </Text>
            </Pressable>
          );
        })}
      </View>
      <Pressable accessibilityRole="button" disabled={activeSaves.length <= 1 || !adventure.isReady}
        onPress={() => setConfirmArchive(true)}
        style={[styles.archiveButton, (activeSaves.length <= 1 || !adventure.isReady) && styles.disabled]}>
        <Text style={styles.archiveText}>Archiver la partie active</Text>
      </Pressable>
      {activeSaves.length <= 1 ? <Text style={styles.hint}>Crée une autre partie avant d’archiver la dernière partie active.</Text> : null}
      {archivedSaves.length ? <>
        <Pressable accessibilityRole="button" onPress={() => setShowArchived((value) => !value)} style={styles.archiveButton}>
          <Text style={styles.archiveText}>{showArchived ? 'Masquer' : 'Afficher'} les archives ({archivedSaves.length})</Text>
        </Pressable>
        {showArchived ? archivedSaves.map((save) => {
          const game = gameOptions.find((entry) => entry.id === save.gameId);
          return <View key={save.id} style={styles.archivedCard}>
            <Text style={styles.saveLabel}>{save.name} · {game?.shortLabel ?? save.gameId}</Text>
            <Text style={styles.saveMeta}>{save.registeredSlugs.length} espèces enregistrées · archivée le {new Date(save.archivedAt!).toLocaleDateString('fr-FR')}</Text>
            <Pressable accessibilityRole="button" onPress={() => adventure.restoreSave(save.id)} style={styles.button}>
              <Text style={styles.buttonText}>Restaurer et ouvrir</Text>
            </Pressable>
          </View>;
        }) : null}
      </> : null}
      <Text style={styles.label}>Créer une autre partie de {adventure.activeGame.shortLabel}</Text>
      <View style={styles.row}>
        <TextInput
          value={newName}
          onChangeText={setNewName}
          maxLength={60}
          placeholder="Nom de la partie"
          placeholderTextColor="#777"
          style={[styles.input, styles.flex]}
        />
        <Pressable
          accessibilityRole="button"
          onPress={() => {
            adventure.addSave(adventure.activeGame.id, newName);
            setNewName('');
          }}
          style={styles.button}
        >
          <Text style={styles.buttonText}>Créer</Text>
        </Pressable>
      </View>
      <Text style={styles.label}>Nom de la partie active</Text>
      <View style={styles.row}>
        <TextInput
          value={nameDraft}
          onChangeText={setNameDraft}
          maxLength={60}
          style={[styles.input, styles.flex]}
        />
        <Pressable
          accessibilityRole="button"
          disabled={!nameDraft.trim() || nameDraft.trim() === adventure.activeSave.name}
          onPress={() => adventure.renameSave(adventure.activeSaveId, nameDraft)}
          style={[styles.button, (!nameDraft.trim() || nameDraft.trim() === adventure.activeSave.name) && styles.disabled]}
        >
          <Text style={styles.buttonText}>Renommer</Text>
        </Pressable>
      </View>
      <Text style={styles.label}>Règles déclarées</Text>
      <View style={styles.row}>
        <Rule
          label="Échanges autorisés"
          active={adventure.activeSave.rules.allowTrades}
          onPress={() => adventure.setSaveRules(adventure.activeSaveId, {
            ...adventure.activeSave.rules,
            allowTrades: !adventure.activeSave.rules.allowTrades,
          })}
        />
        <Rule
          label="Transferts autorisés"
          active={adventure.activeSave.rules.allowTransfers}
          onPress={() => adventure.setSaveRules(adventure.activeSaveId, {
            ...adventure.activeSave.rules,
            allowTransfers: !adventure.activeSave.rules.allowTransfers,
          })}
        />
      </View>
      <Text style={styles.label}>Extensions possédées (identifiants déclarés, séparés par une virgule)</Text>
      <View style={styles.row}>
        <TextInput
          value={dlcDraft}
          onChangeText={setDlcDraft}
          placeholder="Ex. teal-mask, indigo-disk"
          placeholderTextColor="#777"
          style={[styles.input, styles.flex]}
        />
        <Pressable
          accessibilityRole="button"
          onPress={() => adventure.setSaveDlcIds(adventure.activeSaveId,
            dlcDraft.split(',').map((value) => value.trim()).filter(Boolean))}
          style={styles.button}
        >
          <Text style={styles.buttonText}>Garder</Text>
        </Pressable>
      </View>
      <Text style={styles.hint}>Ces préférences ne prouvent pas la disponibilité d’un Pokémon dans le jeu.</Text>
    </View>
  );
}

function Rule({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  return (
    <Pressable accessibilityRole="button" onPress={onPress} style={[styles.rule, active && styles.ruleActive]}>
      <Text style={[styles.ruleText, active && styles.activeText]}>{label} : {active ? 'oui' : 'non'}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: { gap: 11, padding: 15, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.05)' },
  title: { color: '#fff', fontSize: 18, fontWeight: '900' },
  hint: { color: '#aaa', fontSize: 12, lineHeight: 18 },
  label: { color: '#ddd', fontSize: 13, fontWeight: '700' },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  flex: { flex: 1, minWidth: 130 },
  input: { minHeight: 43, paddingHorizontal: 11, borderRadius: 12, color: '#fff', backgroundColor: '#111' },
  button: { minHeight: 43, justifyContent: 'center', paddingHorizontal: 12, borderRadius: 12, backgroundColor: '#f8df94' },
  buttonText: { color: '#111', fontSize: 12, fontWeight: '800' },
  disabled: { opacity: 0.4 },
  saveList: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  saveChip: { minWidth: 120, gap: 4, padding: 10, borderRadius: 13, backgroundColor: '#292929' },
  saveChipActive: { backgroundColor: '#f8df94' },
  saveLabel: { color: '#fff', fontSize: 13, fontWeight: '800' },
  saveMeta: { color: '#aaa', fontSize: 11 },
  activeText: { color: '#111' },
  archiveButton: { alignSelf: 'flex-start', minHeight: 38, justifyContent: 'center' },
  archiveText: { color: '#f8df94', fontSize: 12, fontWeight: '800' },
  archivedCard: { gap: 8, padding: 12, borderRadius: 13, backgroundColor: '#222', alignItems: 'flex-start' },
  rule: { paddingHorizontal: 10, paddingVertical: 9, borderRadius: 12, backgroundColor: '#292929' },
  ruleActive: { backgroundColor: '#f8df94' },
  ruleText: { color: '#ddd', fontSize: 12, fontWeight: '700' },
});
