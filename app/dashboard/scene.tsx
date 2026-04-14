import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { liveBattleCards, shortcutCards, upcomingBattleCards } from '../_shared/data';
import { appRoutes, detailRoute, mapRoute } from '../_shared/routes';
import { BattleTile, BottomDock, ShortcutTile, UpcomingTile } from '../_shared/ui';
import { styles } from './styles';

export function DashboardScene() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'left', 'right']}>
      <DarkBackdrop />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        <View style={styles.topBar}>
          <Pressable onPress={() => router.push(appRoutes.discover)} style={styles.iconButton}>
            <Feather name="menu" size={28} color="#ffffff" />
          </Pressable>

          <View style={styles.avatarCircle}>
            <Text style={styles.avatarText}>S</Text>
          </View>
        </View>

        <Text style={styles.greeting}>
          <Text style={styles.greetingMuted}>Salut !</Text> Stanly
        </Text>
        <Text style={styles.subheading}>Bon retour dans ton Pok\u00e9dex</Text>

        <View style={styles.shortcutsGrid}>
          {shortcutCards.map((card) => (
            <ShortcutTile
              key={card.title}
              card={card}
              onPress={() =>
                router.push(card.icon === 'locations' ? mapRoute() : appRoutes.discover)
              }
            />
          ))}
        </View>

        <SectionHeader title="Combats en direct" />
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.horizontalRow}
        >
          {liveBattleCards.map((card) => (
            <BattleTile
              key={card.title}
              card={card}
              onPress={() => router.push(detailRoute(card.featured[0]))}
            />
          ))}
        </ScrollView>

        <SectionHeader title="\u00c0 venir" />
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.horizontalRow}
        >
          {upcomingBattleCards.map((card) => (
            <UpcomingTile
              key={card.title}
              card={card}
              onPress={() => router.push(detailRoute(card.featured[0]))}
            />
          ))}
        </ScrollView>
      </ScrollView>

      <BottomDock
        onMapPress={() => router.replace(appRoutes.map)}
        onHomePress={() => router.replace(appRoutes.dashboard)}
        onDiscoverPress={() => router.replace(appRoutes.discover)}
      />
    </SafeAreaView>
  );
}

function SectionHeader({ title }: { title: string }) {
  return <Text style={styles.sectionTitle}>{title}</Text>;
}

function DarkBackdrop() {
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
