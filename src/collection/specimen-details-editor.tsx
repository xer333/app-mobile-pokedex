import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import {
  createSpecimenDetailsDraft,
  parseSpecimenDetailsDraft,
  type SpecimenDetailsDraft,
} from '../_shared/specimen-details';
import type { PokemonSpecimen } from '../_shared/specimens';

export function SpecimenDetailsEditor({ specimen, onSave, onClose }: {
  specimen: PokemonSpecimen;
  onSave: (changes: Partial<PokemonSpecimen>) => void;
  onClose: () => void;
}) {
  const [draft, setDraft] = useState(() => createSpecimenDetailsDraft(specimen));
  const [error, setError] = useState<string | null>(null);
  const change = (key: keyof SpecimenDetailsDraft, value: string) => {
    setDraft((current) => ({ ...current, [key]: value }));
    setError(null);
  };
  const save = () => {
    try {
      onSave(parseSpecimenDetailsDraft(draft));
      onClose();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Détails invalides.');
    }
  };

  return (
    <View style={styles.panel}>
      <Text style={styles.title}>Passeport et rangement déclarés</Text>
      <Text style={styles.hint}>Ces informations viennent de toi ; l’application ne lit pas les boîtes du jeu.</Text>
      <Field label="Surnom" value={draft.nickname} onChangeText={(value) => change('nickname', value)} maxLength={60} />
      <View style={styles.row}>
        <View style={styles.flex}>
          <Field label="Boîte" value={draft.boxName} onChangeText={(value) => change('boxName', value)} maxLength={60} />
        </View>
        <View style={styles.slot}>
          <Field label="Emplacement" value={draft.boxSlot} onChangeText={(value) => change('boxSlot', value)} keyboardType="number-pad" maxLength={5} />
        </View>
      </View>
      <View style={styles.row}>
        <View style={styles.flex}>
          <Field label="Ball" value={draft.ball} onChangeText={(value) => change('ball', value)} maxLength={60} />
        </View>
        <View style={styles.flex}>
          <Field label="Langue" value={draft.language} onChangeText={(value) => change('language', value)} maxLength={30} />
        </View>
      </View>
      <Field label="Lieu ou provenance" value={draft.obtainedPlace} onChangeText={(value) => change('obtainedPlace', value)} maxLength={120} />
      <Text style={styles.label}>Notes</Text>
      <TextInput
        multiline
        value={draft.notes}
        onChangeText={(value) => change('notes', value)}
        maxLength={1000}
        placeholder="Repères personnels, sans vérification automatique"
        placeholderTextColor="#777"
        style={[styles.input, styles.notes]}
      />
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <View style={styles.row}>
        <Pressable accessibilityRole="button" onPress={onClose} style={[styles.button, styles.cancel]}>
          <Text style={styles.cancelText}>Annuler</Text>
        </Pressable>
        <Pressable accessibilityRole="button" onPress={save} style={styles.button}>
          <Text style={styles.buttonText}>Enregistrer</Text>
        </Pressable>
      </View>
    </View>
  );
}

function Field({ label, value, onChangeText, maxLength, keyboardType }: {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  maxLength: number;
  keyboardType?: 'number-pad';
}) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        maxLength={maxLength}
        keyboardType={keyboardType}
        placeholderTextColor="#777"
        style={styles.input}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  panel: { gap: 10, padding: 12, borderRadius: 17, backgroundColor: '#202020' },
  title: { color: '#fff', fontSize: 15, fontWeight: '800' },
  hint: { color: '#aaa', fontSize: 12, lineHeight: 18 },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  flex: { flex: 1, minWidth: 120 },
  slot: { width: 115 },
  field: { gap: 4 },
  label: { color: '#ddd', fontSize: 12, fontWeight: '700' },
  input: { minHeight: 42, paddingHorizontal: 10, borderRadius: 12, color: '#fff', backgroundColor: '#101010' },
  notes: { minHeight: 80, paddingVertical: 10, textAlignVertical: 'top' },
  error: { color: '#ffadad', fontSize: 12 },
  button: { minHeight: 42, justifyContent: 'center', paddingHorizontal: 15, borderRadius: 13, backgroundColor: '#f8df94' },
  buttonText: { color: '#111', fontWeight: '800' },
  cancel: { backgroundColor: '#333' },
  cancelText: { color: '#fff', fontWeight: '800' },
});
