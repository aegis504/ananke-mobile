import React, { useState } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet, RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, BorderRadius, Shadows } from '../../theme';
import { useNotifications, AppNotification } from '../../hooks/useNotifications';
import { EmptyState } from '../../components/EmptyState';
import { formatDistanceToNow } from 'date-fns';

interface Props { userId: string }

const TYPE_ICONS: Record<string, { icon: string; color: string; bg: string }> = {
  task: { icon: 'checkbox-outline', color: Colors.primary, bg: '#E8E8F0' },
  deadline: { icon: 'time', color: Colors.danger, bg: '#FEE2E2' },
  reminder: { icon: 'alarm', color: Colors.warning, bg: '#FEF3C7' },
  workflow: { icon: 'git-network-outline', color: Colors.info, bg: '#DBEAFE' },
  system: { icon: 'information-circle', color: Colors.textSecondary, bg: Colors.borderLight },
};

const getTypeConfig = (type: string) => TYPE_ICONS[type] || TYPE_ICONS.system;

export function NotificationsScreen({ userId }: Props) {
  const { notifications, unreadCount, loading, markAsRead, markAllRead, deleteNotification, refetch } = useNotifications(userId);
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => { setRefreshing(true); await refetch(); setRefreshing(false); };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Notifications</Text>
          {unreadCount > 0 && (
            <Text style={styles.subtitle}>{unreadCount} unread</Text>
          )}
        </View>
        {unreadCount > 0 && (
          <TouchableOpacity style={styles.markAllBtn} onPress={markAllRead}>
            <Ionicons name="checkmark-done" size={16} color={Colors.primary} />
            <Text style={styles.markAllText}>Mark all read</Text>
          </TouchableOpacity>
        )}
      </View>

      <FlatList
        data={notifications}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <NotificationItem
            notification={item}
            onRead={() => !item.read && markAsRead(item.id)}
            onDelete={() => deleteNotification(item.id)}
          />
        )}
        contentContainerStyle={[styles.list, notifications.length === 0 && styles.listEmpty]}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />}
        ListEmptyComponent={
          <EmptyState
            emoji="🔔"
            title="No notifications"
            subtitle="You're all caught up! Notifications from tasks and deadlines will appear here."
          />
        }
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

function NotificationItem({ notification, onRead, onDelete }: {
  notification: AppNotification;
  onRead: () => void;
  onDelete: () => void;
}) {
  const typeConfig = getTypeConfig(notification.type);

  return (
    <TouchableOpacity
      style={[styles.notifCard, !notification.read && styles.notifCardUnread]}
      onPress={onRead}
      activeOpacity={0.7}
    >
      {/* Unread indicator */}
      {!notification.read && <View style={styles.unreadDot} />}

      {/* Icon */}
      <View style={[styles.iconContainer, { backgroundColor: typeConfig.bg }]}>
        <Ionicons name={typeConfig.icon as any} size={20} color={typeConfig.color} />
      </View>

      {/* Content */}
      <View style={styles.notifContent}>
        <Text style={[styles.notifTitle, !notification.read && styles.notifTitleUnread]} numberOfLines={1}>
          {notification.title}
        </Text>
        {notification.message && (
          <Text style={styles.notifMessage} numberOfLines={2}>{notification.message}</Text>
        )}
        <Text style={styles.notifTime}>
          {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
        </Text>
      </View>

      {/* Delete */}
      <TouchableOpacity style={styles.deleteBtn} onPress={onDelete}>
        <Ionicons name="close" size={18} color={Colors.textMuted} />
      </TouchableOpacity>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.sm,
  },
  title: { fontSize: 28, fontWeight: '800', color: Colors.textPrimary },
  subtitle: { fontSize: 13, color: Colors.danger, marginTop: 2, fontWeight: '600' },
  markAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: Spacing.md,
    paddingVertical: 8,
    borderRadius: BorderRadius.full,
  },
  markAllText: { fontSize: 13, fontWeight: '600', color: Colors.primary },
  list: { paddingTop: Spacing.sm, paddingBottom: 100 },
  listEmpty: { flex: 1 },
  notifCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: Colors.surface,
    marginHorizontal: Spacing.md,
    marginBottom: Spacing.sm,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    gap: Spacing.sm,
    ...Shadows.sm,
  },
  notifCardUnread: {
    backgroundColor: '#FDFBF7',
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  unreadDot: {
    position: 'absolute',
    top: Spacing.md,
    left: 6,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.primary,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },
  notifContent: { flex: 1 },
  notifTitle: { fontSize: 14, fontWeight: '600', color: Colors.textPrimary, marginBottom: 2 },
  notifTitleUnread: { fontWeight: '700' },
  notifMessage: { fontSize: 13, color: Colors.textSecondary, lineHeight: 18, marginBottom: 4 },
  notifTime: { fontSize: 11, color: Colors.textMuted },
  deleteBtn: { padding: 4 },
});
