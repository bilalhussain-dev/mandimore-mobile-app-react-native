import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Dimensions,
} from 'react-native';

const { width } = Dimensions.get('window');

const categories = [
  { id: '1', name: 'Dogs', emoji: '🐶', count: 4 },
  { id: '2', name: 'Cats', emoji: '🐱', count: 2 },
  { id: '3', name: 'Birds', emoji: '🐦', count: 1 },
  { id: '4', name: 'Fish', emoji: '🐠', count: 3 },
  { id: '5', name: 'Rabbits', emoji: '🐰', count: 1 },
  { id: '6', name: 'Hamsters', emoji: '🐹', count: 2 },
  { id: '7', name: 'Turtles', emoji: '🐢', count: 1 },
  { id: '8', name: 'Horses', emoji: '🐴', count: 2 },
  { id: '9', name: 'Parrots', emoji: '🦜', count: 5 },
  { id: '10', name: 'Reptiles', emoji: '🦎', count: 1 },
  { id: '12', name: 'Frogs', emoji: '🐸', count: 1 },
  { id: '13', name: 'Guinea Pigs', emoji: '🐹', count: 2 },
  { id: '14', name: 'Ferrets', emoji: '🦦', count: 1 },
  { id: '15', name: 'Chickens', emoji: '🐔', count: 3 },
  { id: '16', name: 'Cows', emoji: '🐄', count: 1 },
  { id: '17', name: 'Sheep', emoji: '🐑', count: 2 },
  { id: '18', name: 'Goats', emoji: '🐐', count: 2 },
  { id: '19', name: 'Ducks', emoji: '🦆', count: 6 },
  { id: '20', name: 'Pigeons', emoji: '🕊️', count: 4 },
];

const CategoriesScreen = () => {
  const renderItem = ({ item }: { item: typeof categories[0] }) => (
    <TouchableOpacity style={styles.card}>
      {/* Count badge */}
      <View style={styles.badge}>
        <Text style={styles.badgeText}>{item.count}</Text>
      </View>
      <Text style={styles.emoji}>{item.emoji}</Text>
      <Text style={styles.name}>{item.name}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>🐾 Browse Categories</Text>
      <Text style={styles.subHeader}>Find what you’re looking for by category</Text>
      <FlatList
        data={categories}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle={styles.row}
        contentContainerStyle={{ paddingBottom: 20 }}
      />
    </View>
  );
};

export default CategoriesScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f7f7f7',
    paddingTop: 20,
    paddingHorizontal: 16,
  },
  header: {
    fontSize: 22,
    fontWeight: '700',
    color: '#222',
    textAlign: 'left',
  },
  subHeader: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
  },
  row: {
    justifyContent: 'space-between',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 14,
    paddingVertical: 20,
    paddingHorizontal: 15,
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    margin: 8,
    maxWidth: (width - 48) / 2, // 2 per row
    position: 'relative',
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  emoji: {
    fontSize: 32,
    marginBottom: 6,
  },
  name: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
  },
  badge: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: '#f1641e',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  badgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
  },
});
