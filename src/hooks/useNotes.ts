import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';

export interface Note {
  id: string;
  user_id: string;
  notebook_id: string | null;
  title: string;
  content: string | null;
  pinned: boolean;
  tags: string[];
  created_at: string;
  updated_at: string;
}

export interface Notebook {
  id: string;
  user_id: string;
  name: string;
  icon: string | null;
  color: string | null;
  created_at: string;
}

export function useNotes(userId: string | undefined) {
  const [notes, setNotes] = useState<Note[]>([]);
  const [notebooks, setNotebooks] = useState<Notebook[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAll = useCallback(async () => {
    if (!userId) return;
    const [notesRes, notebooksRes] = await Promise.all([
      supabase.from('notes').select('*').eq('user_id', userId).order('updated_at', { ascending: false }),
      supabase.from('notebooks').select('*').eq('user_id', userId).order('created_at'),
    ]);
    if (notesRes.data) setNotes(notesRes.data as Note[]);
    if (notebooksRes.data) setNotebooks(notebooksRes.data as Notebook[]);
    setLoading(false);
  }, [userId]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  useEffect(() => {
    if (!userId) return;
    const channel = supabase
      .channel('notes-mobile-rt')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'notes', filter: `user_id=eq.${userId}` }, () => fetchAll())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'notebooks', filter: `user_id=eq.${userId}` }, () => fetchAll())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [userId, fetchAll]);

  const addNote = async (title: string, notebookId?: string, content?: string) => {
    if (!userId) return;
    const { data, error } = await supabase.from('notes').insert({
      user_id: userId,
      title: title.trim() || 'Untitled',
      notebook_id: notebookId || null,
      content: content || null,
    }).select().single();
    if (data && !error) setNotes(prev => [data as Note, ...prev]);
    return { data: data as Note | null, error };
  };

  const updateNote = async (id: string, updates: Partial<Note>) => {
    if (!userId) return;
    const { error } = await supabase.from('notes').update(updates).eq('id', id).eq('user_id', userId);
    if (!error) setNotes(prev => prev.map(n => n.id === id ? { ...n, ...updates } : n));
    return { error };
  };

  const deleteNote = async (id: string) => {
    if (!userId) return;
    await supabase.from('notes').delete().eq('id', id).eq('user_id', userId);
    setNotes(prev => prev.filter(n => n.id !== id));
  };

  const addNotebook = async (name: string, color?: string) => {
    if (!userId) return;
    const { data, error } = await supabase.from('notebooks').insert({
      user_id: userId,
      name: name.trim(),
      color: color || '#1A1A2E',
    }).select().single();
    if (data && !error) setNotebooks(prev => [...prev, data as Notebook]);
    return { data: data as Notebook | null, error };
  };

  const pinnedNotes = notes.filter(n => n.pinned);
  const recentNotes = notes.filter(n => !n.pinned).slice(0, 20);

  return { notes, notebooks, pinnedNotes, recentNotes, loading, addNote, updateNote, deleteNote, addNotebook, refetch: fetchAll };
}
