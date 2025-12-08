import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  Dimensions,
  ScrollView,
  TouchableOpacity,
  Linking,
  Share,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@react-native-vector-icons/ionicons';
import Swiper from 'react-native-swiper';
import { useRoute, useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import CreateOrEditProductModal, { ProductFormData } from '../components/createOrEditProductModal';

const { width } = Dimensions.get('window');

const ListingDetail = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { LISTING_DETAIL } = route.params || {};

  const [isFavorite, setIsFavorite] = useState(false);
  const [loadingFavorite, setLoadingFavorite] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [currentUserId, setCurrentUserId] = useState(null);

  useEffect(() => {
    if (LISTING_DETAIL?.id) {
      checkIfFavorite();
    }
    getCurrentUser();
  }, [LISTING_DETAIL?.id]);

  const getCurrentUser = async () => {
    try {
      const userDataString = await AsyncStorage.getItem('current_user');
      if (userDataString) {
        const userData = JSON.parse(userDataString);
        setCurrentUserId(userData.id);
      }
    } catch (error) {
      console.error('Error getting current user:', error);
    }
  };

  const checkIfFavorite = async () => {
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
        const favoriteIds = response.data.data.map(
          fav => fav.listing?.id || fav.listing_id || fav.id
        );
        setIsFavorite(favoriteIds.includes(LISTING_DETAIL.id));
      }
    } catch (error) {
      console.error('Error checking favorite status:', error);
    }
  };

  const toggleFavorite = async () => {
    try {
      const token = await AsyncStorage.getItem('authToken');
      
      if (!token) {
        Alert.alert(
          'Login Required',
          'Please login to add items to favorites'
        );
        return;
      }

      setLoadingFavorite(true);

      // Optimistic UI update
      setIsFavorite(!isFavorite);

      if (isFavorite) {
        // Remove from favorites
        await axios.delete(
          `https://mandimore.com/v1/favorites/${LISTING_DETAIL.id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              Accept: 'application/json',
            },
          }
        );
      } else {
        // Add to favorites
        await axios.post(
          `https://mandimore.com/v1/favorites/${LISTING_DETAIL.id}`,
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
      setIsFavorite(!isFavorite);
      Alert.alert('Error', 'Failed to update favorites. Please try again.');
    } finally {
      setLoadingFavorite(false);
    }
  };

  const handleEditSubmit = () => {
    // Refresh the listing details or navigate back
    setEditModalVisible(false);
    // You might want to refresh the data here or navigate back
    Alert.alert('Success', 'Listing updated successfully!', [
      {
        text: 'OK',
        onPress: () => {
          // Optionally refresh data or navigate
          navigation.goBack();
        }
      }
    ]);
  };

  if (!LISTING_DETAIL) return null;

  const {
    title,
    breed,
    description,
    age,
    color,
    weight,
    height,
    price,
    health_status,
    address,
    image_urls,
    user,
    country,
    province,
    latitude,
    longitude,
    category_id,
    custom_button,
  } = LISTING_DETAIL;

  const images = image_urls && image_urls.length > 0 ? image_urls : [];

  const petDetails = [
    { label: 'Breed', value: breed, icon: 'paw' },
    { label: 'Age', value: age, icon: 'time' },
    { label: 'Color', value: color, icon: 'color-palette' },
    { label: 'Weight', value: weight, icon: 'fitness' },
    { label: 'Height', value: height, icon: 'resize' },
    { label: 'Health', value: health_status, icon: 'medical' },
  ];

  const handleCall = () => {
    if (user?.mobile_number) Linking.openURL(`tel:${user.mobile_number}`);
  };

  const handleWhatsApp = () => {
    if (user?.whatsapp_number) {
      const phone = user.whatsapp_number.replace('+', '');
      const message = encodeURIComponent(
        `Hi ${user.first_name}, I'm interested in your listing "${title}" on Mandimore.`,
      );
      Linking.openURL(`https://wa.me/${phone}?text=${message}`);
    }
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Check out this listing: ${title} - PKR ${parseFloat(
          price,
        ).toLocaleString()} on Mandimore!`,
        title: title,
      });
    } catch (error) {
      console.log('Share error:', error);
    }
  };

  const seller = {
    name: `${user?.first_name || ''} ${user?.last_name || ''}`,
    avatar: user?.user_avatar_url || 'https://i.pravatar.cc/150?img=5',
    verified: user?.verified,
    mobile: user?.mobile_number,
    whatsapp: user?.whatsapp_number,
    username: user?.username,
  };

  const stripHtml = html => {
    return html?.replace(/<[^>]*>?/gm, '').trim() || 'No description available';
  };

  // Prepare initial data for edit mode
  const initialEditData: ProductFormData = {
    title: title || '',
    breed: breed || '',
    description: stripHtml(description),
    age: age || '',
    color: color || '',
    weight: weight || '',
    height: height || '',
    price: price?.toString() || '',
    health_status: health_status || '',
    country: country || 'Pakistan',
    province: province || '',
    address: address || '',
    latitude: latitude?.toString() || '',
    longitude: longitude?.toString() || '',
    category_id: category_id?.toString() || '',
    custom_button: custom_button || '',
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.headerBtn}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={22} color="#333" />
        </TouchableOpacity>
        <View style={styles.headerRight}>
          {currentUserId && currentUserId === user?.id && (
            <TouchableOpacity 
              style={[styles.headerBtn, { marginRight: 8 }]}
              onPress={() => setEditModalVisible(true)}
            >
              <Ionicons name="create-outline" size={20} color="#333" />
            </TouchableOpacity>
          )}
          
          <TouchableOpacity style={styles.headerBtn} onPress={handleShare}>
            <Ionicons name="share-social-outline" size={20} color="#333" />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[
              styles.headerBtn, 
              { marginLeft: 8 },
              isFavorite && styles.headerBtnActive
            ]}
            onPress={toggleFavorite}
            disabled={loadingFavorite}
          >
            {loadingFavorite ? (
              <ActivityIndicator size="small" color={isFavorite ? "#fff" : "#f1641e"} />
            ) : (
              <Ionicons 
                name={isFavorite ? "heart" : "heart-outline"} 
                size={20} 
                color={isFavorite ? "#fff" : "#333"} 
              />
            )}
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        style={styles.scrollView}
      >
        {/* Image Slider */}
        <View style={styles.imageContainer}>
          <Swiper
            autoplay={false}
            height={320}
            dotStyle={styles.dot}
            activeDotStyle={styles.activeDot}
            paginationStyle={styles.pagination}
          >
            {images.map((img, i) => (
              <View key={i} style={styles.slide}>
                <Image source={{ uri: img }} style={styles.image} />
              </View>
            ))}
          </Swiper>

          {/* Image Counter Badge */}
          <View style={styles.imageCountBadge}>
            <Ionicons name="images" size={14} color="#fff" />
            <Text style={styles.imageCountText}>{images.length}</Text>
          </View>
        </View>

        {/* Main Content Card */}
        <View style={styles.contentCard}>
          {/* Title & Price Section */}
          <View style={styles.titleSection}>
            <View style={styles.titleRow}>
              <Text style={styles.title}>{title}</Text>
            </View>
            <View style={styles.priceRow}>
              <View>
                <Text style={styles.priceLabel}>Price</Text>
                <Text style={styles.price}>
                  PKR {parseFloat(price).toLocaleString()}
                </Text>
              </View>
              {health_status === 'excellent' && (
                <View style={styles.healthBadge}>
                  <Ionicons name="shield-checkmark" size={14} color="#4CAF50" />
                  <Text style={styles.healthText}>Excellent Health</Text>
                </View>
              )}
            </View>
          </View>

          {/* Location */}
          <View style={styles.locationContainer}>
            <Ionicons name="location" size={18} color="#f1641e" />
            <Text style={styles.locationText}>{address}</Text>
          </View>

          {/* Details Grid */}
          <View style={styles.detailsSection}>
            <Text style={styles.sectionTitle}>Details</Text>
            <View style={styles.detailsGrid}>
              {petDetails.map((detail, index) => (
                <View key={index} style={styles.detailCard}>
                  <View style={styles.detailIconContainer}>
                    <Ionicons name={detail.icon} size={18} color="#f1641e" />
                  </View>
                  <Text style={styles.detailLabel}>{detail.label}</Text>
                  <Text style={styles.detailValue}>
                    {detail.value || 'N/A'}
                  </Text>
                </View>
              ))}
            </View>
          </View>

          {/* Description */}
          <View style={styles.descriptionSection}>
            <Text style={styles.sectionTitle}>About</Text>
            <Text style={styles.description}>{stripHtml(description)}</Text>
          </View>

          {/* Seller Card */}
          <View style={styles.sellerSection}>
            <Text style={styles.sectionTitle}>Seller</Text>
            <View style={styles.sellerCard}>
              <Image
                source={{ uri: seller.avatar }}
                style={styles.sellerAvatar}
              />
              <View style={styles.sellerInfo}>
                <View style={styles.sellerNameRow}>
                  <Text style={styles.sellerName}>{seller.name}</Text>
                  {seller.verified && (
                    <View style={styles.verifiedBadge}>
                      <Ionicons
                        name="checkmark-circle"
                        size={16}
                        color="#f1641e"
                      />
                    </View>
                  )}
                </View>
                <Text style={styles.sellerUsername}>@{seller.username}</Text>
              </View>

              <TouchableOpacity
                style={styles.messageIconBtn}
                onPress={() =>
                  navigation.navigate('Profile', { PROFILE: { id: user.id } })
                }
              >
                <Ionicons
                  name="chatbubble-ellipses"
                  size={20}
                  color="#f1641e"
                />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Bottom Action Bar */}
      <View style={styles.bottomBar}>
        <TouchableOpacity style={styles.callBtn} onPress={handleCall}>
          <Ionicons name="call" size={20} color="#fff" />
          <Text style={styles.callText}>Call</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.whatsappBtn} onPress={handleWhatsApp}>
          <Ionicons name="logo-whatsapp" size={20} color="#fff" />
          <Text style={styles.whatsappText}>WhatsApp</Text>
        </TouchableOpacity>
      </View>

      {/* Edit Product Modal */}
      <CreateOrEditProductModal
        visible={editModalVisible}
        onClose={() => setEditModalVisible(false)}
        onSubmit={handleEditSubmit}
        editMode={true}
        initialData={initialEditData}
        listingId={LISTING_DETAIL.id}
      />
    </View>
  );
};

export default ListingDetail;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    position: 'absolute',
    top: 40,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    zIndex: 10,
  },
  headerRight: {
    flexDirection: 'row',
  },
  headerBtn: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  headerBtnActive: {
    backgroundColor: '#ff6b6b',
  },
  imageContainer: {
    position: 'relative',
  },
  slide: {
    flex: 1,
  },
  image: {
    width,
    height: 320,
    resizeMode: 'cover',
  },
  pagination: {
    bottom: 16,
  },
  dot: {
    backgroundColor: 'rgba(255,255,255,0.4)',
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  activeDot: {
    backgroundColor: '#f1641e',
    width: 24,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  imageCountBadge: {
    position: 'absolute',
    bottom: 24,
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  imageCountText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  contentCard: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    marginTop: -10,
    paddingTop: 24,
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  titleSection: {
    marginBottom: 16,
  },
  titleRow: {
    marginBottom: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1a1a1a',
    lineHeight: 32,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  priceLabel: {
    fontSize: 13,
    color: '#888',
    marginBottom: 4,
  },
  price: {
    fontSize: 28,
    color: '#f1641e',
    fontWeight: '700',
  },
  healthBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f1f8f4',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  healthText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#4CAF50',
    marginLeft: 4,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff5f0',
    padding: 12,
    borderRadius: 12,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#ffe0d1',
  },
  locationText: {
    fontSize: 14,
    color: '#333',
    marginLeft: 8,
    flex: 1,
    fontWeight: '500',
  },
  detailsSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 16,
  },
  detailsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  detailCard: {
    width: '31%',
    backgroundColor: '#f9f9f9',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    alignItems: 'center',
  },
  detailIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#fff5f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  detailLabel: {
    fontSize: 11,
    color: '#888',
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 13,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
  },
  descriptionSection: {
    marginBottom: 24,
  },
  description: {
    fontSize: 15,
    color: '#555',
    lineHeight: 24,
  },
  sellerSection: {
    marginBottom: 16,
  },
  sellerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9f9f9',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#eee',
  },
  sellerAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 2,
    borderColor: '#f1641e',
  },
  sellerInfo: {
    flex: 1,
    marginLeft: 12,
  },
  sellerNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  sellerName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1a1a1a',
  },
  verifiedBadge: {
    marginLeft: 6,
  },
  sellerUsername: {
    fontSize: 13,
    color: '#777',
    marginBottom: 4,
  },
  messageIconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingBottom: 20,
    borderTopWidth: 1,
    borderColor: '#eee',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  callBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f1641e',
    borderRadius: 12,
    paddingVertical: 14,
    marginRight: 8,
    elevation: 2,
  },
  callText: {
    color: '#fff',
    marginLeft: 8,
    fontWeight: '700',
    fontSize: 15,
  },
  whatsappBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#25D366',
    borderRadius: 12,
    paddingVertical: 14,
    marginLeft: 8,
    elevation: 2,
  },
  whatsappText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
    marginLeft: 8,
  },
});