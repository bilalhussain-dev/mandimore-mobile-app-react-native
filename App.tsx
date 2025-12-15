import React from 'react';
import { StatusBar } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Ionicons } from "@react-native-vector-icons/ionicons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useState, useEffect } from 'react';

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

// Define types
export type RootStackParamList = {
  Signup: undefined;
  Login: undefined;
  Tabs: undefined;
  CreateListing: undefined;
  ListingDetail: { id?: number };
  Category: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator();

// --- Bottom Tabs Layout ---
function BottomTabs() {
  const [userId, current_user_id] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const current_user = await AsyncStorage.getItem("current_user");
        if (current_user) {
          const parsed = JSON.parse(current_user);
          current_user_id(parsed.id);
        }
      } catch (error) {
        console.error('Error loading user data:', error);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) return null; // or a loading spinner

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
        tabBarIcon: ({ color }) => {
          let iconName = 'home-outline';
          switch (route.name) {
            case 'Home':
              iconName = 'home-outline';
              break;
            case 'Listings':
              iconName = 'list-outline';
              break;
            case 'Categories':
              iconName = 'grid-outline';
              break;
            case 'Favorites':
              iconName = 'heart-outline';
              break;
            case 'Profile':
              iconName = 'person-outline';
              break;
          }
          return <Ionicons name={iconName} size={24} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Listings" component={Listings} />
      <Tab.Screen name="Categories" component={CategoriesScreen} />
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
          <Stack.Screen name="CreateListing" component={CreateListing} />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}

export default App;