import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';

export interface CalendarEvent {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  start_time: string;
  end_time: string;
  all_day: boolean;
  color: string;
  location: string | null;
  recurrence: string | null;
  created_at: string;
  updated_at: string;
}

export function useCalendarEvents(userId: string | undefined) {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchEvents = useCallback(async () => {
    if (!userId) return;
    const { data } = await supabase
      .from('calendar_events')
      .select('*')
      .eq('user_id', userId)
      .order('start_time');
    if (data) setEvents(data as CalendarEvent[]);
    setLoading(false);
  }, [userId]);

  useEffect(() => { fetchEvents(); }, [fetchEvents]);

  useEffect(() => {
    if (!userId) return;
    const channel = supabase
      .channel('events-mobile-rt')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'calendar_events', filter: `user_id=eq.${userId}` }, () => fetchEvents())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [userId, fetchEvents]);

  const addEvent = async (
    title: string,
    startTime: string,
    endTime: string,
    color?: string,
    description?: string,
    allDay?: boolean
  ) => {
    if (!userId) return;
    const { data, error } = await supabase.from('calendar_events').insert({
      user_id: userId,
      title: title.trim(),
      start_time: startTime,
      end_time: endTime,
      color: color || '#1A1A2E',
      description: description || null,
      all_day: allDay || false,
    }).select().single();
    if (data && !error) setEvents(prev => [...prev, data as CalendarEvent]);
    return { data: data as CalendarEvent | null, error };
  };

  const deleteEvent = async (id: string) => {
    if (!userId) return;
    await supabase.from('calendar_events').delete().eq('id', id).eq('user_id', userId);
    setEvents(prev => prev.filter(e => e.id !== id));
  };

  // Get events for a specific date
  const getEventsForDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return events.filter(e => {
      const eventDate = new Date(e.start_time).toISOString().split('T')[0];
      return eventDate === dateStr;
    });
  };

  const upcomingEvents = events
    .filter(e => new Date(e.start_time) >= new Date())
    .slice(0, 10);

  return { events, upcomingEvents, loading, addEvent, deleteEvent, getEventsForDate, refetch: fetchEvents };
}
