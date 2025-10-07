import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  Dimensions,
  ScrollView,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import { Ionicons } from '@react-native-vector-icons/ionicons';
import Swiper from 'react-native-swiper';
import { useRoute, useNavigation } from '@react-navigation/native';

const { width } = Dimensions.get('window');

const ListingDetail = () => {
  const route = useRoute<any>();
  const navigation = useNavigation();
  const { item } = route.params;

  const images = [
    item.image,
    'https://picsum.photos/400/400?random=11',
    'https://picsum.photos/400/400?random=12',
  ];

  const petDetails = [
    { label: 'Age', value: '2 years' },
    { label: 'Sex', value: 'Male' },
    { label: 'Color', value: 'Golden Brown' },
    { label: 'Vaccinated', value: 'Yes' },
    { label: 'Breed', value: 'Purebred Retriever' },
    { label: 'Health Status', value: 'Excellent' },
  ];

  const seller = {
    name: 'Sarah Johnson',
    avatar: 'https://i.pravatar.cc/150?img=5',
    rating: 4.8,
    totalListings: 12,
    memberSince: 'Jan 2023',
    verified: true,
  };

  const related = [
    {
      id: 'r1',
      name: 'Siamese Cat',
      price: '$300',
      category: 'Cats',
      image: 'https://placekitten.com/401/401',
    },
    {
      id: 'r2',
      name: 'Bulldog',
      price: '$550',
      category: 'Dogs',
      image: 'https://placedog.net/401/401?id=10',
    },
    {
      id: 'r3',
      name: 'Cockatiel',
      price: '$90',
      category: 'Birds',
      image: 'https://picsum.photos/401/401?random=13',
    },
  ];

  const renderRelated = ({ item: rel }: { item: typeof related[0] }) => (
    <TouchableOpacity style={styles.relatedCard}>
      <Image source={{ uri: rel.image }} style={styles.relatedImage} />
      <View style={styles.relatedInfo}>
        <Text style={styles.relatedName} numberOfLines={1}>
          {rel.name}
        </Text>
        <Text style={styles.relatedPrice}>{rel.price}</Text>
        <Text style={styles.relatedCategory}>{rel.category}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={22} color="#333" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.headerBtn}>
          <Ionicons name="heart-outline" size={22} color="#333" />
        </TouchableOpacity>
      </View>

      {/* Image Slider */}
      <Swiper autoplay height={300} dotStyle={styles.dot} activeDotStyle={styles.activeDot}>
        {images.map((img, i) => (
          <View key={i} style={styles.slide}>
            <Image source={{ uri: img }} style={styles.image} />
          </View>
        ))}
      </Swiper>

      {/* Main Info */}
      <View style={styles.content}>
        <Text style={styles.title}>{item.name}</Text>
        <View style={styles.categoryBadge}>
          <Text style={styles.categoryText}>{item.category}</Text>
        </View>
        <Text style={styles.price}>{item.price}</Text>

        {/* Table Details */}
        <View style={styles.detailsTable}>
          {petDetails.map((detail, index) => (
            <View
              key={index}
              style={[
                styles.tableRow,
                { backgroundColor: index % 2 === 0 ? '#fff' : '#f9f9f9' },
              ]}>
              <Text style={styles.tableLabel}>{detail.label}</Text>
              <Text style={styles.tableValue}>{detail.value}</Text>
            </View>
          ))}
        </View>

        {/* Description */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Description</Text>
          <Text style={styles.description}>
            This is a beautiful {item.category.toLowerCase()} named {item.name}. Well-behaved, vaccinated, and ready for a new home. 
            Healthy, friendly, and social with other pets.
          </Text>
        </View>

        {/* Seller Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Seller Information</Text>
          <TouchableOpacity
            style={styles.sellerCard}
            onPress={() => navigation.navigate('Profile' as never)}>
            <Image source={{ uri: seller.avatar }} style={styles.sellerAvatar} />
            <View style={styles.sellerInfo}>
              <View style={styles.sellerNameRow}>
                <Text style={styles.sellerName}>{seller.name}</Text>
                {seller.verified && (
                  <Ionicons name="checkmark-circle" size={16} color="#4CAF50" />
                )}
              </View>
              <View style={styles.sellerStats}>
                <Ionicons name="star" size={14} color="#FFD700" />
                <Text style={styles.sellerRating}>{seller.rating}</Text>
                <Text style={styles.sellerDivider}>•</Text>
                <Text style={styles.sellerListings}>{seller.totalListings} listings</Text>
              </View>
              <Text style={styles.sellerMember}>Member since {seller.memberSince}</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#999" />
          </TouchableOpacity>
        </View>

        {/* Related */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Similar Listings</Text>
          <FlatList
            horizontal
            data={related}
            renderItem={renderRelated}
            keyExtractor={(item) => item.id}
            showsHorizontalScrollIndicator={false}
          />
        </View>
      </View>

      {/* Bottom Buttons */}
      <View style={styles.bottomBar}>
        <TouchableOpacity style={styles.callBtn}>
          <Ionicons name="call-outline" size={20} color="#fff" />
          <Text style={styles.callText}>Call</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.contactBtn}>
          <Text style={styles.contactText}>Contact Seller</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

export default ListingDetail;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa' },
  header: {
    position: 'absolute',
    top: 40,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    zIndex: 10,
  },
  headerBtn: {
    backgroundColor: '#fff',
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3,
  },
  slide: { flex: 1 },
  image: { width, height: 300, resizeMode: 'cover' },
  dot: { backgroundColor: 'rgba(255,255,255,0.5)', width: 8, height: 8, borderRadius: 4 },
  activeDot: { backgroundColor: '#f1641e', width: 18, height: 8, borderRadius: 4 },
  content: { padding: 20, backgroundColor: '#fff' },
  title: { fontSize: 24, fontWeight: '700', color: '#333' },
  categoryBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#fff5f0',
    borderColor: '#f1641e',
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginVertical: 8,
  },
  categoryText: { color: '#f1641e', fontSize: 13, fontWeight: '600' },
  price: { fontSize: 26, color: '#f1641e', fontWeight: '700', marginBottom: 14 },
  detailsTable: {
    borderWidth: 1,
    borderColor: '#eee',
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 20,
  },
  tableRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  tableLabel: { fontSize: 14, color: '#555', fontWeight: '500' },
  tableValue: { fontSize: 14, color: '#222', fontWeight: '600' },
  section: { marginBottom: 20 },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: '#333', marginBottom: 10 },
  description: { fontSize: 15, color: '#666', lineHeight: 22 },
  sellerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9f9f9',
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#eee',
  },
  sellerAvatar: { width: 60, height: 60, borderRadius: 30 },
  sellerInfo: { flex: 1, marginLeft: 10 },
  sellerNameRow: { flexDirection: 'row', alignItems: 'center' },
  sellerName: { fontSize: 16, fontWeight: '700', marginRight: 6, color: '#333' },
  sellerStats: { flexDirection: 'row', alignItems: 'center', marginTop: 2 },
  sellerRating: { fontSize: 13, marginLeft: 4, fontWeight: '600', color: '#333' },
  sellerDivider: { fontSize: 13, color: '#ccc', marginHorizontal: 6 },
  sellerListings: { fontSize: 13, color: '#666' },
  sellerMember: { fontSize: 12, color: '#999', marginTop: 2 },
  relatedCard: {
    width: 160,
    borderRadius: 12,
    backgroundColor: '#fff',
    marginRight: 12,
    borderWidth: 1,
    borderColor: '#eee',
  },
  relatedImage: { width: '100%', height: 110, borderTopLeftRadius: 12, borderTopRightRadius: 12 },
  relatedInfo: { padding: 10 },
  relatedName: { fontSize: 15, fontWeight: '600', color: '#333' },
  relatedPrice: { fontSize: 14, fontWeight: '700', color: '#f1641e' },
  relatedCategory: { fontSize: 12, color: '#888' },
  bottomBar: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderTopWidth: 1,
    borderColor: '#eee',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  callBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f1641e',
    borderRadius: 10,
    paddingHorizontal: 20,
    paddingVertical: 12,
    marginRight: 10,
  },
  callText: { color: '#fff', marginLeft: 6, fontWeight: '600' },
  contactBtn: {
    flex: 1,
    backgroundColor: '#f1641e',
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  contactText: { color: '#fff', fontSize: 15, fontWeight: '700' },
});
