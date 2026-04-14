import { Image, Pressable, Text, View } from 'react-native';

import type {
  PokemonDamageBucket,
  PokemonDetailData,
  PokemonEvolutionStep,
  PokemonMoveSummary,
  PokemonVariantSummary,
} from '../_shared/pokeapi';
import { styles } from './styles';

export function AboutSection({ pokemon }: { pokemon: PokemonDetailData }) {
  const abilities =
    pokemon.abilities.length > 0 ? pokemon.abilities.join(', ') : 'Aucun talent connu';

  return (
    <View style={styles.sectionBody}>
      <View style={styles.typeRow}>
        {pokemon.types.map((type) => (
          <View key={type} style={styles.typeChip}>
            <Text style={styles.typeChipText}>{type}</Text>
          </View>
        ))}
      </View>

      {pokemon.speciesFlags.length > 0 ? (
        <View style={styles.flagRow}>
          {pokemon.speciesFlags.map((flag) => (
            <View key={flag} style={styles.flagChip}>
              <Text style={styles.flagChipText}>{flag}</Text>
            </View>
          ))}
        </View>
      ) : null}

      <InfoCard title={pokemon.genus} content={pokemon.description} />

      <View style={styles.infoGrid}>
        <InfoCell label="Habitat" value={pokemon.habitat} />
        <InfoCell label="Taille" value={pokemon.size} />
        <InfoCell label="Poids" value={pokemon.weight} />
        <InfoCell label="Exp. base" value={String(pokemon.baseExperience)} />
      </View>

      <View style={styles.infoGrid}>
        <InfoCell label="Génération" value={pokemon.generationLabel} />
        <InfoCell label="Croissance" value={pokemon.growthRate} />
      </View>

      <InfoCard title="Régions" content={pokemon.regions.join(' • ')} />
      <InfoCard title="Groupes d'œufs" content={pokemon.eggGroups.join(' • ')} />
      <InfoCard title="Répartition" content={pokemon.gender} />
      <InfoCard title="Talents" content={abilities} />

      {pokemon.varieties.length > 1 ? <VariantSection varieties={pokemon.varieties} /> : null}
      {pokemon.encounters.length > 0 ? <EncounterSection encounters={pokemon.encounters} /> : null}
    </View>
  );
}

