import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';

export interface AppNotification {
  id: string;
  user_id: string;
  type: string;
  title: string;
  message: string | null;
  read: boolean;
  created_at: string;
}

export function useNotifications(userId: string | undefined) {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = useCallback(async () => {
    if (!userId) return;
    const { data } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(30);
    if (data) {
      setNotifications(data as AppNotification[]);
      setUnreadCount((data as AppNotification[]).filter(n => !n.read).length);
    }
    setLoading(false);
  }, [userId]);

  useEffect(() => { fetchNotifications(); }, [fetchNotifications]);

  useEffect(() => {
    if (!userId) return;
    const channel = supabase
      .channel('notifications-mobile-rt')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'notifications', filter: `user_id=eq.${userId}` }, () => fetchNotifications())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [userId, fetchNotifications]);

  const markAsRead = async (id: string) => {
    if (!userId) return;
    await supabase.from('notifications').update({ read: true }).eq('id', id).eq('user_id', userId);
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  const markAllRead = async () => {
    if (!userId) return;
    await supabase.from('notifications').update({ read: true }).eq('user_id', userId).eq('read', false);
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    setUnreadCount(0);
  };

  const deleteNotification = async (id: string) => {
    if (!userId) return;
    const n = notifications.find(x => x.id === id);
    await supabase.from('notifications').delete().eq('id', id).eq('user_id', userId);
    setNotifications(prev => prev.filter(x => x.id !== id));
    if (n && !n.read) setUnreadCount(prev => Math.max(0, prev - 1));
  };

  return { notifications, unreadCount, loading, markAsRead, markAllRead, deleteNotification, refetch: fetchNotifications };
}
