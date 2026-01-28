import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  FlatList,
  Image,
  ActivityIndicator,
  Dimensions,
  Platform,
  PermissionsAndroid,
  RefreshControl,
  Linking,
} from 'react-native';
import { Ionicons } from '@react-native-vector-icons/ionicons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Geolocation from 'react-native-geolocation-service';
import axios from 'axios';

const { width, height } = Dimensions.get('window');
const THEME_COLOR = '#f1641e';

interface NearbyProduct {
  id: number;
  title: string;
  breed: string;
  description: string;
  age: string;
  color: string;
  weight: string;
  price: string;
  health_status: string;
  address: string;
  distance: number;
  image_urls: string[];
  user: {
    id: number;
    first_name: string;
    last_name: string;
    username: string;
    verified: boolean;
    user_avatar_url: string | null;
  };
}

interface NearbyProductsModalProps {
  visible: boolean;
  onClose: () => void;
  onProductSelect: (product: NearbyProduct) => void;
}

const RADIUS_OPTIONS = [10, 25, 50, 100, 200, 500];

const NearbyProductsModal: React.FC<NearbyProductsModalProps> = ({
  visible,
  onClose,
  onProductSelect,
}) => {
  const [products, setProducts] = useState<NearbyProduct[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedRadius, setSelectedRadius] = useState(200);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [permissionStatus, setPermissionStatus] = useState<string>('unknown');

  // Configure geolocation on mount
//   useEffect(() => {
//     Geolocation.setRNConfiguration({
//       skipPermissionRequests: false,
//       authorizationLevel: 'whenInUse',
//       locationProvider: 'auto',
//     });
//   }, []);

  // Request location permission for Android
  const requestAndroidPermission = async (): Promise<boolean> => {
    try {
      // Check if already granted
      const fineLocationGranted = await PermissionsAndroid.check(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
      );
      
      if (fineLocationGranted) {
        console.log('Location permission already granted');
        setPermissionStatus('granted');
        return true;
      }

      // Request both permissions
      const granted = await PermissionsAndroid.requestMultiple([
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION,
      ]);

      console.log('Permission results:', granted);

      const fineLocation = granted[PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION];
      const coarseLocation = granted[PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION];

      if (
        fineLocation === PermissionsAndroid.RESULTS.GRANTED ||
        coarseLocation === PermissionsAndroid.RESULTS.GRANTED
      ) {
        console.log('Location permission granted');
        setPermissionStatus('granted');
        return true;
      } else if (
        fineLocation === PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN ||
        coarseLocation === PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN
      ) {
        setPermissionStatus('never_ask_again');
        return false;
      } else {
        setPermissionStatus('denied');
        return false;
      }
    } catch (err) {
      console.warn('Permission request error:', err);
      setPermissionStatus('error');
      return false;
    }
  };

  // Request location permission
  const requestLocationPermission = async (): Promise<boolean> => {
    if (Platform.OS === 'ios') {
      return new Promise((resolve) => {
        Geolocation.requestAuthorization();
        // Give iOS time to process
        setTimeout(() => resolve(true), 500);
      });
    } else {
      return await requestAndroidPermission();
    }
  };

  // Open device settings
  const openSettings = () => {
    if (Platform.OS === 'ios') {
      Linking.openURL('app-settings:');
    } else {
      Linking.openSettings();
    }
  };

  const getCurrentLocation = useCallback(async (): Promise<{ lat: number; lng: number } | null> => {
    setLocationError(null);
    setError(null);
    
    console.log('Requesting location permission...');
    const hasPermission = await requestLocationPermission();
    
    if (!hasPermission) {
      console.log('Permission denied, status:', permissionStatus);
      if (permissionStatus === 'never_ask_again') {
        setLocationError('Location permission permanently denied. Please enable it in Settings.');
      } else {
        setLocationError('Location permission denied. Please allow location access.');
      }
      return null;
    }

    console.log('Permission granted, getting location...');

    return new Promise<{ lat: number; lng: number } | null>((resolve) => {
      Geolocation.getCurrentPosition(
        (position) => {
          console.log('Location received:', position.coords);
          const location = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          setUserLocation(location);
          setLocationError(null);
          resolve(location);
        },
        (geoError) => {
          console.error('Geolocation error:', geoError.code, geoError.message);
          
          let errorMessage = 'Unable to get your location.';
          
          switch (geoError.code) {
            case 1: // PERMISSION_DENIED
              errorMessage = 'Location permission denied. Please enable location in Settings.';
              setPermissionStatus('denied');
              break;
            case 2: // POSITION_UNAVAILABLE
              errorMessage = 'Location unavailable. Please check if GPS/Location is enabled on your device.';
              break;
            case 3: // TIMEOUT
              errorMessage = 'Location request timed out. Please try again.';
              break;
            default:
              errorMessage = `Location error: ${geoError.message}`;
          }
          
          setLocationError(errorMessage);
          resolve(null);
        },
        {
          enableHighAccuracy: false, // Set to false for faster response
          timeout: 30000, // Increased timeout
          maximumAge: 300000, // Accept cached location up to 5 minutes old
        }
      );
    });
  }, [permissionStatus]);

  const fetchNearbyProducts = useCallback(async (radius: number, isRefresh = false) => {
    if (!isRefresh) {
      setLoading(true);
    }
    setError(null);
    setLocationError(null);

    try {
      let location = userLocation;
      
      if (!location) {
        location = await getCurrentLocation();
        if (!location) {
          setLoading(false);
          setRefreshing(false);
          return;
        }
      }

      console.log('Fetching nearby products with location:', location, 'radius:', radius);

      const token = await AsyncStorage.getItem('authToken');
      
      const url = `https://mandimore.com/v1/nearby_products?lat=${location.lat}&lng=${location.lng}&radius=${radius}`;
      console.log('API URL:', url);

      const response = await axios.get(url, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
        },
      });

      console.log('API Response code:', response.data?.code);

      if (response.data && response.data.code === 200) {
        setProducts(response.data.data || []);
      } else {
        setError(response.data.message || 'Failed to fetch nearby products');
      }
    } catch (err: any) {
      console.error('Error fetching nearby products:', err);
      setError('Unable to load nearby products. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [userLocation, getCurrentLocation]);

  // Fetch products when modal becomes visible
  useEffect(() => {
    if (visible) {
      setUserLocation(null); // Reset to get fresh location
      fetchNearbyProducts(selectedRadius);
    }
  }, [visible]);

  // Refetch when radius changes (only if we have location)
  const handleRadiusChange = (radius: number) => {
    setSelectedRadius(radius);
    if (userLocation) {
      fetchNearbyProducts(radius);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    setUserLocation(null); // Force re-fetch location
    fetchNearbyProducts(selectedRadius, true);
  };

  const handleRetry = () => {
    setUserLocation(null);
    setLocationError(null);
    setError(null);
    fetchNearbyProducts(selectedRadius);
  };

  const formatPrice = (price: string) => {
    return `PKR ${parseFloat(price).toLocaleString('en-PK')}`;
  };

  const formatDistance = (distance: number) => {
    if (distance < 1) {
      return `${Math.round(distance * 1000)} m away`;
    }
    return `${distance.toFixed(1)} km away`;
  };

  const renderRadiusSelector = () => (
    <View style={styles.radiusContainer}>
      <Text style={styles.radiusLabel}>Search Radius:</Text>
      <FlatList
        horizontal
        data={RADIUS_OPTIONS}
        keyExtractor={(item) => item.toString()}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.radiusList}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[
              styles.radiusChip,
              selectedRadius === item && styles.radiusChipActive,
            ]}
            onPress={() => handleRadiusChange(item)}
          >
            <Text
              style={[
                styles.radiusChipText,
                selectedRadius === item && styles.radiusChipTextActive,
              ]}
            >
              {item} km
            </Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );

  const renderProductItem = ({ item }: { item: NearbyProduct }) => {
    const hasImage = item.image_urls && item.image_urls.length > 0;
    const imageUrl = hasImage ? item.image_urls[0] : 'https://via.placeholder.com/200';

    return (
      <TouchableOpacity
        style={styles.productCard}
        activeOpacity={0.9}
        onPress={() => {
          onProductSelect(item);
          onClose();
        }}
      >
        <Image source={{ uri: imageUrl }} style={styles.productImage} />
        
        <View style={styles.productContent}>
          <View style={styles.productHeader}>
            <Text style={styles.productTitle} numberOfLines={2}>
              {item.title}
            </Text>
            <View style={styles.distanceBadge}>
              <Ionicons name="navigate" size={10} color={THEME_COLOR} />
              <Text style={styles.distanceText}>{formatDistance(item.distance)}</Text>
            </View>
          </View>

          <View style={styles.breedRow}>
            <View style={styles.breedBadge}>
              <Text style={styles.breedText}>{item.breed}</Text>
            </View>
            {item.age && (
              <Text style={styles.ageText}>{item.age}</Text>
            )}
          </View>

          {item.address && (
            <View style={styles.locationRow}>
              <Ionicons name="location-outline" size={12} color="#666" />
              <Text style={styles.addressText} numberOfLines={1}>
                {item.address}
              </Text>
            </View>
          )}

          <View style={styles.productFooter}>
            <Text style={styles.priceText}>{formatPrice(item.price)}</Text>
            
            <View style={styles.sellerInfo}>
              {item.user.user_avatar_url ? (
                <Image
                  source={{ uri: item.user.user_avatar_url }}
                  style={styles.sellerAvatar}
                />
              ) : (
                <View style={styles.sellerAvatarPlaceholder}>
                  <Ionicons name="person" size={10} color="#999" />
                </View>
              )}
              <Text style={styles.sellerName} numberOfLines={1}>
                {item.user.first_name}
              </Text>
              {item.user.verified && (
                <Ionicons name="checkmark-circle" size={12} color={THEME_COLOR} />
              )}
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <View style={styles.emptyIconWrapper}>
        <Ionicons name="location-outline" size={60} color="#ccc" />
      </View>
      <Text style={styles.emptyTitle}>No Nearby Pets Found</Text>
      <Text style={styles.emptyText}>
        Try increasing the search radius or check back later for new listings.
      </Text>
      <TouchableOpacity style={styles.emptyButton} onPress={handleRetry}>
        <Ionicons name="refresh" size={18} color="#fff" />
        <Text style={styles.emptyButtonText}>Try Again</Text>
      </TouchableOpacity>
    </View>
  );

  const renderError = () => (
    <View style={styles.emptyContainer}>
      <View style={[styles.emptyIconWrapper, { backgroundColor: '#fff5f5' }]}>
        <Ionicons name="alert-circle-outline" size={60} color="#ff6b6b" />
      </View>
      <Text style={styles.emptyTitle}>{locationError ? 'Location Error' : 'Oops!'}</Text>
      <Text style={styles.emptyText}>{locationError || error}</Text>
      
      <View style={styles.errorButtonsContainer}>
        <TouchableOpacity style={styles.emptyButton} onPress={handleRetry}>
          <Ionicons name="refresh" size={18} color="#fff" />
          <Text style={styles.emptyButtonText}>Try Again</Text>
        </TouchableOpacity>
        
        {(permissionStatus === 'never_ask_again' || permissionStatus === 'denied' || locationError?.includes('Settings') || locationError?.includes('GPS')) && (
          <TouchableOpacity style={styles.settingsButton} onPress={openSettings}>
            <Ionicons name="settings-outline" size={18} color={THEME_COLOR} />
            <Text style={styles.settingsButtonText}>Open Settings</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <View style={styles.headerIconWrapper}>
              <Ionicons name="location" size={20} color="#fff" />
            </View>
            <View>
              <Text style={styles.headerTitle}>Nearby Pets</Text>
              <Text style={styles.headerSubtitle}>
                {userLocation
                  ? `${products.length} found within ${selectedRadius} km`
                  : 'Finding your location...'}
              </Text>
            </View>
          </View>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Ionicons name="close" size={24} color="#333" />
          </TouchableOpacity>
        </View>

        {/* Radius Selector */}
        {renderRadiusSelector()}

        {/* Content */}
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={THEME_COLOR} />
            <Text style={styles.loadingText}>
              {userLocation ? 'Finding nearby pets...' : 'Getting your location...'}
            </Text>
            <Text style={styles.loadingSubText}>
              Please make sure location/GPS is enabled
            </Text>
          </View>
        ) : error || locationError ? (
          renderError()
        ) : (
          <FlatList
            data={products}
            keyExtractor={(item) => item.id.toString()}
            renderItem={renderProductItem}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={renderEmpty}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={handleRefresh}
                colors={[THEME_COLOR]}
                tintColor={THEME_COLOR}
              />
            }
          />
        )}
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 20 : 16,
    paddingBottom: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  headerIconWrapper: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: THEME_COLOR,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
  },
  headerSubtitle: {
    fontSize: 13,
    color: '#666',
    marginTop: 2,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  radiusContainer: {
    backgroundColor: '#fff',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  radiusLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#666',
    paddingHorizontal: 20,
    marginBottom: 10,
  },
  radiusList: {
    paddingHorizontal: 16,
  },
  radiusChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f5f5f5',
    marginHorizontal: 4,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  radiusChipActive: {
    backgroundColor: THEME_COLOR,
    borderColor: THEME_COLOR,
  },
  radiusChipText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#666',
  },
  radiusChipTextActive: {
    color: '#fff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 15,
    color: '#666',
    fontWeight: '500',
  },
  loadingSubText: {
    marginTop: 8,
    fontSize: 13,
    color: '#999',
  },
  listContent: {
    padding: 16,
    paddingBottom: 40,
    flexGrow: 1,
  },
  productCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 16,
    marginBottom: 12,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
  },
  productImage: {
    width: 120,
    height: 140,
    backgroundColor: '#f0f0f0',
  },
  productContent: {
    flex: 1,
    padding: 12,
    justifyContent: 'space-between',
  },
  productHeader: {
    marginBottom: 6,
  },
  productTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#333',
    lineHeight: 20,
    marginBottom: 4,
  },
  distanceBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: '#fff5f0',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  distanceText: {
    fontSize: 11,
    fontWeight: '600',
    color: THEME_COLOR,
    marginLeft: 3,
  },
  breedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  breedBadge: {
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    marginRight: 8,
  },
  breedText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#666',
  },
  ageText: {
    fontSize: 11,
    color: '#999',
    fontWeight: '500',
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  addressText: {
    fontSize: 11,
    color: '#666',
    marginLeft: 4,
    flex: 1,
  },
  productFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  priceText: {
    fontSize: 16,
    fontWeight: '700',
    color: THEME_COLOR,
  },
  sellerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sellerAvatar: {
    width: 20,
    height: 20,
    borderRadius: 10,
    marginRight: 5,
  },
  sellerAvatarPlaceholder: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 5,
  },
  sellerName: {
    fontSize: 11,
    color: '#666',
    fontWeight: '500',
    marginRight: 3,
    maxWidth: 60,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyIconWrapper: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  errorButtonsContainer: {
    alignItems: 'center',
  },
  emptyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: THEME_COLOR,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 25,
    marginBottom: 12,
  },
  emptyButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#fff',
    marginLeft: 8,
  },
  settingsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: THEME_COLOR,
  },
  settingsButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: THEME_COLOR,
    marginLeft: 8,
  },
});

export default NearbyProductsModal;