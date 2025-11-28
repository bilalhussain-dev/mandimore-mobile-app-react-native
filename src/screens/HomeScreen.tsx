import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  Dimensions,
  ScrollView,
} from 'react-native';
import { Ionicons } from "@react-native-vector-icons/ionicons";
import LinearGradient from 'react-native-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import CreateListing from './CreateListing';

const { width } = Dimensions.get('window');

const categories = [
  { id: '1', name: 'Dogs', emoji: '🐶' },
  { id: '2', name: 'Cats', emoji: '🐱' },
  { id: '3', name: 'Birds', emoji: '🐦' },
  { id: '4', name: 'Fish', emoji: '🐠' },
  { id: '5', name: 'Rabbits', emoji: '🐇' },
];

const latestProducts = [
  { id: '1', name: 'Golden Retriever', price: '$250', image: 'https://place-puppy.com/200x200', category: 'Dog' },
  { id: '2', name: 'Persian Cat', price: '$180', image: 'https://placekitten.com/200/200', category: 'Cat' },
  { id: '3', name: 'Parrot', price: '$90', image: 'https://placebear.com/200/200', category: 'Bird' },
  { id: '4', name: 'Bulldog', price: '$220', image: 'https://place-puppy.com/210x210', category: 'Dog' },
];

const similarProducts = [
  { id: '7', name: 'German Shepherd', price: '$300', image: 'https://place-puppy.com/220x220' },
  { id: '8', name: 'Parakeet', price: '$70', image: 'https://placebear.com/220/220' },
  { id: '9', name: 'Bunny', price: '$90', image: 'https://placekitten.com/220/220' },
];

