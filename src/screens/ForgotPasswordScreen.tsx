import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  FlatList,
} from 'react-native';
import { Ionicons } from '@react-native-vector-icons/ionicons';
import LinearGradient from 'react-native-linear-gradient';
import { useNavigation } from '@react-navigation/native';

const { width } = Dimensions.get('window');

const Profile = () => {
  const navigation = useNavigation();
  const [activeTab, setActiveTab] = useState('listings');

  const user = {
    name: 'Sarah Johnson',
    email: 'sarah.johnson@example.com',
    phone: '+1 (555) 123-4567',
    avatar: 'https://i.pravatar.cc/200?img=5',
    memberSince: 'January 2023',
    rating: 4.8,
    totalReviews: 24,
    verified: true,
    location: 'New York, USA',
  };

  const stats = [
    { label: 'Active Ads', value: '8', icon: 'pricetag-outline', color: '#f1641e' },
    { label: 'Sold', value: '32', icon: 'checkmark-circle-outline', color: '#4CAF50' },
    { label: 'Favorites', value: '15', icon: 'heart-outline', color: '#E91E63' },
    { label: 'Reviews', value: '24', icon: 'star-outline', color: '#FFC107' },
  ];

  const myListings = [
    {
      id: '1',
      name: 'Golden Retriever',
      price: '$450',
      image: 'https://placedog.net/400/400?id=1',
      views: 124,
      date: 'Oct 1, 2025',
    },
    {
      id: '2',
      name: 'Persian Cat',
      price: '$320',
      image: 'https://placekitten.com/400/400',
      views: 89,
      date: 'Sep 28, 2025',
    },
  ];

  const menuItems = [
    { id: '1', title: 'My Listings', icon: 'list-outline' },
    { id: '2', title: 'Favorites', icon: 'heart-outline' },
    { id: '3', title: 'Messages', icon: 'chatbubble-outline' },
    { id: '4', title: 'Settings', icon: 'settings-outline' },
  ];

  const renderListingCard = ({ item }) => (
    <View style={styles.listingCard}>
      <Image source={{ uri: item.image }} style={styles.listingImage} />
      <View style={styles.listingInfo}>
        <Text style={styles.listingName}>{item.name}</Text>
        <Text style={styles.listingPrice}>{item.price}</Text>
        <View style={styles.listingMeta}>
          <Ionicons name="eye-outline" size={14} color="#999" />
          <Text style={styles.metaText}>{item.views} views</Text>
        </View>
      </View>
    </View>
  );

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header with Gradient */}
      <LinearGradient colors={['#f1641e', '#ff7c40']} style={styles.header}>
        <Text style={styles.headerTitle}>Profile</Text>
        <TouchableOpacity>
          <Ionicons name="share-social-outline" size={22} color="#fff" />
        </TouchableOpacity>
      </LinearGradient>

      {/* Profile Card */}
      <View style={styles.profileCard}>
        <View style={styles.avatarWrapper}>
          <Image source={{ uri: user.avatar }} style={styles.avatar} />
          {user.verified && (
            <View style={styles.verifiedBadge}>
              <Ionicons name="checkmark" size={16} color="#fff" />
            </View>
          )}
        </View>
        <Text style={styles.userName}>{user.name}</Text>
        <Text style={styles.userEmail}>{user.email}</Text>
        <View style={styles.metaRow}>
          <Ionicons name="location-outline" size={14} color="#888" />
          <Text style={styles.metaText}>{user.location}</Text>
        </View>
        <TouchableOpacity style={styles.editBtn}>
          <Ionicons name="create-outline" size={16} color="#f1641e" />
          <Text style={styles.editText}>Edit Profile</Text>
        </TouchableOpacity>
      </View>

      {/* Stats */}
      <View style={styles.statsGrid}>
        {stats.map((stat, i) => (
          <View key={i} style={styles.statCard}>
            <View style={[styles.statIconWrapper, { backgroundColor: `${stat.color}15` }]}>
              <Ionicons name={stat.icon} size={22} color={stat.color} />
            </View>
            <Text style={styles.statValue}>{stat.value}</Text>
            <Text style={styles.statLabel}>{stat.label}</Text>
          </View>
        ))}
      </View>

      {/* Tabs */}
      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'listings' && styles.activeTab]}
          onPress={() => setActiveTab('listings')}
        >
          <Text style={[styles.tabText, activeTab === 'listings' && styles.activeTabText]}>
            Listings
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'menu' && styles.activeTab]}
          onPress={() => setActiveTab('menu')}
        >
          <Text style={[styles.tabText, activeTab === 'menu' && styles.activeTabText]}>
            Menu
          </Text>
        </TouchableOpacity>
      </View>

      {/* Tab Content */}
      {activeTab === 'listings' ? (
        <FlatList
          data={myListings}
          numColumns={2}
          keyExtractor={(item) => item.id}
          renderItem={renderListingCard}
          contentContainerStyle={styles.listingGrid}
          scrollEnabled={false}
        />
      ) : (
        <View style={styles.menuList}>
          {menuItems.map((item) => (
            <TouchableOpacity key={item.id} style={styles.menuItem}>
              <View style={styles.menuLeft}>
                <Ionicons name={item.icon} size={22} color="#f1641e" />
                <Text style={styles.menuTitle}>{item.title}</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color="#ccc" />
            </TouchableOpacity>
          ))}

          <TouchableOpacity style={styles.logoutBtn}>
            <Ionicons name="log-out-outline" size={20} color="#fff" />
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
  );
};

