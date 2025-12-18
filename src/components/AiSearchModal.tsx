import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  FlatList,
  Image,
  Animated,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  TouchableWithoutFeedback,
  Dimensions,
  Alert,
} from 'react-native';
import { Ionicons } from '@react-native-vector-icons/ionicons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 48) / 2;

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

interface Category {
  id: number;
  name: string;
  slug: string;
  products_count: number;
}

interface AiSearchModalProps {
  visible: boolean;
  onClose: () => void;
  onProductSelect?: (product: Product) => void;
  onCategorySelect?: (category: Category) => void;
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

const AiSearchModal: React.FC<AiSearchModalProps> = ({
  visible,
  onClose,
  onProductSelect,
  onCategorySelect,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [favoriteIds, setFavoriteIds] = useState(new Set());
  const [loadingFavorites, setLoadingFavorites] = useState({});
  
  const inputRef = useRef<TextInput>(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.spring(slideAnim, {
          toValue: 0,
          tension: 50,
          friction: 7,
          useNativeDriver: true,
        }),
      ]).start();
      
      fetchCategories();
      fetchUserFavorites();
    } else {
      fadeAnim.setValue(0);
      slideAnim.setValue(50);
      setSearchQuery('');
      setSearchResults([]);
      setHasSearched(false);
    }
  }, [visible]);

  const fetchCategories = async () => {
    setLoadingCategories(true);
    try {
      const token = await AsyncStorage.getItem('authToken');
      
      const response = await axios.get('https://mandimore.com/v1/fetch_all_categories', {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
        }
      });
      
      if (response.data && response.data.data) {
        const topCategories = response.data.data
          .filter((cat: Category) => cat.products_count > 0)
          .sort((a: Category, b: Category) => b.products_count - a.products_count)
          .slice(0, 6);
        
        setCategories(topCategories);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    } finally {
      setLoadingCategories(false);
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

  const handleAiSearch = async (query?: string) => {
    const searchText = query || searchQuery;
    
    if (!searchText.trim()) {
      return;
    }

    setIsSearching(true);
    Keyboard.dismiss();
    setHasSearched(true);

    try {
      const token = await AsyncStorage.getItem('authToken');
      
      const response = await axios.get(`https://mandimore.com/products/search?q=${encodeURIComponent(searchText)}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
        },
      });

      if (response.data && response.data.data) {
        setSearchResults(response.data.data);
      } else {
        setSearchResults([]);
      }
    } catch (error) {
      console.error('Error performing AI search:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleCategoryPress = (category: Category) => {
    console.log('Category pressed:', category);
    if (onCategorySelect) {
      onCategorySelect(category);
      onClose();
    }
  };

  const handleProductPress = (product: Product) => {
    if (onProductSelect) {
      onProductSelect(product);
    }
    onClose();
  };

  const formatPrice = (price: string) => {
    return `Rs ${parseFloat(price).toLocaleString('en-PK')}`;
  };

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

  const renderCategoryItem = ({ item }: { item: Category }) => (
    <TouchableOpacity
      style={styles.categoryGridCard}
      onPress={() => handleCategoryPress(item)}
      activeOpacity={0.7}
    >
      <View style={styles.categoryEmojiContainer}>
        <Text style={styles.categoryEmoji}>{getCategoryEmoji(item.name)}</Text>
      </View>
      <Text style={styles.categoryGridTitle} numberOfLines={2}>
        {item.name}
      </Text>
      <View style={styles.categoryGridBadge}>
        <Text style={styles.categoryGridCount}>{item.products_count}</Text>
      </View>
      <View style={styles.categoryArrowIcon}>
        <Ionicons name="arrow-forward" size={14} color="#f1641e" />
      </View>
    </TouchableOpacity>
  );

  const renderEmptyState = () => {
    if (!hasSearched) {
      return (
        <View style={styles.emptyState}>
          <View style={styles.emptyIconContainer}>
            <View style={styles.searchIconCircle}>
              <Ionicons name="search" size={24} color="#f1641e" />
            </View>
          </View>
          <Text style={styles.emptyTitle}>Find Your Perfect Pet</Text>
          <Text style={styles.emptySubtitle}>
            Use AI-powered search or browse by category
          </Text>
          
          <View style={styles.categoriesContainer}>
            <View style={styles.categoriesHeader}>
              <Text style={styles.categoriesTitle}>Popular Categories</Text>
              <View style={styles.categoryCountIndicator}>
                <Text style={styles.categoryCountIndicatorText}>
                  {categories.length} Categories
                </Text>
              </View>
            </View>
            
            {loadingCategories ? (
              <View style={styles.categoryLoader}>
                <ActivityIndicator size="small" color="#f1641e" />
                <Text style={styles.categoryLoadingText}>Loading...</Text>
              </View>
            ) : (
              <FlatList
                data={categories}
                renderItem={renderCategoryItem}
                keyExtractor={(item) => item.id.toString()}
                numColumns={2}
                columnWrapperStyle={styles.categoryGridRow}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.categoriesGrid}
              />
            )}
          </View>
        </View>
      );
    }

    return (
      <View style={styles.emptyState}>
        <View style={styles.emptyIconContainer}>
          <View style={styles.searchIconCircle}>
            <Ionicons name="sad-outline" size={32} color="#999" />
          </View>
        </View>
        <Text style={styles.emptyTitle}>No Results Found</Text>
        <Text style={styles.emptySubtitle}>
          Try different keywords or browse categories
        </Text>
        <TouchableOpacity 
          style={styles.retryButton}
          onPress={() => {
            setSearchQuery('');
            setHasSearched(false);
            setSearchResults([]);
          }}
        >
          <Ionicons name="refresh" size={16} color="#fff" />
          <Text style={styles.retryButtonText}>New Search</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={true}
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        style={styles.modalOverlay}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={styles.modalOverlay}>
            <Animated.View
              style={[
                styles.modalContent,
                {
                  opacity: fadeAnim,
                  transform: [{ translateY: slideAnim }],
                },
              ]}
            >
              {/* Compact Header */}
              <View style={styles.header}>
                <View style={styles.headerContent}>
                  <View style={styles.headerLeft}>
                    <View style={styles.aiIconBadge}>
                      <Ionicons name="sparkles" size={16} color="#f1641e" />
                    </View>
                    <Text style={styles.headerTitle}>AI Search</Text>
                  </View>
                  <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                    <Ionicons name="close" size={20} color="#333" />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Compact Search Bar */}
              <View style={styles.searchSection}>
                <View style={styles.searchWrapper}>
                  <View style={styles.searchBar}>
                    <Ionicons name="search" size={18} color="#999" />
                    <TextInput
                      ref={inputRef}
                      style={styles.searchInput}
                      placeholder="Search for pets..."
                      placeholderTextColor="#999"
                      value={searchQuery}
                      onChangeText={setSearchQuery}
                      onSubmitEditing={() => handleAiSearch()}
                      returnKeyType="search"
                      multiline={false}
                    />
                    {searchQuery.length > 0 && (
                      <TouchableOpacity
                        onPress={() => setSearchQuery('')}
                        style={styles.clearButton}
                      >
                        <Ionicons name="close-circle" size={18} color="#999" />
                      </TouchableOpacity>
                    )}
                  </View>

                  <TouchableOpacity
                    style={[
                      styles.submitButton,
                      (!searchQuery.trim() || isSearching) && styles.submitButtonDisabled,
                    ]}
                    onPress={() => handleAiSearch()}
                    disabled={!searchQuery.trim() || isSearching}
                  >
                    {isSearching ? (
                      <ActivityIndicator size="small" color="#fff" />
                    ) : (
                      <Ionicons name="send" size={18} color="#fff" />
                    )}
                  </TouchableOpacity>
                </View>
              </View>

              {/* Results Counter */}
              {hasSearched && !isSearching && searchResults.length > 0 && (
                <View style={styles.resultsCounter}>
                  <View style={styles.resultsCounterLeft}>
                    <Ionicons name="checkmark-circle" size={16} color="#4CAF50" />
                    <Text style={styles.resultsCounterText}>
                      {searchResults.length} {searchResults.length === 1 ? 'result' : 'results'}
                    </Text>
                  </View>
                </View>
              )}

              {/* Results Container */}
              <View style={styles.resultsContainer}>
                {isSearching ? (
                  <View style={styles.loadingContainer}>
                    <View style={styles.loadingSpinner}>
                      <ActivityIndicator size="large" color="#f1641e" />
                    </View>
                    <Text style={styles.loadingText}>Searching...</Text>
                  </View>
                ) : searchResults.length > 0 ? (
                  <FlatList
                    data={searchResults}
                    renderItem={renderProductItem}
                    keyExtractor={(item, index) => `${item.id}-${index}`}
                    numColumns={2}
                    columnWrapperStyle={styles.row}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.resultsList}
                  />
                ) : (
                  renderEmptyState()
                )}
              </View>
            </Animated.View>
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </Modal>
  );
};

export default AiSearchModal;

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    flex: 1,
    backgroundColor: '#fafafa',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    overflow: 'hidden',
  },

  // Compact Header
  header: {
    backgroundColor: '#fff',
    paddingTop: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  aiIconBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#fff5f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#333',
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Compact Search Section
  searchSection: {
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  searchWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 44,
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#333',
    paddingVertical: 0,
    paddingHorizontal: 10,
    fontWeight: '500',
  },
  clearButton: {
    padding: 2,
  },
  submitButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#f1641e',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#f1641e',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 4,
  },
  submitButtonDisabled: {
    backgroundColor: '#d0d0d0',
    shadowOpacity: 0,
  },

  // Results Counter
  resultsCounter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: '#f0f8f4',
  },
  resultsCounterLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  resultsCounterText: {
    fontSize: 13,
    color: '#2e7d32',
    fontWeight: '700',
    marginLeft: 6,
  },

  // Results Container
  resultsContainer: {
    flex: 1,
  },
  
  // Loading State
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 100,
  },
  loadingSpinner: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
  loadingText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '700',
  },

  // Product Cards
  resultsList: {
    paddingHorizontal: 10,
    paddingTop: 16,
    paddingBottom: 24,
  },
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

  // Empty State - FIXED
  emptyState: {
    flex: 1,
    paddingTop: 40,
    paddingHorizontal: 24,
  },
  emptyIconContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  searchIconCircle: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 6,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#333',
    textAlign: 'center',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 32,
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f1641e',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    alignSelf: 'center',
    shadowColor: '#f1641e',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 4,
  },
  retryButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#fff',
    marginLeft: 6,
  },

  // Categories
  categoriesContainer: {
    flex: 1,
  },
  categoriesHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  categoriesTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#333',
  },
  categoryCountIndicator: {
    backgroundColor: '#fff5f0',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  categoryCountIndicatorText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#f1641e',
  },
  categoryLoader: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  categoryLoadingText: {
    marginTop: 10,
    fontSize: 13,
    color: '#999',
    fontWeight: '500',
  },
  categoriesGrid: {
    paddingBottom: 20,
  },
  categoryGridRow: {
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  categoryGridCard: {
    width: '48%',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 14,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#f5f5f5',
    position: 'relative',
  },
  categoryEmojiContainer: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#fff5f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  categoryEmoji: {
    fontSize: 28,
  },
  categoryGridTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#333',
    textAlign: 'center',
    marginBottom: 8,
    minHeight: 32,
  },
  categoryGridBadge: {
    backgroundColor: '#f1641e',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  categoryGridCount: {
    fontSize: 12,
    fontWeight: '800',
    color: '#fff',
  },
  categoryArrowIcon: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#fff5f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
});