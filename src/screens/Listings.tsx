import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  StyleSheet,
  TextInput,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';

const data = [
  {
    id: '1',
    name: 'Golden Retriever',
    price: '$500',
    image: 'https://placedog.net/400/400?id=1',
  },
  {
    id: '2',
    name: 'Persian Cat',
    price: '$350',
    image: 'https://placekitten.com/400/400',
  },
  {
    id: '3',
    name: 'Parrot',
    price: '$120',
    image: 'https://picsum.photos/400/400?random=1',
  },
  {
    id: '4',
    name: 'German Shepherd',
    price: '$600',
    image: 'https://placedog.net/400/400?id=2',
  },
];

const Listings = () => {
  const [search, setSearch] = useState('');

  const filteredData = data.filter((item) =>
    item.name.toLowerCase().includes(search.toLowerCase())
  );

  const renderItem = ({ item }: { item: typeof data[0] }) => (
    <TouchableOpacity style={styles.card}>
      <Image source={{ uri: item.image }} style={styles.image} />
      <View style={styles.cardContent}>
        <Text style={styles.petName}>{item.name}</Text>
        <Text style={styles.price}>{item.price}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Header with Search + Filter */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Pet Listings</Text>
        <View style={styles.searchRow}>
          <View style={styles.searchBox}>
            <Ionicons name="search-outline" size={20} color="#888" />
            <TextInput
              placeholder="Search pets..."
              placeholderTextColor="#888"
              style={styles.searchInput}
              value={search}
              onChangeText={setSearch}
            />
          </View>
          <TouchableOpacity style={styles.filterBtn}>
            <Ionicons name="filter-outline" size={22} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Grid */}
      <FlatList
        data={filteredData}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle={styles.row}
        contentContainerStyle={{ paddingBottom: 20, paddingTop: 10 }}
      />
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
    paddingTop: 15,
    paddingBottom: 10,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#f1641e',
    marginBottom: 12,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  searchBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9f9f9',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  searchInput: {
    marginLeft: 8,
    flex: 1,
    fontSize: 14,
    color: '#333',
  },
  filterBtn: {
    marginLeft: 10,
    backgroundColor: '#f1641e',
    padding: 10,
    borderRadius: 12,
    elevation: 3,
  },
  row: {
    justifyContent: 'space-between',
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
  image: {
    width: '100%',
    height: 140,
  },
  cardContent: {
    padding: 12,
  },
  petName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  price: {
    fontSize: 14,
    color: '#f1641e',
    marginTop: 6,
    fontWeight: '500',
  },
});
