import { Image, Pressable, Text, View } from 'react-native';

import type {
  PokemonDetailData,
  PokemonEvolutionSummary,
  PokemonMoveSummary,
} from '../_shared/pokeapi';
import { styles } from './styles';

export function AboutSection({ pokemon }: { pokemon: PokemonDetailData }) {
  const abilities = pokemon.abilities.length > 0 ? pokemon.abilities.join(', ') : 'Aucun talent connu';

  return (
    <View style={styles.sectionBody}>
      <View style={styles.typeRow}>
        {pokemon.types.map((type) => (
          <View key={type} style={styles.typeChip}>
            <Text style={styles.typeChipText}>{type}</Text>
          </View>
        ))}
      </View>

      <InfoCard title={pokemon.genus} content={pokemon.description} />

      <View style={styles.infoGrid}>
        <InfoCell label="Habitat" value={pokemon.habitat} />
        <InfoCell label="Taille" value={pokemon.size} />
        <InfoCell label="Poids" value={pokemon.weight} />
        <InfoCell label="Exp. base" value={String(pokemon.baseExperience)} />
      </View>

      <InfoCard
        title="Talents"
        content={abilities}
      />
    </View>
  );
}

export function StatsSection({ pokemon }: { pokemon: PokemonDetailData }) {
  return (
    <View style={styles.sectionBody}>
      <View style={styles.statsList}>
        {pokemon.stats.map((stat) => (
          <View key={stat.label} style={styles.statRow}>
            <Text style={styles.statLabel}>{stat.label}</Text>
            <Text style={styles.statValue}>{stat.value}</Text>
            <View style={styles.statTrack}>
              <View
                style={[
                  styles.statFill,
                  { width: `${stat.fill}%`, backgroundColor: stat.color },
                ]}
              />
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}

export function MovesSection({ pokemon }: { pokemon: PokemonDetailData }) {
  if (pokemon.moves.length === 0) {
    return (
      <View style={styles.sectionBody}>
        <Text style={styles.sectionIntro}>Aucune attaque n'a pu \u00eatre charg\u00e9e pour le moment.</Text>
      </View>
    );
  }

  return (
    <View style={styles.sectionBody}>
      {pokemon.moves.map((move) => (
        <MoveCard key={move.name} move={move} />
      ))}
    </View>
  );
}

export function EvolutionsSection({
  pokemon,
  onOpenEvolution,
}: {
  pokemon: PokemonDetailData;
  onOpenEvolution: (slug: string) => void;
}) {
  return (
    <View style={styles.sectionBody}>
      <Text style={styles.sectionIntro}>
        {pokemon.evolutions.length > 1
          ? "La cha\u00eene d'\u00e9volution compl\u00e8te est disponible ci-dessous."
          : "Ce Pok\u00e9mon n'a pas d'\u00e9volution suppl\u00e9mentaire connue."}
      </Text>

      <View style={styles.evolutionList}>
        {pokemon.evolutions.map((evolution) => (
          <EvolutionCard
            key={evolution.slug}
            evolution={evolution}
            onPress={() => onOpenEvolution(evolution.slug)}
          />
        ))}
      </View>
    </View>
  );
}

function InfoCard({ title, content }: { title: string; content: string }) {
  return (
    <View style={styles.infoCard}>
      <Text style={styles.infoCardTitle}>{title}</Text>
      <Text style={styles.infoCardText}>{content}</Text>
    </View>
  );
}

function InfoCell({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.infoCell}>
      <Text style={styles.infoCellLabel}>{label}</Text>
      <Text style={styles.infoCellValue}>{value}</Text>
    </View>
  );
}

function MoveCard({ move }: { move: PokemonMoveSummary }) {
  return (
    <View style={styles.moveCard}>
      <View style={styles.moveHeader}>
        <Text style={styles.moveName}>{move.name}</Text>
        <View style={styles.moveMetaPill}>
          <Text style={styles.moveMetaPillText}>{move.type}</Text>
        </View>
      </View>

      <View style={styles.moveMetaRow}>
        <MoveMeta label="Cat\u00e9gorie" value={move.category} />
        <MoveMeta label="Puissance" value={move.power} />
        <MoveMeta label="Pr\u00e9cision" value={move.accuracy} />
        <MoveMeta label="PP" value={move.pp} />
      </View>
    </View>
  );
}

function MoveMeta({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.moveMetaItem}>
      <Text style={styles.moveMetaLabel}>{label}</Text>
      <Text style={styles.moveMetaValue}>{value}</Text>
    </View>
  );
}

function EvolutionCard({
  evolution,
  onPress,
}: {
  evolution: PokemonEvolutionSummary;
  onPress: () => void;
}) {
  return (
    <Pressable onPress={onPress} style={styles.evolutionCard}>
      <Image source={{ uri: evolution.image }} style={styles.evolutionImage} />
      <Text style={styles.evolutionName}>{evolution.name}</Text>
    </Pressable>
  );
}
