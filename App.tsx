/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import { StatusBar, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import LoginScreen from './src/screens/LoginScreen';
import SignupScreen from './src/screens/SignupScreen';
import ForgotPasswordScreen from './src/screens/ForgotPasswordScreen';
import Listings from './src/screens/Listings';
import ListingDetail from './src/screens/ListingDetail';
import CategoriesScreen from './src/screens/CategoriesScreen';
import Profile from './src/screens/Profile';
import CreateListing from './src/screens/CreateListing';
import HomeScreen from './src/screens/HomeScreen';

// Define your navigation types
export type RootStackParamList = {
  Home: undefined,
  Login: undefined,
  Signup: undefined,
  ForgotPassword: undefined,
  Listings: undefined,
  ListingDetail: undefined,
  Categories: undefined, 
  Profile: undefined,
  CreateListing: undefined
};

const Stack = createNativeStackNavigator<RootStackParamList>();

function App() {
  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <Stack.Navigator
          initialRouteName="Login"
          screenOptions={{
            headerShown: true, // Hide header since your screens have custom headers
          }}
        >
          <Stack.Screen name="Home" component={HomeScreen} />
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Signup" component={SignupScreen} />
          <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
          <Stack.Screen name="Listings" component={Listings} />
          <Stack.Screen name="ListingDetail" component={ListingDetail} />
          <Stack.Screen name="Categories" component={CategoriesScreen} />
          <Stack.Screen name="Profile" component={Profile} />
          <Stack.Screen name="CreateListing" component={CreateListing} />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}

export default App;