export function StatsSection({ pokemon }: { pokemon: PokemonDetailData }) {
  return (
    <View style={styles.sectionBody}>
      <MatchupSection
        immunities={pokemon.immunities}
        resistances={pokemon.resistances}
        weaknesses={pokemon.weaknesses}
      />

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

export function MovesSection({
  onOpenMove,
  pokemon,
}: {
  onOpenMove: (moveSlug: string) => void;
  pokemon: PokemonDetailData;
}) {
  if (pokemon.moves.length === 0) {
    return (
      <View style={styles.sectionBody}>
        <Text style={styles.sectionIntro}>Aucune attaque n'a pu être chargée pour le moment.</Text>
      </View>
    );
  }

  return (
    <View style={styles.sectionBody}>
      {pokemon.moves.map((move) => (
        <MoveCard key={move.slug} move={move} onPress={() => onOpenMove(move.slug)} />
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
          ? "La chaîne d'évolution complète est disponible ci-dessous."
          : "Ce Pokémon n'a pas d'évolution supplémentaire connue."}
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

      {pokemon.evolutionSteps.length > 0 ? (
        <EvolutionStepsCard steps={pokemon.evolutionSteps} />
      ) : null}
    </View>
  );
}

function MatchupSection({
  immunities,
  resistances,
  weaknesses,
}: {
  immunities: PokemonDamageBucket[];
  resistances: PokemonDamageBucket[];
  weaknesses: PokemonDamageBucket[];
}) {
  return (
    <View style={styles.infoCard}>
      <Text style={styles.infoCardTitle}>Matchups</Text>

      <MatchupRow
        title="Faiblesses"
        items={weaknesses}
        emptyLabel="Aucune faiblesse marquée"
      />
      <MatchupRow
        title="Résistances"
        items={resistances}
        emptyLabel="Aucune résistance marquée"
      />
      <MatchupRow
        title="Immunités"
        items={immunities}
        emptyLabel="Aucune immunité"
      />
    </View>
  );
}

function MatchupRow({
  emptyLabel,
  items,
  title,
}: {
  emptyLabel: string;
  items: PokemonDamageBucket[];
  title: string;
}) {
  return (
    <View style={styles.matchupGroup}>
      <Text style={styles.matchupGroupTitle}>{title}</Text>
      <View style={styles.matchupWrap}>
        {items.length > 0 ? (
          items.map((item) => (
            <View key={`${title}-${item.type}`} style={styles.matchupChip}>
              <Text style={styles.matchupChipText}>
                {item.type} x{item.multiplier}
              </Text>
            </View>
          ))
        ) : (
          <Text style={styles.sectionIntro}>{emptyLabel}</Text>
        )}
      </View>
    </View>
  );
}

function VariantSection({ varieties }: { varieties: PokemonVariantSummary[] }) {
  return (
    <View style={styles.infoCard}>
      <Text style={styles.infoCardTitle}>Variantes et formes</Text>

      <View style={styles.variantList}>
        {varieties.map((variant) => (
          <View key={variant.slug} style={styles.variantCard}>
            <Image source={{ uri: variant.image }} style={styles.variantImage} />
            <View style={styles.variantTextWrap}>
              <Text style={styles.variantName}>{variant.name}</Text>
              <Text style={styles.variantMeta}>
                {variant.isDefault ? 'Forme de base' : 'Forme spéciale'}
              </Text>
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}

function EncounterSection({
  encounters,
}: {
  encounters: PokemonDetailData['encounters'];
}) {
  return (
    <View style={styles.infoCard}>
      <Text style={styles.infoCardTitle}>Lieux de rencontre</Text>

      <View style={styles.encounterList}>
        {encounters.map((encounter) => (
          <View key={encounter.location} style={styles.encounterCard}>
            <Text style={styles.encounterLocation}>{encounter.location}</Text>
            <Text style={styles.encounterVersions}>{encounter.versions.join(' • ')}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

function EvolutionStepsCard({ steps }: { steps: PokemonEvolutionStep[] }) {
  return (
    <View style={styles.infoCard}>
      <Text style={styles.infoCardTitle}>Conditions d'évolution</Text>

      <View style={styles.evolutionStepsList}>
        {steps.map((step) => (
          <View key={`${step.fromSlug}-${step.toSlug}`} style={styles.evolutionStepCard}>
            <Text style={styles.evolutionStepTitle}>
              {step.fromName} → {step.toName}
            </Text>
            <Text style={styles.evolutionStepText}>{step.description}</Text>
          </View>
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

function MoveCard({
  move,
  onPress,
}: {
  move: PokemonMoveSummary;
  onPress: () => void;
}) {
  return (
    <Pressable onPress={onPress} style={styles.moveCard}>
      <View style={styles.moveHeader}>
        <Text style={styles.moveName}>{move.name}</Text>
        <View style={styles.moveMetaPill}>
          <Text style={styles.moveMetaPillText}>{move.type}</Text>
        </View>
      </View>

      <View style={styles.moveMetaRow}>
        <MoveMeta label="Catégorie" value={move.category} />
        <MoveMeta label="Puissance" value={move.power} />
        <MoveMeta label="Précision" value={move.accuracy} />
        <MoveMeta label="PP" value={move.pp} />
        <MoveMeta
          label="Niveau"
          value={move.level !== null ? String(move.level) : '—'}
        />
      </View>
    </Pressable>
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
  evolution: PokemonDetailData['evolutions'][number];
  onPress: () => void;
}) {
  return (
    <Pressable onPress={onPress} style={styles.evolutionCard}>
      <Image source={{ uri: evolution.image }} style={styles.evolutionImage} />
      <Text style={styles.evolutionName}>{evolution.name}</Text>
    </Pressable>
  );
}
