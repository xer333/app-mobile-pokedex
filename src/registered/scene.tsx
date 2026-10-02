import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { FlatList, Image, Pressable, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAdventure } from '../_shared/adventure';
import { pokemonCatalog, pokemonGenerationFilters } from '../_shared/catalog';
import { useCollections } from '../_shared/collections';
import { buildDexStatuses, parseRegisteredList, type UnrecognizedRegistration } from '../_shared/registered-dex';
import { detailRoute } from '../_shared/routes';
import { styles } from './styles';

type DexView = 'missing' | 'registered-unowned' | 'owned-unregistered' | 'all';
type ImportPreview = {
  saveId: string;
  slugs: string[];
  duplicates: number;
  unrecognized: UnrecognizedRegistration[];
  newCount: number;
};

export function RegisteredDexScene() {
  const router = useRouter();
  const adventure = useAdventure();
  const collections = useCollections();
  const [generation, setGeneration] = useState('all');
  const [view, setView] = useState<DexView>('missing');
  const [query, setQuery] = useState('');
  const [importText, setImportText] = useState('');
  const [preview, setPreview] = useState<ImportPreview | null>(null);
  const [feedback, setFeedback] = useState<{ text: string; error: boolean } | null>(null);
  const [showImport, setShowImport] = useState(false);

  const statuses = useMemo(() => buildDexStatuses(
    pokemonCatalog,
    adventure.activeSave.registeredSlugs,
    collections.specimens,
    adventure.activeSaveId,
    adventure.activeGameId,
  ), [adventure.activeSave.registeredSlugs, adventure.activeSaveId, adventure.activeGameId, collections.specimens]);
  const scoped = useMemo(() => statuses.filter((row) =>
    generation === 'all' || row.species.generation === generation,
  ), [generation, statuses]);
  const visible = useMemo(() => {
    const term = normalize(query);
    return scoped.filter((row) => {
      if (view === 'missing' && row.registered) return false;
      if (view === 'registered-unowned' && (!row.registered || row.ownedCount > 0)) return false;
      if (view === 'owned-unregistered' && (row.registered || row.ownedCount === 0)) return false;
      return !term || normalize(`${row.species.nameFr} ${row.species.nameEn} ${row.species.slug} ${row.species.id}`).includes(term);
    });
  }, [query, scoped, view]);
  const registeredCount = scoped.filter((row) => row.registered).length;
  const ownedCount = scoped.filter((row) => row.ownedCount > 0).length;

  const inspectImport = () => {
    if (!adventure.isReady || !collections.isReady) {
      setFeedback({ text: 'Attends le chargement des données avant l’import.', error: true });
      return;
    }
    try {
      const parsed = parseRegisteredList(importText, pokemonCatalog);
      const registered = new Set(adventure.activeSave.registeredSlugs);
      setPreview({
        ...parsed,
        saveId: adventure.activeSaveId,
        newCount: parsed.slugs.filter((slug) => !registered.has(slug)).length,
      });
      setFeedback(null);
    } catch (error) {
      setPreview(null);
      setFeedback({ text: error instanceof Error ? error.message : 'Liste invalide.', error: true });
    }
  };

  const applyImport = () => {
    if (!preview || !adventure.isReady || !collections.isReady) return;
    if (preview.saveId !== adventure.activeSaveId) {
      setPreview(null);
      setFeedback({ text: 'La partie active a changé. Examine la liste à nouveau.', error: true });
      return;
    }
    const registered = new Set(adventure.activeSave.registeredSlugs);
    const currentNewCount = preview.slugs.filter((slug) => !registered.has(slug)).length;
    if (currentNewCount !== preview.newCount) {
      setPreview({ ...preview, newCount: currentNewCount });
      setFeedback({ text: 'Le Pokédex a changé. Vérifie le nouvel aperçu avant de confirmer.', error: true });
      return;
    }
    adventure.registerSlugs(preview.saveId, preview.slugs);
    setPreview(null);
    setFeedback({ text: `${currentNewCount} espèce${currentNewCount > 1 ? 's' : ''} ajoutée${currentNewCount > 1 ? 's' : ''} au Pokédex de cette partie. Aucun exemplaire n’a été créé.`, error: false });
  };

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'left', 'right']}>
      <FlatList
        data={visible}
        keyExtractor={(row) => row.species.slug}
        contentContainerStyle={styles.content}
        ListHeaderComponent={<View style={styles.headerStack}>
          <View style={styles.header}>
            <Pressable accessibilityRole="button" onPress={() => router.back()} style={styles.iconButton}>
              <Feather name="arrow-left" size={22} color="#fff" />
            </Pressable>
            <Text style={styles.title}>Pokédex de la partie</Text>
          </View>
          <Text style={styles.subtitle}>
            {adventure.activeSave.name} · {adventure.activeGame.label}. « Enregistré » signifie inscrit dans ton Pokédex déclaré ; « possédé » signifie qu’un exemplaire est actuellement dans cette partie. La liste ci-dessous vient du référentiel national : elle ne certifie pas la disponibilité dans ce jeu.
          </Text>
          <View style={styles.summary}>
            <Text style={styles.summaryText}>{registeredCount} enregistrées · {ownedCount} possédées · {scoped.length} espèces dans le périmètre affiché</Text>
          </View>
          <Text style={styles.sectionTitle}>Périmètre national</Text>
          <View style={styles.chips}>
            <Chip label="Toutes générations" active={generation === 'all'} onPress={() => setGeneration('all')} />
            {pokemonGenerationFilters.map((option) => (
              <Chip key={option.key} label={option.label} active={generation === option.key} onPress={() => setGeneration(option.key)} />
            ))}
          </View>
          <Text style={styles.sectionTitle}>Écart à examiner</Text>
          <View style={styles.chips}>
            <Chip label="Non enregistrées" active={view === 'missing'} onPress={() => setView('missing')} />
            <Chip label="Enregistrées, non possédées" active={view === 'registered-unowned'} onPress={() => setView('registered-unowned')} />
            <Chip label="Possédées, non enregistrées" active={view === 'owned-unregistered'} onPress={() => setView('owned-unregistered')} />
            <Chip label="Toutes" active={view === 'all'} onPress={() => setView('all')} />
          </View>
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Nom, slug ou numéro national…"
            placeholderTextColor="#888"
            style={styles.input}
          />
          <Text style={styles.count}>{visible.length} résultat{visible.length > 1 ? 's' : ''}</Text>
          <View style={styles.importCard}>
            <Pressable accessibilityRole="button" onPress={() => setShowImport(!showImport)} style={styles.secondaryButton}>
              <Text style={styles.secondaryText}>{showImport ? 'Masquer l’import' : 'Importer des espèces enregistrées'}</Text>
            </Pressable>
            {showImport ? <>
              <Text style={styles.hint}>Colle une espèce par ligne : nom français/anglais exact, slug ou numéro national. Un en-tête « species » est facultatif. Les lignes inconnues seront montrées dans l’aperçu et ignorées. Cet import n’ajoute aucun exemplaire.</Text>
              <TextInput
                multiline
                value={importText}
                onChangeText={(value) => { setImportText(value); setPreview(null); }}
                placeholder={'species\nÉvoli\n25'}
                placeholderTextColor="#777"
                style={styles.importInput}
              />
              <Pressable accessibilityRole="button" onPress={inspectImport} style={styles.primaryButton}>
                <Text style={styles.primaryText}>Examiner la liste</Text>
              </Pressable>
              {preview ? <View style={styles.preview}>
                <Text style={styles.sectionTitle}>Aperçu avant ajout</Text>
                <Text style={styles.hint}>{preview.newCount} nouvelle(s) · {preview.slugs.length - preview.newCount} déjà enregistrée(s) · {preview.duplicates} répétition(s) dans la liste · {preview.unrecognized.length} non reconnue(s)</Text>
                {preview.unrecognized.slice(0, 5).map((item) => (
                  <Text key={`${item.line}-${item.value}`} style={styles.error}>
                    Ligne {item.line} : « {item.value} » {item.reason === 'ambiguous' ? 'est ambigu' : 'est inconnu'}
                  </Text>
                ))}
                {preview.unrecognized.length > 5 ? <Text style={styles.error}>… et {preview.unrecognized.length - 5} autre(s) ligne(s) non reconnue(s).</Text> : null}
                {preview.slugs.length ? <Pressable accessibilityRole="button" onPress={applyImport} style={styles.primaryButton}>
                  <Text style={styles.primaryText}>Ajouter les espèces reconnues</Text>
                </Pressable> : null}
              </View> : null}
            </> : null}
            {feedback ? <Text style={feedback.error ? styles.error : styles.success}>{feedback.text}</Text> : null}
          </View>
        </View>}
        renderItem={({ item }) => {
          const pokemon = item.species;
          return <View style={styles.card}>
            <Image source={{ uri: pokemon.image }} style={styles.image} resizeMode="contain" />
            <View style={styles.cardCopy}>
              <Text style={styles.name}>#{pokemon.id} · {pokemon.nameFr}</Text>
              <Text style={styles.hint}>{item.registered ? 'Enregistré' : 'Non enregistré'} · {item.ownedCount} exemplaire{item.ownedCount > 1 ? 's' : ''} possédé{item.ownedCount > 1 ? 's' : ''}</Text>
              <View style={styles.actions}>
                <Pressable
                  accessibilityRole="button"
                  disabled={!adventure.isReady}
                  onPress={() => adventure.toggleRegistered(pokemon.slug)}
                  style={[styles.actionButton, item.registered && styles.actionActive, !adventure.isReady && styles.disabled]}
                >
                  <Text style={[styles.actionText, item.registered && styles.actionActiveText]}>
                    {item.registered ? 'Retirer du Pokédex' : 'Marquer enregistré'}
                  </Text>
                </Pressable>
                <Pressable accessibilityRole="button" onPress={() => router.push(detailRoute(pokemon.slug))} style={styles.actionButton}>
                  <Text style={styles.actionText}>Fiche</Text>
                </Pressable>
              </View>
            </View>
          </View>;
        }}
        ListEmptyComponent={<View style={styles.empty}><Text style={styles.hint}>Aucune espèce dans ce filtre. Change la génération, l’écart ou la recherche.</Text></View>}
      />
    </SafeAreaView>
  );
}

function Chip({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  return <Pressable accessibilityRole="button" onPress={onPress} style={[styles.chip, active && styles.chipActive]}>
    <Text style={[styles.chipText, active && styles.chipTextActive]}>{label}</Text>
  </Pressable>;
}

function normalize(value: string) {
  return value.trim().normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
}