export default Profile;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9f9f9' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 25,
  },
  headerTitle: { fontSize: 22, color: '#fff', fontWeight: '700' },
  profileCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    marginHorizontal: 16,
    marginTop: -30,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  avatarWrapper: { position: 'relative' },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: '#f1641e',
  },
  verifiedBadge: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    backgroundColor: '#4CAF50',
    borderRadius: 14,
    padding: 3,
  },
  userName: { fontSize: 20, fontWeight: '700', color: '#333', marginTop: 8 },
  userEmail: { color: '#888', marginTop: 2 },
  metaRow: { flexDirection: 'row', alignItems: 'center', marginTop: 6 },
  metaText: { marginLeft: 4, color: '#666', fontSize: 13 },
  editBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#f1641e',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 6,
    marginTop: 10,
  },
  editText: { color: '#f1641e', marginLeft: 6, fontWeight: '600', fontSize: 13 },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 14,
    backgroundColor: '#fff',
    paddingVertical: 20,
    borderRadius: 16,
    marginHorizontal: 16,
  },
  statCard: { alignItems: 'center' },
  statIconWrapper: {
    padding: 10,
    borderRadius: 12,
    marginBottom: 6,
  },
  statValue: { fontWeight: '700', fontSize: 16, color: '#333' },
  statLabel: { fontSize: 12, color: '#777' },
  tabs: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    marginTop: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  tab: { flex: 1, alignItems: 'center', paddingVertical: 12 },
  tabText: { color: '#999', fontWeight: '600' },
  activeTab: { borderBottomWidth: 2, borderBottomColor: '#f1641e' },
  activeTabText: { color: '#f1641e' },
  listingGrid: { paddingHorizontal: 10, paddingTop: 10 },
  listingCard: {
    backgroundColor: '#fff',
    borderRadius: 14,
    margin: 5,
    width: width / 2 - 20,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
    overflow: 'hidden',
  },
  listingImage: { width: '100%', height: 130 },
  listingInfo: { padding: 10 },
  listingName: { fontWeight: '600', color: '#333' },
  listingPrice: { color: '#f1641e', fontWeight: '600', marginTop: 4 },
  listingMeta: { flexDirection: 'row', alignItems: 'center', marginTop: 6 },
  metaText: { color: '#999', fontSize: 12, marginLeft: 4 },
  menuList: {
    backgroundColor: '#fff',
    borderRadius: 16,
    marginHorizontal: 16,
    marginTop: 10,
    padding: 10,
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f1f1',
  },
  menuLeft: { flexDirection: 'row', alignItems: 'center' },
  menuTitle: { marginLeft: 10, fontSize: 16, color: '#333', fontWeight: '500' },
  logoutBtn: {
    flexDirection: 'row',
    backgroundColor: '#f1641e',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 14,
    marginTop: 20,
  },
  logoutText: { color: '#fff', fontWeight: '600', marginLeft: 8 },
});
