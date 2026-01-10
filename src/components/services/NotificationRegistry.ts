import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import { Alert, Platform, Linking } from 'react-native';

const NOTIF_MAP_KEY = '@device_notification_map';

export const NotificationRegistry = {
  getNotifIds: async (subId: string) => {
    const map = await AsyncStorage.getItem('@device_notification_map');
    return map ? JSON.parse(map)[subId] : []; // Return empty array if none
  },
  saveNotifIds: async (subId: string, ids: string[]) => {
    const map = await AsyncStorage.getItem('@device_notification_map') || '{}';
    const parsed = JSON.parse(map);
    parsed[subId] = ids; // Store the whole array
    await AsyncStorage.setItem('@device_notification_map', JSON.stringify(parsed));
  }
};


export const requestNotificationPermission = async () => {
  // 1. Get current permission status
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  // 2. Only ask if permissions haven't been determined yet
  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  // 3. If the user denied permission, show an alert with a link to settings
  if (finalStatus !== 'granted') {
    Alert.alert(
      'Notifications Disabled',
      'Please enable notifications in your phone settings to receive renewal reminders.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Open Settings', onPress: () => Platform.OS === 'ios' ? Linking.openURL('app-settings:') : Linking.openSettings() }
      ]
    );
    return false;
  }

  // 4. Android-specific: Create a notification channel (Required for Android 8.0+)
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