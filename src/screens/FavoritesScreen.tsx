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
  RefreshControl,
} from 'react-native';
import { Ionicons } from "@react-native-vector-icons/ionicons";
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { useNavigation } from '@react-navigation/native';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 30) / 2;

const API_URL = 'https://mandimore.com/v1/favorites';

const FavoritesScreen = () => {
  const navigation = useNavigation();
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchFavorites();
  }, []);

  const fetchFavorites = async () => {
    try {
      setError(null);
      const token = await AsyncStorage.getItem('authToken');
      
      if (!token) {
        setError('Please login to view favorites');
        setLoading(false);
        return;
      }

      const response = await axios.get(API_URL, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
        },
      });

      // Adjust based on your API response structure
      if (response.data && response.data.data) {
        setFavorites(response.data.data);
      } else if (Array.isArray(response.data)) {
        setFavorites(response.data);
      } else {
        setFavorites([]);
      }
    } catch (error) {
      console.error('Error fetching favorites:', error);
      setError(error.response?.data?.message || 'Failed to load favorites');
      setFavorites([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchFavorites();
  };

  const removeFavorite = async (itemId) => {
    try {
      const token = await AsyncStorage.getItem('authToken');
      
      // Optimistically update UI
      setFavorites(prev => prev.filter(item => item.id !== itemId));

      // Make API call to remove favorite
      await axios.delete(`https://mandimore.com/v1/favorites/${itemId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
        },
      });
    } catch (error) {
      console.error('Error removing favorite:', error);
      // Revert on error
      fetchFavorites();
    }
  };

  const formatPrice = (price) => {
    return `Rs ${parseFloat(price).toLocaleString('en-PK')}`;
  };

  const renderItem = ({ item }) => {
    // Support both direct listing and nested listing structure
    const listing = item.listing || item;

    return (
      <TouchableOpacity
        style={styles.card}
        activeOpacity={0.9}
        onPress={() => navigation.navigate('ListingDetail', { LISTING_DETAIL: listing })}
      >
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: listing.image_urls?.[0] || 'https://via.placeholder.com/200' }}
            style={styles.image}
          />
          <View style={styles.imageBadge}>
            <Ionicons name="images-outline" size={12} color="#fff" />
            <Text style={styles.imageBadgeText}>{listing.image_urls?.length || 0}</Text>
          </View>
          <TouchableOpacity 
            style={styles.heartBtn}
            onPress={() => removeFavorite(item.id)}
          >
            <Ionicons name="heart" size={18} color="#ff6b6b" />
          </TouchableOpacity>
        </View>

        <View style={styles.cardContent}>
          <Text style={styles.title} numberOfLines={2}>
            {listing.title}
          </Text>
          
          <View style={styles.breedContainer}>
            <View style={styles.breedBadge}>
              <Text style={styles.breedText} numberOfLines={1}>
                {listing.breed}
              </Text>
            </View>
          </View>

          <View style={styles.detailsRow}>
            <View style={styles.detailItem}>
              <Ionicons name="time-outline" size={12} color="#999" />
              <Text style={styles.detailText}>{listing.age}</Text>
            </View>
            <View style={styles.detailItem}>
              <Ionicons name="scale-outline" size={12} color="#999" />
              <Text style={styles.detailText}>{listing.weight || 'N/A'}</Text>
            </View>
          </View>

          <View style={styles.locationRow}>
            <Ionicons name="location-outline" size={12} color="#666" />
            <Text style={styles.location} numberOfLines={1}>
              {listing.address || 'No location'}
            </Text>
          </View>

          <View style={styles.priceRow}>
            <Text style={styles.price}>{formatPrice(listing.price)}</Text>
            {listing.health_status === 'excellent' && (
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
    <View style={styles.header}>
      <View>
        <Text style={styles.headerTitle}>My Favorites</Text>
        <Text style={styles.headerSubtitle}>
          {favorites.length} {favorites.length === 1 ? 'saved pet' : 'saved pets'}
        </Text>
      </View>
      <TouchableOpacity 
        style={styles.refreshBtn}
        onPress={onRefresh}
      >
        <Ionicons name="refresh-outline" size={24} color="#333" />
      </TouchableOpacity>
    </View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <View style={styles.emptyIconContainer}>
        <Ionicons name="heart-outline" size={80} color="#ddd" />
      </View>
      <Text style={styles.emptyTitle}>No Favorites Yet</Text>
      <Text style={styles.emptyText}>
        Start adding pets to your favorites by tapping the heart icon
      </Text>
      <TouchableOpacity 
        style={styles.browseBtn}
        onPress={() => navigation.navigate('Listings')}
      >
        <Text style={styles.browseBtnText}>Browse Pets</Text>
      </TouchableOpacity>
    </View>
  );

  const renderErrorState = () => (
    <View style={styles.emptyContainer}>
      <View style={styles.emptyIconContainer}>
        <Ionicons name="alert-circle-outline" size={80} color="#ff6b6b" />
      </View>
      <Text style={styles.emptyTitle}>Oops!</Text>
      <Text style={styles.emptyText}>{error}</Text>
      <TouchableOpacity 
        style={styles.browseBtn}
        onPress={fetchFavorites}
      >
        <Text style={styles.browseBtnText}>Try Again</Text>
      </TouchableOpacity>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#f1641e" />
        <Text style={styles.loadingText}>Loading your favorites...</Text>
      </View>
    );
  }

  if (error && favorites.length === 0) {
    return (
      <View style={styles.container}>
        <StatusBar backgroundColor="#fff" barStyle="dark-content" />
        {renderHeader()}
        {renderErrorState()}
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor="#fff" barStyle="dark-content" />
      
      <FlatList
        data={favorites}
        renderItem={renderItem}
        keyExtractor={(item) => item.id?.toString() || Math.random().toString()}
        numColumns={2}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmptyState}
        contentContainerStyle={[
          styles.listContent,
          favorites.length === 0 && styles.listContentEmpty
        ]}
        showsVerticalScrollIndicator={false}
        columnWrapperStyle={favorites.length > 0 ? styles.row : null}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#f1641e']}
            tintColor="#f1641e"
          />
        }
      />
    </View>
  );
};

export default FavoritesScreen;

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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 20,
    backgroundColor: '#fff',
    marginBottom: 12,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#333',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#999',
    marginTop: 2,
  },
  refreshBtn: {
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
  listContentEmpty: {
    flexGrow: 1,
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
    backgroundColor: 'rgba(255,255,255,0.95)',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
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
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
    paddingVertical: 60,
  },
  emptyIconContainer: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: '#f8f9fa',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#333',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 15,
    color: '#999',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 32,
  },
  browseBtn: {
    backgroundColor: '#f1641e',
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#f1641e',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  browseBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
});