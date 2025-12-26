import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  StatusBar,
  Image,
  Animated,
  Share,
  Platform,
} from 'react-native';
import { Ionicons } from '@react-native-vector-icons/ionicons';
import Video from 'react-native-video';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';

const { width, height } = Dimensions.get('window');
const BOTTOM_TAB_HEIGHT = 60;
const VIDEO_HEIGHT = height - BOTTOM_TAB_HEIGHT;

// Demo HLS Video URLs (publicly available test streams)
const DEMO_REELS = [
  {
    id: '1',
    videoUrl: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8',
    user: {
      id: 1,
      name: 'PetLovers_PK',
      avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
      verified: true,
    },
    description: '🐕 Beautiful Golden Retriever puppies playing in the garden! #goldenretriever #puppies #petlove',
    likes: 2453,
    comments: 187,
    shares: 45,
    music: 'Happy Pets - Original Sound',
    isLiked: false,
  },
  {
    id: '2',
    videoUrl: 'https://bitdash-a.akamaihd.net/content/sintel/hls/playlist.m3u8',
    user: {
      id: 2,
      name: 'CatKingdom',
      avatar: 'https://randomuser.me/api/portraits/women/44.jpg',
      verified: true,
    },
    description: '😺 Persian cats grooming session! So fluffy and adorable 💕 #persiancat #catgrooming #catlover',
    likes: 5621,
    comments: 342,
    shares: 128,
    music: 'Cute Cats Melody',
    isLiked: true,
  },
  {
    id: '3',
    videoUrl: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8',
    user: {
      id: 3,
      name: 'BirdSanctuary',
      avatar: 'https://randomuser.me/api/portraits/men/67.jpg',
      verified: false,
    },
    description: '🦜 Amazing talking parrot! Listen to what he says 😂 #parrot #talkingbird #funnyanimals',
    likes: 8934,
    comments: 567,
    shares: 234,
    music: 'Birds Chirping - Nature Sounds',
    isLiked: false,
  },
  {
    id: '4',
    videoUrl: 'https://bitdash-a.akamaihd.net/content/MI201109210084_1/m3u8s/f08e80da-bf1d-4e3d-8899-f0f6155f6efa.m3u8',
    user: {
      id: 4,
      name: 'RabbitFarm',
      avatar: 'https://randomuser.me/api/portraits/women/28.jpg',
      verified: true,
    },
    description: '🐰 Fluffy bunnies eating carrots! So cute 🥕 #rabbit #bunny #cuteanimals #petcare',
    likes: 3456,
    comments: 201,
    shares: 89,
    music: 'Soft Piano - Relaxing',
    isLiked: false,
  },
  {
    id: '5',
    videoUrl: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8',
    user: {
      id: 5,
      name: 'FishWorld',
      avatar: 'https://randomuser.me/api/portraits/men/45.jpg',
      verified: false,
    },
    description: '🐠 Beautiful aquarium setup tour! Tropical fish collection 🌊 #aquarium #tropicalfish #fishkeeping',
    likes: 1987,
    comments: 145,
    shares: 67,
    music: 'Ocean Waves - Ambient',
    isLiked: true,
  },
  {
    id: '6',
    videoUrl: 'https://bitdash-a.akamaihd.net/content/sintel/hls/playlist.m3u8',
    user: {
      id: 6,
      name: 'HorseRanch',
      avatar: 'https://randomuser.me/api/portraits/women/52.jpg',
      verified: true,
    },
    description: '🐴 Morning horse training session! Such majestic creatures 🌅 #horse #horseriding #equestrian',
    likes: 6789,
    comments: 423,
    shares: 156,
    music: 'Country Roads - Acoustic',
    isLiked: false,
  },
];

interface Reel {
  id: string;
  videoUrl: string;
  user: {
    id: number;
    name: string;
    avatar: string;
    verified: boolean;
  };
  description: string;
  likes: number;
  comments: number;
  shares: number;
  music: string;
  isLiked: boolean;
}

interface ReelItemProps {
  item: Reel;
  isActive: boolean;
  onLike: (id: string) => void;
  onComment: (id: string) => void;
  onShare: (item: Reel) => void;
  onUserPress: (userId: number) => void;
}

