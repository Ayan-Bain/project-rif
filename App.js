import { StyleSheet, Text, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import HomeScreen from './src/components/HomeScreen';
import Details from './src/components/Details';
import { Ionicons } from '@expo/vector-icons';
import { AuthProvider } from './src/components/services/AuthHandler';
import { DataProvider } from './src/components/services/RetrieveData';


const Tab = createBottomTabNavigator();

export default function App() {
  return (
    <AuthProvider>
    <DataProvider>
    <NavigationContainer>
      <Tab.Navigator
        initialRouteName="My Subscriptions"
        screenOptions={{
          headerShown: false,
        }}
      >
        <Tab.Screen
          name="My Subscriptions"
          component={HomeScreen}
          options={{
            tabBarIcon: ({ color, size }) => (
              <Ionicons
                name="albums-outline"
                color={color + 5}
                size={size + 3}
              ></Ionicons>
            ),
          }}
        />
        <Tab.Screen name="All Expenses" component={Details} 
          options={{
            tabBarIcon: ({ color, size }) => (
              <Ionicons
                name="card-outline"
                color={color + 5}
                size={size + 3}
              ></Ionicons>
            ),
          }}
        />
      </Tab.Navigator>
    </NavigationContainer>
    </DataProvider>
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
