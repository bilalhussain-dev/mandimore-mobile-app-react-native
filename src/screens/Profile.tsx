// ProfileScreen.tsx
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  StyleSheet,
  Image,
  RefreshControl,
  Alert,
  FlatList,
  Dimensions,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { Ionicons } from "@react-native-vector-icons/ionicons";
import { useNavigation, useRoute } from "@react-navigation/native";
import LinearGradient from "react-native-linear-gradient";

const PRIMARY_COLOR = "#f1641e";
const { width } = Dimensions.get("window");
const CARD_WIDTH = (width - 48) / 2;

const ProfileScreen = () => {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const navigation = useNavigation();
  const route = useRoute<any>();
  const userId = route.params?.PROFILE?.id;

  useEffect(() => {
    if (userId) fetchProfile();
    getCurrentUser();
  }, [userId]);

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

  const fetchProfile = async () => {
    try {
      const token = await AsyncStorage.getItem("authToken");
      const response = await axios.get(
        `https://mandimore.com/v1/user_profile/${userId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        }
      );
      setProfile(response.data.data);
    } catch (error: any) {
      console.log("Error fetching profile:", error.response?.data || error);
      Alert.alert("Error", "Failed to load profile data.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleDeleteListing = async (listingId: number) => {
    Alert.alert(
      "Delete Listing",
      "Are you sure you want to delete this listing? This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              setDeletingId(listingId);
              const token = await AsyncStorage.getItem("authToken");
              
              await axios.delete(
                `https://mandimore.com/v1/products/${listingId}`,
                {
                  headers: {
                    Authorization: `Bearer ${token}`,
                    Accept: "application/json",
                  },
                }
              );

              Alert.alert("Success", "Listing deleted successfully!");
              fetchProfile(); // Refresh the profile
            } catch (error: any) {
              console.error("Error deleting listing:", error);
              Alert.alert(
                "Error",
                error.response?.data?.message || "Failed to delete listing. Please try again."
              );
            } finally {
              setDeletingId(null);
            }
          },
        },
      ]
    );
  };

  const handleLogout = async () => {
    Alert.alert(
      "Logout",
      "Are you sure you want to logout?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Logout",
          style: "destructive",
          onPress: async () => {
            await AsyncStorage.removeItem("authToken");
            navigation.reset({
              index: 0,
              routes: [{ name: "Login" as never }],
            });
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={PRIMARY_COLOR} />
        <Text style={styles.loadingText}>Loading profile...</Text>
      </View>
    );
  }

  if (!profile) {
    return (
      <View style={styles.loadingContainer}>
        <Ionicons name="person-circle-outline" size={80} color="#ccc" />
        <Text style={styles.noDataText}>No profile data found.</Text>
      </View>
    );
  }

  const products = profile.products || [];
  const isOwnProfile = currentUserId === userId;

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              fetchProfile();
            }}
            colors={[PRIMARY_COLOR]}
          />
        }
      >
        {/* Header Section */}
        <LinearGradient
          colors={[PRIMARY_COLOR, "#ff8c4c"]}
          style={styles.headerGradient}
        >
          <View style={styles.avatarContainer}>
            <Image
              source={{
                uri:
                  profile.user_avatar_url ||
                  "https://cdn-icons-png.flaticon.com/512/149/149071.png",
              }}
              style={styles.avatar}
            />
            {profile.verified && (
              <View style={styles.verifiedBadge}>
                <Ionicons name="checkmark-circle" size={24} color={PRIMARY_COLOR} />
              </View>
            )}
          </View>
          <Text style={styles.name}>
            {profile.first_name} {profile.last_name}
          </Text>
          <Text style={styles.username}>@{profile.username}</Text>

          {/* Stats Row */}
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{products.length}</Text>
              <Text style={styles.statLabel}>Listings</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Ionicons 
                name={profile.verified ? "shield-checkmark" : "shield-outline"} 
                size={20} 
                color="#fff" 
              />
              <Text style={styles.statLabel}>
                {profile.verified ? "Verified" : "Unverified"}
              </Text>
            </View>
          </View>
        </LinearGradient>

        {/* Info Section */}
        <View style={styles.infoCard}>
          <View style={styles.sectionHeader}>
            <Ionicons name="information-circle" size={22} color={PRIMARY_COLOR} />
            <Text style={styles.sectionTitle}>Contact Information</Text>
          </View>
          <InfoRow
            icon="call"
            label="Mobile"
            value={profile.mobile_number}
            iconBg="#fff5f0"
            iconColor={PRIMARY_COLOR}
          />
          <InfoRow
            icon="logo-whatsapp"
            label="WhatsApp"
            value={profile.whatsapp_number}
            iconBg="#e8f5e9"
            iconColor="#25D366"
          />
          <InfoRow
            icon="mail"
            label="Email"
            value={profile.email}
            iconBg="#fff5f0"
            iconColor={PRIMARY_COLOR}
          />
        </View>

        {/* Products Section */}
        <View style={styles.productsContainer}>
          <View style={styles.sectionHeader}>
            <Ionicons name="grid" size={22} color={PRIMARY_COLOR} />
            <Text style={styles.sectionTitle}>
              {isOwnProfile ? "My Listings" : "Listings"}
            </Text>
          </View>

          {products.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="paw-outline" size={64} color="#ddd" />
              <Text style={styles.emptyStateTitle}>No Listings Yet</Text>
              <Text style={styles.emptyStateText}>
                {isOwnProfile 
                  ? "You haven't posted any listings yet. Start selling today!"
                  : "This user hasn't posted any listings yet."}
              </Text>
            </View>
          ) : (
            <View style={styles.productsGrid}>
              {products.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  navigation={navigation}
                  userProfile={profile}
                  isOwnProfile={isOwnProfile}
                  onDelete={handleDeleteListing}
                  isDeleting={deletingId === product.id}
                />
              ))}
            </View>
          )}
        </View>

        {/* Logout Button - Only show for own profile */}
        {isOwnProfile && (
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Ionicons name="log-out-outline" size={22} color={PRIMARY_COLOR} />
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
};

// Info Row Component
const InfoRow = ({ icon, label, value, iconBg, iconColor }: any) => (
  <View style={styles.infoRow}>
    <View style={[styles.iconCircle, { backgroundColor: iconBg }]}>
      <Ionicons name={icon} size={18} color={iconColor} />
    </View>
    <View style={styles.infoContent}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value || "Not provided"}</Text>
    </View>
  </View>
);

