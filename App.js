import { StyleSheet, Text, View, useColorScheme } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import HomeScreen from './src/components/HomeScreen';
import Details from './src/components/Details';
import { Ionicons } from '@expo/vector-icons';
import { AuthProvider } from './src/components/services/AuthHandler';
import { DataProvider, useData } from './src/components/services/RetrieveData';
import { Colors } from './src/components/constants/Colors';

const Tab = createBottomTabNavigator();

// 1. Move the Tab logic into its own component
function AppNavigator() {
  const { themeMode } = useData(); // Now this works because it's a child of DataProvider
  const systemScheme = useColorScheme();
  
  const activeTheme = themeMode === "system" ? (systemScheme || "light") : themeMode;
  const theme = Colors[activeTheme];

  return (
    <NavigationContainer>
      <Tab.Navigator
        initialRouteName="My Subscriptions"
        screenOptions={{
          headerShown: false,
          // Use tabBarStyle instead of tabBarBackground for simple color changes
          tabBarStyle: {
            backgroundColor: theme.whiteBackground,
            borderTopColor: theme.border,
          },
          tabBarInactiveTintColor: '#888',
        }}
      >
        <Tab.Screen
          name="My Subscriptions"
          component={HomeScreen}
          options={{
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="albums-outline" color={color} size={size + 3} />
            ),
          }}
        />
        <Tab.Screen 
          name="All Expenses" 
          component={Details} 
          options={{
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="card-outline" color={color} size={size + 3} />
            ),
          }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
}

// 2. Keep App.js clean as the top-level Provider
export default function App() {
  return (
    <AuthProvider>
      <DataProvider>
        <AppNavigator />
      </DataProvider>
    </AuthProvider>
  );
}