import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import { Alert, Platform, Linking } from 'react-native';

export const NotificationRegistry = {
  getNotifIds: async (subId: string) => {
    const map = await AsyncStorage.getItem('@device_notification_map');
    return map ? JSON.parse(map)[subId] : [];
  },
  saveNotifIds: async (subId: string, ids: string[]) => {
    const map = await AsyncStorage.getItem('@device_notification_map') || '{}';
    const parsed = JSON.parse(map);
    parsed[subId] = ids;
    await AsyncStorage.setItem('@device_notification_map', JSON.stringify(parsed));
  }
};


export const requestNotificationPermission = async () => {
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

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