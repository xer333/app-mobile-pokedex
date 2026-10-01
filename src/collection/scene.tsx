import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import {
  FlatList,
  Image,
  Pressable,
  Share,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { gameOptions } from '../_shared/adventure';
import { ConfirmDialog } from '../_shared/confirm-dialog';
import { getCatalogPokemonBySlug } from '../_shared/catalog';
import {
  parseCollectionBackup,
  serializeCollectionBackup,
} from '../_shared/collection-backup';
import { useCollections } from '../_shared/collections';
import type { PokemonSpecimenOrigin } from '../_shared/specimens';
import { styles } from './styles';

const originOptions: Array<{ key: PokemonSpecimenOrigin; label: string }> = [
  { key: 'unspecified', label: 'Non renseignée' },
  { key: 'captured', label: 'Capturé' },
  { key: 'received', label: 'Reçu' },
  { key: 'traded', label: 'Échangé' },
];

export function CollectionScene() {
  const router = useRouter();
  const { importSpecimens, removeSpecimen, specimens, updateSpecimen } = useCollections();
  const [editorMode, setEditorMode] = useState<'closed' | 'export' | 'import'>('closed');
  const [editorValue, setEditorValue] = useState('');
  const [feedback, setFeedback] = useState<{ text: string; error: boolean } | null>(null);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  const [editingGameId, setEditingGameId] = useState<string | null>(null);
  const orderedSpecimens = useMemo(
    () => [...specimens].sort((left, right) => right.obtainedAt - left.obtainedAt),
    [specimens],
  );
  const shinyCount = specimens.filter((specimen) => specimen.shiny).length;
  const speciesCount = new Set(specimens.map((specimen) => specimen.speciesSlug)).size;

  const showExport = async () => {
    const serialized = serializeCollectionBackup(specimens);
    setEditorValue(serialized);
    setEditorMode('export');
    setFeedback(null);
    try {
      await Share.share({ message: serialized, title: 'Sauvegarde de ma collection' });
    } catch {
      setFeedback({ text: 'Le partage est indisponible. Le JSON reste sélectionnable ci-dessous.', error: true });
    }
  };

  const importBackup = () => {
    try {
      const backup = parseCollectionBackup(editorValue);
      const importedCount = importSpecimens(backup.specimens);
      setFeedback({
        text:
          importedCount > 0
            ? `${importedCount} exemplaire${importedCount > 1 ? 's' : ''} importé${importedCount > 1 ? 's' : ''}.`
            : 'Aucun nouvel exemplaire : les identifiants existaient déjà.',
        error: false,
      });
    } catch (error) {
      setFeedback({
        text: error instanceof Error ? error.message : 'Sauvegarde invalide.',
        error: true,
      });
    }
  };

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'left', 'right']}>
      <ConfirmDialog
        visible={pendingDeleteId !== null}
        title="Supprimer cet exemplaire ?"
        message="Les autres exemplaires de la même espèce seront conservés."
        confirmLabel="Supprimer"
        destructive
        onCancel={() => setPendingDeleteId(null)}
        onConfirm={() => {
          if (pendingDeleteId) removeSpecimen(pendingDeleteId);
          setPendingDeleteId(null);
        }}
      />
      <FlatList
        data={orderedSpecimens}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.content}
        ListHeaderComponent={
          <View style={{ gap: 18 }}>
            <View style={styles.header}>
              <Pressable onPress={() => router.back()} style={styles.iconButton}>
                <Feather name="arrow-left" size={22} color="#fff" />
              </Pressable>
              <Text style={styles.title}>Ma collection</Text>
              <View style={styles.iconButton} />
            </View>
            <Text style={styles.subtitle}>
              Les exemplaires sont indépendants des favoris. Une origine non renseignée n’est jamais
              interprétée comme une capture.
            </Text>
            <View style={styles.summary}>
              <Summary value={specimens.length} label="Exemplaires" />
              <Summary value={speciesCount} label="Espèces" />
              <Summary value={shinyCount} label="Shiny" />
            </View>
            <View style={styles.toolCard}>
              <Text style={styles.subtitle}>Sauvegarde des exemplaires uniquement : favoris, équipe, objectifs et chasses ne sont pas inclus.</Text>
              <View style={styles.toolRow}>
                <Button label="Exporter les exemplaires" onPress={showExport} />
                <Button
                  label="Importer des exemplaires"
                  secondary
                  onPress={() => {
                    setEditorMode('import');
                    setEditorValue('');
                    setFeedback(null);
                  }}
                />
              </View>
              {editorMode !== 'closed' ? (
                <>
                  <TextInput
                    multiline
                    editable={editorMode === 'import'}
                    value={editorValue}
                    onChangeText={setEditorValue}
                    placeholder={editorMode === 'import' ? 'Colle ici une sauvegarde JSON…' : ''}
                    placeholderTextColor="#666"
                    style={styles.editor}
                  />
                  {editorMode === 'import' ? (
                    <Button label="Valider l’import" onPress={importBackup} />
                  ) : null}
                </>
              ) : null}
              {feedback ? (
                <Text style={[styles.feedback, feedback.error && styles.error]}>{feedback.text}</Text>
              ) : null}
            </View>
            <Text style={styles.subtitle}>Exemplaires enregistrés</Text>
          </View>
        }
        renderItem={({ item }) => {
          const pokemon = getCatalogPokemonBySlug(item.speciesSlug);
          const game = gameOptions.find((option) => option.id === item.gameId);
          return (
            <View style={styles.card}>
              <View style={styles.cardTop}>
                <Image source={{ uri: pokemon.image }} style={styles.image} resizeMode="contain" />
                <View style={styles.cardCopy}>
                  <Text style={styles.name}>{pokemon.nameFr}{item.shiny ? ' ✨' : ''}</Text>
                  <Text style={styles.meta}>{item.formSlug}</Text>
                  <Text style={styles.meta}>
                    {game?.shortLabel ?? 'Jeu non reconnu'} · {new Date(item.obtainedAt).toLocaleDateString('fr-FR')}
                  </Text>
                </View>
              </View>
              <View style={styles.chips}>
                {originOptions.map((origin) => {
                  const active = item.origin === origin.key;
                  return (
                    <Pressable
                      key={origin.key}
                      onPress={() => updateSpecimen(item.id, { origin: origin.key })}
                      style={[styles.chip, active && styles.chipActive]}
                    >
                      <Text style={[styles.chipText, active && styles.chipTextActive]}>{origin.label}</Text>
                    </Pressable>
                  );
                })}
              </View>
              <View style={styles.chips}>
                <Pressable
                  accessibilityRole="button"
                  onPress={() => updateSpecimen(item.id, { shiny: !item.shiny })}
                  style={[styles.chip, item.shiny && styles.chipActive]}
                >
                  <Text style={[styles.chipText, item.shiny && styles.chipTextActive]}>
                    {item.shiny ? 'Chromatique : oui' : 'Chromatique : non'}
                  </Text>
                </Pressable>
                <Pressable
                  accessibilityRole="button"
                  onPress={() => setEditingGameId(editingGameId === item.id ? null : item.id)}
                  style={styles.chip}
                >
                  <Text style={styles.chipText}>Jeu : {game?.shortLabel ?? item.gameId} ▾</Text>
                </Pressable>
              </View>
              {editingGameId === item.id ? (
                <View style={styles.chips}>
                  {gameOptions.map((option) => (
                    <Pressable
                      key={option.id}
                      accessibilityRole="button"
                      onPress={() => {
                        updateSpecimen(item.id, { gameId: option.id });
                        setEditingGameId(null);
                      }}
                      style={[styles.chip, option.id === item.gameId && styles.chipActive]}
                    >
                      <Text style={[styles.chipText, option.id === item.gameId && styles.chipTextActive]}>
                        {option.label}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              ) : null}
              <Pressable
                accessibilityRole="button"
                onPress={() => setPendingDeleteId(item.id)}
                style={styles.deleteButton}
              >
                <Text style={styles.deleteText}>Supprimer cet exemplaire</Text>
              </Pressable>
            </View>
          );
        }}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyText}>
              Aucun exemplaire. Ouvre une fiche Pokémon et utilise « Ajouter un exemplaire ».
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

function Summary({ label, value }: { label: string; value: number }) {
  return (
    <View style={styles.summaryCard}>
      <Text style={styles.summaryValue}>{value}</Text>
      <Text style={styles.summaryLabel}>{label}</Text>
    </View>
  );
}

function Button({ label, onPress, secondary = false }: { label: string; onPress: () => void; secondary?: boolean }) {
  return (
    <Pressable onPress={onPress} style={[styles.button, secondary && styles.secondaryButton]}>
      <Text style={[styles.buttonText, secondary && styles.secondaryButtonText]}>{label}</Text>
    </Pressable>
  );
}
