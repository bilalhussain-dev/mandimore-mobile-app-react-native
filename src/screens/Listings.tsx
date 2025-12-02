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
import { useNavigation, useFocusEffect } from '@react-navigation/native';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 30) / 2;

const API_URL = 'https://mandimore.com/v1/fetch_all_listings';

const ListingsScreen = () => {
  const navigation = useNavigation();
  const [listings, setListings] = useState([]);
  const [filteredListings, setFilteredListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [favoriteIds, setFavoriteIds] = useState(new Set());
  const [loadingFavorites, setLoadingFavorites] = useState({});

  const categories = ['All', 'Dogs', 'Cats', 'Birds', 'Livestock', 'Others'];

  useEffect(() => {
    fetchListings();
    fetchUserFavorites();
  }, []);

  // 🔥 Auto-refresh when returning from detail screen
  useFocusEffect(
    React.useCallback(() => {
      fetchUserFavorites();
    }, [])
  );

  useEffect(() => {
    filterListings();
  }, [selectedCategory, listings]);

  const fetchListings = async () => {
    try {
      const token = await AsyncStorage.getItem("authToken");

      const response = await axios.get(API_URL, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      });
      if (response.data && response.data.data) {
        setListings(response.data.data);
        setFilteredListings(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching listings:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserFavorites = async () => {
    try {
      const token = await AsyncStorage.getItem('authToken');
      if (!token) return;

      const response = await axios.get('https://mandimore.com/v1/favorites', {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
        },
      });

      if (response.data && response.data.data) {
        const ids = new Set(
          response.data.data.map(fav => fav.listing?.id || fav.listing_id || fav.id)
        );
        setFavoriteIds(ids);
      }
    } catch (error) {
      console.error('Error fetching favorites:', error);
    }
  };

  const toggleFavorite = async (listingId) => {
    try {
      const token = await AsyncStorage.getItem('authToken');

      if (!token) {
        Alert.alert(
          'Login Required',
          'Please login to add items to favorites'
        );
        return;
      }

      const isFavorite = favoriteIds.has(listingId);

      // Show loading for this item
      setLoadingFavorites(prev => ({ ...prev, [listingId]: true }));

      // Optimistic UI update
      setFavoriteIds(prev => {
        const newSet = new Set(prev);
        if (isFavorite) {
          newSet.delete(listingId);
        } else {
          newSet.add(listingId);
        }
        return newSet;
      });

      // Make API call
      if (isFavorite) {
        // Remove from favorites (DELETE)
        await axios.delete(
          `https://mandimore.com/v1/favorites/${listingId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              Accept: 'application/json',
            },
          }
        );
      } else {
        // Add to favorites (POST)
        await axios.post(
          `https://mandimore.com/v1/favorites/${listingId}`,
          {},
          {
            headers: {
              Authorization: `Bearer ${token}`,
              Accept: 'application/json',
            },
          }
        );
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);

      // Revert optimistic update on error
      setFavoriteIds(prev => {
        const newSet = new Set(prev);
        if (newSet.has(listingId)) {
          newSet.delete(listingId);
        } else {
          newSet.add(listingId);
        }
        return newSet;
      });

      Alert.alert('Error', 'Failed to update favorites. Please try again.');
    } finally {
      setLoadingFavorites(prev => ({ ...prev, [listingId]: false }));
    }
  };

  const filterListings = () => {
    let filtered = listings;

    if (selectedCategory !== 'All') {
      filtered = filtered.filter(item =>
        item.breed.toLowerCase().includes(selectedCategory.toLowerCase())
      );
    }

    setFilteredListings(filtered);
  };

  const formatPrice = (price) => {
    return `Rs ${parseFloat(price).toLocaleString('en-PK')}`;
  };

  const renderCategory = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.categoryChip,
        selectedCategory === item && styles.categoryChipActive
      ]}
      onPress={() => setSelectedCategory(item)}
    >
      <Text style={[
        styles.categoryText,
        selectedCategory === item && styles.categoryTextActive
      ]}>
        {item}
      </Text>
    </TouchableOpacity>
  );

  const renderItem = ({ item }) => {
    const isFavorite = favoriteIds.has(item.id);
    const isLoadingFav = loadingFavorites[item.id];

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
          <TouchableOpacity
            style={[
              styles.heartBtn,
              isFavorite && styles.heartBtnActive
            ]}
            onPress={() => toggleFavorite(item.id)}
            disabled={isLoadingFav}
          >
            {isLoadingFav ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Ionicons
                name={isFavorite ? "heart" : "heart-outline"}
                size={18}
                color="#fff"
              />
            )}
          </TouchableOpacity>
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
    <View>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Explore</Text>
          <Text style={styles.headerSubtitle}>Find your perfect companion</Text>
        </View>
        <TouchableOpacity style={styles.notificationBtn}>
          <Ionicons name="notifications-outline" size={24} color="#333" />
          <View style={styles.notificationDot} />
        </TouchableOpacity>
      </View>

      {/* Categories */}
      <FlatList
        horizontal
        data={categories}
        renderItem={renderCategory}
        keyExtractor={(item) => item}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categoriesContainer}
      />

      {/* Results Count */}
      <View style={styles.resultsHeader}>
        <Text style={styles.resultsText}>
          {filteredListings.length} {filteredListings.length === 1 ? 'Listing' : 'Listings'} Found
        </Text>
        <TouchableOpacity style={styles.filterBtn}>
          <Ionicons name="options-outline" size={18} color="#f1641e" />
          <Text style={styles.filterText}>Filter</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#f1641e" />
        <Text style={styles.loadingText}>Loading amazing pets...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor="#fff" barStyle="dark-content" />

      <FlatList
        data={filteredListings}
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
            <Text style={styles.emptyText}>No listings found</Text>
            <Text style={styles.emptySubtext}>Try selecting a different category</Text>
          </View>
        }
      />
    </View>
  );
};

export default ListingsScreen;

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
    paddingBottom: 16,
    backgroundColor: '#fff',
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
  notificationBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#f8f9fa',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  notificationDot: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#f1641e',
    borderWidth: 2,
    borderColor: '#fff',
  },
  categoriesContainer: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 16,
  },
  categoryChip: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#fff',
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  categoryChipActive: {
    backgroundColor: '#f1641e',
    borderColor: '#f1641e',
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  categoryTextActive: {
    color: '#fff',
  },
  resultsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 12,
  },
  resultsText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
  },
  filterBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#f1641e',
  },
  filterText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#f1641e',
    marginLeft: 4,
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