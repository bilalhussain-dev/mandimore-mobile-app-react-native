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
  Linking,
  RefreshControl,
} from 'react-native';
import { Ionicons } from "@react-native-vector-icons/ionicons";
import Video from 'react-native-video';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { BlurView } from '@react-native-community/blur';

const { width, height } = Dimensions.get('window');

// Full screen height - no bottom tab subtraction for immersive experience
const VIDEO_HEIGHT = height;

// Theme color
const THEME_COLOR = '#f1641e';
const THEME_COLOR_LIGHT = 'rgba(241, 100, 30, 0.3)';

// Hardcoded video URL for all reels (as requested)
const HARDCODED_VIDEO_URL = 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8';

// Default avatar placeholder
const DEFAULT_AVATAR = 'https://ui-avatars.com/api/?background=f1641e&color=fff&name=';

// API Configuration
const API_BASE_URL = 'https://mandimore.com/v1';

interface User {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  username: string;
  avatar_url: string | null;
  verified: boolean;
}

interface Reel {
  id: number;
  title: string;
  description: string;
  contact: string;
  category_id: number;
  created_at: string;
  user: User;
  hls_master?: string;
  isLiked?: boolean;
  likes?: number;
  comments?: number;
  shares?: number;
}

interface ReelItemProps {
  item: Reel;
  isActive: boolean;
  onLike: (id: number) => void;
  onComment: (id: number) => void;
  onShare: (item: Reel) => void;
  onUserPress: (userId: number) => void;
  onCallPress: (contact: string) => void;
  onWhatsAppPress: (contact: string, title: string) => void;
}

