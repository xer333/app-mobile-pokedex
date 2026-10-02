import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState, type ReactNode } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';

import { recoveryBackupKey } from './backup-storage-keys';
import { replayRestoreJournal, stageRestoreJournal } from './backup-restore';
import { ConfirmDialog } from './confirm-dialog';
import { parsePortableBackup } from './full-backup';

export function RestoreBootstrap({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const [error, setError] = useState<string | null>(null);
  const [retry, setRetry] = useState(0);
  const [confirmRecovery, setConfirmRecovery] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setStatus('loading');
    replayRestoreJournal(AsyncStorage)
      .then(() => { if (!cancelled) { setError(null); setStatus('ready'); } })
      .catch((cause) => {
        if (!cancelled) {
          setError(cause instanceof Error ? cause.message : 'Lecture locale impossible.');
          setStatus('error');
        }
      });
    return () => { cancelled = true; };
  }, [retry]);

  const restoreRecovery = async () => {
    setStatus('loading');
    try {
      const raw = await AsyncStorage.getItem(recoveryBackupKey);
      if (!raw) throw new Error('Aucune copie de secours disponible.');
      const parsed = parsePortableBackup(raw);
      if (parsed.kind !== 'full') throw new Error('Copie de secours invalide.');
      await stageRestoreJournal(AsyncStorage, parsed.backup);
      await replayRestoreJournal(AsyncStorage);
      setError(null);
      setStatus('ready');
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Reprise impossible.');
      setStatus('error');
    }
  };

  if (status === 'ready') return <>{children}</>;
  return <View style={styles.screen}>
    <ConfirmDialog
      visible={confirmRecovery}
      title="Remplacer la restauration en attente ?"
      message="La copie de secours contient le carnet d’avant la dernière restauration. La reprendre abandonnera la sauvegarde cible encore en attente."
      confirmLabel="Reprendre l’ancien carnet"
      destructive
      onCancel={() => setConfirmRecovery(false)}
      onConfirm={() => { setConfirmRecovery(false); void restoreRecovery(); }}
    />
    {status === 'loading' ? <ActivityIndicator size="large" color="#f8df94" /> : null}
    <Text style={styles.title}>{status === 'loading' ? 'Vérification du carnet…' : 'Restauration à reprendre'}</Text>
    <Text style={styles.description}>{status === 'loading'
      ? 'Les données locales sont vérifiées avant d’ouvrir l’application.'
      : `Une restauration n’a pas pu être terminée. Aucune donnée partiellement restaurée n’est chargée. ${error ?? ''}`}</Text>
    {status === 'error' ? <View style={styles.actions}>
      <Pressable accessibilityRole="button" onPress={() => setRetry((value) => value + 1)} style={styles.button}>
        <Text style={styles.buttonText}>Réessayer</Text>
      </Pressable>
      <Pressable accessibilityRole="button" onPress={() => setConfirmRecovery(true)} style={styles.secondaryButton}>
        <Text style={styles.secondaryText}>Reprendre la copie de secours</Text>
      </Pressable>
    </View> : null}
  </View>;
}

const styles = StyleSheet.create({
  screen: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 16, padding: 24, backgroundColor: '#080808' },
  title: { color: '#fff', fontSize: 23, fontWeight: '900', textAlign: 'center' },
  description: { color: '#ccc', fontSize: 14, lineHeight: 21, textAlign: 'center' },
  actions: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 10 },
  button: { minHeight: 45, borderRadius: 14, paddingHorizontal: 16, justifyContent: 'center', backgroundColor: '#f8df94' },
  buttonText: { color: '#111', fontWeight: '900' },
  secondaryButton: { minHeight: 45, borderRadius: 14, paddingHorizontal: 16, justifyContent: 'center', backgroundColor: '#333' },
  secondaryText: { color: '#fff', fontWeight: '800' },
});
