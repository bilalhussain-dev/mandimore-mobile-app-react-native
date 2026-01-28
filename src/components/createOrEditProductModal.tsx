import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Modal,
  Image,
  Alert,
  ActivityIndicator,
  Platform,
  PermissionsAndroid,
} from "react-native";
import axios from "axios";
import { launchImageLibrary } from "react-native-image-picker";
import { Ionicons } from "@react-native-vector-icons/ionicons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Geolocation from 'react-native-geolocation-service';
import Toast from "react-native-toast-message";

interface Props {
  visible: boolean;
  onClose: () => void;
  onSubmit?: () => void; // Callback after successful submission
  editMode?: boolean; // Whether we're editing or creating
  initialData?: ProductFormData; // Initial data for edit mode
  listingId?: number; // ID of listing being edited
}

export interface ProductFormData {
  title: string;
  breed: string;
  description: string;
  age: string;
  color: string;
  weight: string;
  height: string;
  price: string;
  health_status: string;
  country: string;
  province: string;
  address: string;
  latitude: string;
  longitude: string;
  category_id: string;
  custom_button: string;
}

// Pakistani Provinces
const PAKISTANI_PROVINCES = [
  "Punjab",
  "Sindh",
  "Khyber Pakhtunkhwa",
  "Balochistan",
  "Gilgit-Baltistan",
  "Azad Kashmir",
  "Islamabad Capital Territory",
];

