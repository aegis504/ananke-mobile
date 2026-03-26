import React, { useState } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet,
  RefreshControl, TextInput, Modal, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, BorderRadius, Shadows } from '../../theme';
import { useNotes, Note, Notebook } from '../../hooks/useNotes';
import { EmptyState } from '../../components/EmptyState';
import { NoteEditorModal } from './NoteEditorModal';
import { format } from 'date-fns';

interface Props { userId: string }

export function NotesScreen({ userId }: Props) {
  const { notes, notebooks, pinnedNotes, loading, addNote, updateNote, deleteNote, addNotebook, refetch } = useNotes(userId);
  const [selectedNotebook, setSelectedNotebook] = useState<string | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [showAddNotebook, setShowAddNotebook] = useState(false);
  const [newNotebookName, setNewNotebookName] = useState('');
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => { setRefreshing(true); await refetch(); setRefreshing(false); };

  const filteredNotes = selectedNotebook
    ? notes.filter(n => n.notebook_id === selectedNotebook)
    : notes;

  const handleCreateNotebook = async () => {
    if (!newNotebookName.trim()) return;
    await addNotebook(newNotebookName);
    setNewNotebookName('');
    setShowAddNotebook(false);
  };

  const handleDeleteNote = (id: string) => {
    Alert.alert('Delete Note', 'Delete this note?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => deleteNote(id) },
    ]);
  };

  const getNotebook = (id: string | null) => notebooks.find(nb => nb.id === id);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Notes</Text>
          <Text style={styles.subtitle}>{notes.length} notes · {notebooks.length} notebooks</Text>
        </View>
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.iconBtn} onPress={() => setShowAddNotebook(true)}>
            <Ionicons name="folder-outline" size={20} color={Colors.textSecondary} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.addBtn} onPress={() => setShowAdd(true)}>
            <Ionicons name="add" size={22} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Notebook filter chips */}
      {notebooks.length > 0 && (
        <View style={styles.notebookScrollRow}>
          <TouchableOpacity
            style={[styles.nbChip, !selectedNotebook && styles.nbChipActive]}
            onPress={() => setSelectedNotebook(null)}
          >
            <Text style={[styles.nbChipText, !selectedNotebook && styles.nbChipTextActive]}>All</Text>
          </TouchableOpacity>
          {notebooks.map(nb => (
            <TouchableOpacity
              key={nb.id}
              style={[styles.nbChip, selectedNotebook === nb.id && styles.nbChipActive]}
              onPress={() => setSelectedNotebook(nb.id === selectedNotebook ? null : nb.id)}
            >
              {nb.icon && <Text style={styles.nbIcon}>{nb.icon}</Text>}
              <Text style={[styles.nbChipText, selectedNotebook === nb.id && styles.nbChipTextActive]}>
                {nb.name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* Pinned section */}
      {!selectedNotebook && pinnedNotes.length > 0 && (
        <View style={styles.sectionHeader}>
          <Ionicons name="pin" size={14} color={Colors.accent} />
          <Text style={styles.sectionTitle}>Pinned</Text>
        </View>
      )}

      <FlatList
        data={filteredNotes}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <NoteRow
            note={item}
            notebook={getNotebook(item.notebook_id)}
            onPress={() => setEditingNote(item)}
            onDelete={() => handleDeleteNote(item.id)}
            onPin={() => updateNote(item.id, { pinned: !item.pinned })}
          />
        )}
        contentContainerStyle={[styles.list, filteredNotes.length === 0 && styles.listEmpty]}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />}
        ListEmptyComponent={
          <EmptyState
            emoji="📝"
            title="No notes yet"
            subtitle={selectedNotebook ? "No notes in this notebook" : "Tap + to write your first note"}
          />
        }
        showsVerticalScrollIndicator={false}
      />

      {/* Add Note Modal */}
      {showAdd && (
        <NoteEditorModal
          note={null}
          notebooks={notebooks}
          defaultNotebookId={selectedNotebook}
          onSave={async (title, content, notebookId) => {
            await addNote(title, notebookId, content);
            setShowAdd(false);
          }}
          onClose={() => setShowAdd(false)}
        />
      )}

      {/* Edit Note Modal */}
      {editingNote && (
        <NoteEditorModal
          note={editingNote}
          notebooks={notebooks}
          defaultNotebookId={editingNote.notebook_id}
          onSave={async (title, content, notebookId) => {
            await updateNote(editingNote.id, { title, content, notebook_id: notebookId || null, updated_at: new Date().toISOString() });
            setEditingNote(null);
          }}
          onClose={() => setEditingNote(null)}
        />
      )}

      {/* Add Notebook Modal */}
      <Modal visible={showAddNotebook} transparent animationType="fade" onRequestClose={() => setShowAddNotebook(false)}>
        <View style={styles.overlay}>
          <View style={styles.dialog}>
            <Text style={styles.dialogTitle}>New Notebook</Text>
            <TextInput
              style={styles.dialogInput}
              placeholder="Notebook name..."
              placeholderTextColor={Colors.textMuted}
              value={newNotebookName}
              onChangeText={setNewNotebookName}
              autoFocus
            />
            <View style={styles.dialogActions}>
              <TouchableOpacity style={styles.dialogCancel} onPress={() => setShowAddNotebook(false)}>
                <Text style={styles.dialogCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.dialogConfirm} onPress={handleCreateNotebook}>
                <Text style={styles.dialogConfirmText}>Create</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

function NoteRow({ note, notebook, onPress, onDelete, onPin }: {
  note: Note;
  notebook?: Notebook;
  onPress: () => void;
  onDelete: () => void;
  onPin: () => void;
}) {
  return (
    <TouchableOpacity style={styles.noteCard} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.noteContent}>
        <View style={styles.noteHeader}>
          <Text style={styles.noteTitle} numberOfLines={1}>{note.title}</Text>
          <View style={styles.noteActions}>
            <TouchableOpacity onPress={onPin} style={styles.noteActionBtn}>
              <Ionicons name={note.pinned ? 'pin' : 'pin-outline'} size={16} color={note.pinned ? Colors.accent : Colors.textMuted} />
            </TouchableOpacity>
            <TouchableOpacity onPress={onDelete} style={styles.noteActionBtn}>
              <Ionicons name="trash-outline" size={16} color={Colors.textMuted} />
            </TouchableOpacity>
          </View>
        </View>

        {note.content ? (
          <Text style={styles.notePreview} numberOfLines={2}>{note.content}</Text>
        ) : null}

        <View style={styles.noteMeta}>
          {notebook && (
            <View style={styles.notebookTag}>
              <Ionicons name="folder-outline" size={12} color={Colors.textMuted} />
              <Text style={styles.notebookTagText}>{notebook.name}</Text>
            </View>
          )}
          {note.tags?.slice(0, 2).map(tag => (
            <View key={tag} style={styles.noteTag}>
              <Text style={styles.noteTagText}>#{tag}</Text>
            </View>
          ))}
          <Text style={styles.noteDate}>{format(new Date(note.updated_at), 'MMM d')}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: Spacing.md, paddingTop: Spacing.md, paddingBottom: Spacing.sm },
  title: { fontSize: 28, fontWeight: '800', color: Colors.textPrimary },
  subtitle: { fontSize: 13, color: Colors.textSecondary, marginTop: 2 },
  headerActions: { flexDirection: 'row', gap: Spacing.sm, alignItems: 'center' },
  iconBtn: { width: 40, height: 40, borderRadius: BorderRadius.full, backgroundColor: Colors.surface, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: Colors.border },
  addBtn: { width: 44, height: 44, borderRadius: BorderRadius.full, backgroundColor: Colors.primary, justifyContent: 'center', alignItems: 'center', ...Shadows.md },
  notebookScrollRow: { flexDirection: 'row', paddingHorizontal: Spacing.md, marginBottom: Spacing.sm, gap: 8, flexWrap: 'wrap' },
  nbChip: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: Spacing.md, paddingVertical: 7, borderRadius: BorderRadius.full, backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border, gap: 4 },
  nbChipActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  nbIcon: { fontSize: 13 },
  nbChipText: { fontSize: 13, fontWeight: '600', color: Colors.textSecondary },
  nbChipTextActive: { color: '#fff' },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: Spacing.md, marginBottom: 4, gap: 4 },
  sectionTitle: { fontSize: 12, fontWeight: '700', color: Colors.accent, textTransform: 'uppercase', letterSpacing: 0.5 },
  list: { paddingTop: Spacing.sm, paddingBottom: 100 },
  listEmpty: { flex: 1 },
  noteCard: { backgroundColor: Colors.surface, marginHorizontal: Spacing.md, marginBottom: Spacing.sm, borderRadius: BorderRadius.md, overflow: 'hidden', ...Shadows.sm },
  noteContent: { padding: Spacing.md },
  noteHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  noteTitle: { flex: 1, fontSize: 16, fontWeight: '700', color: Colors.textPrimary },
  noteActions: { flexDirection: 'row', gap: 4 },
  noteActionBtn: { padding: 4 },
  notePreview: { fontSize: 13, color: Colors.textSecondary, lineHeight: 18, marginBottom: 8 },
  noteMeta: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 6 },
  notebookTag: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  notebookTagText: { fontSize: 11, color: Colors.textMuted },
  noteTag: { backgroundColor: Colors.borderLight, paddingHorizontal: 7, paddingVertical: 2, borderRadius: BorderRadius.full },
  noteTagText: { fontSize: 11, color: Colors.textSecondary },
  noteDate: { fontSize: 11, color: Colors.textMuted, marginLeft: 'auto' },
  // Dialog
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', padding: Spacing.lg },
  dialog: { backgroundColor: Colors.surface, borderRadius: BorderRadius.xl, padding: Spacing.lg, width: '100%', ...Shadows.lg },
  dialogTitle: { fontSize: 18, fontWeight: '700', color: Colors.textPrimary, marginBottom: Spacing.md },
  dialogInput: { backgroundColor: Colors.background, borderWidth: 1, borderColor: Colors.border, borderRadius: BorderRadius.md, paddingHorizontal: Spacing.md, paddingVertical: 12, fontSize: 15, color: Colors.textPrimary, marginBottom: Spacing.md },
  dialogActions: { flexDirection: 'row', gap: Spacing.sm },
  dialogCancel: { flex: 1, paddingVertical: 12, borderRadius: BorderRadius.md, backgroundColor: Colors.background, alignItems: 'center' },
  dialogCancelText: { fontSize: 15, fontWeight: '600', color: Colors.textSecondary },
  dialogConfirm: { flex: 1, paddingVertical: 12, borderRadius: BorderRadius.md, backgroundColor: Colors.primary, alignItems: 'center' },
  dialogConfirmText: { fontSize: 15, fontWeight: '600', color: '#fff' },
});
