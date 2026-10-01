import { Pressable, StyleSheet, Text, type StyleProp, type ViewStyle } from 'react-native';

import { useAccount } from './account';

export function AccountAvatarButton({
  onPress,
  size = 42,
  textSize = 18,
  style,
}: {
  onPress: () => void;
  size?: number;
  textSize?: number;
  style?: StyleProp<ViewStyle>;
}) {
  const { initials } = useAccount();

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Ouvrir le profil"
      onPress={onPress}
      style={[
        styles.avatarCircle,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
        },
        style,
      ]}
    >
      <Text style={[styles.avatarText, { fontSize: textSize }]}>{initials}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  avatarCircle: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f8df94',
  },
  avatarText: {
    color: '#111111',
    fontWeight: '800',
  },
});
