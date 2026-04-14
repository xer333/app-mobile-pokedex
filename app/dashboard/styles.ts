import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#050505',
  },
  content: {
    paddingHorizontal: 28,
    paddingTop: 18,
    paddingBottom: 190,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 34,
  },
  iconButton: {
    width: 34,
    height: 34,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f8df94',
  },
  avatarText: {
    color: '#111111',
    fontSize: 18,
    fontWeight: '800',
  },
  greeting: {
    color: '#ffffff',
    fontSize: 42,
    fontWeight: '800',
    lineHeight: 48,
    letterSpacing: -1.4,
  },
  greetingMuted: {
    color: '#b9b9b9',
  },
  subheading: {
    color: '#7f7f7f',
    fontSize: 19,
    marginTop: 8,
    marginBottom: 28,
  },
  shortcutsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 16,
    marginBottom: 30,
  },
  sectionTitle: {
    color: '#ffffff',
    fontSize: 24,
    fontWeight: '800',
    letterSpacing: -0.6,
    marginBottom: 16,
  },
  horizontalRow: {
    paddingRight: 24,
    gap: 14,
    marginBottom: 30,
  },
  backdropStripe: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 56,
    backgroundColor: 'rgba(255,255,255,0.035)',
  },
});
