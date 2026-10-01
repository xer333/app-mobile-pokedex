import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { FlatList, Pressable, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAdventure } from '../_shared/adventure';
import { findResourceConflicts, getGoalProgress, type GoalConstraint } from '../_shared/planning';
import { usePlanning } from '../_shared/planning-provider';
import { styles } from './styles';

const constraintOptions: Array<{ key: GoalConstraint; label: string }> = [
  { key: 'no-trade', label: 'Sans échange' },
  { key: 'no-transfer', label: 'Sans transfert' },
  { key: 'keep-stages', label: 'Conserver chaque stade' },
  { key: 'owned-only', label: 'Seulement mes exemplaires' },
];

export function PlannerScene() {
  const router = useRouter();
  const { activeGame } = useAdventure();
  const planning = usePlanning();
  const [goalTitle, setGoalTitle] = useState('');
  const [drafts, setDrafts] = useState<Record<string, { label: string; resource: string }>>({});
  const conflicts = useMemo(() => findResourceConflicts(planning.goals), [planning.goals]);

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'left', 'right']}>
      <FlatList
        data={planning.goals}
        keyExtractor={(goal) => goal.id}
        contentContainerStyle={styles.content}
        ListHeaderComponent={
          <View style={{ gap: 18 }}>
            <View style={styles.header}>
              <Pressable onPress={() => router.back()} style={styles.iconButton}>
                <Feather name="arrow-left" size={22} color="#fff" />
              </Pressable>
              <Text style={styles.title}>Mes objectifs</Text>
              <View style={styles.iconButton} />
            </View>
            <Text style={styles.subtitle}>
              Les tâches sont tes déclarations. L’application signale les conflits mais ne prétend
              pas calculer un chemin optimal sans données vérifiées.
            </Text>
            <View style={styles.composer}>
              <TextInput
                value={goalTitle}
                onChangeText={setGoalTitle}
                placeholder="Ex. Compléter la famille d’Évoli"
                placeholderTextColor="#666"
                style={styles.input}
              />
              <Pressable
                onPress={() => {
                  if (planning.addGoal(goalTitle, activeGame.id)) setGoalTitle('');
                }}
                style={styles.button}
              >
                <Text style={styles.buttonText}>Créer pour {activeGame.shortLabel}</Text>
              </Pressable>
            </View>
            {conflicts.length > 0 ? (
              <View style={styles.conflictCard}>
                <Text style={styles.conflictTitle}>Ressources partagées à arbitrer</Text>
                {conflicts.map((conflict) => (
                  <Text key={conflict.resourceKey} style={styles.conflictText}>
                    {conflict.resourceKey} · {conflict.entries.length} tâches dans plusieurs objectifs
                  </Text>
                ))}
              </View>
            ) : null}
          </View>
        }
        renderItem={({ item: goal }) => {
          const progress = getGoalProgress(goal);
          const draft = drafts[goal.id] ?? { label: '', resource: '' };
          return (
            <View style={styles.goalCard}>
              <View style={styles.goalTop}>
                <View style={styles.goalCopy}>
                  <Text style={styles.goalTitle}>{goal.title}</Text>
                  <Text style={styles.goalMeta}>
                    {progress.done}/{progress.total} tâches · contexte {goal.gameId}
                  </Text>
                </View>
                <Pressable onPress={() => planning.removeGoal(goal.id)}>
                  <Text style={styles.removeText}>Supprimer</Text>
                </Pressable>
              </View>
              <View style={styles.progressTrack}>
                <View style={[styles.progressFill, { width: `${progress.ratio * 100}%` }]} />
              </View>
              <View style={styles.chips}>
                {constraintOptions.map((constraint) => {
                  const active = goal.constraints.includes(constraint.key);
                  return (
                    <Pressable
                      key={constraint.key}
                      onPress={() => planning.toggleConstraint(goal.id, constraint.key)}
                      style={[styles.chip, active && styles.chipActive]}
                    >
                      <Text style={[styles.chipText, active && styles.chipTextActive]}>{constraint.label}</Text>
                    </Pressable>
                  );
                })}
              </View>
              {goal.tasks.map((task) => (
                <View key={task.id} style={styles.task}>
                  <Pressable
                    onPress={() => planning.toggleTask(goal.id, task.id)}
                    style={[styles.checkbox, task.done && styles.checkboxDone]}
                  >
                    {task.done ? <Feather name="check" size={15} color="#111" /> : null}
                  </Pressable>
                  <View style={styles.taskCopy}>
                    <Text style={[styles.taskText, task.done && styles.taskTextDone]}>{task.label}</Text>
                    <Text style={styles.taskMeta}>
                      {task.resourceKey ? `Ressource : ${task.resourceKey}` : 'Aucune ressource réservée'} · déclaré
                    </Text>
                  </View>
                  <Pressable onPress={() => planning.removeTask(goal.id, task.id)}>
                    <Feather name="x" size={18} color="#999" />
                  </Pressable>
                </View>
              ))}
              <View style={styles.taskComposer}>
                <TextInput
                  value={draft.label}
                  onChangeText={(label) => setDrafts((current) => ({ ...current, [goal.id]: { ...draft, label } }))}
                  placeholder="Nouvelle tâche"
                  placeholderTextColor="#666"
                  style={styles.input}
                />
                <View style={styles.twoColumns}>
                  <TextInput
                    value={draft.resource}
                    onChangeText={(resource) => setDrafts((current) => ({ ...current, [goal.id]: { ...draft, resource } }))}
                    placeholder="Ressource facultative"
                    placeholderTextColor="#666"
                    style={[styles.input, styles.flexInput]}
                  />
                  <Pressable
                    onPress={() => {
                      planning.addTask(goal.id, draft.label, draft.resource || null);
                      setDrafts((current) => ({ ...current, [goal.id]: { label: '', resource: '' } }));
                    }}
                    style={styles.button}
                  >
                    <Text style={styles.buttonText}>Ajouter</Text>
                  </Pressable>
                </View>
              </View>
            </View>
          );
        }}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyText}>Crée un objectif, ajoute ses tâches puis précise tes contraintes.</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}
