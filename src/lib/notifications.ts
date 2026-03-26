import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import { Platform } from 'react-native';
import { supabase } from './supabase';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export async function registerForPushNotifications(userId: string): Promise<string | null> {
  if (!Device.isDevice) {
    console.warn('Push notifications only work on physical devices');
    return null;
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    console.warn('Failed to get push notification permission');
    return null;
  }

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#1A1A2E',
    });
  }

  try {
    const projectId = Constants.expoConfig?.extra?.eas?.projectId ?? Constants.easConfig?.projectId;
    const token = await Notifications.getExpoPushTokenAsync({ projectId });
    
    // Register device in mobile_sync table
    await registerDevice(userId, token.data);
    
    return token.data;
  } catch (error) {
    console.error('Error getting push token:', error);
    return null;
  }
}

export async function registerDevice(userId: string, pushToken?: string | null) {
  const deviceId = `${Device.modelName ?? 'unknown'}-${Platform.OS}-${Date.now()}`;
  const deviceName = Device.deviceName ?? `${Platform.OS} Device`;

  const record = {
    user_id: userId,
    device_id: deviceId,
    device_name: deviceName,
    platform: Platform.OS,
    last_sync_at: new Date().toISOString(),
    push_token: pushToken ?? null,
    app_version: Constants.expoConfig?.version ?? '1.0.0',
    updated_at: new Date().toISOString(),
  };

  const { error } = await supabase
    .from('mobile_sync')
    .upsert(record, { onConflict: 'device_id' });

  if (error) {
    console.error('Error registering device:', error);
  }
}

export async function updateLastSync(userId: string) {
  await supabase
    .from('mobile_sync')
    .update({ last_sync_at: new Date().toISOString() })
    .eq('user_id', userId);
}

export async function schedulePushNotification(title: string, body: string, seconds: number) {
  await Notifications.scheduleNotificationAsync({
    content: { title, body, sound: true },
    trigger: { seconds },
  });
}
