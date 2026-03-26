import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, BorderRadius, Shadows } from '../theme';
import { Task } from '../hooks/useTasks';
import { formatDistanceToNow, isPast } from 'date-fns';

interface Props {
  task: Task;
  onComplete: (id: string) => void;
  onDelete: (id: string) => void;
  onPress?: (task: Task) => void;
}

const PRIORITY_COLORS: Record<string, string> = {
  high: Colors.priorityHigh,
  medium: Colors.priorityMedium,
  low: Colors.priorityLow,
  urgent: Colors.danger,
};

const MODE_ICONS: Record<string, string> = {
  digital: 'laptop-outline',
  physical: 'body-outline',
};

export function TaskCard({ task, onComplete, onDelete, onPress }: Props) {
  const deadline = new Date(task.deadline);
  const isOverdue = isPast(deadline) && !task.completed;
  const timeLeft = formatDistanceToNow(deadline, { addSuffix: true });
  const priorityColor = PRIORITY_COLORS[task.priority] || Colors.textMuted;

  return (
    <TouchableOpacity
      style={[styles.card, task.completed && styles.completed]}
      onPress={() => onPress?.(task)}
      activeOpacity={0.7}
    >
      {/* Priority stripe */}
      <View style={[styles.priorityStripe, { backgroundColor: priorityColor }]} />

      <View style={styles.content}>
        <View style={styles.header}>
          {/* Complete button */}
          <TouchableOpacity
            style={[styles.checkbox, task.completed && styles.checkboxDone]}
            onPress={() => !task.completed && onComplete(task.id)}
          >
            {task.completed && <Ionicons name="checkmark" size={14} color="#fff" />}
          </TouchableOpacity>

          <View style={styles.titleContainer}>
            <Text style={[styles.title, task.completed && styles.titleDone]} numberOfLines={2}>
              {task.title}
            </Text>
            {task.description ? (
              <Text style={styles.description} numberOfLines={1}>{task.description}</Text>
            ) : null}
          </View>

          {/* Delete */}
          <TouchableOpacity style={styles.deleteBtn} onPress={() => onDelete(task.id)}>
            <Ionicons name="trash-outline" size={16} color={Colors.textMuted} />
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          {/* Mode badge */}
          <View style={[styles.badge, { backgroundColor: task.mode === 'digital' ? '#EDE9FE' : '#DBEAFE' }]}>
            <Ionicons
              name={MODE_ICONS[task.mode] as any}
              size={11}
              color={task.mode === 'digital' ? Colors.digital : Colors.physical}
            />
            <Text style={[styles.badgeText, { color: task.mode === 'digital' ? Colors.digital : Colors.physical }]}>
              {task.mode}
            </Text>
          </View>

          {/* Tags */}
          {task.tags?.slice(0, 2).map(tag => (
            <View key={tag} style={styles.tag}>
              <Text style={styles.tagText}>#{tag}</Text>
            </View>
          ))}

          {/* Deadline */}
          <View style={styles.deadline}>
            <Ionicons
              name={isOverdue ? 'alert-circle-outline' : 'time-outline'}
              size={12}
              color={isOverdue ? Colors.danger : Colors.textMuted}
            />
            <Text style={[styles.deadlineText, isOverdue && styles.overdueText]}>
              {timeLeft}
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    marginHorizontal: Spacing.md,
    marginBottom: Spacing.sm,
    overflow: 'hidden',
    ...Shadows.sm,
  },
  completed: {
    opacity: 0.6,
  },
  priorityStripe: {
    width: 4,
  },
  content: {
    flex: 1,
    padding: Spacing.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: Spacing.sm,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: BorderRadius.full,
    borderWidth: 2,
    borderColor: Colors.border,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.sm,
    marginTop: 1,
    flexShrink: 0,
  },
  checkboxDone: {
    backgroundColor: Colors.success,
    borderColor: Colors.success,
  },
  titleContainer: {
    flex: 1,
    marginRight: Spacing.sm,
  },
  title: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.textPrimary,
    lineHeight: 21,
  },
  titleDone: {
    textDecorationLine: 'line-through',
    color: Colors.textMuted,
  },
  description: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  deleteBtn: {
    padding: 4,
    flexShrink: 0,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: BorderRadius.full,
    gap: 3,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '600',
  },
  tag: {
    backgroundColor: Colors.borderLight,
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: BorderRadius.full,
  },
  tagText: {
    fontSize: 11,
    color: Colors.textSecondary,
  },
  deadline: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 'auto',
    gap: 3,
  },
  deadlineText: {
    fontSize: 11,
    color: Colors.textMuted,
  },
  overdueText: {
    color: Colors.danger,
    fontWeight: '600',
  },
});
