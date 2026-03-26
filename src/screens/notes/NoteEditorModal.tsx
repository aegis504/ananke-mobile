import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  Modal, KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, BorderRadius } from '../../theme';
import { Note, Notebook } from '../../hooks/useNotes';

interface Props {
  note: Note | null;
  notebooks: Notebook[];
  defaultNotebookId?: string | null;
  onSave: (title: string, content: string, notebookId?: string) => Promise<void>;
  onClose: () => void;
}

export function NoteEditorModal({ note, notebooks, defaultNotebookId, onSave, onClose }: Props) {
  const [title, setTitle] = useState(note?.title || '');
  const [content, setContent] = useState(note?.content || '');
  const [notebookId, setNotebookId] = useState(defaultNotebookId || note?.notebook_id || '');
  const [loading, setLoading] = useState(false);
  const [showNotebookPicker, setShowNotebookPicker] = useState(false);

  const handleSave = async () => {
    if (!title.trim() && !content.trim()) { onClose(); return; }
    setLoading(true);
    await onSave(title.trim() || 'Untitled', content, notebookId || undefined);
    setLoading(false);
  };

  const selectedNotebook = notebooks.find(nb => nb.id === notebookId);

  return (
    <Modal visible animationType="slide" presentationStyle="fullScreen" onRequestClose={handleSave}>
      <SafeAreaView style={styles.safe}>
        <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={handleSave} style={styles.backBtn}>
              <Ionicons name="chevron-left" size={24} color={Colors.primary} />
            </TouchableOpacity>
            <View style={styles.headerMeta}>
              <TouchableOpacity
                style={styles.notebookSelector}
                onPress={() => setShowNotebookPicker(true)}
              >
                <Ionicons name="folder-outline" size={14} color={Colors.textMuted} />
                <Text style={styles.notebookSelectorText}>
                  {selectedNotebook ? selectedNotebook.name : 'No notebook'}
                </Text>
                <Ionicons name="chevron-down" size={14} color={Colors.textMuted} />
              </TouchableOpacity>
            </View>
            <TouchableOpacity
              style={[styles.saveBtn, loading && styles.saveBtnDisabled]}
              onPress={handleSave}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.saveBtnText}>Save</Text>
              )}
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.editor} keyboardShouldPersistTaps="handled">
            <TextInput
              style={styles.titleInput}
              placeholder="Title"
              placeholderTextColor={Colors.textMuted}
              value={title}
              onChangeText={setTitle}
              multiline
              maxLength={200}
            />
            <TextInput
              style={styles.contentInput}
              placeholder="Start writing..."
              placeholderTextColor={Colors.textMuted}
              value={content}
              onChangeText={setContent}
              multiline
              textAlignVertical="top"
            />
          </ScrollView>

          {/* Notebook picker overlay */}
          {showNotebookPicker && (
            <View style={styles.pickerOverlay}>
              <View style={styles.picker}>
                <Text style={styles.pickerTitle}>Choose Notebook</Text>
                <TouchableOpacity
                  style={[styles.pickerItem, !notebookId && styles.pickerItemActive]}
                  onPress={() => { setNotebookId(''); setShowNotebookPicker(false); }}
                >
                  <Text style={[styles.pickerItemText, !notebookId && styles.pickerItemTextActive]}>No notebook</Text>
                </TouchableOpacity>
                {notebooks.map(nb => (
                  <TouchableOpacity
                    key={nb.id}
                    style={[styles.pickerItem, notebookId === nb.id && styles.pickerItemActive]}
                    onPress={() => { setNotebookId(nb.id); setShowNotebookPicker(false); }}
                  >
                    <Text style={[styles.pickerItemText, notebookId === nb.id && styles.pickerItemTextActive]}>
                      {nb.icon ? `${nb.icon} ` : ''}{nb.name}
                    </Text>
                  </TouchableOpacity>
                ))}
                <TouchableOpacity style={styles.pickerCancel} onPress={() => setShowNotebookPicker(false)}>
                  <Text style={styles.pickerCancelText}>Cancel</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  flex: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm, borderBottomWidth: 1, borderBottomColor: Colors.border },
  backBtn: { padding: 4, marginRight: Spacing.sm },
  headerMeta: { flex: 1 },
  notebookSelector: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  notebookSelectorText: { fontSize: 13, color: Colors.textMuted },
  saveBtn: { backgroundColor: Colors.primary, paddingHorizontal: Spacing.md, paddingVertical: 8, borderRadius: BorderRadius.md },
  saveBtnDisabled: { opacity: 0.6 },
  saveBtnText: { color: '#fff', fontSize: 14, fontWeight: '700' },
  editor: { flex: 1, padding: Spacing.md },
  titleInput: { fontSize: 24, fontWeight: '800', color: Colors.textPrimary, marginBottom: Spacing.md, lineHeight: 32 },
  contentInput: { fontSize: 16, color: Colors.textPrimary, lineHeight: 26, minHeight: 400 },
  pickerOverlay: { position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  picker: { backgroundColor: Colors.surface, borderTopLeftRadius: BorderRadius.xl, borderTopRightRadius: BorderRadius.xl, padding: Spacing.lg },
  pickerTitle: { fontSize: 16, fontWeight: '700', color: Colors.textPrimary, marginBottom: Spacing.md },
  pickerItem: { paddingVertical: 14, paddingHorizontal: Spacing.md, borderRadius: BorderRadius.md, marginBottom: 4 },
  pickerItemActive: { backgroundColor: Colors.primary + '15' },
  pickerItemText: { fontSize: 15, color: Colors.textPrimary },
  pickerItemTextActive: { color: Colors.primary, fontWeight: '700' },
  pickerCancel: { marginTop: Spacing.sm, paddingVertical: 14, alignItems: 'center' },
  pickerCancelText: { fontSize: 15, color: Colors.textSecondary, fontWeight: '600' },
});
