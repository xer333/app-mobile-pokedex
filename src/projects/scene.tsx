import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { FlatList, Pressable, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAdventure } from '../_shared/adventure';
import {
  getCatalogPokemonBySlug,
  pokemonCatalog,
  pokemonCatalogGeneratedAt,
  pokemonGenerationFilters,
} from '../_shared/catalog';
import {
  createCollectionProject,
  createProjectTarget,
  getProjectProgress,
  previewProjectScopeRefresh,
  type ProjectCompletion,
  type ProjectTarget,
} from '../_shared/collection-projects';
import { useCollections } from '../_shared/collections';
import { ConfirmDialog } from '../_shared/confirm-dialog';
import { detailRoute } from '../_shared/routes';
import type { PokemonSpecimenOrigin } from '../_shared/specimens';
import { styles } from './styles';

type ShinyChoice = 'any' | 'yes' | 'no';

export function ProjectsScene() {
  const router = useRouter();
  const adventure = useAdventure();
  const collections = useCollections();
  const [title, setTitle] = useState('');
  const [completion, setCompletion] = useState<ProjectCompletion>('owned');
  const [generation, setGeneration] = useState('manual');
  const [shinyPreset, setShinyPreset] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [renamedTitle, setRenamedTitle] = useState('');
  const [targetQuery, setTargetQuery] = useState('');
  const [selectedSlug, setSelectedSlug] = useState('');
  const [formSlug, setFormSlug] = useState('');
  const [shiny, setShiny] = useState<ShinyChoice>('any');
  const [origin, setOrigin] = useState<PokemonSpecimenOrigin | null>(null);
  const [requiredCount, setRequiredCount] = useState('1');
  const [targetFilter, setTargetFilter] = useState<'missing' | 'all' | 'excluded'>('missing');
  const [deleteProjectId, setDeleteProjectId] = useState<string | null>(null);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [refreshGeneration, setRefreshGeneration] = useState<string | null>(null);
  const [refreshShiny, setRefreshShiny] = useState(false);
  const [scopePreview, setScopePreview] = useState<{
    projectId: string;
    signature: string;
    proposal: ReturnType<typeof previewProjectScopeRefresh>;
  } | null>(null);

  const projects = collections.projects.filter((project) => project.saveId === adventure.activeSaveId);
  const selectedProject = projects.find((project) => project.id === selectedProjectId) ?? projects[0];
  const progress = useMemo(() => selectedProject
    ? getProjectProgress(selectedProject, collections.specimens, adventure.activeSave.registeredSlugs)
    : null,
  [selectedProject, collections.specimens, adventure.activeSave.registeredSlugs]);
  const visibleTargets = useMemo(() => (progress?.targets ?? []).filter((row) =>
    targetFilter === 'all' || (targetFilter === 'excluded' ? row.target.excluded : row.missing > 0)),
  [progress, targetFilter]);
  const matches = useMemo(() => {
    const query = normalize(targetQuery);
    if (!query) return [];
    return pokemonCatalog.filter((pokemon) =>
      normalize(`${pokemon.nameFr} ${pokemon.nameEn} ${pokemon.id}`).includes(query)).slice(0, 6);
  }, [targetQuery]);
  const presetCount = generation === 'manual' ? 0
    : pokemonCatalog.filter((pokemon) => pokemon.generation === generation).length;

  useEffect(() => {
    setRenamedTitle(selectedProject?.title ?? '');
    setTargetFilter('missing');
    setRefreshGeneration(selectedProject?.scopeGeneration ?? null);
    setRefreshShiny(selectedProject?.scopeShiny ?? (selectedProject?.completion === 'owned'
      && selectedProject.targets.length > 0
      && selectedProject.targets.every((target) => target.shiny === true)));
    setScopePreview(null);
  }, [selectedProject?.id]);

  const createProject = () => {
    if (!adventure.isReady || !collections.isReady) return;
    const preset = generation === 'manual' ? [] : pokemonCatalog.filter((pokemon) => pokemon.generation === generation);
    const targets = preset.map((pokemon) => createProjectTarget(pokemon.slug, {
      shiny: completion === 'owned' && shinyPreset ? true : null,
      scopeSource: 'preset',
    }));
    const scopeLabel = generation === 'manual' ? 'Liste choisie manuellement'
      : `${pokemonGenerationFilters.find((option) => option.key === generation)?.label ?? generation} · référentiel national`;
    const scopeRevision = generation === 'manual' ? 'manual-v1' : `catalog:${pokemonCatalogGeneratedAt}`;
    const project = createCollectionProject(title, adventure.activeSaveId, adventure.activeGame.id,
      completion, scopeLabel, scopeRevision, targets, Date.now(), {
        generation: generation === 'manual' ? null : generation,
        shinyPreset: completion === 'owned' && shinyPreset,
      });
    collections.addProject(project);
    setSelectedProjectId(project.id);
    setTitle('');
    setFeedback(null);
  };

  const addTarget = () => {
    if (!selectedProject || !selectedSlug) return;
    const count = Number(requiredCount.trim());
    if (selectedProject.completion === 'owned' && (!Number.isInteger(count) || count < 1 || count > 99)) {
      setFeedback('La quantité doit être un entier de 1 à 99.');
      return;
    }
    const target = createProjectTarget(selectedSlug, selectedProject.completion === 'registered'
      ? { scopeSource: 'manual' }
      : {
          formSlug: formSlug.trim() || null,
          shiny: shiny === 'any' ? null : shiny === 'yes',
          origin,
          requiredCount: count,
          scopeSource: 'manual',
        });
    collections.addProjectTarget(selectedProject.id, target);
    setSelectedSlug('');
    setTargetQuery('');
    setFormSlug('');
    setShiny('any');
    setOrigin(null);
    setRequiredCount('1');
    setFeedback(null);
  };

  const updateTarget = (target: ProjectTarget, changes: Partial<ProjectTarget>) => {
    if (!selectedProject) return;
    collections.updateProject(selectedProject.id, {
      targets: selectedProject.targets.map((entry) => entry.id === target.id
        ? { ...entry, ...changes } : entry),
    });
  };

  const inspectScopeRefresh = () => {
    if (!selectedProject || !refreshGeneration || !adventure.isReady || !collections.isReady) return;
    const label = `${pokemonGenerationFilters.find((option) => option.key === refreshGeneration)?.label ?? refreshGeneration} · référentiel national`;
    try {
      const proposal = previewProjectScopeRefresh(selectedProject, refreshGeneration,
        pokemonCatalog, label, `catalog:${pokemonCatalogGeneratedAt}`, refreshShiny);
      setScopePreview({ projectId: selectedProject.id, signature: projectSignature(selectedProject), proposal });
      setFeedback(null);
    } catch (error) {
      setScopePreview(null);
      setFeedback(error instanceof Error ? error.message : 'Comparaison impossible.');
    }
  };

  const adoptScopeRefresh = () => {
    if (!selectedProject || !scopePreview || !adventure.isReady || !collections.isReady) return;
    if (scopePreview.projectId !== selectedProject.id
      || scopePreview.signature !== projectSignature(selectedProject)) {
      setScopePreview(null);
      setFeedback('Le projet a changé. Examine à nouveau le périmètre avant de l’adopter.');
      return;
    }
    const { nextProject } = scopePreview.proposal;
    collections.updateProject(selectedProject.id, {
      targets: nextProject.targets,
      scopeLabel: nextProject.scopeLabel,
      scopeRevision: nextProject.scopeRevision,
      scopeGeneration: nextProject.scopeGeneration,
      scopeShiny: nextProject.scopeShiny,
    });
    setScopePreview(null);
    setFeedback('Nouveau périmètre adopté. Les cibles personnalisées ont été conservées.');
  };

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'left', 'right']}>
      <ConfirmDialog
        visible={deleteProjectId !== null || deleteTargetId !== null}
        title={deleteProjectId ? 'Supprimer ce projet ?' : 'Retirer cette cible ?'}
        message={deleteProjectId
          ? 'La liste de cibles et son suivi seront perdus. Les exemplaires resteront dans ta collection.'
          : 'Cette cible sera retirée du périmètre. Tu peux aussi simplement l’exclure sans la supprimer.'}
        confirmLabel="Supprimer"
        destructive
        onCancel={() => { setDeleteProjectId(null); setDeleteTargetId(null); }}
        onConfirm={() => {
          if (deleteProjectId) {
            collections.removeProject(deleteProjectId);
            setSelectedProjectId(null);
          } else if (deleteTargetId && selectedProject) {
            collections.updateProject(selectedProject.id, {
              targets: selectedProject.targets.filter((target) => target.id !== deleteTargetId),
            });
          }
          setDeleteProjectId(null);
          setDeleteTargetId(null);
        }}
      />
      <FlatList
        data={visibleTargets}
        keyExtractor={(row) => row.target.id}
        contentContainerStyle={styles.content}
        ListHeaderComponent={
          <View style={styles.headerStack}>
            <View style={styles.header}>
              <Pressable accessibilityRole="button" onPress={() => router.back()} style={styles.iconButton}>
                <Feather name="arrow-left" size={22} color="#fff" />
              </Pressable>
              <Text style={styles.title}>Projets de collection</Text>
            </View>
            <Text style={styles.subtitle}>
              Partie active : {adventure.activeSave.name}. Une cible enregistrée au Pokédex n’est pas un exemplaire possédé ; une boîte prévue n’est pas non plus une possession.
            </Text>
            <View style={styles.card}>
              <Text style={styles.sectionTitle}>Créer un projet</Text>
              <TextInput value={title} onChangeText={setTitle} maxLength={80}
                placeholder="Ex. Living Dex de Kanto" placeholderTextColor="#777" style={styles.input} />
              <Text style={styles.label}>Ce qui compte</Text>
              <View style={styles.chips}>
                <Chip label="Exemplaires possédés" active={completion === 'owned'} onPress={() => setCompletion('owned')} />
                <Chip label="Espèces enregistrées" active={completion === 'registered'} onPress={() => { setCompletion('registered'); setShinyPreset(false); }} />
              </View>
              <Text style={styles.label}>Périmètre initial figé</Text>
              <View style={styles.chips}>
                <Chip label="Liste vide, à compléter" active={generation === 'manual'} onPress={() => setGeneration('manual')} />
                {pokemonGenerationFilters.map((option) => (
                  <Chip key={option.key} label={option.label} active={generation === option.key}
                    onPress={() => setGeneration(option.key)} />
                ))}
              </View>
              {generation !== 'manual' ? (
                <Text style={styles.hint}>{presetCount} espèces du référentiel national seront copiées dans le projet. Leur disponibilité dans {adventure.activeGame.shortLabel} n’est pas vérifiée.</Text>
              ) : null}
              {completion === 'owned' ? (
                <Chip label={shinyPreset ? 'Cibles chromatiques : oui' : 'Cibles chromatiques : non'}
                  active={shinyPreset} onPress={() => setShinyPreset((value) => !value)} />
              ) : null}
              <Pressable accessibilityRole="button" disabled={!adventure.isReady || !collections.isReady}
                onPress={createProject} style={styles.primaryButton}>
                <Text style={styles.primaryText}>Créer le projet</Text>
              </Pressable>
            </View>
            {projects.length > 0 ? (
              <View style={styles.chips}>
                {projects.map((project) => (
                  <Chip key={project.id} label={project.title} active={selectedProject?.id === project.id}
                    onPress={() => setSelectedProjectId(project.id)} />
                ))}
              </View>
            ) : null}
            {selectedProject && progress ? (
              <View style={styles.card}>
                <Text style={styles.sectionTitle}>{selectedProject.title}</Text>
                <Text style={styles.hint}>{selectedProject.scopeLabel} · instantané {selectedProject.scopeRevision}</Text>
                <Text style={styles.progress}>{progress.done}/{progress.total} besoins remplis</Text>
                <View style={styles.progressTrack}>
                  <View style={[styles.progressFill, { width: `${progress.ratio * 100}%` }]} />
                </View>
                <Text style={styles.hint}>Le dénominateur ne change pas avec une mise à jour du catalogue. Les ajouts et exclusions ci-dessous sont des décisions explicites.</Text>
                <Text style={styles.sectionTitle}>Comparer un nouveau périmètre</Text>
                <Text style={styles.hint}>Choisis une génération du référentiel national. L’aperçu montre les besoins ajoutés ou retirés avant toute modification ; il ne vérifie pas leur disponibilité dans {adventure.activeGame.shortLabel}.</Text>
                <View style={styles.chips}>
                  {pokemonGenerationFilters.map((option) => (
                    <Chip key={option.key} label={option.label} active={refreshGeneration === option.key}
                      onPress={() => { setRefreshGeneration(option.key); setScopePreview(null); }} />
                  ))}
                </View>
                {selectedProject.completion === 'owned' ? (
                  <Chip label={refreshShiny ? 'Nouvelles cibles : shiny' : 'Nouvelles cibles : chromatisme libre'}
                    active={refreshShiny} onPress={() => { setRefreshShiny((value) => !value); setScopePreview(null); }} />
                ) : null}
                <Pressable accessibilityRole="button" disabled={!refreshGeneration || !adventure.isReady || !collections.isReady}
                  onPress={inspectScopeRefresh} style={[styles.secondaryButton, !refreshGeneration && styles.disabled]}>
                  <Text style={styles.secondaryText}>Aperçu des changements</Text>
                </Pressable>
                {scopePreview?.projectId === selectedProject.id ? (
                  <View style={styles.scopePreview}>
                    <Text style={styles.sectionTitle}>Avant / après</Text>
                    <Text style={styles.hint}>
                      {progress.total} besoins actuellement · {getProjectProgress(scopePreview.proposal.nextProject,
                        collections.specimens, adventure.activeSave.registeredSlugs).total} après adoption
                    </Text>
                    <Text style={styles.hint}>
                      + {scopePreview.proposal.added.length} cible(s) · − {scopePreview.proposal.removed.length} cible(s) issues d’un préréglage
                    </Text>
                    {scopePreview.proposal.added.slice(0, 5).map((target) => (
                      <Text key={target.id} style={styles.hint}>+ {getCatalogPokemonBySlug(target.speciesSlug).nameFr}</Text>
                    ))}
                    {scopePreview.proposal.removed.slice(0, 5).map((target) => (
                      <Text key={target.id} style={styles.hint}>− {getCatalogPokemonBySlug(target.speciesSlug).nameFr}</Text>
                    ))}
                    {scopePreview.proposal.legacyUnclassified ? (
                      <Text style={styles.scopeWarning}>
                        {scopePreview.proposal.legacyUnclassified} ancienne(s) cible(s) sans origine connue sont conservées, même hors de la génération choisie. Retire-les manuellement si besoin.
                      </Text>
                    ) : null}
                    <Pressable accessibilityRole="button" onPress={adoptScopeRefresh} style={styles.primaryButton}>
                      <Text style={styles.primaryText}>Adopter ce périmètre</Text>
                    </Pressable>
                  </View>
                ) : null}
                <View style={styles.row}>
                  <TextInput value={renamedTitle} onChangeText={setRenamedTitle} maxLength={80}
                    style={[styles.input, styles.flex]} />
                  <Pressable accessibilityRole="button"
                    onPress={() => collections.updateProject(selectedProject.id, { title: renamedTitle.trim() })}
                    style={styles.secondaryButton}>
                    <Text style={styles.secondaryText}>Renommer</Text>
                  </Pressable>
                </View>
                <Pressable accessibilityRole="button" onPress={() => setDeleteProjectId(selectedProject.id)}>
                  <Text style={styles.deleteText}>Supprimer ce projet</Text>
                </Pressable>
                <Text style={styles.sectionTitle}>Ajouter une cible</Text>
                {selectedSlug ? (
                  <View style={styles.row}>
                    <Text style={[styles.label, styles.flex]}>{getCatalogPokemonBySlug(selectedSlug).nameFr}</Text>
                    <Pressable accessibilityRole="button" onPress={() => setSelectedSlug('')}>
                      <Text style={styles.link}>Changer</Text>
                    </Pressable>
                  </View>
                ) : (
                  <>
                    <TextInput value={targetQuery} onChangeText={setTargetQuery}
                      placeholder="Chercher une espèce" placeholderTextColor="#777" style={styles.input} />
                    {matches.map((pokemon) => (
                      <Pressable key={pokemon.slug} accessibilityRole="button"
                        onPress={() => { setSelectedSlug(pokemon.slug); setTargetQuery(''); }}
                        style={styles.searchResult}>
                        <Text style={styles.label}>{pokemon.nameFr} · #{pokemon.id}</Text>
                      </Pressable>
                    ))}
                  </>
                )}
                {selectedProject.completion === 'owned' ? (
                  <>
                    <TextInput value={formSlug} onChangeText={setFormSlug} autoCapitalize="none"
                      placeholder="Forme précise (facultatif, identifiant)" placeholderTextColor="#777" style={styles.input} />
                    <View style={styles.chips}>
                      {([['any', 'Chromatisme libre'], ['yes', 'Shiny'], ['no', 'Non shiny']] as const).map(([key, label]) => (
                        <Chip key={key} label={label} active={shiny === key} onPress={() => setShiny(key)} />
                      ))}
                    </View>
                    <View style={styles.chips}>
                      {([['any', 'Origine libre'], ['unspecified', 'Non renseignée'], ['captured', 'Capturé'], ['received', 'Reçu'], ['traded', 'Échangé']] as const).map(([key, label]) => (
                        <Chip key={key} label={label} active={(origin ?? 'any') === key}
                          onPress={() => setOrigin(key === 'any' ? null : key)} />
                      ))}
                    </View>
                    <TextInput value={requiredCount} onChangeText={setRequiredCount} keyboardType="number-pad"
                      placeholder="Quantité requise (1–99)" placeholderTextColor="#777" style={styles.input} />
                  </>
                ) : null}
                <Pressable accessibilityRole="button" disabled={!selectedSlug}
                  onPress={addTarget} style={[styles.primaryButton, !selectedSlug && styles.disabled]}>
                  <Text style={styles.primaryText}>Ajouter la cible</Text>
                </Pressable>
                {feedback ? <Text style={styles.error}>{feedback}</Text> : null}
                <Text style={styles.sectionTitle}>Cibles du projet</Text>
                <View style={styles.chips}>
                  <Chip label="Manquantes" active={targetFilter === 'missing'} onPress={() => setTargetFilter('missing')} />
                  <Chip label="Toutes" active={targetFilter === 'all'} onPress={() => setTargetFilter('all')} />
                  <Chip label="Exclues" active={targetFilter === 'excluded'} onPress={() => setTargetFilter('excluded')} />
                </View>
                <Text style={styles.hint}>{visibleTargets.length} cible{visibleTargets.length > 1 ? 's' : ''} dans cette vue</Text>
              </View>
            ) : null}
          </View>
        }
        renderItem={({ item: row }) => (
          <View style={styles.targetCard}>
            <View style={styles.row}>
              <View style={styles.flex}>
                <Text style={styles.targetName}>{getCatalogPokemonBySlug(row.target.speciesSlug).nameFr}</Text>
                <Text style={styles.hint}>{describeTarget(row.target)}</Text>
                <Text style={styles.targetCount}>{row.target.excluded ? 'Exclue' : `${row.done}/${row.target.requiredCount} rempli(s)`}</Text>
              </View>
              <Pressable accessibilityRole="button"
                onPress={() => router.push(detailRoute(row.target.speciesSlug))}>
                <Text style={styles.link}>Fiche</Text>
              </Pressable>
            </View>
            <View style={styles.chips}>
              <Chip label={row.target.excluded ? 'Réintégrer' : 'Exclure'} active={row.target.excluded}
                onPress={() => updateTarget(row.target, { excluded: !row.target.excluded })} />
              {selectedProject?.completion === 'owned' ? (
                <>
                  <Chip label="− 1 requis" active={false}
                    onPress={() => updateTarget(row.target, { requiredCount: Math.max(1, row.target.requiredCount - 1) })} />
                  <Chip label="+ 1 requis" active={false}
                    onPress={() => updateTarget(row.target, { requiredCount: Math.min(99, row.target.requiredCount + 1) })} />
                </>
              ) : null}
              <Pressable accessibilityRole="button" onPress={() => setDeleteTargetId(row.target.id)}>
                <Text style={styles.deleteText}>Retirer</Text>
              </Pressable>
            </View>
          </View>
        )}
        ListEmptyComponent={selectedProject ? (
          <View style={styles.empty}>
            <Text style={styles.hint}>{targetFilter === 'missing'
              ? 'Aucune cible manquante dans ce projet. Consulte « Toutes » ou ajoute une cible.'
              : 'Aucune cible dans cette vue.'}</Text>
          </View>
        ) : null}
      />
    </SafeAreaView>
  );
}

function Chip({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  return (
    <Pressable accessibilityRole="button" onPress={onPress}
      style={[styles.chip, active && styles.chipActive]}>
      <Text style={[styles.chipText, active && styles.chipTextActive]}>{label}</Text>
    </Pressable>
  );
}

function describeTarget(target: ProjectTarget) {
  return [target.speciesSlug, target.formSlug && `forme ${target.formSlug}`,
    target.shiny === true ? 'shiny' : target.shiny === false ? 'non shiny' : null,
    target.origin && `origine ${target.origin}`].filter(Boolean).join(' · ');
}

function normalize(value: string) {
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim().toLocaleLowerCase('fr-FR');
}

function projectSignature(project: ReturnType<typeof createCollectionProject>) {
  return JSON.stringify([project.scopeGeneration, project.scopeRevision, project.scopeShiny, project.targets]);
}
