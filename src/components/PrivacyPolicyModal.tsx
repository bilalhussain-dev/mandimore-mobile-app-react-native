import React from "react";
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from "react-native";
import { Ionicons } from "@react-native-vector-icons/ionicons";

interface PrivacyPolicyModalProps {
  visible: boolean;
  onClose: () => void;
}

const PrivacyPolicyModal: React.FC<PrivacyPolicyModalProps> = ({
  visible,
  onClose,
}) => {
  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerContent}>
              <Ionicons name="shield-checkmark" size={24} color="#f1641e" />
              <Text style={styles.headerTitle}>Privacy Policy</Text>
            </View>
            <TouchableOpacity
              onPress={onClose}
              style={styles.closeButton}
              activeOpacity={0.7}
            >
              <Ionicons name="close" size={28} color="#666" />
            </TouchableOpacity>
          </View>

          {/* Content */}
          <ScrollView
            style={styles.content}
            showsVerticalScrollIndicator={false}
          >
            {/* Children's Privacy Section */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Ionicons name="people" size={20} color="#f1641e" />
                <Text style={styles.sectionTitle}>Children's Privacy</Text>
              </View>
              <Text style={styles.paragraph}>
                If you are a parent or guardian and believe your child has
                provided personal information to our platform, please contact us
                immediately at{" "}
                <Text style={styles.emailLink}>privacy@mandimore.com</Text>. We
                will promptly investigate and remove any such information from
                our systems.
              </Text>
            </View>

            {/* Policy Updates Section */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Ionicons name="refresh" size={20} color="#f1641e" />
                <Text style={styles.sectionTitle}>
                  Policy Updates & Changes
                </Text>
              </View>
              <Text style={styles.paragraph}>
                We may update this Privacy Policy periodically to reflect
                changes in our practices, legal requirements, or platform
                features.
              </Text>

              <View style={styles.subsection}>
                <Text style={styles.subsectionTitle}>Notification Process</Text>
                <View style={styles.bulletList}>
                  <View style={styles.bulletItem}>
                    <View style={styles.bulletDot} />
                    <Text style={styles.bulletText}>
                      Email notification to registered users
                    </Text>
                  </View>
                  <View style={styles.bulletItem}>
                    <View style={styles.bulletDot} />
                    <Text style={styles.bulletText}>
                      Prominent notice on platform homepage
                    </Text>
                  </View>
                  <View style={styles.bulletItem}>
                    <View style={styles.bulletDot} />
                    <Text style={styles.bulletText}>
                      Updated effective date clearly displayed
                    </Text>
                  </View>
                </View>
              </View>

              <View style={styles.subsection}>
                <Text style={styles.subsectionTitle}>User Actions</Text>
                <View style={styles.bulletList}>
                  <View style={styles.bulletItem}>
                    <View style={styles.bulletDot} />
                    <Text style={styles.bulletText}>
                      Review changes when notified
                    </Text>
                  </View>
                  <View style={styles.bulletItem}>
                    <View style={styles.bulletDot} />
                    <Text style={styles.bulletText}>
                      Contact us with questions or concerns
                    </Text>
                  </View>
                  <View style={styles.bulletItem}>
                    <View style={styles.bulletDot} />
                    <Text style={styles.bulletText}>
                      Close account if you disagree with changes
                    </Text>
                  </View>
                </View>
              </View>

              <View style={styles.highlightBox}>
                <Ionicons name="information-circle" size={18} color="#f1641e" />
                <Text style={styles.highlightText}>
                  <Text style={styles.highlightBold}>Continued Use: </Text>
                  Your continued use of our platform after policy updates
                  constitutes acceptance of the revised terms. Material changes
                  will be highlighted and may require explicit consent.
                </Text>
              </View>
            </View>

            {/* Contact Section */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Ionicons name="mail" size={20} color="#f1641e" />
                <Text style={styles.sectionTitle}>Contact Us</Text>
              </View>
              <Text style={styles.paragraph}>
                For questions about this Privacy Policy, data protection
                concerns, content removal requests, or DMCA takedown notices,
                please contact us using the information below:
              </Text>

              <View style={styles.contactCard}>
                <Text style={styles.contactTitle}>General Privacy Inquiries</Text>
                <View style={styles.contactDetail}>
                  <Ionicons name="mail-outline" size={16} color="#666" />
                  <Text style={styles.contactText}>
                    Email:{" "}
                    <Text style={styles.emailLink}>privacy@mandimore.com</Text>
                  </Text>
                </View>
                <View style={styles.contactDetail}>
                  <Ionicons name="time-outline" size={16} color="#666" />
                  <Text style={styles.contactText}>
                    Response Time: Within 48 hours
                  </Text>
                </View>
              </View>

              <View style={styles.contactCard}>
                <Text style={styles.contactTitle}>Content Reports & DMCA</Text>
                <View style={styles.contactDetail}>
                  <Ionicons name="mail-outline" size={16} color="#666" />
                  <Text style={styles.contactText}>
                    Email:{" "}
                    <Text style={styles.emailLink}>report@mandimore.com</Text>
                  </Text>
                </View>
                <View style={styles.contactDetail}>
                  <Ionicons name="time-outline" size={16} color="#666" />
                  <Text style={styles.contactText}>
                    Response Time: Within 24 hours
                  </Text>
                </View>
              </View>

              <View style={styles.subsection}>
                <Text style={styles.subsectionTitle}>
                  What to Include in Your Contact
                </Text>
                <View style={styles.bulletList}>
                  <View style={styles.bulletItem}>
                    <View style={styles.bulletDot} />
                    <Text style={styles.bulletText}>
                      Clear description of your inquiry or concern
                    </Text>
                  </View>
                  <View style={styles.bulletItem}>
                    <View style={styles.bulletDot} />
                    <Text style={styles.bulletText}>
                      Your account information (if applicable)
                    </Text>
                  </View>
                  <View style={styles.bulletItem}>
                    <View style={styles.bulletDot} />
                    <Text style={styles.bulletText}>
                      Specific content URLs or references (for reports)
                    </Text>
                  </View>
                  <View style={styles.bulletItem}>
                    <View style={styles.bulletDot} />
                    <Text style={styles.bulletText}>
                      Preferred contact method for our response
                    </Text>
                  </View>
                </View>
              </View>

              <View style={styles.urgentBox}>
                <View style={styles.urgentHeader}>
                  <Ionicons name="warning" size={20} color="#ff6b6b" />
                  <Text style={styles.urgentTitle}>
                    Emergency Content Removal
                  </Text>
                </View>
                <Text style={styles.urgentText}>
                  For urgent content removal requests involving copyright
                  infringement, safety concerns, or inappropriate material, use{" "}
                  <Text style={styles.emailLink}>report@mandimore.com</Text>{" "}
                  with "URGENT" in the subject line. We prioritize these
                  requests and aim to respond within 24 hours.
                </Text>
              </View>
            </View>

            {/* Bottom spacing */}
            <View style={{ height: 40 }} />
          </ScrollView>

          {/* Footer Button */}
          <View style={styles.footer}>
            <TouchableOpacity
              onPress={onClose}
              style={styles.acceptButton}
              activeOpacity={0.8}
            >
              <Text style={styles.acceptButtonText}>I Understand</Text>
              <Ionicons name="checkmark-circle" size={20} color="#fff" />
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
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContainer: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    height: "90%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 10,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1a1a1a",
    marginLeft: 12,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#f8f8f8",
    alignItems: "center",
    justifyContent: "center",
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },
  section: {
    marginTop: 24,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1a1a1a",
    marginLeft: 8,
  },
  paragraph: {
    fontSize: 15,
    lineHeight: 24,
    color: "#4a4a4a",
  },
  subsection: {
    marginTop: 16,
  },
  subsectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1a1a1a",
    marginBottom: 8,
  },
  bulletList: {
    marginTop: 8,
  },
  bulletItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  bulletDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#f1641e",
    marginTop: 8,
    marginRight: 12,
  },
  bulletText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 22,
    color: "#4a4a4a",
  },
  highlightBox: {
    flexDirection: "row",
    backgroundColor: "#fff5f0",
    borderLeftWidth: 3,
    borderLeftColor: "#f1641e",
    padding: 16,
    borderRadius: 8,
    marginTop: 16,
  },
  highlightText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 22,
    color: "#4a4a4a",
    marginLeft: 12,
  },
  highlightBold: {
    fontWeight: "700",
    color: "#1a1a1a",
  },
  contactCard: {
    backgroundColor: "#f8f9fa",
    borderRadius: 12,
    padding: 16,
    marginTop: 12,
    borderWidth: 1,
    borderColor: "#e8e8e8",
  },
  contactTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#1a1a1a",
    marginBottom: 8,
  },
  contactDetail: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 6,
  },
  contactText: {
    fontSize: 14,
    color: "#4a4a4a",
    marginLeft: 8,
  },
  emailLink: {
    color: "#f1641e",
    fontWeight: "600",
  },
  urgentBox: {
    backgroundColor: "#fff5f5",
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
    borderWidth: 1,
    borderColor: "#ffe0e0",
  },
  urgentHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  urgentTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#ff6b6b",
    marginLeft: 8,
  },
  urgentText: {
    fontSize: 14,
    lineHeight: 22,
    color: "#4a4a4a",
  },
  footer: {
    padding: 24,
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
  },
  acceptButton: {
    backgroundColor: "#f1641e",
    borderRadius: 12,
    height: 56,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#f1641e",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  acceptButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
    marginRight: 8,
  },
});

export default PrivacyPolicyModal;