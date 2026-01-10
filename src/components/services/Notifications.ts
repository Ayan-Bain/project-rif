import * as Notifications from 'expo-notifications';
import { Alert, Platform } from 'react-native';

export const requestNotificationPermission = async () => {
  // 1. Get current permission status
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  // 2. If not granted, ask the user
  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  // 3. If the user refuses, show an alert explaining why you need it
  if (finalStatus !== 'granted') {
    Alert.alert(
      'Permissions Required',
      'Please enable notifications in your settings to receive renewal reminders.'
    );
    return false;
  }

  // 4. Android-specific: Create a channel (Required for Android 8.0+)
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });
  }

  return true;
};