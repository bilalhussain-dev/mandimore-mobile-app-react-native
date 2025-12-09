import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Modal,
  ActivityIndicator,
  Dimensions,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@react-native-vector-icons/ionicons';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Toast from 'react-native-toast-message';

interface Props {
  visible: boolean;
  onClose: () => void;
  productId: number;
}

const REPORT_REASONS = [
  { id: 1, label: 'Spam', value: 'spam', icon: 'mail-outline' },
  { id: 2, label: 'Copyright', value: 'copyright', icon: 'shield-outline' },
  { id: 3, label: 'Fraud', value: 'fraud', icon: 'warning-outline' },
  { id: 4, label: 'Inappropriate', value: 'inappropriate_content', icon: 'eye-off-outline' },
  { id: 5, label: 'Misinformation', value: 'misinformation', icon: 'information-circle-outline' },
  { id: 6, label: 'Other', value: 'other', icon: 'ellipsis-horizontal-outline' },
];

const { height } = Dimensions.get('window');

const ReportProductModal: React.FC<Props> = ({ visible, onClose, productId }) => {
  const [selectedReason, setSelectedReason] = useState<string>('');
  const [note, setNote] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const handleSubmit = async () => {
    if (!selectedReason) {
      Toast.show({
        type: 'error',
        text1: 'Required',
        text2: 'Please select a reason for reporting',
        position: 'top',
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const token = await AsyncStorage.getItem('authToken');

      if (!token) {
        Toast.show({
          type: 'error',
          text1: 'Login Required',
          text2: 'Please login to report this product',
          position: 'top',
        });
        setIsSubmitting(false);
        return;
      }

      const response = await axios.post(
        `https://mandimore.com/v1/products/${productId}/reports`,
        {
          reason: selectedReason,
          note: note.trim(),
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: 'application/json',
            'Content-Type': 'application/json',
          },
        }
      );

      console.log('Report submitted:', response.data);

      Toast.show({
        type: 'success',
        text1: 'Product Reported Successfully',
        text2: 'Thank you! We will review your report shortly.',
        position: 'top',
        visibilityTime: 3000,
        topOffset: 50,
      });

      // Reset form
      setSelectedReason('');
      setNote('');
      onClose();
    } catch (error: any) {
      console.error('Error submitting report:', error.response?.data || error.message);
      
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: error.response?.data?.message || 'Failed to submit report. Please try again.',
        position: 'top',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setSelectedReason('');
    setNote('');
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={handleClose}
    >
      <View style={styles.modalWrapper}>
        <TouchableOpacity 
          style={styles.backdrop} 
          activeOpacity={1} 
          onPress={handleClose}
        />
        
        <View style={styles.modalBox}>
          {/* Modern Header */}
          <View style={styles.header}>
            <View style={styles.dragIndicator} />
            <View style={styles.headerContent}>
              <View style={styles.iconCircle}>
                <Ionicons name="flag" size={24} color="#f1641e" />
              </View>
              <Text style={styles.headerTitle}>Report Product</Text>
              <Text style={styles.subtitle}>Help us maintain quality standards</Text>
            </View>
            <TouchableOpacity onPress={handleClose} style={styles.closeBtn}>
              <Ionicons name="close" size={24} color="#999" />
            </TouchableOpacity>
          </View>

          {/* Scrollable Content */}
          <ScrollView 
            style={styles.scrollArea}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {/* Modern Grid Layout for Options */}
            <View style={styles.optionsGrid}>
              {REPORT_REASONS.map((reason) => {
                const isSelected = selectedReason === reason.value;
                return (
                  <TouchableOpacity
                    key={reason.id}
                    style={[styles.gridOption, isSelected && styles.gridOptionSelected]}
                    onPress={() => setSelectedReason(reason.value)}
                    activeOpacity={0.7}
                  >
                    <View style={[styles.optionIconBox, isSelected && styles.optionIconBoxSelected]}>
                      <Ionicons 
                        name={reason.icon as any} 
                        size={20} 
                        color={isSelected ? '#f1641e' : '#666'} 
                      />
                    </View>
                    <Text style={[styles.gridOptionText, isSelected && styles.gridOptionTextSelected]}>
                      {reason.label}
                    </Text>
                    {isSelected && (
                      <View style={styles.checkBadge}>
                        <Ionicons name="checkmark" size={14} color="#fff" />
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Modern Text Area */}
            <View style={styles.textAreaSection}>
              <Text style={styles.textAreaLabel}>
                Additional Details <Text style={styles.optional}>(Optional)</Text>
              </Text>
              <View style={styles.textAreaWrapper}>
                <TextInput
                  style={styles.textArea}
                  placeholder="Tell us more about why you're reporting this product..."
                  placeholderTextColor="#aaa"
                  value={note}
                  onChangeText={setNote}
                  multiline
                  numberOfLines={3}
                  textAlignVertical="top"
                  maxLength={500}
                />
              </View>
              <Text style={styles.charCounter}>{note.length} / 500</Text>
            </View>

            {/* Modern Info Card */}
            <View style={styles.infoCard}>
              <View style={styles.infoIconBox}>
                <Ionicons name="shield-checkmark" size={18} color="#f1641e" />
              </View>
              <Text style={styles.infoText}>
                Your report will be reviewed within 24 hours. False reports may affect your account status.
              </Text>
            </View>

            <View style={{ height: 20 }} />
          </ScrollView>

          {/* Modern Buttons */}
          <View style={styles.footer}>
            <TouchableOpacity
              style={[styles.submitBtn, isSubmitting && styles.submitBtnDisabled]}
              onPress={handleSubmit}
              disabled={isSubmitting}
              activeOpacity={0.9}
            >
              {isSubmitting ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <>
                  <Ionicons name="send" size={20} color="#fff" />
                  <Text style={styles.submitBtnText}>Submit Report</Text>
                </>
              )}
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.cancelBtn} 
              onPress={handleClose}
              disabled={isSubmitting}
              activeOpacity={0.9}
            >
              <Text style={styles.cancelBtnText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <Toast />
    </Modal>
  );
};

export default ReportProductModal;

const styles = StyleSheet.create({
  modalWrapper: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  backdrop: {
    flex: 1,
  },
  modalBox: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    height: height * 0.85,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 20,
  },
  
  // Modern Header
  header: {
    paddingTop: 8,
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    position: 'relative',
  },
  dragIndicator: {
    width: 36,
    height: 4,
    backgroundColor: '#e0e0e0',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 16,
  },
  headerContent: {
    alignItems: 'center',
  },
  iconCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#fff5f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 13,
    color: '#777',
    textAlign: 'center',
  },
  closeBtn: {
    position: 'absolute',
    top: 12,
    right: 20,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Scrollable Area
  scrollArea: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },

  // Modern Grid Layout
  optionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  gridOption: {
    width: '48%',
    backgroundColor: '#f8f8f8',
    borderRadius: 14,
    padding: 12,
    marginBottom: 10,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#f8f8f8',
    position: 'relative',
  },
  gridOptionSelected: {
    backgroundColor: '#fff5f0',
    borderColor: '#f1641e',
  },
  optionIconBox: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  optionIconBoxSelected: {
    backgroundColor: '#ffe8db',
  },
  gridOptionText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#555',
    textAlign: 'center',
  },
  gridOptionTextSelected: {
    color: '#f1641e',
    fontWeight: '700',
  },
  checkBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#f1641e',
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Modern Text Area
  textAreaSection: {
    marginBottom: 16,
  },
  textAreaLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  optional: {
    fontSize: 13,
    color: '#999',
    fontWeight: '400',
  },
  textAreaWrapper: {
    backgroundColor: '#f8f8f8',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e5e5e5',
    overflow: 'hidden',
  },
  textArea: {
    padding: 14,
    fontSize: 14,
    color: '#1a1a1a',
    minHeight: 85,
    maxHeight: 100,
  },
  charCounter: {
    fontSize: 12,
    color: '#999',
    textAlign: 'right',
    marginTop: 8,
  },

  // Modern Info Card
  infoCard: {
    flexDirection: 'row',
    backgroundColor: '#f0f7ff',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#d4e7ff',
  },
  infoIconBox: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  infoText: {
    flex: 1,
    fontSize: 12,
    color: '#555',
    lineHeight: 18,
  },

  // Modern Buttons
  footer: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 24,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    backgroundColor: '#fff',
  },
  submitBtn: {
    flexDirection: 'row',
    backgroundColor: '#f1641e',
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    shadowColor: '#f1641e',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  submitBtnDisabled: {
    backgroundColor: '#ccc',
    shadowOpacity: 0,
  },
  submitBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
    marginLeft: 8,
  },
  cancelBtn: {
    paddingVertical: 14,
    borderRadius: 16,
    backgroundColor: '#f5f5f5',
  },
  cancelBtnText: {
    textAlign: 'center',
    fontSize: 15,
    color: '#666',
    fontWeight: '600',
  },
});