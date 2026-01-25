import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Image,
  ActivityIndicator,
  Alert,
  Dimensions,
  StatusBar,
  Modal,
  FlatList,
  Platform,
} from 'react-native';
import { Ionicons } from '@react-native-vector-icons/ionicons';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import Video from 'react-native-video';
import { launchImageLibrary } from 'react-native-image-picker';
import Slider from '@react-native-community/slider';
import appEvents, { EVENTS } from '../utils/EventEmitter';

const { width, height } = Dimensions.get('window');

interface Category {
  id: number;
  name: string;
  slug: string;
  products_count: number;
}

// Category emoji mapping
const categoryEmojis: { [key: string]: string } = {
  'Dogs': '🐶',
  'Cats': '🐱',
  'Birds': '🐦',
  'Fish': '🐠',
  'Rabbits': '🐰',
  'Hamsters': '🐹',
  'Turtles': '🐢',
  'Horses': '🐴',
  'Parrots': '🦜',
  'Pigeons': '🕊️',
  'Ducks': '🦆',
  'Chickens': '🐔',
  'Hens': '🐔',
  'Cows': '🐄',
  'Sheep': '🐑',
  'Goats': '🐐',
  'Buffaloes': '🐃',
  'Calves': '🐄',
  'Camels': '🐫',
  'Donkeys': '🫏',
  'Mules': '🐴',
  'Roosters': '🐓',
  'Turkeys': '🦃',
  'Quails': '🐦',
  'Peacocks': '🦚',
  'Pheasants': '🐦',
  'Love Birds': '🦜',
  'Cockatiels': '🦜',
  'Macaws': '🦜',
  'Finches': '🐦',
  'Pet Food & Accessories': '🦴',
  'Livestock Feed': '🌾',
  'Animal Medicines': '💊',
  'Pet Training & Services': '🎓',
  'Animal Transport': '🚚',
  'Animal Adoption': '🏠',
  'Missing & Lost Pets': '🔍',
  'Animal for Sacrifice (Qurbani)': '🐑',
};

const getCategoryEmoji = (categoryName: string): string => {
  return categoryEmojis[categoryName] || '🐾';
};

