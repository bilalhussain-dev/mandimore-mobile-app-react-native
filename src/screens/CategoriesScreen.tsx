import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import AsyncStorage from "@react-native-async-storage/async-storage";

const { width } = Dimensions.get('window');

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
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const navigation = useNavigation();

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

  const renderItem = ({ item }: { item: Category }) => (
    <TouchableOpacity style={styles.card} onPress={() => navigation.navigate('Category', { category: item })}>
      {/* Count badge - only show if count > 0 */}
      {item.product_count > 0 && (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{item.product_count}</Text>
        </View>
      )}
      <Text style={styles.emoji}>{getEmojiForCategory(item.name)}</Text>
      <Text style={styles.name}>{item.name}</Text>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color="#f1641e" />
        <Text style={styles.loadingText}>Loading categories...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <Text style={styles.errorText}>😕 {error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={fetchCategories}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>🐾 Browse Categories</Text>
      <Text style={styles.subHeader}>
        Find what you're looking for by category ({categories.length} categories)
      </Text>
      <FlatList
        data={categories}
        renderItem={renderItem}
        keyExtractor={(item) => item.id.toString()}
        numColumns={2}
        columnWrapperStyle={styles.row}
        contentContainerStyle={{ paddingBottom: 20 }}
      />
    </View>
  );
};

export default CategoriesScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f7f7f7',
    paddingTop: 20,
    paddingHorizontal: 16,
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    fontSize: 22,
    fontWeight: '700',
    color: '#222',
    textAlign: 'left',
  },
  subHeader: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
  },
  row: {
    justifyContent: 'space-between',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 14,
    paddingVertical: 20,
    paddingHorizontal: 15,
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    margin: 8,
    maxWidth: (width - 48) / 2,
    position: 'relative',
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  emoji: {
    fontSize: 32,
    marginBottom: 6,
  },
  name: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
  },
  badge: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: '#f1641e',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  badgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
  errorText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: '#f1641e',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});