// Profile.tsx
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
  StatusBar,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import axios from 'axios';
import { useRoute, useNavigation } from '@react-navigation/native';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 30) / 2;
const FALLBACK_AVATAR = 'https://via.placeholder.com/300x300.png?text=avatar';
const FALLBACK_IMAGE = 'https://via.placeholder.com/400x300.png?text=image';

const Profile = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { PROFILE } = route.params || {};
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'listings' | 'about'>('listings');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    const fetchUserProfile = async () => {
      try {
        setLoading(true);
        setError(null);
        const userId = PROFILE?.id;
        if (!userId) {
          throw new Error('User ID missing (navigation param PROFILE.id).');
        }
        const resp = await axios.get(
          `https://mandimore.com/v1/user_profile/${userId}`,
          { signal: (controller as any).signal } // axios doesn't accept AbortSignal in older versions; harmless fallback
        );
        if (resp?.data?.code === 200) {
          setUserData(resp.data.data || null);
        } else {
          setUserData(null);
          setError(resp?.data?.message || 'Failed to fetch profile');
        }
      } catch (err: any) {
        if (axios.isCancel?.(err)) return; // cancelled
        console.error('Profile fetch error', err);
        setError(err?.message || 'Error fetching user profile');
        setUserData(null);
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();

    return () => {
      try {
        controller.abort();
      } catch (e) {}
    };
  }, [PROFILE]);

  // Loading / error states
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#f1641e" />
        <Text style={styles.loadingText}>Loading profile...</Text>
      </View>
    );
  }

  if (!userData) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.errorText}>{error || 'User not found'}</Text>
      </View>
    );
  }

  // Safe getters
  const avatarUri = userData.user_avatar_url || FALLBACK_AVATAR;
  const products = Array.isArray(userData.products) ? userData.products : [];

  // Listing card (used by FlatList)
  const renderListingCard = ({ item }: any) => {
    const uri = (item.image_urls && item.image_urls[0]) || FALLBACK_IMAGE;
    return (
      <TouchableOpacity
        style={styles.card}
        activeOpacity={0.9}
        onPress={() => navigation.navigate('ListingDetail', { LISTING_DETAIL: item })}
      >
        <View style={styles.imageContainer}>
          <Image source={{ uri }} style={styles.image} resizeMode="cover" />
          <TouchableOpacity style={styles.heartBtn}>
            <Ionicons name="heart-outline" size={18} color="#fff" />
          </TouchableOpacity>
        </View>

        <View style={styles.cardContent}>
          <Text style={styles.title} numberOfLines={2}>
            {item.title || 'Untitled'}
          </Text>

          <Text style={styles.price}>
            {item.price ? `₨ ${parseFloat(item.price).toLocaleString('en-PK')}` : 'Price N/A'}
          </Text>

          <View style={styles.detailsRow}>
            <Ionicons name="paw-outline" size={12} color="#999" />
            <Text style={styles.detailText} numberOfLines={1}>
              {item.breed || 'Unknown'}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  // Header component for the FlatList (profile info + tabs)
  const ListHeader = () => (
    <>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={22} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Profile</Text>
        <View style={{ width: 22 }} />
      </View>

      <View style={styles.profileCard}>
        <Image source={{ uri: avatarUri }} style={styles.avatar} />

        <View style={styles.userInfo}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Text style={styles.userName}>
              {`${userData.first_name || ''} ${userData.last_name || ''}`.trim() || userData.username || 'Seller'}
            </Text>
            {userData.verified && (
              <Ionicons name="checkmark-circle" size={16} color="#4CAF50" style={{ marginLeft: 8 }} />
            )}
          </View>

          {userData.username ? <Text style={styles.userHandle}>@{userData.username}</Text> : null}
          {userData.email ? <Text style={styles.userEmail}>{userData.email}</Text> : null}

          {/* quick actions */}
          <View style={styles.actionsRow}>
            <TouchableOpacity style={styles.msgBtn}>
              <Ionicons name="chatbubble-ellipses-outline" size={16} color="#fff" />
              <Text style={styles.msgBtnText}>Message</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.callBtn}>
              <Ionicons name="call-outline" size={16} color="#f1641e" />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Tabs */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'listings' && styles.activeTab]}
          onPress={() => setActiveTab('listings')}
        >
          <Text style={[styles.tabText, activeTab === 'listings' && styles.activeTabText]}>
            Listings ({products.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === 'about' && styles.activeTab]}
          onPress={() => setActiveTab('about')}
        >
          <Text style={[styles.tabText, activeTab === 'about' && styles.activeTabText]}>About</Text>
        </TouchableOpacity>
      </View>
    </>
  );

  // Footer component to show About info when About tab active
  const ListFooter = () => {
    if (activeTab === 'listings') return <View style={{ height: 20 }} />;
    return (
      <View style={styles.aboutCard}>
        <Text style={styles.aboutTitle}>About</Text>

        <View style={styles.infoRow}>
          <Ionicons name="call-outline" size={16} color="#f1641e" />
          <Text style={styles.infoText}>{userData.mobile_number || 'N/A'}</Text>
        </View>

        <View style={styles.infoRow}>
          <Ionicons name="logo-whatsapp" size={16} color="#25D366" />
          <Text style={styles.infoText}>{userData.whatsapp_number || 'N/A'}</Text>
        </View>

        <View style={styles.infoRow}>
          <Ionicons name="location-outline" size={16} color="#666" />
          <Text style={styles.infoText}>{userData.location || 'Location not provided'}</Text>
        </View>

        <View style={styles.infoRow}>
          <Ionicons name="shield-checkmark-outline" size={16} color="#4CAF50" />
          <Text style={styles.infoText}>{userData.verified ? 'Verified user' : 'Not verified'}</Text>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor="#fff" barStyle="dark-content" />

      <FlatList
        data={activeTab === 'listings' ? products : []}
        renderItem={renderListingCard}
        keyExtractor={(item) => String(item.id)}
        numColumns={2}
        ListHeaderComponent={ListHeader}
        ListFooterComponent={ListFooter}
        contentContainerStyle={styles.listContent}
        columnWrapperStyle={styles.row}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          activeTab === 'listings' ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="cube-outline" size={48} color="#ddd" />
              <Text style={styles.emptyText}>No listings yet</Text>
            </View>
          ) : null
        }
      />
    </View>
  );
};

