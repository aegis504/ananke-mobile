import React from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, Modal, ScrollView, Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Spacing, BorderRadius, Shadows } from '../../theme';
import { Task } from '../../hooks/useTasks';
import { format, formatDistanceToNow, isPast } from 'date-fns';

interface Props {
  task: Task;
  onClose: () => void;
  onComplete: () => Promise<void>;
  onDelete: () => Promise<void>;
  onUpdate: (updates: Partial<Task>) => Promise<void>;
}

const PRIORITY_COLORS: Record<string, string> = {
  low: Colors.priorityLow,
  medium: Colors.priorityMedium,
  high: Colors.priorityHigh,
  urgent: Colors.danger,
};

export function TaskDetailModal({ task, onClose, onComplete, onDelete, onUpdate }: Props) {
  const deadline = new Date(task.deadline);
  const isOverdue = isPast(deadline) && !task.completed;

  const handleDelete = () => {
    Alert.alert('Delete Task', 'Are you sure you want to delete this task?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: onDelete },
    ]);
  };

  const toggleMode = () => {
    onUpdate({ mode: task.mode === 'digital' ? 'physical' : 'digital' });
  };

  return (
    <Modal visible animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <SafeAreaView style={styles.safe}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.backBtn}>
            <Ionicons name="chevron-down" size={24} color={Colors.textSecondary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Task Details</Text>
          <TouchableOpacity onPress={handleDelete} style={styles.deleteBtn}>
            <Ionicons name="trash-outline" size={20} color={Colors.danger} />
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          {/* Title */}
          <Text style={[styles.title, task.completed && styles.titleDone]}>{task.title}</Text>

          {/* Description */}
          {task.description ? (
            <Text style={styles.description}>{task.description}</Text>
          ) : null}

          {/* Status row */}
          <View style={styles.statusRow}>
            {/* Priority badge */}
            <View style={[styles.badge, { backgroundColor: PRIORITY_COLORS[task.priority] + '20' }]}>
              <View style={[styles.dot, { backgroundColor: PRIORITY_COLORS[task.priority] }]} />
              <Text style={[styles.badgeText, { color: PRIORITY_COLORS[task.priority] }]}>
                {task.priority}
              </Text>
            </View>

            {/* Mode badge */}
            <TouchableOpacity
              style={[styles.badge, { backgroundColor: task.mode === 'digital' ? '#EDE9FE' : '#DBEAFE' }]}
              onPress={toggleMode}
            >
              <Ionicons
                name={task.mode === 'digital' ? 'laptop-outline' : 'body-outline'}
                size={14}
                color={task.mode === 'digital' ? Colors.digital : Colors.physical}
              />
              <Text style={[styles.badgeText, { color: task.mode === 'digital' ? Colors.digital : Colors.physical }]}>
                {task.mode}
              </Text>
            </TouchableOpacity>

            {task.completed && (
              <View style={[styles.badge, { backgroundColor: '#DCFCE7' }]}>
                <Ionicons name="checkmark-circle" size={14} color={Colors.success} />
                <Text style={[styles.badgeText, { color: Colors.success }]}>Completed</Text>
              </View>
            )}
          </View>

          {/* Deadline card */}
          <View style={[styles.infoCard, isOverdue && styles.infoCardDanger]}>
            <Ionicons
              name={isOverdue ? 'alert-circle' : 'time'}
              size={20}
              color={isOverdue ? Colors.danger : Colors.textSecondary}
            />
            <View style={styles.infoCardContent}>
              <Text style={[styles.infoCardLabel, isOverdue && { color: Colors.danger }]}>
                {isOverdue ? 'OVERDUE' : 'DEADLINE'}
              </Text>
              <Text style={[styles.infoCardValue, isOverdue && { color: Colors.danger }]}>
                {format(deadline, 'MMM d, yyyy · h:mm a')}
              </Text>
              <Text style={[styles.infoCardMeta, isOverdue && { color: Colors.danger }]}>
                {formatDistanceToNow(deadline, { addSuffix: true })}
              </Text>
            </View>
          </View>

          {/* Created */}
          <View style={styles.infoCard}>
            <Ionicons name="calendar-outline" size={20} color={Colors.textSecondary} />
            <View style={styles.infoCardContent}>
              <Text style={styles.infoCardLabel}>CREATED</Text>
              <Text style={styles.infoCardValue}>
                {format(new Date(task.created_at), 'MMM d, yyyy · h:mm a')}
              </Text>
            </View>
          </View>

          {/* Tags */}
          {task.tags && task.tags.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>Tags</Text>
              <View style={styles.tagRow}>
                {task.tags.map(tag => (
                  <View key={tag} style={styles.tagChip}>
                    <Text style={styles.tagText}>#{tag}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* AI/Workflow info */}
          {task.enforcing && (
            <View style={[styles.infoCard, { backgroundColor: '#FEF3C7' }]}>
              <Ionicons name="shield-checkmark" size={20} color={Colors.warning} />
              <View style={styles.infoCardContent}>
                <Text style={[styles.infoCardLabel, { color: Colors.warning }]}>ENFORCED</Text>
                <Text style={styles.infoCardValue}>This task is being enforced by Ananke</Text>
              </View>
            </View>
          )}
        </ScrollView>

        {/* Complete button */}
        {!task.completed && (
          <View style={styles.footer}>
            <TouchableOpacity style={styles.completeBtn} onPress={onComplete}>
              <Ionicons name="checkmark-circle" size={22} color="#fff" />
              <Text style={styles.completeBtnText}>Mark as Complete</Text>
            </TouchableOpacity>
          </View>
        )}
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  backBtn: { padding: 4, marginRight: Spacing.sm },
  headerTitle: { flex: 1, fontSize: 17, fontWeight: '700', color: Colors.textPrimary, textAlign: 'center' },
  deleteBtn: { padding: 4 },
  content: { padding: Spacing.md, paddingBottom: 40 },
  title: { fontSize: 24, fontWeight: '800', color: Colors.textPrimary, marginBottom: Spacing.sm, lineHeight: 32 },
  titleDone: { textDecorationLine: 'line-through', color: Colors.textMuted },
  description: { fontSize: 15, color: Colors.textSecondary, lineHeight: 22, marginBottom: Spacing.md },
  statusRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: Spacing.md },
  badge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 5, borderRadius: BorderRadius.full, gap: 4 },
  dot: { width: 8, height: 8, borderRadius: 4 },
  badgeText: { fontSize: 12, fontWeight: '600', textTransform: 'capitalize' },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    gap: Spacing.sm,
    ...Shadows.sm,
  },
  infoCardDanger: { backgroundColor: '#FEF2F2' },
  infoCardContent: { flex: 1 },
  infoCardLabel: { fontSize: 11, fontWeight: '700', color: Colors.textMuted, letterSpacing: 0.8, marginBottom: 4 },
  infoCardValue: { fontSize: 15, fontWeight: '600', color: Colors.textPrimary },
  infoCardMeta: { fontSize: 12, color: Colors.textMuted, marginTop: 2 },
  section: { marginTop: Spacing.md },
  sectionLabel: { fontSize: 13, fontWeight: '700', color: Colors.textSecondary, marginBottom: 8, textTransform: 'uppercase' },
  tagRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  tagChip: { backgroundColor: Colors.borderLight, paddingHorizontal: 10, paddingVertical: 6, borderRadius: BorderRadius.full },
  tagText: { fontSize: 13, color: Colors.textSecondary, fontWeight: '600' },
  footer: { padding: Spacing.md, paddingBottom: 32, borderTopWidth: 1, borderTopColor: Colors.border },
  completeBtn: {
    flexDirection: 'row',
    backgroundColor: Colors.success,
    borderRadius: BorderRadius.md,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  completeBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