const ReelItem: React.FC<ReelItemProps> = ({
  item,
  isActive,
  onLike,
  onComment,
  onShare,
  onUserPress,
}) => {
  const [paused, setPaused] = useState(!isActive);
  const [loading, setLoading] = useState(true);
  const [liked, setLiked] = useState(item.isLiked);
  const [likesCount, setLikesCount] = useState(item.likes);
  const [showPlayIcon, setShowPlayIcon] = useState(false);
  const heartScale = useRef(new Animated.Value(1)).current;
  const playIconOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    setPaused(!isActive);
  }, [isActive]);

  const handleVideoPress = () => {
    setPaused(!paused);
    setShowPlayIcon(true);
    
    Animated.sequence([
      Animated.timing(playIconOpacity, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.delay(500),
      Animated.timing(playIconOpacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => setShowPlayIcon(false));
  };

  const handleDoubleTap = useCallback(() => {
    if (!liked) {
      setLiked(true);
      setLikesCount(prev => prev + 1);
      onLike(item.id);
      
      Animated.sequence([
        Animated.spring(heartScale, {
          toValue: 1.3,
          useNativeDriver: true,
        }),
        Animated.spring(heartScale, {
          toValue: 1,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [liked, item.id, onLike, heartScale]);

  const handleLikePress = () => {
    setLiked(!liked);
    setLikesCount(prev => liked ? prev - 1 : prev + 1);
    onLike(item.id);
    
    Animated.sequence([
      Animated.spring(heartScale, {
        toValue: 1.3,
        useNativeDriver: true,
      }),
      Animated.spring(heartScale, {
        toValue: 1,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const formatCount = (count: number): string => {
    if (count >= 1000000) {
      return (count / 1000000).toFixed(1) + 'M';
    } else if (count >= 1000) {
      return (count / 1000).toFixed(1) + 'K';
    }
    return count.toString();
  };

  return (
    <View style={styles.reelContainer}>
      <TouchableOpacity
        activeOpacity={1}
        style={styles.videoContainer}
        onPress={handleVideoPress}
        onLongPress={handleDoubleTap}
      >
        <Video
          source={{ uri: item.videoUrl }}
          style={styles.video}
          resizeMode="cover"
          repeat
          paused={paused}
          onLoad={() => setLoading(false)}
          onBuffer={({ isBuffering }) => setLoading(isBuffering)}
          bufferConfig={{
            minBufferMs: 15000,
            maxBufferMs: 50000,
            bufferForPlaybackMs: 2500,
            bufferForPlaybackAfterRebufferMs: 5000,
          }}
        />

        {loading && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color="#f1641e" />
          </View>
        )}

        {showPlayIcon && (
          <Animated.View style={[styles.playIconContainer, { opacity: playIconOpacity }]}>
            <View style={styles.playIconBackground}>
              <Ionicons
                name={paused ? 'play' : 'pause'}
                size={50}
                color="#fff"
              />
            </View>
          </Animated.View>
        )}

        {/* Bottom Gradient */}
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.8)']}
          style={styles.bottomGradient}
        />

        {/* Top Gradient */}
        <LinearGradient
          colors={['rgba(0,0,0,0.4)', 'transparent']}
          style={styles.topGradient}
        />
      </TouchableOpacity>

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Reels</Text>
        <TouchableOpacity style={styles.cameraButton}>
          <Ionicons name="camera-outline" size={26} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Right Action Buttons */}
      <View style={styles.actionsContainer}>
        {/* User Avatar */}
        <TouchableOpacity
          style={styles.avatarButton}
          onPress={() => onUserPress(item.user.id)}
        >
          <Image source={{ uri: item.user.avatar }} style={styles.actionAvatar} />
          <View style={styles.followButton}>
            <Ionicons name="add" size={12} color="#fff" />
          </View>
        </TouchableOpacity>

        {/* Like Button */}
        <TouchableOpacity style={styles.actionButton} onPress={handleLikePress}>
          <Animated.View style={{ transform: [{ scale: heartScale }] }}>
            <Ionicons
              name={liked ? 'heart' : 'heart-outline'}
              size={30}
              color={liked ? '#ff6b6b' : '#fff'}
            />
          </Animated.View>
          <Text style={styles.actionText}>{formatCount(likesCount)}</Text>
        </TouchableOpacity>

        {/* Comment Button */}
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => onComment(item.id)}
        >
          <Ionicons name="chatbubble-outline" size={28} color="#fff" />
          <Text style={styles.actionText}>{formatCount(item.comments)}</Text>
        </TouchableOpacity>

        {/* Share Button */}
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => onShare(item)}
        >
          <Ionicons name="paper-plane-outline" size={28} color="#fff" />
          <Text style={styles.actionText}>{formatCount(item.shares)}</Text>
        </TouchableOpacity>

        {/* More Button */}
        <TouchableOpacity style={styles.actionButton}>
          <Ionicons name="ellipsis-vertical" size={24} color="#fff" />
        </TouchableOpacity>

        {/* Music Disc */}
        <Animated.View style={styles.musicDisc}>
          <Image
            source={{ uri: item.user.avatar }}
            style={styles.musicDiscImage}
          />
        </Animated.View>
      </View>

      {/* Bottom Info */}
      <View style={styles.bottomInfo}>
        {/* User Info */}
        <TouchableOpacity
          style={styles.userInfo}
          onPress={() => onUserPress(item.user.id)}
        >
          <Text style={styles.userName}>@{item.user.name}</Text>
          {item.user.verified && (
            <View style={styles.verifiedBadge}>
              <Ionicons name="checkmark-circle" size={16} color="#f1641e" />
            </View>
          )}
        </TouchableOpacity>

        {/* Description */}
        <Text style={styles.description} numberOfLines={2}>
          {item.description}
        </Text>

        {/* Music Info */}
        <View style={styles.musicInfo}>
          <Ionicons name="musical-notes" size={14} color="#fff" />
          <Text style={styles.musicText} numberOfLines={1}>
            {item.music}
          </Text>
        </View>
      </View>
    </View>
  );
};

const ReelsScreen: React.FC = () => {
  const navigation = useNavigation();
  const [reels, setReels] = useState<Reel[]>(DEMO_REELS);
  const [activeIndex, setActiveIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);

  useFocusEffect(
    useCallback(() => {
      // Resume video when screen is focused
      return () => {
        // Pause all videos when screen loses focus
      };
    }, [])
  );

  const handleViewableItemsChanged = useRef(({ viewableItems }: any) => {
    if (viewableItems.length > 0) {
      setActiveIndex(viewableItems[0].index || 0);
    }
  }).current;

  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 50,
  }).current;

  const handleLike = useCallback((id: string) => {
    setReels(prev =>
      prev.map(reel =>
        reel.id === id ? { ...reel, isLiked: !reel.isLiked } : reel
      )
    );
  }, []);

  const handleComment = useCallback((id: string) => {
    // Navigate to comments or show comment modal
    console.log('Open comments for reel:', id);
  }, []);

  const handleShare = useCallback(async (item: Reel) => {
    try {
      await Share.share({
        message: `Check out this amazing pet video on Mandimore! 🐾\n\n${item.description}`,
        title: 'Share Reel',
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  }, []);

  const handleUserPress = useCallback((userId: number) => {
    // Navigate to user profile
    console.log('Navigate to user:', userId);
  }, []);

  const renderItem = useCallback(
    ({ item, index }: { item: Reel; index: number }) => (
      <ReelItem
        item={item}
        isActive={index === activeIndex}
        onLike={handleLike}
        onComment={handleComment}
        onShare={handleShare}
        onUserPress={handleUserPress}
      />
    ),
    [activeIndex, handleLike, handleComment, handleShare, handleUserPress]
  );

  const getItemLayout = useCallback(
    (_: any, index: number) => ({
      length: VIDEO_HEIGHT,
      offset: VIDEO_HEIGHT * index,
      index,
    }),
    []
  );

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle="light-content"
        backgroundColor="transparent"
        translucent
      />
      <FlatList
        ref={flatListRef}
        data={reels}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        pagingEnabled
        showsVerticalScrollIndicator={false}
        snapToInterval={VIDEO_HEIGHT}
        snapToAlignment="start"
        decelerationRate="fast"
        onViewableItemsChanged={handleViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        getItemLayout={getItemLayout}
        removeClippedSubviews={Platform.OS === 'android'}
        maxToRenderPerBatch={2}
        windowSize={3}
        initialNumToRender={1}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  reelContainer: {
    width,
    height: VIDEO_HEIGHT,
    backgroundColor: '#000',
  },
  videoContainer: {
    flex: 1,
  },
  video: {
    width: '100%',
    height: '100%',
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  playIconContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  playIconBackground: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  bottomGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 300,
  },
  topGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 120,
  },

  // Header
  header: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 50 : 40,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    zIndex: 10,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#fff',
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  cameraButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Actions
  actionsContainer: {
    position: 'absolute',
    right: 12,
    bottom: 100,
    alignItems: 'center',
  },
  avatarButton: {
    marginBottom: 20,
  },
  actionAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: '#fff',
  },
  followButton: {
    position: 'absolute',
    bottom: -6,
    alignSelf: 'center',
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#f1641e',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#000',
  },
  actionButton: {
    alignItems: 'center',
    marginBottom: 20,
  },
  actionText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
    marginTop: 4,
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  musicDisc: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    borderWidth: 8,
    borderColor: '#333',
    overflow: 'hidden',
    marginTop: 5,
  },
  musicDiscImage: {
    width: '100%',
    height: '100%',
  },

  // Bottom Info
  bottomInfo: {
    position: 'absolute',
    bottom: 20,
    left: 12,
    right: 80,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  userName: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  verifiedBadge: {
    marginLeft: 6,
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 1,
  },
  description: {
    color: '#fff',
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 10,
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  musicInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  musicText: {
    color: '#fff',
    fontSize: 12,
    marginLeft: 6,
    fontWeight: '500',
    maxWidth: 180,
  },
});

export default ReelsScreen;