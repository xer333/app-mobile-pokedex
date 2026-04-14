import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#050505',
  },
  listContent: {
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
  title: {
    color: '#ffffff',
    fontSize: 34,
    fontWeight: '800',
    lineHeight: 42,
    letterSpacing: -1,
    maxWidth: 290,
    marginBottom: 10,
  },
  subtitle: {
    color: '#8d8d8d',
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 20,
  },
  searchShell: {
    height: 54,
    borderRadius: 18,
    backgroundColor: '#2a2a2a',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 18,
    marginBottom: 28,
  },
  searchInput: {
    flex: 1,
    color: '#ffffff',
    fontSize: 17,
  },
  gridRow: {
    justifyContent: 'space-between',
    marginBottom: 18,
  },
  emptyState: {
    marginTop: 18,
    padding: 24,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  emptyTitle: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 8,
  },
  emptyText: {
    color: '#b1b1b1',
    fontSize: 15,
    lineHeight: 22,
  },
  backdropStripe: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 56,
    backgroundColor: 'rgba(255,255,255,0.035)',
  },
});
