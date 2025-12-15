import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  RefreshControl,
  Dimensions,
  StatusBar,
  Alert,
} from 'react-native';
import { Ionicons } from '@react-native-vector-icons/ionicons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import CreateOrEditProductModal from '../components/createOrEditProductModal';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 30) / 2;

interface Category {
  id: number;
  name: string;
  slug: string;
  products_count: number;
}

interface Product {
  id: number;
  title: string;
  breed: string;
  price: string;
  address: string;
  age: string;
  weight?: string;
  image_urls: string[];
  health_status: string;
  user: {
    id: number;
    first_name: string;
    verified: boolean;
    user_avatar_url: string | null;
  };
}

interface UserData {
  first_name: string;
  last_name: string;
  user_avatar_url: string | null;
}

// Category emoji mapping
const categoryEmojis: { [key: string]: string } = {
  'Dogs': '🐶',
  'Cats': '🐱',
  'Birds': '🐦',
  'Fish': '🐠',
  'Rabbits': '🐰',
  'Hamsters': '🐹',
  'Turtles': '🐢',
  'Horses': '🐴',
  'Parrots': '🦜',
  'Pigeons': '🕊️',
  'Ducks': '🦆',
  'Chickens': '🐔',
  'Hens': '🐔',
  'Cows': '🐄',
  'Sheep': '🐑',
  'Goats': '🐐',
  'Buffaloes': '🐃',
  'Calves': '🐄',
  'Camels': '🐫',
  'Donkeys': '🫏',
  'Mules': '🐴',
  'Roosters': '🐓',
  'Turkeys': '🦃',
  'Quails': '🐦',
  'Peacocks': '🦚',
  'Pheasants': '🐦',
  'Love Birds': '🦜',
  'Cockatiels': '🦜',
  'Macaws': '🦜',
  'Finches': '🐦',
  'Pet Food & Accessories': '🦴',
  'Livestock Feed': '🌾',
  'Animal Medicines': '💊',
  'Pet Training & Services': '🎓',
  'Animal Transport': '🚚',
  'Animal Adoption': '🏠',
  'Missing & Lost Pets': '🔍',
  'Animal for Sacrifice (Qurbani)': '🐑',
};

const getCategoryEmoji = (categoryName: string): string => {
  return categoryEmojis[categoryName] || '🐾';
};

