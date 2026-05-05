import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import {
  FlatList,
  Image,
  ImageBackground,
  Linking,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Animated, { FadeInUp, LinearTransition } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AccountAvatarButton } from '../_shared/account-ui';
import { useActivity } from '../_shared/activity';
import { appRoutes, mapRoute } from '../_shared/routes';
import { BottomDock } from '../_shared/ui';
import { getRegionMapAsset } from '../map/mapAssets';
import {
  getLocationAtlasRegion,
  locationAtlasRegions,
  type NamedPlaceKind,
} from './places';
import { styles } from './styles';

export function LocationsScene() {
  const router = useRouter();
  const [selectedRegionKey, setSelectedRegionKey] = useState('kanto');
  const [refreshing, setRefreshing] = useState(false);
  const { recordActivity } = useActivity();
  const selectedRegion = useMemo(
    () => getLocationAtlasRegion(selectedRegionKey),
    [selectedRegionKey],
  );
  const mapAsset = getRegionMapAsset(selectedRegion.key);
  const resolvedSource = Image.resolveAssetSource(mapAsset.image);
  const mapAspectRatio =
    resolvedSource?.width && resolvedSource?.height
      ? resolvedSource.width / resolvedSource.height
      : 1.45;
  const cityCount = selectedRegion.places.filter((place) => place.kind === 'city').length;
  const landmarkCount = selectedRegion.places.filter((place) => place.kind === 'landmark').length;

  useEffect(() => {
    recordActivity({
      route: appRoutes.locations,
      label: `Lieux de ${selectedRegion.title}`,
    });
  }, [recordActivity, selectedRegion.title]);

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'left', 'right']}>
      <LocationsBackdrop />

      <FlatList
        data={selectedRegion.places}
        keyExtractor={(item) => `${selectedRegion.key}-${item.label}`}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              setTimeout(() => setRefreshing(false), 260);
            }}
            tintColor="#ffffff"
            progressBackgroundColor="#1f1f1f"
          />
        }
        initialNumToRender={8}
        maxToRenderPerBatch={12}
        windowSize={5}
        ListHeaderComponent={
          <View>
            <View style={styles.header}>
              <Pressable
                onPress={() => router.replace(appRoutes.dashboard)}
                style={styles.iconButton}
              >
                <Feather name="arrow-left" size={22} color="#ffffff" />
              </Pressable>

              <AccountAvatarButton
                onPress={() => router.push(appRoutes.profile)}
                size={40}
                textSize={16}
              />
            </View>

            <View>
              <Text style={styles.title}>Lieux</Text>
              <Text style={styles.subtitle}>
                Un atlas dedie aux villes, villages et lieux nommes des jeux Pokemon. Ici, pas de
                points de capture: uniquement la geographie des regions.
              </Text>
            </View>

            <LinearGradient colors={selectedRegion.accent} style={styles.heroCard}>
              <View style={styles.heroGlow} />
              <View style={styles.heroContent}>
                <View style={styles.heroTopRow}>
                  <View style={styles.heroCopyColumn}>
                    <Text style={styles.heroEyebrow}>Carte active</Text>

                    <View style={styles.heroTitleBlock}>
                      <Text style={styles.heroTitle}>{selectedRegion.title}</Text>
                      <View style={styles.heroBadge}>
                        <Text style={styles.heroBadgeText}>{selectedRegion.gameLabel}</Text>
                      </View>
                    </View>

                    <Text style={styles.heroMeta}>{selectedRegion.summary}</Text>
                  </View>

                  <View style={styles.heroPreviewCard}>
                    <ImageBackground
                      source={mapAsset.image}
                      style={styles.heroPreviewImage}
                      imageStyle={styles.heroPreviewImageInner}
                    >
                      <View style={styles.heroPreviewShade} />
                      <View style={styles.heroPreviewCaption}>
                        <Text style={styles.heroPreviewCaptionText}>Atlas regional</Text>
                      </View>
                    </ImageBackground>
                  </View>
                </View>

                <View style={styles.heroLegendRow}>
                  <LegendChip color="#ffffff" label="Ville" />
                  <LegendChip color="#ffe49a" label="Village" />
                  <LegendChip color="#8de8ff" label="Lieu cle" />
                </View>

                <View style={styles.heroSummaryRow}>
                  <View style={styles.summaryPill}>
                    <Text style={styles.summaryPillText}>{selectedRegion.places.length} lieux nommes</Text>
                  </View>
                  <View style={styles.summaryPill}>
                    <Text style={styles.summaryPillText}>{cityCount} villes majeures</Text>
                  </View>
                  <View style={styles.summaryPill}>
                    <Text style={styles.summaryPillText}>
                      {landmarkCount > 0 ? `${landmarkCount} lieux cles` : 'Carte regionale'}
                    </Text>
                  </View>
                </View>

                <View style={styles.heroActionRow}>
                  <Pressable
                    onPress={() => router.push(mapRoute(undefined, selectedRegion.key))}
                    style={styles.heroButtonPrimary}
                  >
                    <Text style={styles.heroButtonText}>Ouvrir la carte des rencontres</Text>
                  </Pressable>

                  <Pressable
                    onPress={() => void Linking.openURL(mapAsset.sourceUrl)}
                    style={styles.heroButtonSecondary}
                  >
                    <Text style={styles.heroButtonText}>Voir la source</Text>
                  </Pressable>
                </View>
              </View>
            </LinearGradient>

            <View>
              <Text style={styles.sectionTitle}>Choisir une region</Text>

              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.chipRow}
              >
                {locationAtlasRegions.map((region) => (
                  <RegionChip
                    key={region.key}
                    active={region.key === selectedRegion.key}
                    label={region.title}
                    onPress={() => setSelectedRegionKey(region.key)}
                  />
                ))}
              </ScrollView>
            </View>

            <View style={styles.mapCard}>
              <ImageBackground
                source={mapAsset.image}
                style={[styles.mapCanvas, { aspectRatio: mapAspectRatio }]}
                imageStyle={styles.mapImage}
              >
                <View style={styles.mapShade} />
                {selectedRegion.places.map((place) => (
                  <MapMarker key={`${selectedRegion.key}-${place.label}`} place={place} />
                ))}
              </ImageBackground>

              <View style={styles.mapFooter}>
                <Text style={styles.mapVariantText}>{mapAsset.variantLabel}</Text>
                <Text style={styles.mapSourceText}>
                  Source visuelle: {mapAsset.sourceLabel}. Cette page sert de lecture geographique,
                  distincte de l&apos;atlas de rencontres.
                </Text>
                <Pressable
                  onPress={() => void Linking.openURL(mapAsset.sourceUrl)}
                  style={styles.mapSourceButton}
                >
                  <Text style={styles.mapSourceButtonText}>Ouvrir la source de la carte</Text>
                </Pressable>
              </View>
            </View>

            <Text style={styles.sectionTitle}>Villes et lieux cles</Text>
          </View>
        }
        renderItem={({ item, index }) => (
          <Animated.View
            entering={FadeInUp.delay(index * 20).duration(220)}
            layout={LinearTransition.springify().damping(20).stiffness(170)}
          >
            <View
              style={[
                styles.placeCard,
                item.kind === 'city' && styles.placeCardCity,
                item.kind === 'village' && styles.placeCardVillage,
                item.kind === 'landmark' && styles.placeCardLandmark,
              ]}
            >
              <View style={styles.placeCardTopRow}>
                <View>
                  <Text style={styles.placeCardTitle}>{item.label}</Text>
                  <Text style={styles.placeCardMeta}>{kindLabelMap[item.kind]}</Text>
                </View>

                <View style={styles.placeKindBadge}>
                  <Text style={styles.placeKindBadgeText}>{kindShortMap[item.kind]}</Text>
                </View>
              </View>
            </View>
          </Animated.View>
        )}
        ListFooterComponent={
          <View style={styles.infoCard}>
            <Text style={styles.infoTitle}>Difference avec Carte</Text>
            <Text style={styles.infoText}>
              `Lieux` te montre l&apos;organisation des regions et leurs noms importants.
              `Carte`, dans le menu du bas, reste l&apos;atlas specialise pour savoir ou rencontrer
              des Pokemon.
            </Text>
          </View>
        }
      />

      <BottomDock
        activeTab="none"
        onMapPress={() => router.replace(appRoutes.map)}
        onHomePress={() => router.replace(appRoutes.dashboard)}
        onDiscoverPress={() => router.replace(appRoutes.discover)}
      />
    </SafeAreaView>
  );
}

