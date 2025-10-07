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
// import Ionicons from 'react-native-vector-icons/Ionicons';
import { Ionicons } from "@react-native-vector-icons/ionicons";

import LinearGradient from 'react-native-linear-gradient';
import { useNavigation } from '@react-navigation/native';

const { width } = Dimensions.get('window');

const Profile = () => {
  const navigation = useNavigation();
  const [activeTab, setActiveTab] = useState('listings');

  const user = {
    name: 'Sarah Johnson',
    email: 'sarah.johnson@example.com',
    avatar: 'https://i.pravatar.cc/200?img=5',
    memberSince: 'January 2023',
    rating: 4.8,
    totalReviews: 24,
    verified: true,
    location: 'New York, USA',
  };

  const myListings = [
    {
      id: '1',
      name: 'Golden Retriever',
      price: '$450',
      category: 'Dogs',
      status: 'Active',
      image: 'https://placedog.net/400/400?id=1',
      views: 124,
      date: 'Oct 1, 2025',
    },
    {
      id: '2',
      name: 'Persian Cat',
      price: '$320',
      category: 'Cats',
      status: 'Active',
      image: 'https://placekitten.com/400/400',
      views: 89,
      date: 'Sep 28, 2025',
    },
    {
      id: '3',
      name: 'Parrot',
      price: '$150',
      category: 'Birds',
      status: 'Sold',
      image: 'https://picsum.photos/400/400?random=20',
      views: 156,
      date: 'Sep 25, 2025',
    },
  ];

  const menuItems = [
    { id: '1', title: 'My Listings', icon: 'list' },
    { id: '2', title: 'Favorites', icon: 'heart-outline' },
    { id: '3', title: 'Settings', icon: 'settings-outline' },
    { id: '4', title: 'Help & Support', icon: 'help-circle-outline' },
  ];

  const renderListingCard = ({ item }) => (
    <TouchableOpacity style={styles.listingCard}>
      <Image source={{ uri: item.image }} style={styles.listingImage} />
      <LinearGradient
        colors={['transparent', 'rgba(0,0,0,0.4)']}
        style={styles.imageOverlay}
      />
      <View style={styles.statusBadge}>
        <Text style={styles.statusText}>{item.status}</Text>
      </View>
      <View style={styles.listingInfo}>
        <Text style={styles.listingName}>{item.name}</Text>
        <Text style={styles.listingPrice}>{item.price}</Text>
        <View style={styles.listingMeta}>
          <Ionicons name="eye-outline" size={14} color="#999" />
          <Text style={styles.metaText}>{item.views}</Text>
          <Text style={styles.listingDate}>{item.date}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderMenuItem = (item) => (
    <TouchableOpacity key={item.id} style={styles.menuItem}>
      <View style={styles.menuLeft}>
        <View style={styles.menuIconWrapper}>
          <Ionicons name={item.icon} size={22} color="#f1641e" />
        </View>
        <Text style={styles.menuTitle}>{item.title}</Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color="#ccc" />
    </TouchableOpacity>
  );

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <LinearGradient colors={['#f1641e', '#f68b4f']} style={styles.header}>
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={22} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>My Profile</Text>
          <TouchableOpacity>
            <Ionicons name="share-social-outline" size={22} color="#fff" />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {/* Profile Section */}
      <View style={styles.profileSection}>
        <View style={styles.avatarWrapper}>
          <Image source={{ uri: user.avatar }} style={styles.avatar} />
          {user.verified && (
            <View style={styles.verifiedBadge}>
              <Ionicons name="checkmark" size={14} color="#fff" />
            </View>
          )}
        </View>

        <Text style={styles.userName}>{user.name}</Text>
        <Text style={styles.userEmail}>{user.email}</Text>

        <View style={styles.metaRow}>
          <Ionicons name="location-outline" size={16} color="#999" />
          <Text style={styles.metaText}>{user.location}</Text>
        </View>

        <View style={styles.metaRow}>
          <Ionicons name="calendar-outline" size={16} color="#999" />
          <Text style={styles.metaText}>Joined {user.memberSince}</Text>
        </View>

        <View style={styles.ratingContainer}>
          {[...Array(5)].map((_, i) => (
            <Ionicons
              key={i}
              name={i < Math.floor(user.rating) ? 'star' : 'star-outline'}
              size={18}
              color="#FFC107"
            />
          ))}
          <Text style={styles.ratingText}>({user.totalReviews})</Text>
        </View>

        <TouchableOpacity style={styles.editProfileBtn}>
          <Ionicons name="create-outline" size={18} color="#fff" />
          <Text style={styles.editProfileText}>Edit Profile</Text>
        </TouchableOpacity>
      </View>

      {/* Tabs */}
      <View style={styles.tabContainer}>
        {['listings', 'menu'].map((tab) => (
          <TouchableOpacity
            key={tab}
            onPress={() => setActiveTab(tab)}
            style={[
              styles.tabButton,
              activeTab === tab && styles.activeTabButton,
            ]}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === tab && styles.activeTabText,
              ]}
            >
              {tab === 'listings' ? 'My Listings' : 'Menu'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Tab Content */}
      {activeTab === 'listings' ? (
        <FlatList
          data={myListings}
          numColumns={2}
          columnWrapperStyle={styles.row}
          renderItem={renderListingCard}
          keyExtractor={(i) => i.id}
          scrollEnabled={false}
          contentContainerStyle={{ padding: 10 }}
        />
      ) : (
        <View style={styles.menuContainer}>
          {menuItems.map(renderMenuItem)}
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
  container: { flex: 1, backgroundColor: '#f8f9fa' },
  header: {
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: { fontSize: 20, fontWeight: '700', color: '#fff' },
  profileSection: {
    alignItems: 'center',
    backgroundColor: '#fff',
    margin: 10,
    paddingVertical: 20,
    borderRadius: 16,
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
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
  },
  userName: { fontSize: 20, fontWeight: '700', color: '#333', marginTop: 10 },
  userEmail: { fontSize: 14, color: '#888' },
  metaRow: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  metaText: { fontSize: 13, color: '#666', marginLeft: 5 },
  ratingContainer: { flexDirection: 'row', alignItems: 'center', marginTop: 6 },
  ratingText: { fontSize: 13, color: '#777', marginLeft: 6 },
  editProfileBtn: {
    flexDirection: 'row',
    backgroundColor: '#f1641e',
    borderRadius: 24,
    paddingHorizontal: 18,
    paddingVertical: 10,
    alignItems: 'center',
    marginTop: 14,
  },
  editProfileText: { color: '#fff', fontWeight: '600', marginLeft: 6 },
  tabContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    backgroundColor: '#fff',
    marginHorizontal: 10,
    borderRadius: 30,
    marginTop: 15,
    padding: 4,
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
    borderRadius: 25,
  },
  activeTabButton: {
    backgroundColor: '#f1641e',
  },
  tabText: { color: '#666', fontWeight: '600' },
  activeTabText: { color: '#fff' },
  row: { justifyContent: 'space-between' },
  listingCard: {
    backgroundColor: '#fff',
    borderRadius: 14,
    overflow: 'hidden',
    marginBottom: 14,
    flex: 1,
    marginHorizontal: 5,
    elevation: 3,
  },
  listingImage: { width: '100%', height: 150 },
  imageOverlay: { ...StyleSheet.absoluteFillObject },
  statusBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: '#f1641e',
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  statusText: { color: '#fff', fontSize: 11, fontWeight: '600' },
  listingInfo: { padding: 10 },
  listingName: { fontWeight: '600', fontSize: 14, color: '#333' },
  listingPrice: { color: '#f1641e', fontWeight: '700', marginVertical: 4 },
  listingMeta: { flexDirection: 'row', alignItems: 'center' },
  metaText: { fontSize: 11, color: '#888', marginLeft: 4 },
  listingDate: { fontSize: 11, color: '#aaa', marginLeft: 'auto' },
  menuContainer: {
    backgroundColor: '#fff',
    margin: 10,
    borderRadius: 16,
    paddingVertical: 10,
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderColor: '#f5f5f5',
  },
  menuLeft: { flexDirection: 'row', alignItems: 'center' },
  menuIconWrapper: {
    backgroundColor: '#fff5f0',
    padding: 10,
    borderRadius: 12,
    marginRight: 10,
  },
  menuTitle: { fontSize: 16, color: '#333', fontWeight: '500' },
  logoutBtn: {
    backgroundColor: '#f1641e',
    borderRadius: 12,
    margin: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
  },
  logoutText: { color: '#fff', marginLeft: 6, fontWeight: '700' },
});
