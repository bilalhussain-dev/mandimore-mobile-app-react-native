import React from 'react';
import { StatusBar, View, Image, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Ionicons } from "@react-native-vector-icons/ionicons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useState, useEffect } from 'react';
import axios from 'axios';
import appEvents, { EVENTS } from './src/utils/EventEmitter';

// Screens
import Listings from './src/screens/Listings';
import ListingDetail from './src/screens/ListingDetail';
import CategoriesScreen from './src/screens/CategoriesScreen';
import Profile from './src/screens/Profile';
import HomeScreen from './src/screens/HomeScreen';
import LoginScreen from './src/screens/LoginScreen';
import Category from './src/screens/Category';
import FavoritesScreen from './src/screens/FavoritesScreen';
import CreateListing from './src/screens/CreateListing';
import SignupScreen from './src/screens/SignupScreen';
import ReelsScreen from './src/screens/ReelsScreen';

// Define types
export type RootStackParamList = {
  Signup: undefined;
  Login: undefined;
  Tabs: undefined;
  CreateListing: undefined;
  ListingDetail: { id?: number };
  Category: undefined;
  Categories: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator();

interface UserData {
  id: number;
  first_name: string;
  last_name: string;
  avatar: string | null;
}

// Custom Profile Tab Icon with Avatar
const ProfileTabIcon = ({ color, focused, avatar }: { color: string; focused: boolean; avatar: string | null }) => {
  if (avatar) {
    return (
      <View style={[styles.avatarContainer, focused && styles.avatarContainerActive]}>
        <Image source={{ uri: avatar }} style={styles.avatarIcon} />
      </View>
    );
  }
  return <Ionicons name="person-outline" size={24} color={color} />;
};

// Custom Favorites Tab Icon with Badge
const FavoritesTabIcon = ({ color, favoritesCount }: { color: string; favoritesCount: number }) => {
  return (
    <View style={styles.iconContainer}>
      <Ionicons name="heart-outline" size={24} color={color} />
      {favoritesCount > 0 && (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>
            {favoritesCount > 99 ? '99+' : favoritesCount}
          </Text>
        </View>
      )}
    </View>
  );
};

// --- Bottom Tabs Layout ---
function BottomTabs() {
  const [userId, setUserId] = useState<number | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [favoritesCount, setFavoritesCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUserData();
  }, []);

  useEffect(() => {
    if (userId) {
      fetchFavoritesCount();
    }
  }, [userId]);

  // Listen for favorites updates - INSTANT UPDATE
  useEffect(() => {
    const unsubscribe = appEvents.on(EVENTS.FAVORITES_UPDATED, (newCount: number) => {
      console.log('BottomTabs: Favorites count updated instantly to:', newCount);
      setFavoritesCount(newCount);
    });

    return () => unsubscribe();
  }, []);

  // Listen for profile updates
  useEffect(() => {
    const unsubscribe = appEvents.on(EVENTS.PROFILE_UPDATED, () => {
      console.log('BottomTabs: Profile updated, refreshing user data...');
      loadUserData();
    });

    return () => unsubscribe();
  }, []);

  const loadUserData = async () => {
    try {
      const current_user = await AsyncStorage.getItem("current_user");
      if (current_user) {
        const parsed = JSON.parse(current_user);
        setUserId(parsed.id);
        setUserData(parsed);
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchFavoritesCount = async () => {
    try {
      const token = await AsyncStorage.getItem('authToken');
      if (!token) return;

      const response = await axios.get('https://mandimore.com/v1/favorites', {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
        },
      });

      if (response.data && response.data.data) {
        const count = response.data.data.length;
        setFavoritesCount(count);
      }
    } catch (error) {
      console.error('Error fetching favorites count:', error);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#f1641e" />
      </View>
    );
  }

  return (
    <Tab.Navigator
      initialRouteName="Home"
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarShowLabel: true,
        tabBarActiveTintColor: '#f1641e',
        tabBarInactiveTintColor: '#999',
        tabBarStyle: {
          height: 60,
          borderTopWidth: 0.5,
          borderTopColor: '#eee',
          backgroundColor: '#fff',
          paddingBottom: 5,
        },
        tabBarIcon: ({ color, focused }) => {
          if (route.name === 'Profile') {
            return (
              <ProfileTabIcon 
                color={color} 
                focused={focused} 
                avatar={userData?.avatar || null} 
              />
            );
          }
          
          if (route.name === 'Favorites') {
            return <FavoritesTabIcon color={color} favoritesCount={favoritesCount} />;
          }

          let iconName: string = 'home-outline';
          switch (route.name) {
            case 'Home':
              iconName = focused ? 'home' : 'home-outline';
              break;
            case 'Listings':
              iconName = focused ? 'list' : 'list-outline';
              break;
            case 'Reels':
              iconName = focused ? 'videocam' : 'videocam-outline';
              break;
          }
          return <Ionicons name={iconName} size={24} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Listings" component={Listings} />
      <Tab.Screen 
        name="Reels" 
        component={ReelsScreen}
        options={{
          tabBarStyle: {
            height: 60,
            borderTopWidth: 0,
            backgroundColor: '#000',
            paddingBottom: 5,
          },
          tabBarActiveTintColor: '#fff',
          tabBarInactiveTintColor: '#666',
        }}
      />
      <Tab.Screen 
        name="Favorites" 
        component={FavoritesScreen} 
        initialParams={{ userId: userId || 0 }}
      />
      <Tab.Screen 
        name="Profile" 
        component={Profile}
        initialParams={{ PROFILE: { id: userId || 0 } }}
      />
    </Tab.Navigator>
  );
}

// --- App with Stack + Tabs ---
function App() {
  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <StatusBar barStyle="dark-content" backgroundColor="#fff" />
        <Stack.Navigator
          initialRouteName="Login"
          screenOptions={{ headerShown: false }}
        >
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Signup" component={SignupScreen} />
          <Stack.Screen name="Tabs" component={BottomTabs} />
          <Stack.Screen name="ListingDetail" component={ListingDetail} />
          <Stack.Screen name="Category" component={Category} />
          <Stack.Screen name="Categories" component={CategoriesScreen} />
          <Stack.Screen name="CreateListing" component={CreateListing} />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  iconContainer: {
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: -6,
    right: -10,
    backgroundColor: '#ff4444',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 5,
    borderWidth: 2,
    borderColor: '#fff',
  },
  badgeText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '800',
  },
  avatarContainer: {
    width: 28,
    height: 28,
    borderRadius: 14,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  avatarContainerActive: {
    borderColor: '#f1641e',
  },
  avatarIcon: {
    width: '100%',
    height: '100%',
    backgroundColor: '#f0f0f0',
  },
});

export default App;