import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  ActivityIndicator,
  Dimensions,
  Alert,
} from 'react-native';
import { Ionicons } from "@react-native-vector-icons/ionicons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from 'axios';
import { useNavigation } from '@react-navigation/native';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 30) / 2;

const Category = ({ route }) => {
  const { category } = route.params;
  const navigation = useNavigation();
  
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const token = await AsyncStorage.getItem('authToken');
      const res = await fetch(`https://mandimore.com/v1/categories/${category.id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      });
      const json = await res.json();
      setProducts(json.data.products);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price) => {
    return `Rs ${parseFloat(price).toLocaleString('en-PK')}`;
  };

  const renderItem = ({ item }) => {
    return (
      <TouchableOpacity
        style={styles.card}
        activeOpacity={0.9}
        onPress={() => navigation.navigate('ListingDetail', { LISTING_DETAIL: item })}
      >
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: item.image_urls?.[0] || 'https://via.placeholder.com/200' }}
            style={styles.image}
          />
          <View style={styles.imageBadge}>
            <Ionicons name="images-outline" size={12} color="#fff" />
            <Text style={styles.imageBadgeText}>{item.image_urls?.length || 0}</Text>
          </View>
        </View>

        <View style={styles.cardContent}>
          <Text style={styles.title} numberOfLines={2}>
            {item.title}
          </Text>
          
          <View style={styles.breedContainer}>
            <View style={styles.breedBadge}>
              <Text style={styles.breedText} numberOfLines={1}>
                {item.breed}
              </Text>
            </View>
          </View>

          <View style={styles.detailsRow}>
            <View style={styles.detailItem}>
              <Ionicons name="time-outline" size={12} color="#999" />
              <Text style={styles.detailText}>{item.age}</Text>
            </View>
            <View style={styles.detailItem}>
              <Ionicons name="scale-outline" size={12} color="#999" />
              <Text style={styles.detailText}>{item.weight || 'N/A'}</Text>
            </View>
          </View>

          <View style={styles.locationRow}>
            <Ionicons name="location-outline" size={12} color="#666" />
            <Text style={styles.location} numberOfLines={1}>
              {item.address || 'No location'}
            </Text>
          </View>

          <View style={styles.priceRow}>
            <Text style={styles.price}>{formatPrice(item.price)}</Text>
            {item.health_status === 'excellent' && (
              <View style={styles.healthBadge}>
                <Ionicons name="shield-checkmark" size={10} color="#4CAF50" />
                <Text style={styles.healthText}>Healthy</Text>
              </View>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderHeader = () => (
    <View style={styles.headerContainer}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backBtn}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        
        <View style={styles.headerTextContainer}>
          <Text style={styles.headerTitle}>{category.name}</Text>
          <Text style={styles.headerSubtitle}>
            {products.length} {products.length === 1 ? 'Product' : 'Products'}
          </Text>
        </View>

        <TouchableOpacity style={styles.notificationBtn}>
          <Ionicons name="notifications-outline" size={24} color="#333" />
        </TouchableOpacity>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <StatusBar backgroundColor="#fff" barStyle="dark-content" />
        <ActivityIndicator size="large" color="#f1641e" />
        <Text style={styles.loadingText}>Loading products...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor="#fff" barStyle="dark-content" />
      
      <FlatList
        data={products}
        renderItem={renderItem}
        keyExtractor={(item) => item.id.toString()}
        numColumns={2}
        ListHeaderComponent={renderHeader}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        columnWrapperStyle={styles.row}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="paw-outline" size={64} color="#ddd" />
            <Text style={styles.emptyText}>No products found</Text>
            <Text style={styles.emptySubtext}>Check back later for new listings</Text>
          </View>
        }
      />
    </View>
  );
};

export default Category;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },
  headerContainer: {
    backgroundColor: '#fff',
    paddingBottom: 16,
    marginBottom: 12,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
  },
  backBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#f8f9fa',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  headerTextContainer: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#333',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#999',
    marginTop: 2,
  },
  notificationBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#f8f9fa',
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    paddingHorizontal: 10,
    paddingBottom: 20,
  },
  row: {
    justifyContent: 'space-between',
  },
  card: {
    width: CARD_WIDTH,
    backgroundColor: '#fff',
    borderRadius: 16,
    marginBottom: 12,
    marginHorizontal: 5,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
  },
  imageContainer: {
    position: 'relative',
  },
  image: {
    width: '100%',
    height: 160,
    backgroundColor: '#f0f0f0',
  },
  imageBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  imageBadgeText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '600',
    marginLeft: 4,
  },
  heartBtn: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  heartBtnActive: {
    backgroundColor: '#ff6b6b',
  },
  cardContent: {
    padding: 12,
  },
  title: {
    fontSize: 15,
    fontWeight: '700',
    color: '#333',
    marginBottom: 6,
    lineHeight: 20,
  },
  breedContainer: {
    marginBottom: 8,
  },
  breedBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#fff5f0',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#ffe0d1',
  },
  breedText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#f1641e',
  },
  detailsRow: {
    flexDirection: 'row',
    marginBottom: 6,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12,
  },
  detailText: {
    fontSize: 11,
    color: '#999',
    marginLeft: 3,
    fontWeight: '500',
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  location: {
    fontSize: 11,
    color: '#666',
    marginLeft: 3,
    flex: 1,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  price: {
    fontSize: 16,
    fontWeight: '700',
    color: '#f1641e',
  },
  healthBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f1f8f4',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 6,
  },
  healthText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#4CAF50',
    marginLeft: 2,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#999',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#bbb',
    marginTop: 4,
  },
});