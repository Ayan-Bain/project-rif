import {  ActivityIndicator, useColorScheme, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import HomeScreen from './src/components/HomeScreen';
import Details from './src/components/Details';
import { Ionicons } from '@expo/vector-icons';
import { AuthProvider } from './src/components/services/AuthHandler';
import { DataProvider, useData } from './src/components/services/RetrieveData';
import { Colors } from './src/components/constants/Colors';

const Tab = createBottomTabNavigator();

function AppNavigator() {
  const { themeMode, loading } = useData();
  const systemScheme = useColorScheme();
  
  const activeTheme = themeMode === "system" ? (systemScheme || "light") : themeMode;
  const theme = Colors[activeTheme];
const isDark = activeTheme === 'dark';

  if(loading) {
    return (
      <View style={{flex: 1, justifyContent: 'center'}}>
        <ActivityIndicator size={100}/>
      </View>
    )
  }

  return (
    <NavigationContainer>
      <Tab.Navigator
        initialRouteName="My Subscriptions"
        screenOptions={{
          headerShown: false,
          tabBarStyle: {
            backgroundColor: theme.whiteBackground,
            borderTopColor: theme.border,
          },
          tabBarInactiveTintColor: isDark?'#FFF':'#888',
          tabBarActiveTintColor: '#857ff1',
        }}
      >
        <Tab.Screen
          name="My Subscriptions"
          component={HomeScreen}
          options={{
            tabBarIcon: ({ color, size }) => (
              <Ionicons name={isDark?"albums":"albums-outline"} color={color} size={size + 3} />
            ),
          }}
        />
        <Tab.Screen 
          name="All Expenses" 
          component={Details} 
          options={{
            tabBarIcon: ({ color, size }) => (
              <Ionicons name={isDark?"card":"card-outline"} color={color} size={size + 3} />
            ),
          }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <DataProvider>
        <AppNavigator />
      </DataProvider>
    </AuthProvider>
  );
}