export default Profile;

/* Styles */
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa' },

  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 10, color: '#555' },
  errorText: { color: '#f1641e', fontSize: 16 },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 18,
    paddingBottom: 10,
    backgroundColor: '#fff',
    elevation: 2,
  },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#333' },

  profileCard: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 14,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 2,
  },
  avatar: { width: 86, height: 86, borderRadius: 44, backgroundColor: '#eee' },
  userInfo: { flex: 1, marginLeft: 12 },
  userName: { fontSize: 17, fontWeight: '700', color: '#111' },
  userHandle: { color: '#f1641e', marginTop: 4 },
  userEmail: { color: '#777', marginTop: 6, fontSize: 13 },

  actionsRow: { flexDirection: 'row', marginTop: 12, alignItems: 'center' },
  msgBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f1641e',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
  },
  msgBtnText: { color: '#fff', fontWeight: '700', marginLeft: 8, fontSize: 13 },
  callBtn: {
    marginLeft: 12,
    width: 40,
    height: 40,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#f1641e',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },

  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    marginHorizontal: 16,
    borderRadius: 12,
    overflow: 'hidden',
    marginTop: 12,
    borderWidth: 1,
    borderColor: '#eee',
  },
  tab: { flex: 1, paddingVertical: 12, alignItems: 'center' },
  tabText: { fontSize: 14, fontWeight: '600', color: '#777' },
  activeTab: { backgroundColor: '#f1641e15' },
  activeTabText: { color: '#f1641e', fontWeight: '800' },

  listContent: { paddingHorizontal: 10, paddingBottom: 40, paddingTop: 12 },
  row: { justifyContent: 'space-between' },
  card: {
    width: CARD_WIDTH,
    backgroundColor: '#fff',
    borderRadius: 14,
    marginBottom: 12,
    overflow: 'hidden',
    elevation: 3,
  },
  imageContainer: { position: 'relative' },
  image: { width: '100%', height: 140, backgroundColor: '#f0f0f0' },

  heartBtn: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: 'rgba(0,0,0,0.35)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  cardContent: { padding: 10 },
  title: { fontSize: 14, fontWeight: '700', color: '#111' },
  price: { color: '#f1641e', fontWeight: '800', marginTop: 6 },
  detailsRow: { flexDirection: 'row', alignItems: 'center', marginTop: 6 },
  detailText: { fontSize: 12, color: '#888', marginLeft: 6 },

  aboutCard: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    borderRadius: 12,
    padding: 16,
    marginTop: 12,
    elevation: 2,
  },
  aboutTitle: { fontSize: 16, fontWeight: '700', color: '#111', marginBottom: 8 },
  infoRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  infoText: { marginLeft: 10, color: '#444', fontSize: 14 },

  emptyContainer: { alignItems: 'center', paddingVertical: 50 },
  emptyText: { fontSize: 15, color: '#999', marginTop: 10 },
});
