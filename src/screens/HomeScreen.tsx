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
import LinearGradient from 'react-native-linear-gradient'; // ✅ CLI Compatible

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
  const renderCategory = ({ item }) => (
    <TouchableOpacity style={styles.categoryCard}>
      <Text style={styles.categoryEmoji}>{item.emoji}</Text>
      <Text style={styles.categoryText}>{item.name}</Text>
    </TouchableOpacity>
  );

  const renderGridProduct = ({ item }) => (
    <TouchableOpacity style={styles.productCard}>
      <Image source={{ uri: item.image }} style={styles.productImage} />
      <TouchableOpacity style={styles.favoriteBtn}>
        <Ionicons name="heart-outline" size={20} color="#f1641e" />
      </TouchableOpacity>

      <View style={styles.badge}>
        <Text style={styles.badgeText}>{item.category}</Text>
      </View>

      <View style={styles.productInfo}>
        <Text style={styles.productName}>{item.name}</Text>
        <View style={styles.priceRow}>
          <Text style={styles.productPrice}>{item.price}</Text>
          <TouchableOpacity style={styles.cartBtn}>
            <Ionicons name="cart-outline" size={18} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderSimilarProduct = ({ item }) => (
    <TouchableOpacity style={styles.similarCard}>
      <Image source={{ uri: item.image }} style={styles.similarImage} />
      <Text style={styles.similarName}>{item.name}</Text>
      <Text style={styles.similarPrice}>{item.price}</Text>
    </TouchableOpacity>
  );

  return (
    <LinearGradient colors={['#fff', '#ffe5d6']} style={styles.gradientContainer}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.welcome}>👋 Welcome Back!</Text>
            <Text style={styles.title}>Mandimore</Text>
          </View>
          <Ionicons name="notifications-outline" size={26} color="#f1641e" />
        </View>

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
        <Text style={styles.sectionTitle}>Latest Products</Text>
        <View style={styles.gridContainer}>
          {latestProducts.map((item) => renderGridProduct({ item }))}
        </View>

        {/* Featured / Similar Products */}
        <Text style={styles.sectionTitle}>Featured Products</Text>
        <FlatList
          data={similarProducts}
          renderItem={renderSimilarProduct}
          keyExtractor={(item) => item.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.similarList}
        />
      </ScrollView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  gradientContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 40,
  },
  header: {
    marginTop: 50,
    marginBottom: 24,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  welcome: {
    fontSize: 16,
    color: '#444',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#f1641e',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
    color: '#333',
  },

  // 🐾 Categories
  categoryList: {
    paddingBottom: 16,
  },
  categoryCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 20,
    marginRight: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 3,
  },
  categoryEmoji: {
    fontSize: 30,
  },
  categoryText: {
    marginTop: 6,
    fontSize: 14,
    color: '#f1641e',
    fontWeight: '600',
  },

  // 🐶 Latest Products Grid
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  productCard: {
    backgroundColor: '#fff',
    borderRadius: 18,
    width: width * 0.44,
    marginBottom: 18,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 6,
    elevation: 4,
    overflow: 'hidden',
    position: 'relative',
  },
  productImage: {
    width: '100%',
    height: 130,
  },
  favoriteBtn: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 4,
    elevation: 3,
  },
  badge: {
    position: 'absolute',
    top: 10,
    left: 10,
    backgroundColor: '#f1641e',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  badgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  productInfo: {
    padding: 12,
  },
  productName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
    marginBottom: 6,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  productPrice: {
    fontSize: 14,
    color: '#f1641e',
    fontWeight: '600',
  },
  cartBtn: {
    backgroundColor: '#f1641e',
    borderRadius: 8,
    padding: 5,
  },

  // 🌟 Featured / Similar Products
  similarList: {
    paddingBottom: 20,
  },
  similarCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    marginRight: 14,
    paddingBottom: 8,
    width: 150,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 5,
    elevation: 3,
  },
  similarImage: {
    width: '100%',
    height: 110,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  similarName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginTop: 8,
  },
  similarPrice: {
    fontSize: 13,
    color: '#f1641e',
    fontWeight: '500',
  },
});

export default HomeScreen;