const HomeScreen: React.FC = () => {
  const navigation = useNavigation();
  const [modalVisible, setModalVisible] = useState(false);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [favoriteIds, setFavoriteIds] = useState(new Set());
  const [loadingFavorites, setLoadingFavorites] = useState({});

  useEffect(() => {
    fetchUserData();
    fetchCategories();
    fetchProducts(1, true);
    fetchUserFavorites();
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      fetchUserFavorites();
    }, [])
  );

  const fetchUserData = async () => {
    try {
      const userDataString = await AsyncStorage.getItem('current_user');
      if (userDataString) {
        const user = JSON.parse(userDataString);
        setUserData(user);
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  };

  const fetchCategories = async () => {
    try {
      const token = await AsyncStorage.getItem('authToken');
      
      const response = await axios.get('https://mandimore.com/v1/fetch_all_categories', {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
        }
      });
      
      if (response.data && response.data.data) {
        const categoriesWithProducts = response.data.data
          .filter((cat: Category) => cat.products_count > 0)
          .sort((a: Category, b: Category) => b.products_count - a.products_count);
        
        setCategories(categoriesWithProducts);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchProducts = async (pageNum: number, isRefresh: boolean = false) => {
    if (loadingMore || (!hasMore && !isRefresh)) return;

    if (pageNum === 1) {
      setLoading(true);
    } else {
      setLoadingMore(true);
    }

    try {
      const token = await AsyncStorage.getItem('authToken');
      
      const response = await axios.get('https://mandimore.com/v1/fetch_all_listings', {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
        }
      });
      
      if (response.data && response.data.data) {
        const allProducts = response.data.data;
        const itemsPerPage = 10;
        const startIndex = (pageNum - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        const paginatedProducts = allProducts.slice(startIndex, endIndex);

        if (isRefresh) {
          setProducts(paginatedProducts);
          setPage(1);
          setHasMore(endIndex < allProducts.length);
        } else {
          setProducts(prev => [...prev, ...paginatedProducts]);
          setHasMore(endIndex < allProducts.length);
        }
      }
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
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

  const toggleFavorite = useCallback(async (listingId: number) => {
    try {
      const token = await AsyncStorage.getItem('authToken');

      if (!token) {
        Alert.alert('Login Required', 'Please login to add items to favorites');
        return;
      }

      const isFavorite = favoriteIds.has(listingId);

      setLoadingFavorites(prev => ({ ...prev, [listingId]: true }));

      setFavoriteIds(prev => {
        const newSet = new Set(prev);
        if (isFavorite) {
          newSet.delete(listingId);
        } else {
          newSet.add(listingId);
        }
        return newSet;
      });

      if (isFavorite) {
        await axios.delete(`https://mandimore.com/v1/favorites/${listingId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: 'application/json',
          },
        });
      } else {
        await axios.post(`https://mandimore.com/v1/favorites/${listingId}`, {}, {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: 'application/json',
          },
        });
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);

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
  }, [favoriteIds]);

  const onRefresh = async () => {
    setRefreshing(true);
    setHasMore(true);
    await Promise.all([fetchCategories(), fetchProducts(1, true), fetchUserFavorites()]);
    setRefreshing(false);
  };

  const loadMore = () => {
    if (!loadingMore && hasMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchProducts(nextPage);
    }
  };

  const handleCategoryPress = useCallback((categoryId: number) => {
    setSelectedCategory(categoryId === selectedCategory ? null : categoryId);
  }, [selectedCategory]);

  const handleProductPress = useCallback((product: Product) => {
    navigation.navigate('ListingDetail', { LISTING_DETAIL: product });
  }, [navigation]);

  const handleOpenModal = useCallback(() => {
    setModalVisible(true);
  }, []);

  const handleCloseModal = useCallback(() => {
    setModalVisible(false);
  }, []);

  const handleSubmit = useCallback(() => {
    setModalVisible(false);
    onRefresh();
  }, []);

  const formatPrice = (price: string) => {
    return `Rs ${parseFloat(price).toLocaleString('en-PK')}`;
  };

  const renderHeader = () => (
    <View>
      {/* Gradient Header */}
      <View style={styles.header}>
        <View style={styles.gradientOverlay} />
        <View style={styles.userSection}>
          {userData?.user_avatar_url ? (
            <Image source={{ uri: userData.user_avatar_url }} style={styles.avatar} />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Ionicons name="person" size={20} color="#fff" />
            </View>
          )}
          <View style={styles.userInfo}>
            <Text style={styles.greeting}>Hello 👋</Text>
            <Text style={styles.userName} numberOfLines={1}>
              {userData?.first_name || 'Guest'} {userData?.last_name || ''}
            </Text>
          </View>
        </View>
        
        <TouchableOpacity style={styles.notificationBtn}>
          <Ionicons name="notifications-outline" size={22} color="#fff" />
          <View style={styles.notificationDot} />
        </TouchableOpacity>
      </View>

      {/* Inline Stats Row */}
      <View style={styles.statsRow}>
        <View style={styles.statItem}>
          <View style={styles.statIcon}>
            <Ionicons name="grid-outline" size={18} color="#f1641e" />
          </View>
          <View style={styles.statContent}>
            <Text style={styles.statValue}>{categories.length}</Text>
            <Text style={styles.statLabel}>Categories</Text>
          </View>
        </View>

        <View style={styles.statDivider} />

        <View style={styles.statItem}>
          <View style={styles.statIcon}>
            <Ionicons name="heart-outline" size={18} color="#FF6B6B" />
          </View>
          <View style={styles.statContent}>
            <Text style={styles.statValue}>{favoriteIds.size}</Text>
            <Text style={styles.statLabel}>Favorites</Text>
          </View>
        </View>

        <View style={styles.statDivider} />

        <View style={styles.statItem}>
          <View style={styles.statIcon}>
            <Ionicons name="paw-outline" size={18} color="#4CAF50" />
          </View>
          <View style={styles.statContent}>
            <Text style={styles.statValue}>{products.length}+</Text>
            <Text style={styles.statLabel}>Listings</Text>
          </View>
        </View>
      </View>

      {/* Categories Section */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Browse Categories</Text>
        <TouchableOpacity onPress={() => navigation.navigate('Categories')}>
          <Text style={styles.seeAllText}>See All →</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        horizontal
        data={categories}
        renderItem={renderCategoryItem}
        keyExtractor={(item) => item.id.toString()}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categoriesList}
      />

      {/* Listings Header */}
      <View style={styles.listingsHeader}>
        <Text style={styles.listingsTitle}>Featured Pets</Text>
        <TouchableOpacity style={styles.filterBtn}>
          <Ionicons name="funnel-outline" size={16} color="#f1641e" />
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderCategoryItem = ({ item }: { item: Category }) => (
    <TouchableOpacity
      style={[
        styles.categoryCard,
        selectedCategory === item.id && styles.categoryCardActive,
      ]}
      onPress={() => navigation.navigate('Category', { category: item })}
      activeOpacity={0.7}
    >
      <Text style={styles.categoryEmoji}>{getCategoryEmoji(item.name)}</Text>
      <Text
        style={[
          styles.categoryName,
          selectedCategory === item.id && styles.categoryNameActive,
        ]}
        numberOfLines={1}
      >
        {item.name}
      </Text>
      <View style={[
        styles.categoryBadge,
        selectedCategory === item.id && styles.categoryBadgeActive
      ]}>
        <Text style={[
          styles.categoryCount,
          selectedCategory === item.id && styles.categoryCountActive,
        ]}>
          {item.products_count}
        </Text>
      </View>
    </TouchableOpacity>
  );

  const renderProductItem = ({ item }: { item: Product }) => {
    const hasImage = item.image_urls && item.image_urls.length > 0;
    const imageUrl = hasImage ? item.image_urls[0] : 'https://via.placeholder.com/200';
    const isFavorite = favoriteIds.has(item.id);
    const isLoadingFav = loadingFavorites[item.id];

    return (
      <TouchableOpacity
        style={styles.card}
        activeOpacity={0.9}
        onPress={() => handleProductPress(item)}
      >
        <View style={styles.imageContainer}>
          <Image source={{ uri: imageUrl }} style={styles.image} />
          
          {hasImage && item.image_urls.length > 1 && (
            <View style={styles.imageBadge}>
              <Ionicons name="images-outline" size={12} color="#fff" />
              <Text style={styles.imageBadgeText}>{item.image_urls.length}</Text>
            </View>
          )}

          <TouchableOpacity
            style={[styles.heartBtn, isFavorite && styles.heartBtnActive]}
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
              <Text style={styles.detailText}>{item.age || 'N/A'}</Text>
            </View>
            <View style={styles.detailItem}>
              <Ionicons name="scale-outline" size={12} color="#999" />
              <Text style={styles.detailText}>{item.weight || 'N/A'}</Text>
            </View>
          </View>

          {item.address && (
            <View style={styles.locationRow}>
              <Ionicons name="location-outline" size={12} color="#666" />
              <Text style={styles.location} numberOfLines={1}>
                {item.address}
              </Text>
            </View>
          )}

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

  const renderFooter = () => {
    if (!loadingMore) return null;
    
    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="large" color="#f1641e" />
        <Text style={styles.footerLoaderText}>Loading more...</Text>
      </View>
    );
  };

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
      <StatusBar barStyle="light-content" backgroundColor="#f1641e" />
      
      <FlatList
        data={products}
        renderItem={renderProductItem}
        keyExtractor={(item, index) => `${item.id}-${index}`}
        numColumns={2}
        columnWrapperStyle={styles.row}
        ListHeaderComponent={renderHeader}
        ListFooterComponent={renderFooter}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={onRefresh} 
            colors={['#f1641e']}
            tintColor="#f1641e"
          />
        }
        onEndReached={loadMore}
        onEndReachedThreshold={0.5}
      />

      {/* Smaller Floating Button */}
      <TouchableOpacity
        onPress={handleOpenModal}
        style={styles.floatingButton}
        activeOpacity={0.8}
      >
        <Ionicons name="add" size={24} color="#fff" />
      </TouchableOpacity>

      {/* Always Rendered Modal for Instant Opening */}
      <CreateOrEditProductModal
        visible={modalVisible}
        onClose={handleCloseModal}
        onSubmit={handleSubmit}
      />
    </View>
  );
};

export default HomeScreen;

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
  listContent: {
    paddingBottom: 100,
  },

  // Gradient Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 24,
    backgroundColor: '#f1641e',
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    position: 'relative',
    overflow: 'hidden',
  },
  gradientOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  userSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    zIndex: 1,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  avatarPlaceholder: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.25)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  userInfo: {
    marginLeft: 12,
    flex: 1,
  },
  greeting: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.9)',
    marginBottom: 2,
  },
  userName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
  },
  notificationBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    zIndex: 1,
  },
  notificationDot: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#4CAF50',
    borderWidth: 2,
    borderColor: '#f1641e',
  },

  // Inline Stats Row
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    marginHorizontal: 20,
    marginTop: -16,
    marginBottom: 20,
    padding: 16,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
  statItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  statIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#f8f9fa',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  statContent: {
    flex: 1,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '800',
    color: '#333',
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 10,
    color: '#999',
    fontWeight: '500',
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: '#e0e0e0',
    marginHorizontal: 8,
  },

  // Section Headers
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#333',
  },
  seeAllText: {
    fontSize: 13,
    color: '#f1641e',
    fontWeight: '600',
  },

  // Categories with Emojis
  categoriesList: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  categoryCard: {
    width: 100,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 14,
    marginRight: 12,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#f0f0f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  categoryCardActive: {
    backgroundColor: '#f1641e',
    borderColor: '#f1641e',
  },
  categoryEmoji: {
    fontSize: 36,
    marginBottom: 8,
  },
  categoryName: {
    fontSize: 12,
    fontWeight: '700',
    color: '#333',
    textAlign: 'center',
    marginBottom: 6,
  },
  categoryNameActive: {
    color: '#fff',
  },
  categoryBadge: {
    backgroundColor: '#f5f5f5',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 10,
  },
  categoryBadgeActive: {
    backgroundColor: 'rgba(255,255,255,0.25)',
  },
  categoryCount: {
    fontSize: 11,
    fontWeight: '800',
    color: '#666',
  },
  categoryCountActive: {
    color: '#fff',
  },

  // Listings Header
  listingsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  listingsTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#333',
  },
  filterBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#fff5f0',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ffe0d1',
  },

  // Product Cards
  row: {
    justifyContent: 'space-between',
    paddingHorizontal: 10,
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

  // Footer Loader
  footerLoader: {
    paddingVertical: 30,
    alignItems: 'center',
  },
  footerLoaderText: {
    marginTop: 10,
    fontSize: 14,
    color: '#999',
    fontWeight: '500',
  },

  // Smaller Floating Button
  floatingButton: {
    position: 'absolute',
    bottom: 24,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#f1641e',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#f1641e',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 8,
  },
});