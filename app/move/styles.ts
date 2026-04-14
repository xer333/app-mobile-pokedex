import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#0a0a0a',
  },
  content: {
    paddingHorizontal: 24,
    paddingTop: 18,
    paddingBottom: 36,
    gap: 18,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  iconButton: {
    width: 34,
    height: 34,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    color: '#ffffff',
    fontSize: 26,
    fontWeight: '800',
    textAlign: 'center',
    flex: 1,
  },
  heroCard: {
    borderRadius: 30,
    padding: 24,
    backgroundColor: 'rgba(255,255,255,0.05)',
    gap: 18,
  },
  heroMetaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  pill: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  pillText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '700',
  },
  effectCard: {
    borderRadius: 26,
    padding: 22,
    backgroundColor: 'rgba(255,255,255,0.05)',
    gap: 10,
  },
  sectionTitle: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '800',
  },
  effectText: {
    color: '#d2d2d2',
    fontSize: 15,
    lineHeight: 24,
  },
  statGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
  },
  statCell: {
    width: '47%',
    borderRadius: 22,
    padding: 16,
    backgroundColor: 'rgba(255,255,255,0.05)',
    gap: 6,
  },
  statLabel: {
    color: '#8c8c8c',
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  statValue: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '800',
  },
  loadingWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    paddingHorizontal: 32,
  },
  loadingText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'center',
  },
  errorText: {
    color: '#d6d6d6',
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
  },
});