const HomeScreen = () => {
  const navigation = useNavigation();

  const renderCategory = ({ item }) => (
    <TouchableOpacity style={styles.categoryCard}>
      <Text style={styles.categoryEmoji}>{item.emoji}</Text>
      <Text style={styles.categoryText}>{item.name}</Text>
    </TouchableOpacity>
  );

  const renderGridProduct = ({ item }) => (
    <TouchableOpacity style={styles.productCard} activeOpacity={0.8}>
      <Image source={{ uri: item.image }} style={styles.productImage} />
      <TouchableOpacity style={styles.favoriteBtn} activeOpacity={0.7}>
        <Ionicons name="heart-outline" size={20} color="#f1641e" />
      </TouchableOpacity>

      <View style={styles.badge}>
        <Text style={styles.badgeText}>{item.category}</Text>
      </View>

      <View style={styles.productInfo}>
        <Text style={styles.productName} numberOfLines={1}>{item.name}</Text>
        <View style={styles.priceRow}>
          <Text style={styles.productPrice}>{item.price}</Text>
          <TouchableOpacity style={styles.cartBtn} activeOpacity={0.8}>
            <Ionicons name="cart-outline" size={18} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderSimilarProduct = ({ item }) => (
    <TouchableOpacity style={styles.similarCard} activeOpacity={0.8}>
      <Image source={{ uri: item.image }} style={styles.similarImage} />
      <View style={styles.similarInfo}>
        <Text style={styles.similarName} numberOfLines={1}>{item.name}</Text>
        <Text style={styles.similarPrice}>{item.price}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <LinearGradient colors={['#fff', '#ffe5d6']} style={styles.gradientContainer}>
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.welcome}>👋 Welcome Back!</Text>
            <Text style={styles.title}>Mandimore</Text>
          </View>
          <TouchableOpacity style={styles.notificationBtn}>
            <Ionicons name="notifications-outline" size={26} color="#f1641e" />
            <View style={styles.notificationDot} />
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
        <TouchableOpacity style={styles.searchBar} activeOpacity={0.7}>
          <Ionicons name="search-outline" size={20} color="#999" />
          <Text style={styles.searchText}>Search for pets...</Text>
          <Ionicons name="options-outline" size={20} color="#f1641e" />
        </TouchableOpacity>

        {/* Categories */}
        <Text style={styles.sectionTitle}>Categories</Text>
        <FlatList
          data={categories}
          renderItem={renderCategory}
          keyExtractor={(item) => item.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryList}
        />

        {/* Latest Products */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Latest Products</Text>
          <TouchableOpacity>
            <Text style={styles.seeAll}>See All</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.gridContainer}>
          {latestProducts.map((item) => renderGridProduct({ item }))}
        </View>

        {/* Featured Products */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Featured Products</Text>
          <TouchableOpacity>
            <Text style={styles.seeAll}>See All</Text>
          </TouchableOpacity>
        </View>
        <FlatList
          data={similarProducts}
          renderItem={renderSimilarProduct}
          keyExtractor={(item) => item.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.similarList}
        />
      </ScrollView>

      {/* Floating Action Button */}
      <TouchableOpacity 
        style={styles.fab} 
        activeOpacity={0.8}
        onPress={()=> navigation.navigate('CreateListing')}>
        <LinearGradient
          colors={['#ff7a3d', '#f1641e']}
          style={styles.fabGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <Ionicons name="add" size={28} color="#fff" />
        </LinearGradient>
      </TouchableOpacity>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  gradientContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 100,
  },
  header: {
    marginTop: 50,
    marginBottom: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  welcome: {
    fontSize: 16,
    color: '#666',
    marginBottom: 4,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: '#f1641e',
    letterSpacing: 0.5,
  },
  notificationBtn: {
    position: 'relative',
    padding: 8,
  },
  notificationDot: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#ff3b30',
  },

  // Search Bar
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    elevation: 2,
  },
  searchText: {
    flex: 1,
    marginLeft: 12,
    fontSize: 15,
    color: '#999',
  },

  // Section Headers
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
  },
  seeAll: {
    fontSize: 14,
    color: '#f1641e',
    fontWeight: '600',
  },

  // Categories
  categoryList: {
    paddingBottom: 16,
  },
  categoryCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    paddingVertical: 16,
    paddingHorizontal: 22,
    marginRight: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#f1641e',
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#ffe5d6',
  },
  categoryEmoji: {
    fontSize: 32,
  },
  categoryText: {
    marginTop: 8,
    fontSize: 14,
    color: '#f1641e',
    fontWeight: '700',
  },

  // Latest Products Grid
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  productCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    width: width * 0.44,
    marginBottom: 18,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    elevation: 5,
    overflow: 'hidden',
    position: 'relative',
  },
  productImage: {
    width: '100%',
    height: 140,
    backgroundColor: '#f5f5f5',
  },
  favoriteBtn: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 6,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  badge: {
    position: 'absolute',
    top: 10,
    left: 10,
    backgroundColor: '#f1641e',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  badgeText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  productInfo: {
    padding: 14,
  },
  productName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
    marginBottom: 8,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  productPrice: {
    fontSize: 16,
    color: '#f1641e',
    fontWeight: '800',
  },
  cartBtn: {
    backgroundColor: '#f1641e',
    borderRadius: 10,
    padding: 6,
  },

  // Featured Products
  similarList: {
    paddingBottom: 20,
  },
  similarCard: {
    backgroundColor: '#fff',
    borderRadius: 18,
    marginRight: 14,
    width: 160,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 6,
    elevation: 4,
    overflow: 'hidden',
  },
  similarImage: {
    width: '100%',
    height: 120,
    backgroundColor: '#f5f5f5',
  },
  similarInfo: {
    padding: 12,
  },
  similarName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#333',
    marginBottom: 4,
  },
  similarPrice: {
    fontSize: 14,
    color: '#f1641e',
    fontWeight: '700',
  },

  // Floating Action Button
  fab: {
    position: 'absolute',
    bottom: 30,
    right: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    shadowColor: '#f1641e',
    shadowOpacity: 0.4,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 12,
    elevation: 8,
  },
  fabGradient: {
    width: '100%',
    height: '100%',
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default HomeScreen;