// EditProfileModal.tsx - Complete with Toast
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Image,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@react-native-vector-icons/ionicons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { launchImageLibrary } from 'react-native-image-picker';
import Toast from 'react-native-toast-message';

const PRIMARY_COLOR = '#f1641e';

interface EditProfileModalProps {
  visible: boolean;
  onClose: () => void;
  profileData: any;
  onUpdateSuccess: () => void;
}

const EditProfileModal: React.FC<EditProfileModalProps> = ({
  visible,
  onClose,
  profileData,
  onUpdateSuccess,
}) => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [username, setUsername] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [avatarUri, setAvatarUri] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<any>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (profileData) {
      setFirstName(profileData.first_name || '');
      setLastName(profileData.last_name || '');
      setUsername(profileData.username || '');
      setMobileNumber(profileData.mobile_number || '');
      setWhatsappNumber(profileData.whatsapp_number || '');
      setAvatarUri(profileData.avatar || profileData.user_avatar_url || null);
    }
  }, [profileData]);

  const handlePickImage = () => {
    launchImageLibrary(
      {
        mediaType: 'photo',
        maxWidth: 1000,
        maxHeight: 1000,
        quality: 0.8,
      },
      (response) => {
        if (response.didCancel) {
          return;
        }
        if (response.errorCode) {
          Toast.show({
            type: 'error',
            text1: 'Error',
            text2: 'Failed to pick image',
            position: 'top',
          });
          return;
        }
        if (response.assets && response.assets[0]) {
          const asset = response.assets[0];
          setAvatarUri(asset.uri || null);
          setAvatarFile({
            uri: asset.uri,
            type: asset.type || 'image/jpeg',
            name: asset.fileName || `avatar_${Date.now()}.jpg`,
          });
        }
      }
    );
  };

  const handleSave = async () => {
    // Validation
    if (!firstName.trim()) {
      Toast.show({
        type: 'error',
        text1: 'Validation Error',
        text2: 'First name is required',
        position: 'top',
      });
      return;
    }
    if (!lastName.trim()) {
      Toast.show({
        type: 'error',
        text1: 'Validation Error',
        text2: 'Last name is required',
        position: 'top',
      });
      return;
    }
    if (!username.trim()) {
      Toast.show({
        type: 'error',
        text1: 'Validation Error',
        text2: 'Username is required',
        position: 'top',
      });
      return;
    }
    if (!mobileNumber.trim()) {
      Toast.show({
        type: 'error',
        text1: 'Validation Error',
        text2: 'Mobile number is required',
        position: 'top',
      });
      return;
    }

    try {
      setSaving(true);
      const token = await AsyncStorage.getItem('authToken');

      // Create FormData for photo upload
      const formData = new FormData();
      
      // Add user fields
      formData.append('user[first_name]', firstName.trim());
      formData.append('user[last_name]', lastName.trim());
      formData.append('user[username]', username.trim());
      formData.append('user[mobile_number]', mobileNumber.trim());
      formData.append('user[whatsapp_number]', whatsappNumber.trim() || mobileNumber.trim());

      // Add avatar if changed
      if (avatarFile) {
        formData.append('user[avatar]', {
          uri: avatarFile.uri,
          type: avatarFile.type,
          name: avatarFile.name,
        } as any);
      }

      console.log('Updating profile with FormData...');

      const response = await axios.put(
        'https://mandimore.com/v1/update_user',
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      console.log('Update response:', response.data);

      // Update local storage
      const currentUser = await AsyncStorage.getItem('current_user');
      if (currentUser) {
        const userData = JSON.parse(currentUser);
        const updatedUser = {
          ...userData,
          first_name: firstName.trim(),
          last_name: lastName.trim(),
          username: username.trim(),
          mobile_number: mobileNumber.trim(),
          whatsapp_number: whatsappNumber.trim() || mobileNumber.trim(),
          avatar: response.data.data?.avatar || userData.avatar,
        };
        await AsyncStorage.setItem('current_user', JSON.stringify(updatedUser));
        
        // Trigger global update event
        await AsyncStorage.setItem('profile_updated', Date.now().toString());
      }

      Toast.show({
        type: 'success',
        text1: 'Success! 🎉',
        text2: 'Profile updated successfully',
        position: 'top',
      });

      onUpdateSuccess();
      onClose();
    } catch (error: any) {
      console.error('Error updating profile:', error.response?.data || error.message || error);
      Toast.show({
        type: 'error',
        text1: 'Update Failed',
        text2: error.response?.data?.message || error.response?.data?.error || 'Failed to update profile',
        position: 'top',
      });
    } finally {
      setSaving(false);
    }
  };

  const copyMobileToWhatsApp = () => {
    setWhatsappNumber(mobileNumber);
    Toast.show({
      type: 'info',
      text1: 'Copied! 📋',
      text2: 'Mobile number copied to WhatsApp',
      position: 'bottom',
      visibilityTime: 2000,
    });
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        {/* Empty space that closes modal when tapped */}
        <TouchableOpacity 
          style={styles.topSpace}
          activeOpacity={1}
          onPress={onClose}
        />
        
        <View style={styles.modalContainer}>
          {/* Drag Handle */}
          <View style={styles.dragHandle} />

          {/* Header */}
          <View style={styles.modalHeader}>
            <View style={styles.headerLeft}>
              <View style={styles.iconCircle}>
                <Ionicons name="person" size={20} color={PRIMARY_COLOR} />
              </View>
              <Text style={styles.modalTitle}>Edit Profile</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>

          <ScrollView 
            style={styles.modalContent}
            showsVerticalScrollIndicator={false}
          >
            {/* Avatar Section */}
            <TouchableOpacity 
              style={styles.avatarSection}
              onPress={handlePickImage}
              activeOpacity={0.7}
            >
              <View style={styles.avatarWrapper}>
                <Image
                  source={{
                    uri:
                      avatarUri ||
                      'https://cdn-icons-png.flaticon.com/512/149/149071.png',
                  }}
                  style={styles.avatarImage}
                />
                <View style={styles.avatarBadge}>
                  <Ionicons name="camera" size={20} color="#fff" />
                </View>
              </View>
              <Text style={styles.avatarHint}>Tap to change photo</Text>
            </TouchableOpacity>

            {/* Form Fields */}
            <View style={styles.formSection}>
              {/* First Name */}
              <View style={styles.inputContainer}>
                <View style={styles.inputLabel}>
                  <Ionicons name="person-outline" size={18} color={PRIMARY_COLOR} />
                  <Text style={styles.labelText}>First Name</Text>
                </View>
                <TextInput
                  style={styles.input}
                  value={firstName}
                  onChangeText={setFirstName}
                  placeholder="Enter first name"
                  placeholderTextColor="#999"
                />
              </View>

              {/* Last Name */}
              <View style={styles.inputContainer}>
                <View style={styles.inputLabel}>
                  <Ionicons name="person-outline" size={18} color={PRIMARY_COLOR} />
                  <Text style={styles.labelText}>Last Name</Text>
                </View>
                <TextInput
                  style={styles.input}
                  value={lastName}
                  onChangeText={setLastName}
                  placeholder="Enter last name"
                  placeholderTextColor="#999"
                />
              </View>

              {/* Username */}
              <View style={styles.inputContainer}>
                <View style={styles.inputLabel}>
                  <Ionicons name="at" size={18} color={PRIMARY_COLOR} />
                  <Text style={styles.labelText}>Username</Text>
                </View>
                <TextInput
                  style={styles.input}
                  value={username}
                  onChangeText={setUsername}
                  placeholder="Enter username"
                  placeholderTextColor="#999"
                  autoCapitalize="none"
                />
              </View>

              {/* Mobile Number */}
              <View style={styles.inputContainer}>
                <View style={styles.inputLabel}>
                  <Ionicons name="call-outline" size={18} color={PRIMARY_COLOR} />
                  <Text style={styles.labelText}>Mobile Number</Text>
                </View>
                <TextInput
                  style={styles.input}
                  value={mobileNumber}
                  onChangeText={setMobileNumber}
                  placeholder="+92 300 1234567"
                  placeholderTextColor="#999"
                  keyboardType="phone-pad"
                />
              </View>

              {/* WhatsApp Number */}
              <View style={styles.inputContainer}>
                <View style={styles.inputLabel}>
                  <Ionicons name="logo-whatsapp" size={18} color="#25D366" />
                  <Text style={styles.labelText}>WhatsApp Number</Text>
                  <TouchableOpacity
                    onPress={copyMobileToWhatsApp}
                    style={styles.copyBtn}
                  >
                    <Ionicons name="copy-outline" size={14} color={PRIMARY_COLOR} />
                    <Text style={styles.copyText}>Copy</Text>
                  </TouchableOpacity>
                </View>
                <TextInput
                  style={styles.input}
                  value={whatsappNumber}
                  onChangeText={setWhatsappNumber}
                  placeholder="+92 300 1234567"
                  placeholderTextColor="#999"
                  keyboardType="phone-pad"
                />
              </View>
            </View>

            {/* Info Note */}
            <View style={styles.infoNote}>
              <Ionicons name="information-circle-outline" size={18} color="#666" />
              <Text style={styles.infoText}>
                Your mobile and WhatsApp numbers will be visible to buyers
              </Text>
            </View>
          </ScrollView>

          {/* Footer Buttons */}
          <View style={styles.modalFooter}>
            <TouchableOpacity
              style={styles.cancelBtn}
              onPress={onClose}
              disabled={saving}
            >
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.saveBtn, saving && styles.saveBtnDisabled]}
              onPress={handleSave}
              disabled={saving}
            >
              {saving ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <>
                  <Ionicons name="checkmark" size={20} color="#fff" />
                  <Text style={styles.saveText}>Save</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  topSpace: {
    flex: 1,
  },
  modalContainer: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    height: '65%',
    paddingBottom: 20,
  },
  dragHandle: {
    width: 40,
    height: 5,
    backgroundColor: '#e0e0e0',
    borderRadius: 3,
    alignSelf: 'center',
    marginTop: 12,
    marginBottom: 8,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#fff5f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1a1a1a',
  },
  closeBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    flex: 1,
    paddingHorizontal: 20,
  },
  avatarSection: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  avatarWrapper: {
    position: 'relative',
  },
  avatarImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#f0f0f0',
    borderWidth: 4,
    borderColor: '#fff5f0',
  },
  avatarBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: PRIMARY_COLOR,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#fff',
  },
  avatarHint: {
    marginTop: 12,
    fontSize: 13,
    color: '#999',
    fontWeight: '500',
  },
  formSection: {
    marginTop: 8,
  },
  inputContainer: {
    marginBottom: 18,
  },
  inputLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  labelText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginLeft: 8,
    flex: 1,
  },
  copyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff5f0',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  copyText: {
    fontSize: 12,
    color: PRIMARY_COLOR,
    fontWeight: '600',
    marginLeft: 4,
  },
  input: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 15,
    color: '#333',
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  infoNote: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 12,
    marginTop: 8,
    marginBottom: 20,
  },
  infoText: {
    flex: 1,
    fontSize: 12,
    color: '#666',
    marginLeft: 10,
    lineHeight: 16,
  },
  modalFooter: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingTop: 16,
    gap: 12,
  },
  cancelBtn: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  cancelText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  saveBtn: {
    flex: 1,
    backgroundColor: PRIMARY_COLOR,
    paddingVertical: 14,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveBtnDisabled: {
    opacity: 0.6,
  },
  saveText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginLeft: 6,
  },
});

export default EditProfileModal;