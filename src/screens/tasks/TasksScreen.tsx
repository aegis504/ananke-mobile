import React, { useState } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet,
  RefreshControl, Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, BorderRadius, Shadows } from '../../theme';
import { useTasks, Task } from '../../hooks/useTasks';
import { TaskCard } from '../../components/TaskCard';
import { EmptyState } from '../../components/EmptyState';
import { AddTaskModal } from './AddTaskModal';
import { TaskDetailModal } from './TaskDetailModal';

interface Props {
  userId: string;
}

type Filter = 'active' | 'overdue' | 'completed';

export function TasksScreen({ userId }: Props) {
  const { tasks, activeTasks, completedTasks, overdueTasks, loading, addTask, completeTask, deleteTask, updateTask, refetch } = useTasks(userId);
  const [filter, setFilter] = useState<Filter>('active');
  const [showAdd, setShowAdd] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const filteredTasks = filter === 'active' ? activeTasks
    : filter === 'overdue' ? overdueTasks
    : completedTasks;

  const FILTERS: { key: Filter; label: string; count: number }[] = [
    { key: 'active', label: 'Active', count: activeTasks.length },
    { key: 'overdue', label: 'Overdue', count: overdueTasks.length },
    { key: 'completed', label: 'Done', count: completedTasks.length },
  ];

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Tasks</Text>
          <Text style={styles.subtitle}>{activeTasks.length} active · {overdueTasks.length} overdue</Text>
        </View>
        <TouchableOpacity style={styles.addBtn} onPress={() => setShowAdd(true)}>
          <Ionicons name="add" size={22} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Filter tabs */}
      <View style={styles.filterRow}>
        {FILTERS.map(f => (
          <TouchableOpacity
            key={f.key}
            style={[styles.filterTab, filter === f.key && styles.filterTabActive]}
            onPress={() => setFilter(f.key)}
          >
            <Text style={[styles.filterLabel, filter === f.key && styles.filterLabelActive]}>
              {f.label}
            </Text>
            {f.count > 0 && (
              <View style={[styles.filterBadge, filter === f.key && styles.filterBadgeActive]}>
                <Text style={[styles.filterBadgeText, filter === f.key && styles.filterBadgeTextActive]}>
                  {f.count}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        ))}
      </View>

      {/* Task List */}
      <FlatList
        data={filteredTasks}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <TaskCard
            task={item}
            onComplete={completeTask}
            onDelete={deleteTask}
            onPress={setSelectedTask}
          />
        )}
        contentContainerStyle={[styles.list, filteredTasks.length === 0 && styles.listEmpty]}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />}
        ListEmptyComponent={
          <EmptyState
            emoji={filter === 'completed' ? '🎉' : filter === 'overdue' ? '✅' : '📋'}
            title={filter === 'active' ? 'No active tasks' : filter === 'overdue' ? 'No overdue tasks!' : 'No completed tasks'}
            subtitle={filter === 'active' ? 'Tap + to add your first task' : filter === 'overdue' ? 'You\'re all caught up 🎉' : 'Complete some tasks to see them here'}
          />
        }
        showsVerticalScrollIndicator={false}
      />

      {/* Add Task Modal */}
      <AddTaskModal
        visible={showAdd}
        onClose={() => setShowAdd(false)}
        onAdd={async (title, mode, minutes, priority, description, tags) => {
          await addTask(title, mode, minutes, priority, description, tags);
          setShowAdd(false);
        }}
      />

      {/* Task Detail Modal */}
      {selectedTask && (
        <TaskDetailModal
          task={selectedTask}
          onClose={() => setSelectedTask(null)}
          onComplete={async () => { await completeTask(selectedTask.id); setSelectedTask(null); }}
          onDelete={async () => { await deleteTask(selectedTask.id); setSelectedTask(null); }}
          onUpdate={async (updates) => { await updateTask(selectedTask.id, updates); }}
        />
      )}
    </SafeAreaView>
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
  subtitle: { fontSize: 13, color: Colors.textSecondary, marginTop: 2 },
  addBtn: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    ...Shadows.md,
  },
  filterRow: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.md,
    marginBottom: Spacing.sm,
    gap: Spacing.sm,
  },
  filterTab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: 8,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 6,
  },
  filterTabActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  filterLabel: { fontSize: 13, fontWeight: '600', color: Colors.textSecondary },
  filterLabelActive: { color: '#fff' },
  filterBadge: {
    backgroundColor: Colors.border,
    borderRadius: BorderRadius.full,
    minWidth: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  filterBadgeActive: { backgroundColor: 'rgba(255,255,255,0.25)' },
  filterBadgeText: { fontSize: 11, fontWeight: '700', color: Colors.textSecondary },
  filterBadgeTextActive: { color: '#fff' },
  list: { paddingTop: Spacing.sm, paddingBottom: 100 },
  listEmpty: { flex: 1 },
});