// Product Card Component
const ProductCard = ({ 
  product, 
  navigation, 
  userProfile, 
  isOwnProfile,
  onDelete,
  isDeleting 
}: any) => {
  const images = product.image_urls || [];
  const mainImage = images.length > 0 ? images[0] : "https://via.placeholder.com/400x300?text=No+Image";

  // Create enriched product data with user info
  const enrichedProduct = {
    ...product,
    user: {
      id: userProfile.id,
      first_name: userProfile.first_name,
      last_name: userProfile.last_name,
      username: userProfile.username,
      mobile_number: userProfile.mobile_number,
      whatsapp_number: userProfile.whatsapp_number,
      user_avatar_url: userProfile.user_avatar_url,
      verified: userProfile.verified,
      email: userProfile.email,
    },
  };

  const formatPrice = (price: any) => {
    return `Rs ${parseFloat(price).toLocaleString('en-PK')}`;
  };

  return (
    <TouchableOpacity
      style={styles.productCard}
      onPress={() =>
        navigation.navigate("ListingDetail", { LISTING_DETAIL: enrichedProduct })
      }
      activeOpacity={0.9}
      disabled={isDeleting}
    >
      <View style={styles.imageWrapper}>
        <Image source={{ uri: mainImage }} style={styles.productImage} />
        
        {/* Image Count Badge */}
        {images.length > 1 && (
          <View style={styles.imageBadge}>
            <Ionicons name="images-outline" size={12} color="#fff" />
            <Text style={styles.imageBadgeText}>{images.length}</Text>
          </View>
        )}

        {/* Health Badge */}
        {product.health_status === "excellent" && (
          <View style={styles.healthBadgeCard}>
            <Ionicons name="shield-checkmark" size={12} color={PRIMARY_COLOR} />
          </View>
        )}

        {/* Delete Button - Only show for own profile */}
        {isOwnProfile && (
          <TouchableOpacity
            style={styles.deleteBtn}
            onPress={() => onDelete(product.id)}
            disabled={isDeleting}
          >
            {isDeleting ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Ionicons name="trash-outline" size={16} color="#fff" />
            )}
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.productDetails}>
        <Text style={styles.productTitle} numberOfLines={2}>
          {product.title}
        </Text>
        
        {/* Breed Badge */}
        <View style={styles.breedContainer}>
          <View style={styles.breedBadge}>
            <Text style={styles.breedText} numberOfLines={1}>
              {product.breed || "Mixed Breed"}
            </Text>
          </View>
        </View>

        {/* Details Row */}
        <View style={styles.detailsRow}>
          {product.age && (
            <View style={styles.detailItem}>
              <Ionicons name="time-outline" size={12} color="#999" />
              <Text style={styles.detailText}>{product.age}</Text>
            </View>
          )}
          {product.weight && (
            <View style={styles.detailItem}>
              <Ionicons name="scale-outline" size={12} color="#999" />
              <Text style={styles.detailText}>{product.weight}</Text>
            </View>
          )}
        </View>

        {/* Location */}
        {product.address && (
          <View style={styles.locationRow}>
            <Ionicons name="location-outline" size={12} color="#666" />
            <Text style={styles.location} numberOfLines={1}>
              {product.address}
            </Text>
          </View>
        )}

        {/* Price Row */}
        <View style={styles.priceRow}>
          <Text style={styles.productPrice}>
            {formatPrice(product.price)}
          </Text>
          <View style={styles.viewDetailsBtn}>
            <Ionicons name="arrow-forward" size={14} color={PRIMARY_COLOR} />
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8f9fa" },
  scrollView: { flex: 1 },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f8f9fa",
  },
  loadingText: { marginTop: 12, color: "#666", fontSize: 15, fontWeight: "500" },
  noDataText: { marginTop: 16, color: "#666", fontSize: 16 },

  headerGradient: {
    alignItems: "center",
    paddingTop: 60,
    paddingBottom: 30,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  avatarContainer: {
    position: "relative",
    marginBottom: 16,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 4,
    borderColor: "#fff",
  },
  verifiedBadge: {
    position: "absolute",
    bottom: 5,
    right: 5,
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 2,
  },
  name: {
    fontSize: 24,
    fontWeight: "700",
    color: "#fff",
    marginBottom: 4,
  },
  username: {
    color: "#ffe1d3",
    fontSize: 15,
    fontWeight: "500",
  },
  statsContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 20,
    paddingVertical: 16,
    paddingHorizontal: 32,
    marginTop: 20,
  },
  statItem: {
    alignItems: "center",
    paddingHorizontal: 20,
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: "rgba(255, 255, 255, 0.3)",
  },
  statNumber: {
    fontSize: 20,
    fontWeight: "700",
    color: "#fff",
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: "#ffe1d3",
    fontWeight: "500",
    marginTop: 4,
  },

  infoCard: {
    backgroundColor: "#fff",
    margin: 16,
    marginTop: 24,
    borderRadius: 20,
    padding: 20,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1a1a1a",
    marginLeft: 8,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f9f9f9",
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  infoContent: {
    flex: 1,
    marginLeft: 12,
  },
  infoLabel: {
    fontSize: 12,
    color: "#888",
    marginBottom: 2,
    fontWeight: "500",
  },
  infoValue: {
    fontSize: 15,
    color: "#333",
    fontWeight: "600",
  },

  productsContainer: {
    marginHorizontal: 16,
    marginTop: 8,
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 60,
    paddingHorizontal: 40,
    backgroundColor: "#fff",
    borderRadius: 20,
    marginTop: 8,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#333",
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 14,
    color: "#888",
    textAlign: "center",
    lineHeight: 20,
  },

  productsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginTop: 8,
  },

  productCard: {
    width: CARD_WIDTH,
    backgroundColor: "#fff",
    borderRadius: 16,
    marginBottom: 16,
    overflow: "hidden",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
  },
  imageWrapper: {
    position: "relative",
  },
  productImage: {
    width: "100%",
    height: 160,
    backgroundColor: "#f0f0f0",
  },
  imageBadge: {
    position: "absolute",
    top: 8,
    left: 8,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  imageBadgeText: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "600",
    marginLeft: 4,
  },
  healthBadgeCard: {
    position: "absolute",
    bottom: 8,
    left: 8,
    backgroundColor: "#fff",
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    elevation: 2,
  },
  deleteBtn: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(244, 67, 54, 0.9)",
    justifyContent: "center",
    alignItems: "center",
    elevation: 2,
  },
  productDetails: {
    padding: 12,
  },
  productTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#333",
    marginBottom: 6,
    lineHeight: 20,
  },
  breedContainer: {
    marginBottom: 8,
  },
  breedBadge: {
    alignSelf: "flex-start",
    backgroundColor: "#fff5f0",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#ffe0d1",
  },
  breedText: {
    fontSize: 11,
    fontWeight: "600",
    color: PRIMARY_COLOR,
  },
  detailsRow: {
    flexDirection: "row",
    marginBottom: 6,
  },
  detailItem: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 12,
  },
  detailText: {
    fontSize: 11,
    color: "#999",
    marginLeft: 3,
    fontWeight: "500",
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  location: {
    fontSize: 11,
    color: "#666",
    marginLeft: 3,
    flex: 1,
  },
  priceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 4,
  },
  productPrice: {
    color: PRIMARY_COLOR,
    fontWeight: "700",
    fontSize: 16,
  },
  viewDetailsBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#fff5f0",
    justifyContent: "center",
    alignItems: "center",
  },

  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
    borderWidth: 2,
    borderColor: PRIMARY_COLOR,
    marginHorizontal: 16,
    marginTop: 24,
    paddingVertical: 14,
    borderRadius: 30,
    elevation: 2,
  },
  logoutText: {
    color: PRIMARY_COLOR,
    fontWeight: "700",
    marginLeft: 8,
    fontSize: 16,
  },
});

export default ProfileScreen;