const CreateReel: React.FC = () => {
  const navigation = useNavigation();
  const videoRef = useRef<any>(null);

  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);

  // Video state
  const [videoUri, setVideoUri] = useState<string | null>(null);
  const [videoAsset, setVideoAsset] = useState<any>(null);
  const [videoDuration, setVideoDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

  // Trimming state
  const [trimStart, setTrimStart] = useState(0);
  const [trimEnd, setTrimEnd] = useState(0);
  const [showTrimmer, setShowTrimmer] = useState(false);
  const [activeTrimHandle, setActiveTrimHandle] = useState<'start' | 'end' | null>(null);

  // Upload state
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Modal state
  const [categoryModalVisible, setCategoryModalVisible] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const token = await AsyncStorage.getItem('authToken');
      const response = await axios.get('https://mandimore.com/v1/fetch_all_categories', {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
        },
      });

      if (response.data && response.data.data) {
        // Sort by products_count descending
        const sortedCategories = response.data.data.sort(
          (a: Category, b: Category) => b.products_count - a.products_count
        );
        setCategories(sortedCategories);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
      Alert.alert('Error', 'Failed to load categories');
    } finally {
      setLoadingCategories(false);
    }
  };

  const pickVideo = async () => {
    try {
      const result = await launchImageLibrary({
        mediaType: 'video',
        videoQuality: 'high',
        durationLimit: 60, // Max 60 seconds
      });

      if (result.didCancel) {
        return;
      }

      if (result.errorCode) {
        Alert.alert('Error', result.errorMessage || 'Failed to pick video');
        return;
      }

      if (result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        setVideoUri(asset.uri || null);
        setVideoAsset(asset);
        setTrimStart(0);
        setTrimEnd(asset.duration || 30);
        setVideoDuration(asset.duration || 30);
        setShowTrimmer(true);
        setIsPlaying(false);
        setCurrentTime(0);
      }
    } catch (error) {
      console.error('Error picking video:', error);
      Alert.alert('Error', 'Failed to pick video');
    }
  };

  const onVideoLoad = (data: any) => {
    const duration = data.duration;
    setVideoDuration(duration);
    if (trimEnd === 0 || trimEnd > duration) {
      setTrimEnd(Math.min(duration, 60)); // Max 60 seconds
    }
  };

  const onVideoProgress = (data: any) => {
    setCurrentTime(data.currentTime);
    
    // Loop within trim range
    if (data.currentTime >= trimEnd) {
      videoRef.current?.seek(trimStart);
    }
  };

  const togglePlayPause = () => {
    if (!isPlaying) {
      // If starting playback, start from trim start
      if (currentTime < trimStart || currentTime >= trimEnd) {
        videoRef.current?.seek(trimStart);
      }
    }
    setIsPlaying(!isPlaying);
  };

  const handleTrimStartChange = (value: number) => {
    const newStart = Math.min(value, trimEnd - 1);
    setTrimStart(newStart);
    if (currentTime < newStart) {
      videoRef.current?.seek(newStart);
      setCurrentTime(newStart);
    }
  };

  const handleTrimEndChange = (value: number) => {
    const newEnd = Math.max(value, trimStart + 1);
    setTrimEnd(Math.min(newEnd, 60)); // Max 60 seconds
    if (currentTime > newEnd) {
      videoRef.current?.seek(trimStart);
      setCurrentTime(trimStart);
    }
  };

  const seekToPosition = (position: number) => {
    const clampedPosition = Math.max(trimStart, Math.min(position, trimEnd));
    videoRef.current?.seek(clampedPosition);
    setCurrentTime(clampedPosition);
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getTrimmedDuration = (): number => {
    return trimEnd - trimStart;
  };

  const removeVideo = () => {
    Alert.alert(
      'Remove Video',
      'Are you sure you want to remove this video?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => {
            setVideoUri(null);
            setVideoAsset(null);
            setShowTrimmer(false);
            setTrimStart(0);
            setTrimEnd(0);
            setVideoDuration(0);
            setCurrentTime(0);
            setIsPlaying(false);
          },
        },
      ]
    );
  };

  const validateForm = (): boolean => {
    if (!videoUri) {
      Alert.alert('Video Required', 'Please select a video to upload');
      return false;
    }
    if (!title.trim()) {
      Alert.alert('Title Required', 'Please enter a title for your critter');
      return false;
    }
    if (title.trim().length < 3) {
      Alert.alert('Title Too Short', 'Title must be at least 3 characters');
      return false;
    }
    if (!selectedCategory) {
      Alert.alert('Category Required', 'Please select a category');
      return false;
    }
    return true;
  };

  const handleUpload = async () => {
    if (!validateForm()) return;

    setIsUploading(true);
    setUploadProgress(0);

    try {
      const token = await AsyncStorage.getItem('authToken');
      
      const formData = new FormData();
      formData.append('title', title.trim());
      formData.append('description', description.trim());
      formData.append('category_id', selectedCategory!.id.toString());
      formData.append('trim_start', trimStart.toString());
      formData.append('trim_end', trimEnd.toString());
      
      // Append video file
      formData.append('video', {
        uri: videoUri,
        type: videoAsset?.type || 'video/mp4',
        name: videoAsset?.fileName || 'critter_video.mp4',
      } as any);

      // TODO: Replace with your actual upload endpoint
      const response = await axios.post(
        'https://mandimore.com/v1/reels',
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: 'application/json',
            'Content-Type': 'multipart/form-data',
          },
          onUploadProgress: (progressEvent) => {
            const progress = progressEvent.total
              ? Math.round((progressEvent.loaded * 100) / progressEvent.total)
              : 0;
            setUploadProgress(progress);
          },
        }
      );

      if (response.data) {
        // Emit event for reel created
        appEvents.emit(EVENTS.LISTING_CREATED);
        
        Alert.alert(
          'Success! 🎉',
          'Your critter has been uploaded successfully!',
          [
            {
              text: 'OK',
              onPress: () => navigation.goBack(),
            },
          ]
        );
      }
    } catch (error: any) {
      console.error('Upload error:', error);
      const errorMessage = error.response?.data?.message || 'Failed to upload critter. Please try again.';
      Alert.alert('Upload Failed', errorMessage);
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const renderCategoryItem = ({ item }: { item: Category }) => (
    <TouchableOpacity
      style={[
        styles.categoryItem,
        selectedCategory?.id === item.id && styles.categoryItemSelected,
      ]}
      onPress={() => {
        setSelectedCategory(item);
        setCategoryModalVisible(false);
      }}
      activeOpacity={0.7}
    >
      <Text style={styles.categoryItemEmoji}>{getCategoryEmoji(item.name)}</Text>
      <View style={styles.categoryItemContent}>
        <Text
          style={[
            styles.categoryItemName,
            selectedCategory?.id === item.id && styles.categoryItemNameSelected,
          ]}
        >
          {item.name}
        </Text>
        <Text style={styles.categoryItemCount}>
          {item.products_count} {item.products_count === 1 ? 'listing' : 'listings'}
        </Text>
      </View>
      {selectedCategory?.id === item.id && (
        <Ionicons name="checkmark-circle" size={24} color="#f1641e" />
      )}
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#f1641e" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Upload Critter</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Video Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            <Ionicons name="videocam" size={18} color="#f1641e" /> Video
          </Text>

          {!videoUri ? (
            <TouchableOpacity
              style={styles.videoPicker}
              onPress={pickVideo}
              activeOpacity={0.8}
            >
              <View style={styles.videoPickerIcon}>
                <Ionicons name="cloud-upload-outline" size={40} color="#f1641e" />
              </View>
              <Text style={styles.videoPickerTitle}>Select Video</Text>
              <Text style={styles.videoPickerSubtitle}>
                Tap to choose a video from your gallery
              </Text>
              <View style={styles.videoPickerInfo}>
                <Ionicons name="information-circle-outline" size={14} color="#999" />
                <Text style={styles.videoPickerInfoText}>Max 60 seconds • MP4, MOV</Text>
              </View>
            </TouchableOpacity>
          ) : (
            <View style={styles.videoPreviewContainer}>
              {/* Video Player */}
              <TouchableOpacity
                style={styles.videoWrapper}
                onPress={togglePlayPause}
                activeOpacity={0.95}
              >
                <Video
                  ref={videoRef}
                  source={{ uri: videoUri }}
                  style={styles.videoPlayer}
                  resizeMode="cover"
                  paused={!isPlaying}
                  muted={isMuted}
                  repeat={true}
                  onLoad={onVideoLoad}
                  onProgress={onVideoProgress}
                />

                {/* Play/Pause Overlay */}
                {!isPlaying && (
                  <View style={styles.playOverlay}>
                    <View style={styles.playButton}>
                      <Ionicons name="play" size={32} color="#fff" />
                    </View>
                  </View>
                )}

                {/* Video Controls */}
                <View style={styles.videoControls}>
                  <TouchableOpacity
                    style={styles.videoControlBtn}
                    onPress={() => setIsMuted(!isMuted)}
                  >
                    <Ionicons
                      name={isMuted ? 'volume-mute' : 'volume-high'}
                      size={20}
                      color="#fff"
                    />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.videoControlBtn}
                    onPress={removeVideo}
                  >
                    <Ionicons name="trash-outline" size={20} color="#fff" />
                  </TouchableOpacity>
                </View>

                {/* Duration Badge */}
                <View style={styles.durationBadge}>
                  <Text style={styles.durationText}>
                    {formatTime(getTrimmedDuration())}
                  </Text>
                </View>
              </TouchableOpacity>

              {/* Trim Controls */}
              {showTrimmer && videoDuration > 0 && (
                <View style={styles.trimmerContainer}>
                  <View style={styles.trimmerHeader}>
                    <Text style={styles.trimmerTitle}>
                      <Ionicons name="cut-outline" size={16} color="#333" /> Trim Video
                    </Text>
                    <Text style={styles.trimmerDuration}>
                      {formatTime(getTrimmedDuration())} selected
                    </Text>
                  </View>

                  {/* Timeline */}
                  <View style={styles.timeline}>
                    <View style={styles.timelineTrack}>
                      {/* Selected Range */}
                      <View
                        style={[
                          styles.timelineSelected,
                          {
                            left: `${(trimStart / videoDuration) * 100}%`,
                            right: `${100 - (trimEnd / videoDuration) * 100}%`,
                          },
                        ]}
                      />
                      {/* Current Position */}
                      <View
                        style={[
                          styles.timelinePlayhead,
                          {
                            left: `${(currentTime / videoDuration) * 100}%`,
                          },
                        ]}
                      />
                    </View>
                  </View>

                  {/* Start Time Slider */}
                  <View style={styles.sliderRow}>
                    <Text style={styles.sliderLabel}>Start</Text>
                    <Slider
                      style={styles.slider}
                      minimumValue={0}
                      maximumValue={videoDuration}
                      value={trimStart}
                      onValueChange={handleTrimStartChange}
                      minimumTrackTintColor="#f1641e"
                      maximumTrackTintColor="#e0e0e0"
                      thumbTintColor="#f1641e"
                    />
                    <Text style={styles.sliderTime}>{formatTime(trimStart)}</Text>
                  </View>

                  {/* End Time Slider */}
                  <View style={styles.sliderRow}>
                    <Text style={styles.sliderLabel}>End</Text>
                    <Slider
                      style={styles.slider}
                      minimumValue={0}
                      maximumValue={videoDuration}
                      value={trimEnd}
                      onValueChange={handleTrimEndChange}
                      minimumTrackTintColor="#f1641e"
                      maximumTrackTintColor="#e0e0e0"
                      thumbTintColor="#f1641e"
                    />
                    <Text style={styles.sliderTime}>{formatTime(trimEnd)}</Text>
                  </View>

                  {/* Preview Trim Button */}
                  <TouchableOpacity
                    style={styles.previewTrimBtn}
                    onPress={() => {
                      videoRef.current?.seek(trimStart);
                      setIsPlaying(true);
                    }}
                  >
                    <Ionicons name="play-circle-outline" size={18} color="#f1641e" />
                    <Text style={styles.previewTrimText}>Preview Trimmed Video</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          )}
        </View>

        {/* Title Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            <Ionicons name="text" size={18} color="#f1641e" /> Title
          </Text>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Give your critter a catchy title..."
              placeholderTextColor="#999"
              value={title}
              onChangeText={setTitle}
              maxLength={100}
            />
            <Text style={styles.charCount}>{title.length}/100</Text>
          </View>
        </View>

        {/* Description Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            <Ionicons name="document-text-outline" size={18} color="#f1641e" /> Description
          </Text>
          <View style={styles.inputContainer}>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Tell us about your critter... What makes it special?"
              placeholderTextColor="#999"
              value={description}
              onChangeText={setDescription}
              maxLength={500}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
            <Text style={styles.charCount}>{description.length}/500</Text>
          </View>
        </View>

        {/* Category Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            <Ionicons name="pricetag-outline" size={18} color="#f1641e" /> Category
          </Text>
          <TouchableOpacity
            style={styles.categorySelector}
            onPress={() => setCategoryModalVisible(true)}
            activeOpacity={0.8}
          >
            {selectedCategory ? (
              <View style={styles.selectedCategory}>
                <Text style={styles.selectedCategoryEmoji}>
                  {getCategoryEmoji(selectedCategory.name)}
                </Text>
                <Text style={styles.selectedCategoryName}>{selectedCategory.name}</Text>
              </View>
            ) : (
              <Text style={styles.categorySelectorPlaceholder}>
                Select a category...
              </Text>
            )}
            <Ionicons name="chevron-down" size={20} color="#999" />
          </TouchableOpacity>
        </View>

        {/* Upload Button */}
        <TouchableOpacity
          style={[
            styles.uploadButton,
            (!videoUri || !title.trim() || !selectedCategory || isUploading) &&
              styles.uploadButtonDisabled,
          ]}
          onPress={handleUpload}
          disabled={!videoUri || !title.trim() || !selectedCategory || isUploading}
          activeOpacity={0.8}
        >
          {isUploading ? (
            <View style={styles.uploadingContainer}>
              <ActivityIndicator size="small" color="#fff" />
              <Text style={styles.uploadingText}>
                Uploading... {uploadProgress}%
              </Text>
            </View>
          ) : (
            <>
              <Ionicons name="cloud-upload" size={22} color="#fff" />
              <Text style={styles.uploadButtonText}>Upload Critter</Text>
            </>
          )}
        </TouchableOpacity>

        {/* Upload Progress Bar */}
        {isUploading && (
          <View style={styles.progressBarContainer}>
            <View style={styles.progressBarTrack}>
              <View
                style={[styles.progressBarFill, { width: `${uploadProgress}%` }]}
              />
            </View>
            <Text style={styles.progressText}>
              {uploadProgress < 100
                ? 'Uploading your critter...'
                : 'Processing...'}
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Category Modal */}
      <Modal
        visible={categoryModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setCategoryModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Category</Text>
              <TouchableOpacity
                style={styles.modalCloseBtn}
                onPress={() => setCategoryModalVisible(false)}
              >
                <Ionicons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>

            {loadingCategories ? (
              <View style={styles.modalLoading}>
                <ActivityIndicator size="large" color="#f1641e" />
                <Text style={styles.modalLoadingText}>Loading categories...</Text>
              </View>
            ) : (
              <FlatList
                data={categories}
                renderItem={renderCategoryItem}
                keyExtractor={(item) => item.id.toString()}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.categoryList}
              />
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default CreateReel;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#f1641e',
    paddingTop: Platform.OS === 'ios' ? 50 : StatusBar.currentHeight || 24,
    paddingBottom: 16,
    paddingHorizontal: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
  },
  headerRight: {
    width: 40,
  },

  // Scroll View
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },

  // Sections
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
    marginBottom: 12,
  },

  // Video Picker
  videoPicker: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#f1641e',
    borderStyle: 'dashed',
  },
  videoPickerIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#fff5f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  videoPickerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
    marginBottom: 8,
  },
  videoPickerSubtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 12,
  },
  videoPickerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  videoPickerInfoText: {
    fontSize: 12,
    color: '#999',
    marginLeft: 4,
  },

  // Video Preview
  videoPreviewContainer: {
    backgroundColor: '#fff',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  videoWrapper: {
    width: '100%',
    height: 300,
    backgroundColor: '#000',
    position: 'relative',
  },
  videoPlayer: {
    width: '100%',
    height: '100%',
  },
  playOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  playButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(241, 100, 30, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  videoControls: {
    position: 'absolute',
    top: 12,
    right: 12,
    flexDirection: 'row',
  },
  videoControlBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  durationBadge: {
    position: 'absolute',
    bottom: 12,
    left: 12,
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  durationText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },

  // Trimmer
  trimmerContainer: {
    padding: 16,
    backgroundColor: '#f8f9fa',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  trimmerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  trimmerTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#333',
  },
  trimmerDuration: {
    fontSize: 13,
    color: '#f1641e',
    fontWeight: '600',
  },
  timeline: {
    height: 24,
    marginBottom: 16,
  },
  timelineTrack: {
    height: 8,
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
    marginTop: 8,
    position: 'relative',
    overflow: 'hidden',
  },
  timelineSelected: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    backgroundColor: '#f1641e',
    borderRadius: 4,
  },
  timelinePlayhead: {
    position: 'absolute',
    top: -4,
    width: 4,
    height: 16,
    backgroundColor: '#333',
    borderRadius: 2,
    marginLeft: -2,
  },
  sliderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  sliderLabel: {
    width: 40,
    fontSize: 13,
    color: '#666',
    fontWeight: '500',
  },
  slider: {
    flex: 1,
    height: 40,
  },
  sliderTime: {
    width: 45,
    fontSize: 13,
    color: '#333',
    fontWeight: '600',
    textAlign: 'right',
  },
  previewTrimBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    marginTop: 8,
  },
  previewTrimText: {
    fontSize: 14,
    color: '#f1641e',
    fontWeight: '600',
    marginLeft: 6,
  },

  // Inputs
  inputContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    overflow: 'hidden',
  },
  input: {
    fontSize: 16,
    color: '#333',
    padding: 16,
    paddingBottom: 32,
  },
  textArea: {
    minHeight: 120,
  },
  charCount: {
    position: 'absolute',
    bottom: 8,
    right: 12,
    fontSize: 12,
    color: '#999',
  },

  // Category Selector
  categorySelector: {
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  categorySelectorPlaceholder: {
    fontSize: 16,
    color: '#999',
  },
  selectedCategory: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  selectedCategoryEmoji: {
    fontSize: 24,
    marginRight: 12,
  },
  selectedCategoryName: {
    fontSize: 16,
    color: '#333',
    fontWeight: '600',
  },

  // Upload Button
  uploadButton: {
    backgroundColor: '#f1641e',
    borderRadius: 16,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    shadowColor: '#f1641e',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  uploadButtonDisabled: {
    backgroundColor: '#ccc',
    shadowOpacity: 0,
    elevation: 0,
  },
  uploadButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
    marginLeft: 10,
  },
  uploadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  uploadingText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginLeft: 12,
  },

  // Progress Bar
  progressBarContainer: {
    marginTop: 16,
    alignItems: 'center',
  },
  progressBarTrack: {
    width: '100%',
    height: 8,
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#f1641e',
    borderRadius: 4,
  },
  progressText: {
    marginTop: 8,
    fontSize: 13,
    color: '#666',
  },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: height * 0.7,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
  },
  modalCloseBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalLoading: {
    padding: 40,
    alignItems: 'center',
  },
  modalLoadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#666',
  },
  categoryList: {
    padding: 16,
  },
  categoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    marginBottom: 10,
  },
  categoryItemSelected: {
    backgroundColor: '#fff5f0',
    borderWidth: 2,
    borderColor: '#f1641e',
  },
  categoryItemEmoji: {
    fontSize: 28,
    marginRight: 14,
  },
  categoryItemContent: {
    flex: 1,
  },
  categoryItemName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  categoryItemNameSelected: {
    color: '#f1641e',
  },
  categoryItemCount: {
    fontSize: 12,
    color: '#999',
  },
});