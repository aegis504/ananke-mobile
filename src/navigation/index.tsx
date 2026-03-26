import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import * as Notifications from 'expo-notifications';
import type { User } from '@supabase/supabase-js';

import { Colors, Shadows } from '../theme';
import { TasksScreen } from '../screens/tasks/TasksScreen';
import { NotesScreen } from '../screens/notes/NotesScreen';
import { CalendarScreen } from '../screens/calendar/CalendarScreen';
import { NotificationsScreen } from '../screens/notifications/NotificationsScreen';
import { ProfileScreen } from '../screens/profile/ProfileScreen';
import { useNotifications } from '../hooks/useNotifications';
import { registerForPushNotifications } from '../lib/notifications';

const Tab = createBottomTabNavigator();

function TabBarBadge({ count }: { count: number }) {
  if (count === 0) return null;
  return (
    <View style={badge.container}>
      <Text style={badge.text}>{count > 99 ? '99+' : count}</Text>
    </View>
  );
}

const badge = StyleSheet.create({
  container: {
    position: 'absolute',
    top: -4,
    right: -10,
    backgroundColor: Colors.danger,
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  text: { color: '#fff', fontSize: 11, fontWeight: '700' },
});

interface Props {
  user: User;
}

export function AppNavigator({ user }: Props) {
  const { unreadCount } = useNotifications(user.id);
  const notificationListener = useRef<Notifications.Subscription>();

  useEffect(() => {
    // Register for push notifications
    registerForPushNotifications(user.id);

    // Listen for incoming notifications
    notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
      console.log('Notification received:', notification);
    });

    return () => {
      if (notificationListener.current) {
        Notifications.removeNotificationSubscription(notificationListener.current);
      }
    };
  }, [user.id]);

  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarStyle: styles.tabBar,
          tabBarActiveTintColor: Colors.tabActive,
          tabBarInactiveTintColor: Colors.tabInactive,
          tabBarLabelStyle: styles.tabLabel,
          tabBarIcon: ({ focused, color, size }) => {
            const icons: Record<string, { active: string; inactive: string }> = {
              Tasks: { active: 'checkbox', inactive: 'checkbox-outline' },
              Notes: { active: 'document-text', inactive: 'document-text-outline' },
              Calendar: { active: 'calendar', inactive: 'calendar-outline' },
              Notifications: { active: 'notifications', inactive: 'notifications-outline' },
              Profile: { active: 'person', inactive: 'person-outline' },
            };
            const iconSet = icons[route.name] || { active: 'ellipse', inactive: 'ellipse-outline' };
            const iconName = focused ? iconSet.active : iconSet.inactive;

            if (route.name === 'Notifications' && unreadCount > 0) {
              return (
                <View style={{ position: 'relative' }}>
                  <Ionicons name={iconName as any} size={size} color={color} />
                  <TabBarBadge count={unreadCount} />
                </View>
              );
            }

            return <Ionicons name={iconName as any} size={size} color={color} />;
          },
        })}
      >
        <Tab.Screen name="Tasks">
          {() => <TasksScreen userId={user.id} />}
        </Tab.Screen>
        <Tab.Screen name="Notes">
          {() => <NotesScreen userId={user.id} />}
        </Tab.Screen>
        <Tab.Screen name="Calendar">
          {() => <CalendarScreen userId={user.id} />}
        </Tab.Screen>
        <Tab.Screen name="Notifications">
          {() => <NotificationsScreen userId={user.id} />}
        </Tab.Screen>
        <Tab.Screen name="Profile">
          {() => <ProfileScreen userId={user.id} user={user} />}
        </Tab.Screen>
      </Tab.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: Colors.tabBar,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingTop: 8,
    paddingBottom: Platform.OS === 'ios' ? 20 : 8,
    height: Platform.OS === 'ios' ? 82 : 62,
    ...Shadows.lg,
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: '600',
    marginTop: 2,
  },
});
