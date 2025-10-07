import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  StatusBar,
} from 'react-native';
import { Ionicons } from "@react-native-vector-icons/ionicons";
import { useNavigation } from '@react-navigation/native';

const data = [
  {
    id: '1',
    name: 'Golden Retriever',
    price: 'PKR 50,000',
    category: 'Dog',
    date: '2025-09-28',
    image: 'https://placedog.net/400/400?id=1',
  },
  {
    id: '2',
    name: 'Persian Cat',
    price: 'PKR 35,000',
    category: 'Cat',
    date: '2025-09-27',
    image: 'https://placekitten.com/400/400',
  },
  {
    id: '3',
    name: 'Parrot',
    price: 'PKR 12,000',
    category: 'Bird',
    date: '2025-09-26',
    image: 'https://picsum.photos/400/400?random=1',
  },
  {
    id: '4',
    name: 'German Shepherd',
    price: 'PKR 60,000',
    category: 'Dog',
    date: '2025-09-25',
    image: 'https://placedog.net/400/400?id=2',
  },
];

const Listings = () => {
  const [search, setSearch] = useState('');
  const navigation = useNavigation();

  const filteredData = data.filter((item) =>
    item.name.toLowerCase().includes(search.toLowerCase())
  );

  const renderItem = ({ item }: { item: typeof data[0] }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => navigation.navigate('ListingDetail' as never, { item } as never)}
      activeOpacity={0.8}
    >
      <View style={styles.imageWrapper}>
        <Image source={{ uri: item.image }} style={styles.image} />
        <View style={styles.priceTag}>
          <Text style={styles.priceText}>{item.price}</Text>
        </View>
      </View>
      <View style={styles.cardContent}>
        <Text style={styles.petName}>{item.name}</Text>
        <View style={styles.metaRow}>
          <View style={styles.categoryBadge}>
            <Ionicons name="paw-outline" size={12} color="#f1641e" />
            <Text style={styles.category}>{item.category}</Text>
          </View>
          <Text style={styles.date}>{item.date}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#f1641e" />

      {/* Header */}
      

      {/* Grid */}
      <FlatList
        data={filteredData}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle={styles.row}
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      />

      {/* Floating Add Button */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('CreateListing' as never)}
        activeOpacity={0.9}
      >
        <Ionicons name="add" size={28} color="#fff" />
      </TouchableOpacity>
    </View>
  );
};

export default Listings;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingHorizontal: 10,
  },
  header: {
    backgroundColor: '#f1641e',
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 15,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    elevation: 3,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 16,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  searchBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    elevation: 2,
  },
  searchInput: {
    marginLeft: 8,
    flex: 1,
    fontSize: 14,
    color: '#333',
  },
  filterBtn: {
    marginLeft: 10,
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 12,
    elevation: 3,
  },
  row: {
    justifyContent: 'space-between',
    marginTop: 10,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    marginBottom: 15,
    flex: 1,
    marginHorizontal: 5,
    overflow: 'hidden',
  },
  imageWrapper: {
    position: 'relative',
  },
  image: {
    width: '100%',
    height: 150,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  priceTag: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    backgroundColor: '#f1641e',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  priceText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  cardContent: {
    padding: 12,
  },
  petName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 6,
    alignItems: 'center',
  },
  categoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff5f0',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  category: {
    fontSize: 12,
    color: '#f1641e',
    fontWeight: '500',
    marginLeft: 4,
  },
  date: {
    fontSize: 12,
    color: '#999',
  },
  fab: {
    position: 'absolute',
    bottom: 25,
    right: 25,
    backgroundColor: '#f1641e',
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 6,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
  },
});