const CreateOrEditProductModal: React.FC<Props> = ({ 
  visible, 
  onClose, 
  onSubmit,
  editMode = false,
  initialData,
  listingId,
}) => {
  const [images, setImages] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [errors, setErrors] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [locationLoading, setLocationLoading] = useState<boolean>(false);

  const [form, setForm] = useState<ProductFormData>({
    title: "",
    breed: "",
    description: "",
    age: "",
    color: "",
    weight: "",
    height: "",
    price: "",
    health_status: "",
    country: "Pakistan",
    province: "",
    address: "",
    latitude: "",
    longitude: "",
    category_id: "",
    custom_button: "",
  });

  const updateField = (key: keyof ProductFormData, value: string) => {
    setErrors("");
    setForm({ ...form, [key]: value });
  };

  // Reset form
  const resetForm = () => {
    setForm({
      title: "",
      breed: "",
      description: "",
      age: "",
      color: "",
      weight: "",
      height: "",
      price: "",
      health_status: "",
      country: "Pakistan",
      province: "",
      address: "",
      latitude: "",
      longitude: "",
      category_id: "",
      custom_button: "",
    });
    setImages([]);
    setErrors("");
  };

  // Fetch Categories When Modal Opens
  useEffect(() => {
    if (visible) {
      fetchCategories();
      if (!editMode) {
        fetchLocation();
      }
    }
  }, [visible]);

  // Populate form with initial data in edit mode
  useEffect(() => {
    if (editMode && initialData) {
      setForm(initialData);
      // Clear images in edit mode - user won't be able to change them
      setImages([]);
    } else if (!editMode) {
      // Reset form when switching to create mode
      resetForm();
    }
  }, [editMode, initialData, visible]);

  const fetchCategories = async () => {
    try {
      const token = await AsyncStorage.getItem("authToken");

      const res = await axios.get("https://mandimore.com/v1/fetch_all_categories", {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      });
      setCategories(res.data.data);
    } catch (err) {
      console.log("Category Fetch Error:", err);
    }
  };

  // Request location permission (Android)
  const requestLocationPermission = async () => {
    if (Platform.OS === "android") {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          {
            title: "Location Permission",
            message: "This app needs access to your location to auto-fill address details.",
            buttonNeutral: "Ask Me Later",
            buttonNegative: "Cancel",
            buttonPositive: "OK",
          }
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      } catch (err) {
        console.warn(err);
        return false;
      }
    }
    return true; // iOS handles permissions automatically
  };

  // Fetch location using React Native Geolocation API
  const fetchLocation = async () => {
    setLocationLoading(true);

    // Request permission first (Android)
    const hasPermission = await requestLocationPermission();
    
    if (!hasPermission) {
      Toast.show({
        type: "error",
        text1: "Permission Denied",
        text2: "Location permission is required to auto-fill your location.",
        position: "top",
      });
      setLocationLoading(false);
      return;
    }

    Geolocation.getCurrentPosition(
      (position) => {
        setForm((prev) => ({
          ...prev,
          latitude: position.coords.latitude.toFixed(6),
          longitude: position.coords.longitude.toFixed(6),
        }));
        setLocationLoading(false);
        Toast.show({
          type: "success",
          text1: "Success",
          text2: "Location fetched successfully!",
          position: "top",
        });
      },
      (error) => {
        console.log("Location error:", error);
        setLocationLoading(false);
        Toast.show({
          type: "error",
          text1: "Location Error",
          text2: `Could not fetch location. Please enter manually.`,
          position: "top",
        });
      },
      { 
        enableHighAccuracy: true, 
        timeout: 20000, 
        maximumAge: 10000 
      }
    );
  };

  // Pick Multiple Images (only in create mode)
  const pickImages = async () => {
    const result: any = await launchImageLibrary({
      mediaType: "photo",
      quality: 0.8,
      selectionLimit: 5, // Allow up to 5 images
    });

    if (!result.didCancel && result.assets?.length > 0) {
      const newImages = result.assets.map((img: any) => ({
        uri: img.uri,
        type: img.type || "image/jpeg",
        name: img.fileName || `upload_${Date.now()}.jpg`,
      }));

      setImages([...images, ...newImages]);
    }
  };

  // Remove Image (only in create mode)
  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  // Basic Validations
  const validateForm = () => {
    if (!form.title.trim()) return "Title is required";
    if (!form.price.trim()) return "Price is required";
    if (!form.category_id) return "Please select a category";
    if (!form.province) return "Please select a province";
    
    // Images only required when creating (not editing)
    if (!editMode && images.length === 0) return "Please upload at least one image";

    return "";
  };

  // Submit to API
  const handleSubmit = async () => {
    const errorMsg = validateForm();
    if (errorMsg) {
      setErrors(errorMsg);
      Toast.show({
        type: "error",
        text1: "Validation Error",
        text2: errorMsg,
        position: "top",
      });
      return;
    }

    setIsLoading(true);

    try {
      const token = await AsyncStorage.getItem("authToken");
      console.log(token)

      let res;
      if (editMode && listingId) {
        // Update existing listing - Send as JSON (no images in edit mode)
        const jsonData = {
          title: form.title,
          breed: form.breed,
          description: form.description,
          age: form.age,
          color: form.color,
          weight: form.weight,
          height: form.height,
          price: form.price,
          health_status: form.health_status,
          country: form.country,
          province: form.province,
          address: form.address,
          latitude: form.latitude,
          longitude: form.longitude,
          category_id: Number(form.category_id),
          custom_button: form.custom_button,
          _method: "PUT", // Laravel method spoofing
        };
        
        res = await axios.put(
         
          `https://mandimore.com/v1/products/${listingId}`,
          jsonData,
          {
            headers: {
              "Content-Type": "application/json",
              "Accept": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );
      } else {
        // Create new listing - Send as FormData (with images)
        const data = new FormData();

        // Add fields
        Object.keys(form).forEach((key) => {
          if (key === "category_id") {
            data.append(key, Number(form[key as keyof ProductFormData]));
          } else {
            data.append(key, form[key as keyof ProductFormData]);
          }
        });

        // Add all images
        if (images.length > 0) {
          images.forEach((image) => {
            data.append("images[]", image);
          });
        }

        res = await axios.post("https://mandimore.com/v1/products", data, {
          headers: {
            "Content-Type": "multipart/form-data",
            "Accept": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
      }

      console.log(editMode ? "Product Updated:" : "Product Created:", res.data);
      
      Toast.show({
        type: "success",
        text1: "Success!",
        text2: editMode ? "Listing updated successfully!" : "Listing created successfully!",
        position: "top",
      });
      
      if (!editMode) {
        resetForm();
      }
      
      onClose();
      
      // Call onSubmit callback
      if (onSubmit) {
        onSubmit();
      }
    } catch (error: any) {
      console.log("Error:", error.response?.data || error.message);
      const errorMessage = error.response?.data?.message || "Something went wrong";
      setErrors(errorMessage);
      
      Toast.show({
        type: "error",
        text1: "Error",
        text2: errorMessage,
        position: "top",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.modalWrapper}>
        <View style={styles.modalBox}>
          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Header */}
            <View style={styles.headerContainer}>
              <Text style={styles.header}>{editMode ? "Edit Listing" : "Create Listing"}</Text>
              <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                <Ionicons name="close" size={28} color="#666" />
              </TouchableOpacity>
            </View>

            {errors ? <Text style={styles.error}>{errors}</Text> : null}

            {/* Image Upload Section - Only show in CREATE mode */}
            {!editMode && (
              <View style={styles.imageSection}>
                <Text style={styles.sectionTitle}>Product Images</Text>
                
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.imageScroll}>
                  {/* Existing Images */}
                  {images.map((img, index) => (
                    <View key={index} style={styles.imageItem}>
                      <Image source={{ uri: img.uri }} style={styles.uploadedImage} />
                      <TouchableOpacity
                        style={styles.removeImageButton}
                        onPress={() => removeImage(index)}
                      >
                        <Ionicons name="close-circle" size={24} color="#ff3b30" />
                      </TouchableOpacity>
                    </View>
                  ))}

                  {/* Add More Images Button */}
                  {images.length < 5 && (
                    <TouchableOpacity style={styles.addImageButton} onPress={pickImages}>
                      <Ionicons name="add-circle-outline" size={40} color="#f1641e" />
                      <Text style={styles.addImageText}>Add Image</Text>
                    </TouchableOpacity>
                  )}
                </ScrollView>
                
                <Text style={styles.imageHint}>
                  {images.length}/5 images • Tap + to add images
                </Text>
              </View>
            )}

            {/* Edit Mode Notice */}
            {editMode && (
              <View style={styles.editNotice}>
                <Ionicons name="information-circle" size={20} color="#f1641e" />
                <Text style={styles.editNoticeText}>
                  Editing listing details. Images cannot be changed.
                </Text>
              </View>
            )}

            {/* Basic Information */}
            <Text style={styles.sectionTitle}>Basic Information</Text>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Title *</Text>
              <TextInput
                placeholder="Enter product title"
                style={styles.input}
                value={form.title}
                onChangeText={(t) => updateField("title", t)}
                placeholderTextColor="#999"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Breed</Text>
              <TextInput
                placeholder="Enter breed"
                style={styles.input}
                value={form.breed}
                onChangeText={(t) => updateField("breed", t)}
                placeholderTextColor="#999"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Description</Text>
              <TextInput
                placeholder="Enter detailed description"
                style={[styles.input, styles.textArea]}
                value={form.description}
                onChangeText={(t) => updateField("description", t)}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
                placeholderTextColor="#999"
              />
            </View>

            {/* Category Horizontal Chips */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Category *</Text>
              <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false}
                style={styles.chipScroll}
              >
                {categories.map((cat) => (
                  <TouchableOpacity
                    key={cat.id}
                    style={[
                      styles.chip,
                      form.category_id == cat.id && styles.chipActive,
                    ]}
                    onPress={() => updateField("category_id", String(cat.id))}
                  >
                    <Text
                      style={
                        form.category_id == cat.id
                          ? styles.chipTextActive
                          : styles.chipText
                      }
                    >
                      {cat.name}
                    </Text>
                    {form.category_id == cat.id && (
                      <Ionicons name="checkmark-circle" size={18} color="#fff" style={{ marginLeft: 6 }} />
                    )}
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            {/* Details */}
            <Text style={styles.sectionTitle}>Details</Text>

            <View style={styles.row}>
              <View style={[styles.inputGroup, styles.halfWidth]}>
                <Text style={styles.inputLabel}>Age</Text>
                <TextInput
                  placeholder="e.g., 2 years"
                  style={styles.input}
                  value={form.age}
                  onChangeText={(t) => updateField("age", t)}
                  placeholderTextColor="#999"
                />
              </View>

              <View style={[styles.inputGroup, styles.halfWidth]}>
                <Text style={styles.inputLabel}>Color</Text>
                <TextInput
                  placeholder="e.g., Brown"
                  style={styles.input}
                  value={form.color}
                  onChangeText={(t) => updateField("color", t)}
                  placeholderTextColor="#999"
                />
              </View>
            </View>

            <View style={styles.row}>
              <View style={[styles.inputGroup, styles.halfWidth]}>
                <Text style={styles.inputLabel}>Weight</Text>
                <TextInput
                  placeholder="e.g., 25 kg"
                  style={styles.input}
                  value={form.weight}
                  onChangeText={(t) => updateField("weight", t)}
                  placeholderTextColor="#999"
                />
              </View>

              <View style={[styles.inputGroup, styles.halfWidth]}>
                <Text style={styles.inputLabel}>Height</Text>
                <TextInput
                  placeholder="e.g., 60 cm"
                  style={styles.input}
                  value={form.height}
                  onChangeText={(t) => updateField("height", t)}
                  placeholderTextColor="#999"
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Health Status</Text>
              <TextInput
                placeholder="e.g., Vaccinated, Healthy"
                style={styles.input}
                value={form.health_status}
                onChangeText={(t) => updateField("health_status", t)}
                placeholderTextColor="#999"
              />
            </View>

            {/* Pricing */}
            <Text style={styles.sectionTitle}>Pricing</Text>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Price *</Text>
              <View style={styles.priceInputContainer}>
                <Text style={styles.currencySymbol}>PKR</Text>
                <TextInput
                  placeholder="0"
                  style={styles.priceInput}
                  value={form.price}
                  onChangeText={(t) => updateField("price", t)}
                  keyboardType="numeric"
                  placeholderTextColor="#999"
                />
              </View>
            </View>

            {/* Location */}
            <View style={styles.locationHeader}>
              <Text style={styles.sectionTitle}>Location</Text>
              {locationLoading ? (
                <ActivityIndicator size="small" color="#f1641e" />
              ) : (
                <TouchableOpacity onPress={fetchLocation} style={styles.refreshLocation}>
                  <Ionicons name="location" size={18} color="#f1641e" />
                  <Text style={styles.refreshLocationText}>Refresh Location</Text>
                </TouchableOpacity>
              )}
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Country</Text>
              <TextInput
                style={[styles.input, styles.disabledInput]}
                value={form.country}
                editable={false}
                placeholderTextColor="#999"
              />
            </View>

            {/* Province Horizontal Chips */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Province *</Text>
              <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false}
                style={styles.chipScroll}
              >
                {PAKISTANI_PROVINCES.map((province) => (
                  <TouchableOpacity
                    key={province}
                    style={[
                      styles.chip,
                      form.province === province && styles.chipActive,
                    ]}
                    onPress={() => updateField("province", province)}
                  >
                    <Text
                      style={
                        form.province === province
                          ? styles.chipTextActive
                          : styles.chipText
                      }
                    >
                      {province}
                    </Text>
                    {form.province === province && (
                      <Ionicons name="checkmark-circle" size={18} color="#fff" style={{ marginLeft: 6 }} />
                    )}
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Address</Text>
              <TextInput
                placeholder="Enter street address"
                style={styles.input}
                value={form.address}
                onChangeText={(t) => updateField("address", t)}
                placeholderTextColor="#999"
              />
            </View>

            <View style={styles.row}>
              <View style={[styles.inputGroup, styles.halfWidth]}>
                <Text style={styles.inputLabel}>Latitude</Text>
                <TextInput
                  placeholder="Auto-filled"
                  style={styles.input}
                  value={form.latitude}
                  onChangeText={(t) => updateField("latitude", t)}
                  keyboardType="decimal-pad"
                  placeholderTextColor="#999"
                />
              </View>

              <View style={[styles.inputGroup, styles.halfWidth]}>
                <Text style={styles.inputLabel}>Longitude</Text>
                <TextInput
                  placeholder="Auto-filled"
                  style={styles.input}
                  value={form.longitude}
                  onChangeText={(t) => updateField("longitude", t)}
                  keyboardType="decimal-pad"
                  placeholderTextColor="#999"
                />
              </View>
            </View>

            {/* Optional Custom Button */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Custom Button URL (Optional)</Text>
              <TextInput
                placeholder="e.g., https://wa.me/1234567890"
                style={styles.input}
                value={form.custom_button}
                onChangeText={(t) => updateField("custom_button", t)}
                placeholderTextColor="#999"
                keyboardType="url"
                autoCapitalize="none"
              />
            </View>

            {/* Action Buttons */}
            <TouchableOpacity
              style={[styles.submitButton, isLoading && styles.submitButtonDisabled]}
              onPress={handleSubmit}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <>
                  <Ionicons name="checkmark-circle" size={22} color="#fff" />
                  <Text style={styles.submitButtonText}>
                    {editMode ? "Update Listing" : "Create Listing"}
                  </Text>
                </>
              )}
            </TouchableOpacity>

            <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>

            <View style={{ height: 20 }} />
          </ScrollView>
        </View>
      </View>
      
      {/* Toast Component */}
      <Toast />
    </Modal>
  );
};

export default CreateOrEditProductModal;

const styles = StyleSheet.create({
  modalWrapper: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "flex-end",
  },
  modalBox: {
    backgroundColor: "#fff",
    paddingHorizontal: 20,
    paddingTop: 20,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    maxHeight: "94%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 10,
  },
  headerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  header: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#1a1a1a",
  },
  closeButton: {
    padding: 4,
  },
  error: {
    backgroundColor: "#fee",
    padding: 12,
    borderRadius: 10,
    color: "#c00",
    textAlign: "center",
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: "#c00",
  },
  
  // Edit Mode Notice
  editNotice: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff5f0",
    padding: 12,
    borderRadius: 10,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: "#f1641e",
  },
  editNoticeText: {
    fontSize: 13,
    color: "#333",
    marginLeft: 8,
    flex: 1,
  },

  // Image Section
  imageSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1a1a1a",
    marginBottom: 12,
    marginTop: 8,
  },
  imageScroll: {
    marginBottom: 8,
  },
  imageItem: {
    position: "relative",
    marginRight: 12,
  },
  uploadedImage: {
    width: 120,
    height: 120,
    borderRadius: 12,
    backgroundColor: "#f5f5f5",
  },
  removeImageButton: {
    position: "absolute",
    top: -8,
    right: -8,
    backgroundColor: "#fff",
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  addImageButton: {
    width: 120,
    height: 120,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#f1641e",
    borderStyle: "dashed",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff9f6",
  },
  addImageText: {
    color: "#f1641e",
    fontWeight: "600",
    marginTop: 4,
    fontSize: 12,
  },
  imageHint: {
    fontSize: 12,
    color: "#666",
    marginTop: 4,
  },

  // Input Fields
  inputGroup: {
    marginBottom: 18,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
  },
  input: {
    backgroundColor: "#f9f9f9",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    color: "#1a1a1a",
    borderWidth: 1,
    borderColor: "#e5e5e5",
  },
  textArea: {
    minHeight: 100,
    paddingTop: 14,
  },
  disabledInput: {
    backgroundColor: "#f0f0f0",
    color: "#999",
  },

  // Horizontal Chips
  chipScroll: {
    marginBottom: 4,
  },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginRight: 10,
    borderWidth: 1.5,
    borderColor: "#e0e0e0",
  },
  chipActive: {
    backgroundColor: "#f1641e",
    borderColor: "#f1641e",
  },
  chipText: {
    fontSize: 14,
    color: "#333",
    fontWeight: "500",
  },
  chipTextActive: {
    fontSize: 14,
    color: "#fff",
    fontWeight: "600",
  },

  // Row Layout
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },
  halfWidth: {
    flex: 1,
  },

  // Price Input
  priceInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f9f9f9",
    borderRadius: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: "#e5e5e5",
  },
  currencySymbol: {
    fontSize: 16,
    fontWeight: "700",
    color: "#f1641e",
    marginRight: 8,
  },
  priceInput: {
    flex: 1,
    paddingVertical: 14,
    fontSize: 15,
    color: "#1a1a1a",
  },

  // Location
  locationHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
    marginTop: 8,
  },
  refreshLocation: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  refreshLocationText: {
    fontSize: 13,
    color: "#f1641e",
    fontWeight: "600",
  },

  // Buttons
  submitButton: {
    flexDirection: "row",
    backgroundColor: "#f1641e",
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 12,
    shadowColor: "#f1641e",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
    gap: 8,
  },
  submitButtonDisabled: {
    backgroundColor: "#ccc",
  },
  submitButtonText: {
    color: "#fff",
    fontSize: 17,
    fontWeight: "700",
  },
  cancelButton: {
    marginTop: 12,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: "#f5f5f5",
    borderWidth: 1,
    borderColor: "#e5e5e5",
  },
  cancelButtonText: {
    textAlign: "center",
    fontSize: 16,
    color: "#666",
    fontWeight: "600",
  },
});