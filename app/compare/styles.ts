import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#050505',
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
    fontSize: 24,
    fontWeight: '800',
    flex: 1,
    textAlign: 'center',
  },
  compareRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 14,
  },
  compareCard: {
    flex: 1,
    borderRadius: 28,
    padding: 18,
    backgroundColor: 'rgba(255,255,255,0.05)',
    alignItems: 'center',
    gap: 12,
  },
  compareImage: {
    width: 140,
    height: 140,
    resizeMode: 'contain',
  },
  compareName: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '800',
    textAlign: 'center',
  },
  compareSubtext: {
    color: '#bcbcbc',
    fontSize: 13,
    textAlign: 'center',
  },
  compareTypeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 8,
  },
  typePill: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  typePillText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '700',
  },
  sectionCard: {
    borderRadius: 28,
    padding: 20,
    backgroundColor: 'rgba(255,255,255,0.05)',
    gap: 16,
  },
  sectionTitle: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '800',
  },
  statRow: {
    gap: 10,
  },
  statHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statLabel: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '700',
  },
  statValueRow: {
    flexDirection: 'row',
    gap: 18,
  },
  statValue: {
    color: '#d3d3d3',
    fontSize: 14,
    minWidth: 56,
  },
  statTracksRow: {
    flexDirection: 'row',
    gap: 12,
  },
  statTrack: {
    flex: 1,
    height: 8,
    borderRadius: 999,
    backgroundColor: '#303030',
    overflow: 'hidden',
  },
  statFill: {
    height: '100%',
    borderRadius: 999,
  },
  matchupRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  matchupColumn: {
    flex: 1,
    gap: 8,
  },
  matchupTitle: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
  },
  matchupWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  matchupPill: {
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  matchupText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '700',
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
