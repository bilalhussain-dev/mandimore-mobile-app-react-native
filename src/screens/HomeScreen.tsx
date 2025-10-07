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
import LinearGradient from 'react-native-linear-gradient'; // ✅ Works with CLI

const { width } = Dimensions.get('window');

const categories = [
  { id: '1', name: 'Dogs', emoji: '🐶' },
  { id: '2', name: 'Cats', emoji: '🐱' },
  { id: '3', name: 'Birds', emoji: '🐦' },
  { id: '4', name: 'Fish', emoji: '🐠' },
  { id: '5', name: 'Rabbits', emoji: '🐇' },
];

const latestProducts = [
  { id: '1', name: 'Golden Retriever', price: '$250', image: 'https://place-puppy.com/200x200' },
  { id: '2', name: 'Persian Cat', price: '$180', image: 'https://placekitten.com/200/200' },
  { id: '3', name: 'Parrot', price: '$90', image: 'https://placebear.com/200/200' },
  { id: '4', name: 'Bulldog', price: '$220', image: 'https://place-puppy.com/210x210' },
  { id: '5', name: 'Siamese Cat', price: '$150', image: 'https://placekitten.com/210/210' },
  { id: '6', name: 'Macaw', price: '$120', image: 'https://placebear.com/210/210' },
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
      <View style={styles.productInfo}>
        <Text style={styles.productName}>{item.name}</Text>
        <Text style={styles.productPrice}>{item.price}</Text>
      </View>
      <Ionicons name="heart-outline" size={20} color="#f1641e" style={styles.favoriteIcon} />
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

        {/* Latest Products (Grid Layout) */}
        <Text style={styles.sectionTitle}>Latest Products</Text>
        <View style={styles.gridContainer}>
          {latestProducts.map((item) => renderGridProduct({ item }))}
        </View>

        {/* Similar Products (Horizontal Scroll) */}
        <Text style={styles.sectionTitle}>Similar Products</Text>
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
  categoryList: {
    paddingBottom: 16,
  },
  categoryCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginRight: 12,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
  },
  categoryEmoji: {
    fontSize: 26,
  },
  categoryText: {
    marginTop: 6,
    fontSize: 14,
    color: '#f1641e',
    fontWeight: '500',
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  productCard: {
    backgroundColor: '#fff',
    borderRadius: 14,
    width: width * 0.44,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
    overflow: 'hidden',
    position: 'relative',
  },
  productImage: {
    width: '100%',
    height: 120,
  },
  productInfo: {
    padding: 10,
  },
  productName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
  },
  productPrice: {
    fontSize: 14,
    color: '#f1641e',
    fontWeight: '500',
  },
  favoriteIcon: {
    position: 'absolute',
    top: 10,
    right: 10,
  },
  similarList: {
    paddingBottom: 20,
  },
  similarCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginRight: 14,
    paddingBottom: 8,
    width: 140,
    alignItems: 'center',
    elevation: 3,
  },
  similarImage: {
    width: '100%',
    height: 100,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  similarName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    marginTop: 6,
  },
  similarPrice: {
    fontSize: 13,
    color: '#f1641e',
    fontWeight: '500',
  },
});

export default HomeScreen;
