import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  Modal, KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, BorderRadius, Shadows } from '../../theme';

interface Props {
  visible: boolean;
  onClose: () => void;
  onAdd: (title: string, mode: 'digital' | 'physical', minutes: number, priority: string, description?: string, tags?: string[]) => Promise<void>;
}

const PRIORITIES = ['low', 'medium', 'high', 'urgent'];
const PRIORITY_COLORS: Record<string, string> = {
  low: Colors.priorityLow,
  medium: Colors.priorityMedium,
  high: Colors.priorityHigh,
  urgent: Colors.danger,
};

const QUICK_DEADLINES = [
  { label: '30 min', value: 30 },
  { label: '1 hr', value: 60 },
  { label: '2 hrs', value: 120 },
  { label: '1 day', value: 1440 },
  { label: '3 days', value: 4320 },
  { label: '1 week', value: 10080 },
];

export function AddTaskModal({ visible, onClose, onAdd }: Props) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [mode, setMode] = useState<'digital' | 'physical'>('digital');
  const [priority, setPriority] = useState('medium');
  const [deadlineMinutes, setDeadlineMinutes] = useState(60);
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const handleAddTag = () => {
    const tag = tagInput.trim().toLowerCase().replace(/[^a-z0-9]/g, '');
    if (tag && !tags.includes(tag)) {
      setTags(prev => [...prev, tag]);
      setTagInput('');
    }
  };

  const handleSubmit = async () => {
    if (!title.trim()) return;
    setLoading(true);
    await onAdd(title, mode, deadlineMinutes, priority, description || undefined, tags.length > 0 ? tags : undefined);
    setLoading(false);
    // Reset
    setTitle('');
    setDescription('');
    setMode('digital');
    setPriority('medium');
    setDeadlineMinutes(60);
    setTags([]);
    setTagInput('');
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.container}>
          {/* Handle */}
          <View style={styles.handle} />

          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>New Task</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color={Colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
            {/* Title */}
            <View style={styles.section}>
              <Text style={styles.label}>Task title *</Text>
              <TextInput
                style={styles.input}
                placeholder="What needs to be done?"
                placeholderTextColor={Colors.textMuted}
                value={title}
                onChangeText={setTitle}
                autoFocus
                maxLength={200}
              />
            </View>

            {/* Description */}
            <View style={styles.section}>
              <Text style={styles.label}>Description (optional)</Text>
              <TextInput
                style={[styles.input, styles.multiline]}
                placeholder="Add more details..."
                placeholderTextColor={Colors.textMuted}
                value={description}
                onChangeText={setDescription}
                multiline
                numberOfLines={3}
                maxLength={1000}
              />
            </View>

            {/* Mode */}
            <View style={styles.section}>
              <Text style={styles.label}>Mode</Text>
              <View style={styles.toggleRow}>
                {(['digital', 'physical'] as const).map(m => (
                  <TouchableOpacity
                    key={m}
                    style={[styles.toggleBtn, mode === m && styles.toggleBtnActive]}
                    onPress={() => setMode(m)}
                  >
                    <Ionicons
                      name={m === 'digital' ? 'laptop-outline' : 'body-outline'}
                      size={18}
                      color={mode === m ? '#fff' : Colors.textSecondary}
                    />
                    <Text style={[styles.toggleLabel, mode === m && styles.toggleLabelActive]}>
                      {m.charAt(0).toUpperCase() + m.slice(1)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Priority */}
            <View style={styles.section}>
              <Text style={styles.label}>Priority</Text>
              <View style={styles.priorityRow}>
                {PRIORITIES.map(p => (
                  <TouchableOpacity
                    key={p}
                    style={[
                      styles.priorityBtn,
                      priority === p && { backgroundColor: PRIORITY_COLORS[p], borderColor: PRIORITY_COLORS[p] },
                    ]}
                    onPress={() => setPriority(p)}
                  >
                    <Text style={[styles.priorityLabel, priority === p && styles.priorityLabelActive]}>
                      {p}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Deadline */}
            <View style={styles.section}>
              <Text style={styles.label}>Deadline</Text>
              <View style={styles.deadlineGrid}>
                {QUICK_DEADLINES.map(d => (
                  <TouchableOpacity
                    key={d.value}
                    style={[styles.deadlineBtn, deadlineMinutes === d.value && styles.deadlineBtnActive]}
                    onPress={() => setDeadlineMinutes(d.value)}
                  >
                    <Text style={[styles.deadlineLabel, deadlineMinutes === d.value && styles.deadlineLabelActive]}>
                      {d.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Tags */}
            <View style={styles.section}>
              <Text style={styles.label}>Tags</Text>
              <View style={styles.tagInputRow}>
                <TextInput
                  style={[styles.input, styles.tagInput]}
                  placeholder="Add tag..."
                  placeholderTextColor={Colors.textMuted}
                  value={tagInput}
                  onChangeText={setTagInput}
                  onSubmitEditing={handleAddTag}
                  autoCapitalize="none"
                  maxLength={30}
                />
                <TouchableOpacity style={styles.tagAddBtn} onPress={handleAddTag}>
                  <Ionicons name="add" size={20} color={Colors.primary} />
                </TouchableOpacity>
              </View>
              {tags.length > 0 && (
                <View style={styles.tagList}>
                  {tags.map(tag => (
                    <TouchableOpacity
                      key={tag}
                      style={styles.tagChip}
                      onPress={() => setTags(prev => prev.filter(t => t !== tag))}
                    >
                      <Text style={styles.tagChipText}>#{tag}</Text>
                      <Ionicons name="close" size={12} color={Colors.textSecondary} />
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>

            {/* Submit */}
            <TouchableOpacity
              style={[styles.submitBtn, (!title.trim() || loading) && styles.submitDisabled]}
              onPress={handleSubmit}
              disabled={!title.trim() || loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <>
                  <Ionicons name="checkmark-circle" size={20} color="#fff" />
                  <Text style={styles.submitText}>Create Task</Text>
                </>
              )}
            </TouchableOpacity>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  container: { flex: 1, backgroundColor: Colors.background, padding: Spacing.md },
  handle: { width: 36, height: 4, backgroundColor: Colors.border, borderRadius: 2, alignSelf: 'center', marginBottom: Spacing.md },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.lg },
  title: { fontSize: 22, fontWeight: '800', color: Colors.textPrimary },
  section: { marginBottom: Spacing.lg },
  label: { fontSize: 13, fontWeight: '600', color: Colors.textSecondary, marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 },
  input: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: 12,
    fontSize: 15,
    color: Colors.textPrimary,
  },
  multiline: { height: 80, textAlignVertical: 'top' },
  toggleRow: { flexDirection: 'row', gap: Spacing.sm },
  toggleBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
    gap: 6,
  },
  toggleBtnActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  toggleLabel: { fontSize: 14, fontWeight: '600', color: Colors.textSecondary },
  toggleLabelActive: { color: '#fff' },
  priorityRow: { flexDirection: 'row', gap: Spacing.sm },
  priorityBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
    alignItems: 'center',
  },
  priorityLabel: { fontSize: 12, fontWeight: '600', color: Colors.textSecondary, textTransform: 'capitalize' },
  priorityLabelActive: { color: '#fff' },
  deadlineGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  deadlineBtn: {
    paddingHorizontal: Spacing.md,
    paddingVertical: 10,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  deadlineBtnActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  deadlineLabel: { fontSize: 13, fontWeight: '600', color: Colors.textSecondary },
  deadlineLabelActive: { color: '#fff' },
  tagInputRow: { flexDirection: 'row', gap: Spacing.sm, alignItems: 'center' },
  tagInput: { flex: 1 },
  tagAddBtn: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tagList: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm, marginTop: Spacing.sm },
  tagChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.borderLight,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: BorderRadius.full,
    gap: 4,
  },
  tagChipText: { fontSize: 12, color: Colors.textSecondary, fontWeight: '600' },
  submitBtn: {
    flexDirection: 'row',
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.md,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 40,
  },
  submitDisabled: { opacity: 0.5 },
  submitText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
