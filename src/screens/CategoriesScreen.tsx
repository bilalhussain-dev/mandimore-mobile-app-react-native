import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@react-native-vector-icons/ionicons';
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 48) / 2;

// Emoji mapping for categories
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

interface Category {
  id: number;
  name: string;
  short_info: string | null;
  slug: string;
  products_count: number;
  product_count: number;
}

interface ApiResponse {
  code: number;
  message: string;
  data: Category[];
}

const CategoriesScreen = () => {
  const navigation = useNavigation<any>();
  
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    const token = await AsyncStorage.getItem('authToken');
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('https://mandimore.com/v1/fetch_all_categories', {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        }
      });
      const json: ApiResponse = await response.json();
      
      if (json.code === 200 && json.data) {
        // Sort by product count (descending) to show categories with items first
        const sortedCategories = json.data.sort((a, b) => b.product_count - a.product_count);
        setCategories(sortedCategories);
      } else {
        setError('Failed to load categories');
      }
    } catch (err) {
      setError('Unable to fetch categories. Please try again.');
      console.error('Error fetching categories:', err);
    } finally {
      setLoading(false);
    }
  };

  const getEmojiForCategory = (name: string): string => {
    return categoryEmojis[name] || '🐾';
  };

  const renderHeader = () => (
    <View style={styles.headerContainer}>
      {/* Compact Gradient Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backBtn}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={22} color="#fff" />
        </TouchableOpacity>
        
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>All Categories</Text>
          <Text style={styles.headerSubtitle}>{categories.length} available</Text>
        </View>
      </View>
    </View>
  );

  const renderItem = ({ item }: { item: Category }) => (
    <TouchableOpacity 
      style={styles.card} 
      onPress={() => navigation.navigate('Category', { category: item })}
      activeOpacity={0.7}
    >
      {/* Count badge */}
      {item.product_count > 0 && (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{item.product_count}</Text>
        </View>
      )}
      
      <View style={styles.emojiCircle}>
        <Text style={styles.emoji}>{getEmojiForCategory(item.name)}</Text>
      </View>
      
      <Text style={styles.categoryName} numberOfLines={2}>
        {item.name}
      </Text>

      {/* Bottom accent */}
      <View style={styles.bottomAccent} />
    </TouchableOpacity>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="paw-outline" size={64} color="#ddd" />
      <Text style={styles.emptyText}>No categories available</Text>
      <Text style={styles.emptySubtext}>Check back later</Text>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <StatusBar barStyle="light-content" backgroundColor="#f1641e" />
        <ActivityIndicator size="large" color="#f1641e" />
        <Text style={styles.loadingText}>Loading categories...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.loadingContainer}>
        <StatusBar barStyle="light-content" backgroundColor="#f1641e" />
        <Ionicons name="alert-circle-outline" size={64} color="#f1641e" />
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={fetchCategories}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#f1641e" />
      
      <FlatList
        data={categories}
        renderItem={renderItem}
        keyExtractor={(item) => item.id.toString()}
        numColumns={2}
        columnWrapperStyle={styles.row}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmptyState}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

export default CategoriesScreen;

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

  // Header Container
  headerContainer: {
    marginBottom: 20,
  },

  // Compact Gradient Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 20,
    backgroundColor: '#f1641e',
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    shadowColor: '#f1641e',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 6,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#fff',
    marginBottom: 2,
  },
  headerSubtitle: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.9)',
    fontWeight: '500',
  },

  // List
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  row: {
    justifyContent: 'space-between',
    marginBottom: 16,
  },

  // Modern Card Design
  card: {
    width: CARD_WIDTH,
    backgroundColor: '#fff',
    borderRadius: 20,
    paddingVertical: 24,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 3 },
  },
  emojiCircle: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#fff5f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14,
    borderWidth: 3,
    borderColor: '#ffe8dc',
  },
  emoji: {
    fontSize: 38,
  },
  categoryName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#333',
    textAlign: 'center',
    minHeight: 38,
    lineHeight: 19,
  },
  badge: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: '#f1641e',
    borderRadius: 14,
    paddingHorizontal: 10,
    paddingVertical: 5,
    shadowColor: '#f1641e',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
    elevation: 4,
  },
  badgeText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '900',
  },
  bottomAccent: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 4,
    backgroundColor: '#f1641e',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },

  // Empty State
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
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

  // Error State
  errorText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 20,
    paddingHorizontal: 40,
  },
  retryButton: {
    backgroundColor: '#f1641e',
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 12,
    shadowColor: '#f1641e',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
});