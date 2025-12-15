import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Ionicons } from "@react-native-vector-icons/ionicons";
import { RootStackParamList } from "../../App";
import PrivacyPolicyModal from "../components/PrivacyPolicyModal";
type SignupScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, "Signup">;

const SignupScreen = () => {
  const navigation = useNavigation<SignupScreenNavigationProp>();
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    username: "",
    email: "",
    password: "",
    password_confirmation: "",
    mobile_number: "",
    whatsapp_number: "",
  });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [sameAsPhone, setSameAsPhone] = useState(true);
  const [showPrivacyPolicy, setShowPrivacyPolicy] = useState(false);

  const updateField = (field: string, value: string) => {
    setFormData((prev) => {
      const updated = { ...prev, [field]: value };
      
      // Auto-sync WhatsApp with mobile if checkbox is checked
      if (field === "mobile_number" && sameAsPhone) {
        updated.whatsapp_number = value;
      }
      
      return updated;
    });
  };

  const validateForm = () => {
    const { first_name, last_name, username, email, password, password_confirmation, mobile_number } = formData;

    if (!first_name.trim() || !last_name.trim()) {
      Alert.alert("Error", "Please enter your first and last name");
      return false;
    }

    if (!username.trim() || username.length < 3) {
      Alert.alert("Error", "Username must be at least 3 characters");
      return false;
    }

    if (!email.trim() || !email.includes("@")) {
      Alert.alert("Error", "Please enter a valid email address");
      return false;
    }

    if (!password || password.length < 6) {
      Alert.alert("Error", "Password must be at least 6 characters");
      return false;
    }

    if (password !== password_confirmation) {
      Alert.alert("Error", "Passwords do not match");
      return false;
    }

    if (!mobile_number.trim()) {
      Alert.alert("Error", "Please enter your mobile number");
      return false;
    }

    return true;
  };

  const handleSignup = async () => {
    if (!validateForm()) return;

    try {
      setLoading(true);
      const response = await fetch("https://mandimore.com/v1/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      
      const data = await response.json();
      
      if (response.ok && data.code === 200) {
        Alert.alert(
          "Success! 🎉",
          "Your account has been created successfully! A confirmation email has been sent to your email address. Please verify your email and login.",
          [
            {
              text: "OK",
              onPress: () => navigation.navigate("Login"),
            },
          ]
        );
      } else {
        Alert.alert("Signup Failed", data.message || "Something went wrong");
      }
    } catch (error) {
      console.error("Signup error:", error);
      Alert.alert("Error", "Unable to create account. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Header Section */}
        <View style={styles.header}>
          <View style={styles.iconContainer}>
            <Ionicons name="paw" size={40} color="#f1641e" />
          </View>
          <Text style={styles.title}>Join Mandimore</Text>
          <Text style={styles.subtitle}>Create your account to get started</Text>
        </View>

        {/* Form Section */}
        <View style={styles.formContainer}>
          {/* Name Row */}
          <View style={styles.nameRow}>
            <View style={[styles.inputContainer, styles.halfWidth]}>
              <Text style={styles.label}>First Name</Text>
              <View style={styles.inputWrapper}>
                <Ionicons
                  name="person-outline"
                  size={20}
                  color="#999"
                  style={styles.inputIcon}
                />
                <TextInput
                  value={formData.first_name}
                  onChangeText={(value) => updateField("first_name", value)}
                  placeholder="John"
                  placeholderTextColor="#999"
                  autoCapitalize="words"
                  style={styles.input}
                />
              </View>
            </View>

            <View style={[styles.inputContainer, styles.halfWidth]}>
              <Text style={styles.label}>Last Name</Text>
              <View style={styles.inputWrapper}>
                <Ionicons
                  name="person-outline"
                  size={20}
                  color="#999"
                  style={styles.inputIcon}
                />
                <TextInput
                  value={formData.last_name}
                  onChangeText={(value) => updateField("last_name", value)}
                  placeholder="Doe"
                  placeholderTextColor="#999"
                  autoCapitalize="words"
                  style={styles.input}
                />
              </View>
            </View>
          </View>

          {/* Username Input */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Username</Text>
            <View style={styles.inputWrapper}>
              <Ionicons
                name="at-outline"
                size={20}
                color="#999"
                style={styles.inputIcon}
              />
              <TextInput
                value={formData.username}
                onChangeText={(value) => updateField("username", value)}
                placeholder="johndoe123"
                placeholderTextColor="#999"
                autoCapitalize="none"
                style={styles.input}
              />
            </View>
          </View>

          {/* Email Input */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Email Address</Text>
            <View style={styles.inputWrapper}>
              <Ionicons
                name="mail-outline"
                size={20}
                color="#999"
                style={styles.inputIcon}
              />
              <TextInput
                value={formData.email}
                onChangeText={(value) => updateField("email", value)}
                placeholder="your.email@example.com"
                placeholderTextColor="#999"
                autoCapitalize="none"
                keyboardType="email-address"
                style={styles.input}
              />
            </View>
          </View>

          {/* Mobile Number Input */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Mobile Number</Text>
            <View style={styles.inputWrapper}>
              <Ionicons
                name="call-outline"
                size={20}
                color="#999"
                style={styles.inputIcon}
              />
              <TextInput
                value={formData.mobile_number}
                onChangeText={(value) => updateField("mobile_number", value)}
                placeholder="+923001234567"
                placeholderTextColor="#999"
                keyboardType="phone-pad"
                style={styles.input}
              />
            </View>
          </View>

          {/* WhatsApp Number with Checkbox */}
          <View style={styles.inputContainer}>
            <View style={styles.labelRow}>
              <Text style={styles.label}>WhatsApp Number</Text>
              <TouchableOpacity
                onPress={() => {
                  setSameAsPhone(!sameAsPhone);
                  if (!sameAsPhone) {
                    updateField("whatsapp_number", formData.mobile_number);
                  }
                }}
                style={styles.checkboxContainer}
                activeOpacity={0.7}
              >
                <Ionicons
                  name={sameAsPhone ? "checkbox" : "square-outline"}
                  size={20}
                  color="#f1641e"
                />
                <Text style={styles.checkboxLabel}>Same as mobile</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.inputWrapper}>
              <Ionicons
                name="logo-whatsapp"
                size={20}
                color="#999"
                style={styles.inputIcon}
              />
              <TextInput
                value={formData.whatsapp_number}
                onChangeText={(value) => updateField("whatsapp_number", value)}
                placeholder="+923001234567"
                placeholderTextColor="#999"
                keyboardType="phone-pad"
                editable={!sameAsPhone}
                style={[styles.input, sameAsPhone && styles.inputDisabled]}
              />
            </View>
          </View>

          {/* Password Input */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Password</Text>
            <View style={styles.inputWrapper}>
              <Ionicons
                name="lock-closed-outline"
                size={20}
                color="#999"
                style={styles.inputIcon}
              />
              <TextInput
                value={formData.password}
                onChangeText={(value) => updateField("password", value)}
                placeholder="Enter your password"
                placeholderTextColor="#999"
                secureTextEntry={!showPassword}
                style={styles.input}
              />
              <TouchableOpacity
                onPress={() => setShowPassword(!showPassword)}
                style={styles.eyeIcon}
              >
                <Ionicons
                  name={showPassword ? "eye-outline" : "eye-off-outline"}
                  size={20}
                  color="#999"
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* Confirm Password Input */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Confirm Password</Text>
            <View style={styles.inputWrapper}>
              <Ionicons
                name="lock-closed-outline"
                size={20}
                color="#999"
                style={styles.inputIcon}
              />
              <TextInput
                value={formData.password_confirmation}
                onChangeText={(value) => updateField("password_confirmation", value)}
                placeholder="Re-enter your password"
                placeholderTextColor="#999"
                secureTextEntry={!showConfirmPassword}
                style={styles.input}
              />
              <TouchableOpacity
                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                style={styles.eyeIcon}
              >
                <Ionicons
                  name={showConfirmPassword ? "eye-outline" : "eye-off-outline"}
                  size={20}
                  color="#999"
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* Signup Button */}
          <TouchableOpacity
            onPress={handleSignup}
            disabled={loading}
            style={[styles.signupButton, loading && styles.signupButtonDisabled]}
            activeOpacity={0.8}
          >
            {loading ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <>
                <Text style={styles.signupButtonText}>Create Account</Text>
                <Ionicons name="arrow-forward" size={20} color="#fff" />
              </>
            )}
          </TouchableOpacity>

          {/* Terms Text */}
          <Text style={styles.termsText}>
            By signing up, you agree to our{" "}
            <Text style={styles.termsLink}>Terms of Service</Text> and{" "}
            <Text 
              style={styles.termsLink}
              onPress={() => setShowPrivacyPolicy(true)}
            >
              Privacy Policy
            </Text>
          </Text>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Already have an account?{" "}
            <Text
              style={styles.footerLink}
              onPress={() => navigation.navigate("Login")}
            >
              Sign In
            </Text>
          </Text>
        </View>
      </ScrollView>

      {/* Privacy Policy Modal */}
      <PrivacyPolicyModal
        visible={showPrivacyPolicy}
        onClose={() => setShowPrivacyPolicy(false)}
      />
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 40,
  },
  header: {
    alignItems: "center",
    marginBottom: 32,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#fff5f0",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
    shadowColor: "#f1641e",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  title: {
    fontSize: 32,
    fontWeight: "700",
    color: "#1a1a1a",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
    fontWeight: "400",
    textAlign: "center",
  },
  formContainer: {
    flex: 1,
  },
  nameRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  halfWidth: {
    width: "48%",
  },
  inputContainer: {
    marginBottom: 20,
  },
  labelRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1a1a1a",
    marginBottom: 8,
  },
  checkboxContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  checkboxLabel: {
    fontSize: 13,
    color: "#666",
    marginLeft: 6,
    fontWeight: "500",
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f8f8f8",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e8e8e8",
    paddingHorizontal: 16,
    height: 56,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: "#1a1a1a",
    height: "100%",
  },
  inputDisabled: {
    color: "#999",
  },
  eyeIcon: {
    padding: 8,
  },
  signupButton: {
    backgroundColor: "#f1641e",
    borderRadius: 12,
    height: 56,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
    shadowColor: "#f1641e",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  signupButtonDisabled: {
    opacity: 0.6,
  },
  signupButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
    marginRight: 8,
  },
  termsText: {
    fontSize: 12,
    color: "#999",
    textAlign: "center",
    marginTop: 16,
    lineHeight: 18,
    paddingHorizontal: 20,
  },
  termsLink: {
    color: "#f1641e",
    fontWeight: "600",
  },
  footer: {
    alignItems: "center",
    marginTop: 24,
  },
  footerText: {
    fontSize: 14,
    color: "#666",
  },
  footerLink: {
    color: "#f1641e",
    fontWeight: "600",
  },
});

export default SignupScreen;