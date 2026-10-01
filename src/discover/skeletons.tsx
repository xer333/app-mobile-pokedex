import { useEffect } from 'react';
import { View, type StyleProp, type ViewStyle } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

import { styles } from './styles';

export function DiscoverHeaderSkeleton() {
  return (
    <View>
      <View style={styles.topBar}>
        <SkeletonBlock style={styles.skeletonIconButton} />
        <SkeletonBlock style={styles.skeletonAvatar} />
      </View>

      <View style={styles.skeletonTitleBlock}>
        <SkeletonBlock style={styles.skeletonTitleLineLarge} />
        <SkeletonBlock style={styles.skeletonTitleLineSmall} />
        <SkeletonBlock style={[styles.skeletonTitleLineSmall, { width: '74%' }]} />
      </View>

      <View style={styles.skeletonSearchShell}>
        <SkeletonBlock style={styles.skeletonSearchLine} />
      </View>

      {Array.from({ length: 3 }).map((_, index) => (
        <View key={`skeleton-filter-${index}`} style={styles.skeletonFilterGroup}>
          <SkeletonBlock style={styles.skeletonFilterTitle} />
          <View style={styles.skeletonFilterRow}>
            <SkeletonBlock style={[styles.skeletonChip, { width: 76 }]} />
            <SkeletonBlock style={[styles.skeletonChip, { width: 112 }]} />
            <SkeletonBlock style={[styles.skeletonChip, { width: 134 }]} />
          </View>
        </View>
      ))}

      <View style={styles.skeletonResultsHeader}>
        <SkeletonBlock style={styles.skeletonResultsTitle} />
        <SkeletonBlock style={styles.skeletonResultsCount} />
      </View>
    </View>
  );
}

export function DiscoverCardSkeleton() {
  return (
    <View style={styles.skeletonCardShell}>
      <View style={styles.skeletonCard}>
        <SkeletonBlock style={styles.skeletonBadge} />
        <SkeletonBlock style={styles.skeletonImage} />

        <View style={styles.skeletonFooterRow}>
          <View style={{ flex: 1 }}>
            <SkeletonBlock style={styles.skeletonFooterText} />
            <SkeletonBlock style={styles.skeletonFooterMeta} />
          </View>
          <SkeletonBlock style={styles.skeletonArrow} />
        </View>
      </View>
    </View>
  );
}

function SkeletonBlock({ style }: { style: StyleProp<ViewStyle> }) {
  const opacity = useSharedValue(0.48);

  useEffect(() => {
    opacity.value = withRepeat(withTiming(0.95, { duration: 900 }), -1, true);
  }, [opacity]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      style={[
        {
          backgroundColor: 'rgba(255,255,255,0.14)',
        },
        style,
        animatedStyle,
      ]}
    />
  );
}
