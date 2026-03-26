import React, { useState } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet,
  RefreshControl, Modal, TextInput, Alert, ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, BorderRadius, Shadows } from '../../theme';
import { useCalendarEvents, CalendarEvent } from '../../hooks/useCalendarEvents';
import { EmptyState } from '../../components/EmptyState';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isToday, isSameMonth } from 'date-fns';

interface Props { userId: string }

export function CalendarScreen({ userId }: Props) {
  const { events, upcomingEvents, loading, addEvent, deleteEvent, getEventsForDate, refetch } = useCalendarEvents(userId);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showAdd, setShowAdd] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => { setRefreshing(true); await refetch(); setRefreshing(false); };

  const daysInMonth = eachDayOfInterval({
    start: startOfMonth(currentMonth),
    end: endOfMonth(currentMonth),
  });

  const selectedEvents = getEventsForDate(selectedDate);
  const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const prevMonth = () => setCurrentMonth(m => new Date(m.getFullYear(), m.getMonth() - 1, 1));
  const nextMonth = () => setCurrentMonth(m => new Date(m.getFullYear(), m.getMonth() + 1, 1));

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Calendar</Text>
            <Text style={styles.subtitle}>{upcomingEvents.length} upcoming events</Text>
          </View>
          <TouchableOpacity style={styles.addBtn} onPress={() => setShowAdd(true)}>
            <Ionicons name="add" size={22} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* Month navigator */}
        <View style={styles.monthNav}>
          <TouchableOpacity onPress={prevMonth} style={styles.monthNavBtn}>
            <Ionicons name="chevron-back" size={20} color={Colors.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.monthLabel}>{format(currentMonth, 'MMMM yyyy')}</Text>
          <TouchableOpacity onPress={nextMonth} style={styles.monthNavBtn}>
            <Ionicons name="chevron-forward" size={20} color={Colors.textPrimary} />
          </TouchableOpacity>
        </View>

        {/* Day names */}
        <View style={styles.dayNames}>
          {DAY_NAMES.map(d => (
            <Text key={d} style={styles.dayName}>{d}</Text>
          ))}
        </View>

        {/* Calendar grid */}
        <View style={styles.grid}>
          {/* Empty cells before first day */}
          {Array.from({ length: daysInMonth[0].getDay() }).map((_, i) => (
            <View key={`empty-${i}`} style={styles.dayCell} />
          ))}
          {daysInMonth.map(day => {
            const dayEvents = getEventsForDate(day);
            const selected = isSameDay(day, selectedDate);
            const today = isToday(day);
            return (
              <TouchableOpacity
                key={day.toISOString()}
                style={[styles.dayCell, selected && styles.dayCellSelected, today && !selected && styles.dayCellToday]}
                onPress={() => setSelectedDate(day)}
              >
                <Text style={[styles.dayNumber, selected && styles.dayNumberSelected, today && !selected && styles.dayNumberToday]}>
                  {format(day, 'd')}
                </Text>
                {dayEvents.length > 0 && (
                  <View style={[styles.eventDot, selected && styles.eventDotSelected]} />
                )}
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Selected day events */}
        <View style={styles.dayEventsSection}>
          <Text style={styles.dayEventsTitle}>
            {isToday(selectedDate) ? 'Today' : format(selectedDate, 'EEEE, MMMM d')}
          </Text>
          {selectedEvents.length === 0 ? (
            <View style={styles.noEvents}>
              <Text style={styles.noEventsText}>No events this day</Text>
            </View>
          ) : (
            selectedEvents.map(event => (
              <EventCard key={event.id} event={event} onDelete={() => deleteEvent(event.id)} />
            ))
          )}
        </View>

        {/* Upcoming events */}
        {upcomingEvents.length > 0 && (
          <View style={styles.upcomingSection}>
            <Text style={styles.upcomingTitle}>Upcoming</Text>
            {upcomingEvents.slice(0, 5).map(event => (
              <EventCard key={event.id} event={event} onDelete={() => deleteEvent(event.id)} showDate />
            ))}
          </View>
        )}
      </ScrollView>

      {/* Add Event Modal */}
      {showAdd && (
        <AddEventModal
          defaultDate={selectedDate}
          onAdd={async (title, start, end, color) => {
            await addEvent(title, start, end, color);
            setShowAdd(false);
          }}
          onClose={() => setShowAdd(false)}
        />
      )}
    </SafeAreaView>
  );
}

function EventCard({ event, onDelete, showDate }: { event: CalendarEvent; onDelete: () => void; showDate?: boolean }) {
  const handleDelete = () => {
    Alert.alert('Delete Event', 'Delete this event?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: onDelete },
    ]);
  };

  return (
    <View style={[styles.eventCard, { borderLeftColor: event.color || Colors.primary }]}>
      <View style={styles.eventCardContent}>
        <Text style={styles.eventTitle} numberOfLines={1}>{event.title}</Text>
        <Text style={styles.eventTime}>
          {showDate ? format(new Date(event.start_time), 'MMM d · ') : ''}
          {event.all_day ? 'All day' : `${format(new Date(event.start_time), 'h:mm a')} – ${format(new Date(event.end_time), 'h:mm a')}`}
        </Text>
        {event.location && <Text style={styles.eventLocation}>📍 {event.location}</Text>}
      </View>
      <TouchableOpacity onPress={handleDelete} style={styles.eventDeleteBtn}>
        <Ionicons name="trash-outline" size={16} color={Colors.textMuted} />
      </TouchableOpacity>
    </View>
  );
}

