import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
// import Ionicons from 'react-native-vector-icons/Ionicons'; // for RN CLI

import { Ionicons } from "@react-native-vector-icons/ionicons";

// import { Ionicons } from '@expo/vector-icons'; // if using Expo
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App'; // Adjust path if needed

type LoginScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'Login'
>;

const LoginScreen = () => {
  const navigation = useNavigation<LoginScreenNavigationProp>();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [secureText, setSecureText] = useState(true);

  const handleLogin = () => {
    console.log('Email:', email, 'Password:', password);
    // 🚀 Demo login → go straight to Listings
    navigation.navigate('Listings');
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <StatusBar barStyle="light-content" backgroundColor="#f1641e" />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Welcome Back</Text>
        <Text style={styles.subtitle}>Login to continue</Text>
      </View>

      {/* Form */}
      <View style={styles.form}>
        {/* Email Field */}
        <View style={styles.inputContainer}>
          <Ionicons name="mail-outline" size={20} color="#888" style={styles.icon} />
          <TextInput
            placeholder="Email"
            placeholderTextColor="#888"
            style={styles.input}
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={setEmail}
          />
        </View>

        {/* Password Field */}
        <View style={styles.inputContainer}>
          <Ionicons name="lock-closed-outline" size={20} color="#888" style={styles.icon} />
          <TextInput
            placeholder="Password"
            placeholderTextColor="#888"
            style={styles.input}
            secureTextEntry={secureText}
            value={password}
            onChangeText={setPassword}
          />
          <TouchableOpacity onPress={() => setSecureText(!secureText)}>
            <Ionicons name={secureText ? 'eye-off-outline' : 'eye-outline'} size={20} color="#888" />
          </TouchableOpacity>
        </View>

        {/* Forgot Password */}
        <TouchableOpacity
          style={styles.forgotPassword}
          onPress={() => navigation.navigate('ForgotPassword')}
        >
          <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
        </TouchableOpacity>

        {/* Login Button */}
        <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
          <Text style={styles.loginButtonText}>Login</Text>
        </TouchableOpacity>

        {/* Signup Link */}
        <TouchableOpacity
          style={styles.signupLink}
          onPress={() => navigation.navigate('Signup')}
        >
          <Text style={styles.signupText}>
            Don&apos;t have an account?{' '}
            <Text style={styles.signupHighlight}>Sign Up</Text>
          </Text>
        </TouchableOpacity>

        {/* Demo Login Button */}
        <TouchableOpacity
          style={[styles.loginButton, { backgroundColor: '#555', marginTop: 15 }]}
          onPress={() => navigation.navigate('Listings')}
        >
          <Text style={styles.loginButtonText}>Login as Guest</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

export default LoginScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    backgroundColor: '#f1641e',
    paddingVertical: 60,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
  },
  subtitle: {
    fontSize: 16,
    color: '#fff',
    marginTop: 8,
  },
  form: {
    marginTop: 40,
    paddingHorizontal: 20,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9f9f9',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  icon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: 20,
  },
  forgotPasswordText: {
    fontSize: 14,
    color: '#f1641e',
    fontWeight: '500',
  },
  loginButton: {
    backgroundColor: '#f1641e',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 10,
    elevation: 2,
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  signupLink: {
    marginTop: 20,
    alignItems: 'center',
  },
  signupText: {
    fontSize: 14,
    color: '#555',
  },
  signupHighlight: {
    color: '#f1641e',
    fontWeight: 'bold',
  },
});
