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

const ProfileScreen = () => {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const navigation = useNavigation();
  const route = useRoute<any>();
  const userId = route.params?.PROFILE?.id;

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

  useEffect(() => {
    if (userId) fetchProfile();
  }, [userId]);

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
        <Text style={styles.loadingText}>Loading your profile...</Text>
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
                <Ionicons name="checkmark-circle" size={24} color="#4CAF50" />
              </View>
            )}
          </View>
          <Text style={styles.name}>
            {profile.first_name} {profile.last_name}
          </Text>
          <Text style={styles.username}>@{profile.username}</Text>
          <Text style={styles.email}>{profile.email}</Text>

          {/* Stats Row */}
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{products.length}</Text>
              <Text style={styles.statLabel}>Listings</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>
                {profile.verified ? "Verified" : "Unverified"}
              </Text>
              <Text style={styles.statLabel}>Status</Text>
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
            iconBg="#e3f2fd"
            iconColor="#2196F3"
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
            iconBg="#fff3e0"
            iconColor="#FF9800"
          />
        </View>

        {/* Products Section */}
        <View style={styles.productsContainer}>
          <View style={styles.sectionHeader}>
            <Ionicons name="grid" size={22} color={PRIMARY_COLOR} />
            <Text style={styles.sectionTitle}>My Listings</Text>
          </View>

          {products.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="paw-outline" size={64} color="#ddd" />
              <Text style={styles.emptyStateTitle}>No Listings Yet</Text>
              <Text style={styles.emptyStateText}>
                You haven't posted any listings yet. Start selling your pets today!
              </Text>
            </View>
          ) : (
            <FlatList
              data={products}
              keyExtractor={(item) => item.id.toString()}
              renderItem={({ item }) => (
                <ProductCard
                  product={item}
                  navigation={navigation}
                  userProfile={profile}
                />
              )}
              horizontal={false}
              scrollEnabled={false}
              showsVerticalScrollIndicator={false}
            />
          )}
        </View>

        {/* Logout */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={22} color="#fff" />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>

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
const ProductCard = ({ product, navigation, userProfile }: any) => {
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

  return (
    <TouchableOpacity
      style={styles.productCard}
      onPress={() =>
        navigation.navigate("ListingDetail", { LISTING_DETAIL: enrichedProduct })
      }
      activeOpacity={0.7}
    >
      <View style={styles.imageWrapper}>
        <Image source={{ uri: mainImage }} style={styles.productImage} />
        {images.length > 1 && (
          <View style={styles.imageCountBadge}>
            <Ionicons name="images" size={12} color="#fff" />
            <Text style={styles.imageCountText}>{images.length}</Text>
          </View>
        )}
        {product.health_status === "excellent" && (
          <View style={styles.healthBadgeCard}>
            <Ionicons name="shield-checkmark" size={12} color="#4CAF50" />
          </View>
        )}
      </View>

      <View style={styles.productDetails}>
        <Text style={styles.productTitle} numberOfLines={2}>
          {product.title}
        </Text>
        
        <View style={styles.productMeta}>
          <View style={styles.productMetaItem}>
            <Ionicons name="paw" size={14} color="#666" />
            <Text style={styles.productBreed} numberOfLines={1}>
              {product.breed || "Mixed Breed"}
            </Text>
          </View>
          {product.age && (
            <View style={styles.productMetaItem}>
              <Ionicons name="time" size={14} color="#666" />
              <Text style={styles.productAge}>{product.age}</Text>
            </View>
          )}
        </View>

        <View style={styles.productFooter}>
          <Text style={styles.productPrice}>
            Rs. {parseFloat(product.price).toLocaleString()}
          </Text>
          <View style={styles.viewDetailsBtn}>
            <Text style={styles.viewDetailsText}>View</Text>
            <Ionicons name="arrow-forward" size={14} color={PRIMARY_COLOR} />
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f5f5" },
  scrollView: { flex: 1 },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
  },
  loadingText: { marginTop: 12, color: "#666", fontSize: 15 },
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
  email: {
    color: "#ffd9c7",
    fontSize: 13,
    marginTop: 6,
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

  productCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
    overflow: "hidden",
  },
  imageWrapper: {
    position: "relative",
  },
  productImage: {
    width: "100%",
    height: 220,
    backgroundColor: "#f0f0f0",
  },
  imageCountBadge: {
    position: "absolute",
    top: 12,
    right: 12,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
  },
  imageCountText: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "600",
    marginLeft: 4,
  },
  healthBadgeCard: {
    position: "absolute",
    top: 12,
    left: 12,
    backgroundColor: "#fff",
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    elevation: 2,
  },
  productDetails: {
    padding: 14,
  },
  productTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#1a1a1a",
    marginBottom: 8,
  },
  productMeta: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  productMetaItem: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 16,
  },
  productBreed: {
    fontSize: 13,
    color: "#666",
    marginLeft: 4,
    fontWeight: "500",
  },
  productAge: {
    fontSize: 13,
    color: "#666",
    marginLeft: 4,
    fontWeight: "500",
  },
  productFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  productPrice: {
    color: PRIMARY_COLOR,
    fontWeight: "700",
    fontSize: 18,
  },
  viewDetailsBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff5f0",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
  },
  viewDetailsText: {
    color: PRIMARY_COLOR,
    fontSize: 13,
    fontWeight: "600",
    marginRight: 4,
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