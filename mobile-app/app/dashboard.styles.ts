import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#f4f4f5',
  },
  content: {
    padding: 18,
    paddingTop: 10,
  },
  cardsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 18,
    marginHorizontal: 5,
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
  },
  statIcon: {
    marginBottom: 8,
  },
  statLabel: {
    fontSize: 15,
    color: '#888',
    marginBottom: 2,
  },
  statValue: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#2563eb',
  },
  statValueWarning: {
    color: '#eab308',
  },
  addButton: {
    position: 'absolute',
    bottom: 28,
    right: 28,
    backgroundColor: '#2563eb',
    borderRadius: 30,
    width: 60,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 6,
    shadowColor: '#2563eb',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.16,
    shadowRadius: 10,
    zIndex: 10,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 32,
    fontWeight: 'bold',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#222',
    marginBottom: 8,
    marginTop: 16,
  },
  upcomingCard: {
    padding: 14,
    borderRadius: 12,
    backgroundColor: '#f1f5f9',
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  upcomingIcon: {
    marginRight: 12,
  },
  upcomingInfo: {
    flex: 1,
  },
  upcomingTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#222',
  },
  upcomingMeta: {
    color: '#666',
    marginTop: 2,
    fontSize: 13,
  },
  badge: {
    backgroundColor: '#2563eb',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginLeft: 8,
  },
  badgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
});

export default styles;