const EVENT_COLORS = ['#1A1A2E', '#3B82F6', '#22C55E', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#06B6D4'];

function AddEventModal({ defaultDate, onAdd, onClose }: {
  defaultDate: Date;
  onAdd: (title: string, start: string, end: string, color?: string) => Promise<void>;
  onClose: () => void;
}) {
  const [title, setTitle] = useState('');
  const [color, setColor] = useState(EVENT_COLORS[0]);
  const [loading, setLoading] = useState(false);
  // Simplified: use default date, user can refine
  const startTime = new Date(defaultDate);
  startTime.setHours(9, 0, 0, 0);
  const endTime = new Date(defaultDate);
  endTime.setHours(10, 0, 0, 0);

  const handleAdd = async () => {
    if (!title.trim()) return;
    setLoading(true);
    await onAdd(title, startTime.toISOString(), endTime.toISOString(), color);
    setLoading(false);
  };

  return (
    <Modal visible animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <View style={styles.modalContainer}>
        <View style={styles.handle} />
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>New Event</Text>
          <TouchableOpacity onPress={onClose}><Ionicons name="close" size={24} color={Colors.textSecondary} /></TouchableOpacity>
        </View>
        <View style={styles.modalSection}>
          <Text style={styles.modalLabel}>Title</Text>
          <TextInput
            style={styles.modalInput}
            placeholder="Event name..."
            placeholderTextColor={Colors.textMuted}
            value={title}
            onChangeText={setTitle}
            autoFocus
          />
        </View>
        <View style={styles.modalSection}>
          <Text style={styles.modalLabel}>Date: {format(defaultDate, 'EEEE, MMMM d yyyy')}</Text>
        </View>
        <View style={styles.modalSection}>
          <Text style={styles.modalLabel}>Color</Text>
          <View style={styles.colorRow}>
            {EVENT_COLORS.map(c => (
              <TouchableOpacity
                key={c}
                style={[styles.colorDot, { backgroundColor: c }, color === c && styles.colorDotSelected]}
                onPress={() => setColor(c)}
              />
            ))}
          </View>
        </View>
        <TouchableOpacity
          style={[styles.modalSubmit, (!title.trim() || loading) && styles.modalSubmitDisabled]}
          onPress={handleAdd}
          disabled={!title.trim() || loading}
        >
          <Text style={styles.modalSubmitText}>{loading ? 'Creating...' : 'Create Event'}</Text>
        </TouchableOpacity>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: Spacing.md, paddingTop: Spacing.md, paddingBottom: Spacing.sm },
  title: { fontSize: 28, fontWeight: '800', color: Colors.textPrimary },
  subtitle: { fontSize: 13, color: Colors.textSecondary, marginTop: 2 },
  addBtn: { width: 44, height: 44, borderRadius: BorderRadius.full, backgroundColor: Colors.primary, justifyContent: 'center', alignItems: 'center', ...Shadows.md },
  monthNav: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: Spacing.lg, paddingVertical: Spacing.sm },
  monthNavBtn: { padding: Spacing.sm },
  monthLabel: { fontSize: 17, fontWeight: '700', color: Colors.textPrimary },
  dayNames: { flexDirection: 'row', paddingHorizontal: Spacing.md, marginBottom: 4 },
  dayName: { flex: 1, textAlign: 'center', fontSize: 12, fontWeight: '600', color: Colors.textMuted },
  grid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: Spacing.md, marginBottom: Spacing.md },
  dayCell: { width: `${100 / 7}%`, aspectRatio: 1, justifyContent: 'center', alignItems: 'center', borderRadius: BorderRadius.md },
  dayCellSelected: { backgroundColor: Colors.primary },
  dayCellToday: { backgroundColor: Colors.borderLight },
  dayNumber: { fontSize: 14, color: Colors.textPrimary, fontWeight: '500' },
  dayNumberSelected: { color: '#fff', fontWeight: '700' },
  dayNumberToday: { color: Colors.primary, fontWeight: '700' },
  eventDot: { width: 5, height: 5, borderRadius: 3, backgroundColor: Colors.accent, marginTop: 2 },
  eventDotSelected: { backgroundColor: '#fff' },
  dayEventsSection: { paddingHorizontal: Spacing.md, marginBottom: Spacing.lg },
  dayEventsTitle: { fontSize: 17, fontWeight: '700', color: Colors.textPrimary, marginBottom: Spacing.sm },
  noEvents: { paddingVertical: Spacing.md, alignItems: 'center' },
  noEventsText: { fontSize: 14, color: Colors.textMuted },
  upcomingSection: { paddingHorizontal: Spacing.md, marginBottom: 100 },
  upcomingTitle: { fontSize: 17, fontWeight: '700', color: Colors.textPrimary, marginBottom: Spacing.sm },
  eventCard: { flexDirection: 'row', backgroundColor: Colors.surface, borderRadius: BorderRadius.md, marginBottom: Spacing.sm, borderLeftWidth: 4, overflow: 'hidden', ...Shadows.sm },
  eventCardContent: { flex: 1, padding: Spacing.md },
  eventTitle: { fontSize: 15, fontWeight: '700', color: Colors.textPrimary, marginBottom: 3 },
  eventTime: { fontSize: 13, color: Colors.textSecondary },
  eventLocation: { fontSize: 12, color: Colors.textMuted, marginTop: 3 },
  eventDeleteBtn: { padding: Spacing.md, justifyContent: 'center' },
  // Modal
  modalContainer: { flex: 1, backgroundColor: Colors.background, padding: Spacing.md },
  handle: { width: 36, height: 4, backgroundColor: Colors.border, borderRadius: 2, alignSelf: 'center', marginBottom: Spacing.md },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.lg },
  modalTitle: { fontSize: 22, fontWeight: '800', color: Colors.textPrimary },
  modalSection: { marginBottom: Spacing.lg },
  modalLabel: { fontSize: 13, fontWeight: '600', color: Colors.textSecondary, marginBottom: 8, textTransform: 'uppercase' },
  modalInput: { backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border, borderRadius: BorderRadius.md, paddingHorizontal: Spacing.md, paddingVertical: 12, fontSize: 15, color: Colors.textPrimary },
  colorRow: { flexDirection: 'row', gap: Spacing.sm, flexWrap: 'wrap' },
  colorDot: { width: 36, height: 36, borderRadius: 18 },
  colorDotSelected: { borderWidth: 3, borderColor: Colors.textPrimary },
  modalSubmit: { backgroundColor: Colors.primary, borderRadius: BorderRadius.md, padding: 16, alignItems: 'center' },
  modalSubmitDisabled: { opacity: 0.5 },
  modalSubmitText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