// Glassmorphism CTA Button Component - Compact Pill Style
const GlassCTAButton: React.FC<{
  onPress: () => void;
  icon: string;
  label: string;
  variant: 'call' | 'whatsapp';
}> = ({ onPress, icon, label, variant }) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.95,
      useNativeDriver: true,
      speed: 50,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      speed: 50,
    }).start();
  };

  const iconColor = variant === 'call' ? '#4CAF50' : '#25D366';

  return (
    <Animated.View style={[styles.glassCTAWrapper, { transform: [{ scale: scaleAnim }] }]}>
      <TouchableOpacity
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={1}
        style={styles.glassCTAButton}
      >
        <View style={styles.glassCTAContent}>
          {Platform.OS === 'ios' ? (
            <BlurView
              style={StyleSheet.absoluteFill}
              blurType="dark"
              blurAmount={20}
              reducedTransparencyFallbackColor="rgba(0,0,0,0.5)"
            />
          ) : (
            <View style={[StyleSheet.absoluteFill, styles.androidBlurFallback]} />
          )}
          <View style={styles.glassCTAInner}>
            <Ionicons name={icon as any} size={14} color={iconColor} />
            <Text style={styles.glassCTAText}>{label}</Text>
          </View>
          {/* Subtle border glow */}
          <View style={[styles.glassCTABorder, { borderColor: `${iconColor}40` }]} />
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

const ReelItem: React.FC<ReelItemProps> = ({
  item,
  isActive,
  onLike,
  onComment,
  onShare,
  onUserPress,
  onCallPress,
  onWhatsAppPress,
}) => {
  const [paused, setPaused] = useState(!isActive);
  const [loading, setLoading] = useState(true);
  const [liked, setLiked] = useState(item.isLiked || false);
  const [likesCount, setLikesCount] = useState(item.likes || 0);
  const [showPlayIcon, setShowPlayIcon] = useState(false);
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const heartScale = useRef(new Animated.Value(1)).current;
  const playIconOpacity = useRef(new Animated.Value(0)).current;
  const doubleTapHeartScale = useRef(new Animated.Value(0)).current;
  const doubleTapHeartOpacity = useRef(new Animated.Value(0)).current;
  const videoRef = useRef<any>(null);
  const lastTap = useRef<number>(0);

  useEffect(() => {
    setPaused(!isActive);
    if (!isActive) {
      setIsDescriptionExpanded(false);
    }
  }, [isActive]);

  const handleVideoPress = useCallback(() => {
    const now = Date.now();
    const DOUBLE_TAP_DELAY = 300;

    if (now - lastTap.current < DOUBLE_TAP_DELAY) {
      // Double tap - like
      handleDoubleTapLike();
    } else {
      // Single tap - play/pause
      setTimeout(() => {
        if (Date.now() - lastTap.current >= DOUBLE_TAP_DELAY) {
          setPaused(prev => !prev);
          setShowPlayIcon(true);

          Animated.sequence([
            Animated.timing(playIconOpacity, {
              toValue: 1,
              duration: 50,
              useNativeDriver: true,
            }),
            Animated.delay(400),
            Animated.timing(playIconOpacity, {
              toValue: 0,
              duration: 150,
              useNativeDriver: true,
            }),
          ]).start(() => setShowPlayIcon(false));
        }
      }, DOUBLE_TAP_DELAY);
    }
    lastTap.current = now;
  }, []);

  const handleDoubleTapLike = useCallback(() => {
    if (!liked) {
      setLiked(true);
      setLikesCount(prev => prev + 1);
      onLike(item.id);
    }

    // Show floating heart animation
    Animated.parallel([
      Animated.sequence([
        Animated.timing(doubleTapHeartOpacity, {
          toValue: 1,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.delay(600),
        Animated.timing(doubleTapHeartOpacity, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]),
      Animated.sequence([
        Animated.spring(doubleTapHeartScale, {
          toValue: 1,
          useNativeDriver: true,
          speed: 20,
          bounciness: 15,
        }),
        Animated.timing(doubleTapHeartScale, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]),
    ]).start();
  }, [liked, item.id, onLike]);

  const handleLikePress = useCallback(() => {
    setLiked(prev => !prev);
    setLikesCount(prev => liked ? prev - 1 : prev + 1);
    onLike(item.id);

    Animated.sequence([
      Animated.spring(heartScale, {
        toValue: 1.3,
        useNativeDriver: true,
        speed: 50,
      }),
      Animated.spring(heartScale, {
        toValue: 1,
        useNativeDriver: true,
        speed: 50,
      }),
    ]).start();
  }, [liked, item.id, onLike, heartScale]);

  const handleFollowPress = useCallback(() => {
    setIsFollowing(prev => !prev);
  }, []);

  const toggleDescription = useCallback(() => {
    setIsDescriptionExpanded(prev => !prev);
  }, []);

  const formatCount = (count: number): string => {
    if (count >= 1000000) {
      return (count / 1000000).toFixed(1) + 'M';
    } else if (count >= 1000) {
      return (count / 1000).toFixed(1) + 'K';
    }
    return count.toString();
  };

  const getUserDisplayName = () => {
    if (item.user.username) return item.user.username;
    return `${item.user.first_name}${item.user.last_name ? '_' + item.user.last_name : ''}`;
  };

  const getAvatarUrl = () => {
    if (item.user.avatar_url) return item.user.avatar_url;
    return `${DEFAULT_AVATAR}${item.user.first_name}+${item.user.last_name || ''}`;
  };

  const videoUrl = HARDCODED_VIDEO_URL;

  return (
    <View style={styles.reelContainer}>
      <TouchableOpacity
        activeOpacity={1}
        style={styles.videoContainer}
        onPress={handleVideoPress}
      >
        <Video
          ref={videoRef}
          source={{ uri: videoUrl }}
          style={styles.video}
          resizeMode="cover"
          repeat
          paused={paused}
          playInBackground={false}
          playWhenInactive={false}
          ignoreSilentSwitch="ignore"
          onLoad={() => setLoading(false)}
          onBuffer={({ isBuffering }) => setLoading(isBuffering)}
          bufferConfig={{
            minBufferMs: 2000,
            maxBufferMs: 10000,
            bufferForPlaybackMs: 500,
            bufferForPlaybackAfterRebufferMs: 1000,
          }}
          minLoadRetryCount={3}
          maxBitRate={2000000}
        />

        {loading && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color={THEME_COLOR} />
          </View>
        )}

        {/* Play/Pause Icon */}
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

        {/* Double Tap Heart */}
        <Animated.View
          style={[
            styles.doubleTapHeartContainer,
            {
              opacity: doubleTapHeartOpacity,
              transform: [{ scale: doubleTapHeartScale }],
            },
          ]}
        >
          <Ionicons name="heart" size={100} color={THEME_COLOR} />
        </Animated.View>

        {/* Bottom Gradient - Extended for full screen */}
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.3)', 'rgba(0,0,0,0.85)']}
          locations={[0, 0.5, 1]}
          style={styles.bottomGradient}
        />

        {/* Top Gradient */}
        <LinearGradient
          colors={['rgba(0,0,0,0.6)', 'rgba(0,0,0,0.3)', 'transparent']}
          locations={[0, 0.5, 1]}
          style={styles.topGradient}
        />
      </TouchableOpacity>

      {/* Right Action Buttons */}
      <View style={styles.actionsContainer}>
        {/* User Avatar */}
        <TouchableOpacity
          style={styles.avatarButton}
          onPress={() => onUserPress(item.user.id)}
        >
          <View style={styles.avatarWrapper}>
            <Image
              source={{ uri: getAvatarUrl() }}
              style={styles.actionAvatar}
            />
            <View style={styles.avatarRing} />
          </View>
          <TouchableOpacity
            style={[
              styles.followButton,
              isFollowing && styles.followButtonActive,
            ]}
            onPress={handleFollowPress}
          >
            <Ionicons
              name={isFollowing ? 'checkmark' : 'add'}
              size={12}
              color="#fff"
            />
          </TouchableOpacity>
        </TouchableOpacity>

        {/* Like Button */}
        <TouchableOpacity style={styles.actionButton} onPress={handleLikePress}>
          <Animated.View style={{ transform: [{ scale: heartScale }] }}>
            <Ionicons
              name={liked ? 'heart' : 'heart-outline'}
              size={32}
              color={liked ? '#ff4757' : '#fff'}
            />
          </Animated.View>
          <Text style={styles.actionText}>{formatCount(likesCount)}</Text>
        </TouchableOpacity>

        {/* Comment Button */}
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => onComment(item.id)}
        >
          <Ionicons name="chatbubble-ellipses-outline" size={30} color="#fff" />
          <Text style={styles.actionText}>{formatCount(item.comments || 0)}</Text>
        </TouchableOpacity>

        {/* Share Button */}
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => onShare(item)}
        >
          <Ionicons name="paper-plane-outline" size={28} color="#fff" />
          <Text style={styles.actionText}>{formatCount(item.shares || 0)}</Text>
        </TouchableOpacity>
      </View>

      {/* Bottom Info */}
      <View style={styles.bottomInfo}>
        {/* User Info */}
        <TouchableOpacity
          style={styles.userInfo}
          onPress={() => onUserPress(item.user.id)}
        >
          <Text style={styles.userName}>@{getUserDisplayName()}</Text>
          {item.user.verified && (
            <View style={styles.verifiedBadge}>
              <Ionicons name="checkmark-circle" size={16} color={THEME_COLOR} />
            </View>
          )}
        </TouchableOpacity>

        {/* Title */}
        {item.title && (
          <Text style={styles.titleText} numberOfLines={1}>
            {item.title}
          </Text>
        )}

        {/* Description - Expandable */}
        <TouchableOpacity onPress={toggleDescription} activeOpacity={0.8}>
          <View style={[
            styles.descriptionContainer,
            isDescriptionExpanded && styles.descriptionContainerExpanded
          ]}>
            <Text
              style={styles.description}
              numberOfLines={isDescriptionExpanded ? undefined : 2}
            >
              {item.description}
            </Text>
            {!isDescriptionExpanded && item.description && item.description.length > 80 && (
              <Text style={styles.seeMoreText}>... more</Text>
            )}
            {isDescriptionExpanded && (
              <Text style={styles.seeLessText}>Show less</Text>
            )}
          </View>
        </TouchableOpacity>

        {/* Location Tag */}
        {item.contact && (
          <View style={styles.locationContainer}>
            <Ionicons name="location" size={14} color={THEME_COLOR} />
            <Text style={styles.locationText}>{item.contact}</Text>
          </View>
        )}

        {/* Glassmorphism CTA Buttons */}
        <View style={styles.ctaContainer}>
          <GlassCTAButton
            onPress={() => onCallPress(item.contact)}
            icon="call"
            label="Call Now"
            variant="call"
          />
          <GlassCTAButton
            onPress={() => onWhatsAppPress(item.contact, item.title)}
            icon="logo-whatsapp"
            label="WhatsApp"
            variant="whatsapp"
          />
        </View>
      </View>

      {/* Sound/Music Info */}
      <View style={styles.soundInfo}>
        <View style={styles.soundIcon}>
          <Ionicons name="musical-notes" size={12} color="#fff" />
        </View>
        <Text style={styles.soundText} numberOfLines={1}>
          Original Audio · {getUserDisplayName()}
        </Text>
      </View>
    </View>
  );
};

const ReelsScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const [reels, setReels] = useState<Reel[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const flatListRef = useRef<FlatList>(null);

  const fetchReels = useCallback(async () => {
    try {
      const token = await AsyncStorage.getItem("authToken");
      setError(null);
      const response = await fetch(`${API_BASE_URL}/reels`, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      });
      const result = await response.json();

      if (result.code === 200 && result.data) {
        const reelsWithDefaults = result.data.map((reel: Reel) => ({
          ...reel,
          isLiked: false,
          likes: Math.floor(Math.random() * 5000) + 100,
          comments: Math.floor(Math.random() * 500) + 10,
          shares: Math.floor(Math.random() * 200) + 5,
        }));
        setReels(reelsWithDefaults);
      } else {
        setError(result.message || 'Failed to fetch reels');
      }
    } catch (err) {
      console.error('Error fetching reels:', err);
      setError('Failed to load reels. Please check your connection.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchReels();
  }, [fetchReels]);

  useFocusEffect(
    useCallback(() => {
      return () => {
        // Cleanup on unfocus
      };
    }, [])
  );

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    fetchReels();
  }, [fetchReels]);

  const handleBackPress = () => {
    navigation.goBack();
  };

  const handleViewableItemsChanged = useRef(({ viewableItems }: any) => {
    if (viewableItems.length > 0) {
      setActiveIndex(viewableItems[0].index || 0);
    }
  }).current;

  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 60,
  }).current;

  const handleLike = useCallback((id: number) => {
    setReels(prev =>
      prev.map(reel =>
        reel.id === id ? { ...reel, isLiked: !reel.isLiked } : reel
      )
    );
  }, []);

  const handleComment = useCallback((id: number) => {
    console.log('Open comments for reel:', id);
  }, []);

  const handleShare = useCallback(async (item: Reel) => {
    try {
      await Share.share({
        message: `Check out this on Mandimore! 🐾\n\n${item.title}\n${item.description}`,
        title: 'Share Reel',
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  }, []);

  const handleUserPress = useCallback((userId: number) => {
    console.log('Navigate to user:', userId);
  }, []);

  const handleCallPress = useCallback((contact: string) => {
    const phoneNumber = 'tel:+923001234567';
    Linking.openURL(phoneNumber).catch(err => {
      console.error('Error opening phone:', err);
    });
  }, []);

  const handleWhatsAppPress = useCallback((contact: string, title: string) => {
    const phoneNumber = '+923001234567';
    const message = encodeURIComponent(`Hi! I'm interested in "${title}" I saw on Mandimore.`);
    const whatsappUrl = `whatsapp://send?phone=${phoneNumber}&text=${message}`;

    Linking.openURL(whatsappUrl).catch(err => {
      console.error('Error opening WhatsApp:', err);
      Linking.openURL(`https://wa.me/${phoneNumber}?text=${message}`);
    });
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
        onCallPress={handleCallPress}
        onWhatsAppPress={handleWhatsAppPress}
      />
    ),
    [activeIndex, handleLike, handleComment, handleShare, handleUserPress, handleCallPress, handleWhatsAppPress]
  );

  const getItemLayout = useCallback(
    (_: any, index: number) => ({
      length: VIDEO_HEIGHT,
      offset: VIDEO_HEIGHT * index,
      index,
    }),
    []
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
        <View style={styles.loadingContent}>
          <View style={styles.loadingSpinner}>
            <ActivityIndicator size="large" color={THEME_COLOR} />
          </View>
          <Text style={styles.loadingText}>Loading Reels...</Text>
        </View>
      </View>
    );
  }

  if (error && reels.length === 0) {
    return (
      <View style={styles.errorContainer}>
        <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
        <View style={styles.errorIconWrapper}>
          <Ionicons name="cloud-offline-outline" size={60} color={THEME_COLOR} />
        </View>
        <Text style={styles.errorTitle}>Oops!</Text>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={fetchReels}>
          <LinearGradient
            colors={[THEME_COLOR, '#ff8c42']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.retryGradient}
          >
            <Ionicons name="refresh" size={20} color="#fff" />
            <Text style={styles.retryButtonText}>Try Again</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    );
  }

  if (reels.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
        <View style={styles.emptyIconWrapper}>
          <Ionicons name="videocam-off-outline" size={70} color="#444" />
        </View>
        <Text style={styles.emptyTitle}>No Reels Yet</Text>
        <Text style={styles.emptyText}>Check back later for new content!</Text>
        <TouchableOpacity style={styles.retryButton} onPress={fetchReels}>
          <LinearGradient
            colors={[THEME_COLOR, '#ff8c42']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.retryGradient}
          >
            <Ionicons name="refresh" size={20} color="#fff" />
            <Text style={styles.retryButtonText}>Refresh</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle="light-content"
        backgroundColor="transparent"
        translucent
      />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.headerButton}
          onPress={handleBackPress}
        >
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Reels</Text>
          <View style={styles.headerDot} />
        </View>

        <TouchableOpacity style={styles.headerButton}>
          <Ionicons name="camera-outline" size={26} color="#fff" />
        </TouchableOpacity>
      </View>

      <FlatList
        ref={flatListRef}
        data={reels}
        renderItem={renderItem}
        keyExtractor={item => item.id.toString()}
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
        updateCellsBatchingPeriod={100}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={THEME_COLOR}
            colors={[THEME_COLOR]}
            progressViewOffset={100}
          />
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingContent: {
    alignItems: 'center',
  },
  loadingSpinner: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(241, 100, 30, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  loadingText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
    opacity: 0.8,
  },
  errorContainer: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  errorIconWrapper: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(241, 100, 30, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  errorTitle: {
    color: '#fff',
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 8,
  },
  errorText: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 15,
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 22,
  },
  emptyContainer: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyIconWrapper: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255,255,255,0.05)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  emptyTitle: {
    color: '#fff',
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 8,
  },
  emptyText: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 15,
    marginBottom: 30,
  },
  retryButton: {
    borderRadius: 25,
    overflow: 'hidden',
    elevation: 8,
    shadowColor: THEME_COLOR,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  retryGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingVertical: 14,
    gap: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
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
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  doubleTapHeartContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bottomGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 400,
  },
  topGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 150,
  },

  // Header
  header: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 54 : 44,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    zIndex: 10,
  },
  headerButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  headerCenter: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#fff',
    letterSpacing: 0.5,
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  headerDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: THEME_COLOR,
    marginLeft: 6,
  },

  // Actions
  actionsContainer: {
    position: 'absolute',
    right: 12,
    bottom: 200,
    alignItems: 'center',
  },
  avatarButton: {
    marginBottom: 24,
    alignItems: 'center',
  },
  avatarWrapper: {
    position: 'relative',
  },
  actionAvatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    borderWidth: 2,
    borderColor: '#fff',
    backgroundColor: '#333',
  },
  avatarRing: {
    position: 'absolute',
    width: 58,
    height: 58,
    borderRadius: 29,
    borderWidth: 2,
    borderColor: THEME_COLOR,
    top: -3,
    left: -3,
    opacity: 0.5,
  },
  followButton: {
    position: 'absolute',
    bottom: -8,
    alignSelf: 'center',
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: THEME_COLOR,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#000',
  },
  followButtonActive: {
    backgroundColor: '#4CAF50',
  },
  actionButton: {
    alignItems: 'center',
    marginBottom: 22,
  },
  actionText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
    marginTop: 4,
    textShadowColor: 'rgba(0,0,0,0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },

  // Bottom Info
  bottomInfo: {
    position: 'absolute',
    bottom: 100,
    left: 16,
    right: 85,
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
    textShadowColor: 'rgba(0,0,0,0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  verifiedBadge: {
    marginLeft: 6,
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 1,
  },
  titleText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 6,
    textShadowColor: 'rgba(0,0,0,0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  descriptionContainer: {
    marginBottom: 10,
  },
  descriptionContainerExpanded: {
    marginBottom: 14,
  },
  description: {
    color: 'rgba(255,255,255,0.95)',
    fontSize: 14,
    lineHeight: 20,
    textShadowColor: 'rgba(0,0,0,0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  seeMoreText: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 14,
    fontWeight: '600',
    marginTop: 2,
  },
  seeLessText: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 14,
    fontWeight: '600',
    marginTop: 8,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  locationText: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 13,
    marginLeft: 6,
    fontWeight: '500',
    textShadowColor: 'rgba(0,0,0,0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },

  // Glassmorphism CTA Buttons - Compact Pill Style
  ctaContainer: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 6,
  },
  glassCTAWrapper: {
    // Remove flex: 1 to allow buttons to size to content
  },
  glassCTAButton: {
    borderRadius: 100,
    overflow: 'hidden',
  },
  glassCTAContent: {
    position: 'relative',
    borderRadius: 100,
    overflow: 'hidden',
  },
  androidBlurFallback: {
    backgroundColor: 'rgba(255,255,255,0.12)',
  },
  glassCTAInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 14,
    gap: 6,
  },
  glassCTAText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  glassCTABorder: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 100,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
  },

  // Sound Info
  soundInfo: {
    position: 'absolute',
    bottom: 55,
    left: 16,
    right: 85,
    flexDirection: 'row',
    alignItems: 'center',
  },
  soundIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  soundText: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 12,
    fontWeight: '500',
    flex: 1,
  },
});

export default ReelsScreen;