function RegionChip({
  active,
  label,
  onPress,
}: {
  active: boolean;
  label: string;
  onPress: () => void;
}) {
  return (
    <Pressable onPress={onPress} style={[styles.regionChip, active && styles.regionChipActive]}>
      <Text style={[styles.regionChipText, active && styles.regionChipTextActive]}>{label}</Text>
    </Pressable>
  );
}

function MapMarker({
  place,
}: {
  place: {
    label: string;
    kind: NamedPlaceKind;
    left: number;
    top: number;
  };
}) {
  return (
    <View style={[styles.markerWrap, { left: `${place.left}%`, top: `${place.top}%` }]}>
      <View
        style={[
          styles.markerDot,
          place.kind === 'village' && styles.markerDotVillage,
          place.kind === 'landmark' && styles.markerDotLandmark,
        ]}
      />
      <View style={styles.markerLabel}>
        <Text style={styles.markerLabelText}>{place.label}</Text>
      </View>
    </View>
  );
}

function LegendChip({
  color,
  label,
}: {
  color: string;
  label: string;
}) {
  return (
    <View style={styles.legendChip}>
      <View style={[styles.legendDot, { backgroundColor: color }]} />
      <Text style={styles.legendChipText}>{label}</Text>
    </View>
  );
}

const kindLabelMap: Record<NamedPlaceKind, string> = {
  city: 'Ville majeure',
  village: 'Village',
  landmark: 'Lieu cle',
};

const kindShortMap: Record<NamedPlaceKind, string> = {
  city: 'Ville',
  village: 'Village',
  landmark: 'Cle',
};

function LocationsBackdrop() {
  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      <LinearGradient
        colors={['#101010', '#222222', '#141414', '#242424', '#111111']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={StyleSheet.absoluteFill}
      />
      <View style={[styles.backdropStripe, { left: '18%' }]} />
      <View style={[styles.backdropStripe, { left: '44%' }]} />
      <View style={[styles.backdropStripe, { left: '70%' }]} />
    </View>
  );
}
