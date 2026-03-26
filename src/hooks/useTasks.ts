import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';

export interface Task {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  mode: 'digital' | 'physical';
  deadline: string;
  completed: boolean;
  completed_at: string | null;
  enforcing: boolean;
  workflow_prepared: boolean;
  priority: string;
  tags: string[];
  created_at: string;
  updated_at: string;
  version: number;
}

export function useTasks(userId: string | undefined) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTasks = useCallback(async () => {
    if (!userId) return;
    const { data } = await supabase
      .from('tasks')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    if (data) setTasks(data as Task[]);
    setLoading(false);
  }, [userId]);

  useEffect(() => { fetchTasks(); }, [fetchTasks]);

  // Real-time subscription
  useEffect(() => {
    if (!userId) return;
    const channel = supabase
      .channel('tasks-mobile-rt')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'tasks',
        filter: `user_id=eq.${userId}`,
      }, (payload) => {
        if (payload.eventType === 'INSERT') {
          setTasks(prev => prev.some(t => t.id === payload.new.id) ? prev : [payload.new as Task, ...prev]);
        } else if (payload.eventType === 'UPDATE') {
          setTasks(prev => prev.map(t => t.id === payload.new.id ? payload.new as Task : t));
        } else if (payload.eventType === 'DELETE') {
          setTasks(prev => prev.filter(t => t.id !== (payload.old as Task).id));
        }
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [userId]);

  const addTask = async (
    title: string,
    mode: 'digital' | 'physical',
    minutes: number,
    priority: string = 'medium',
    description?: string,
    tags?: string[]
  ) => {
    if (!userId) return { error: new Error('No user') };
    const deadline = new Date(Date.now() + minutes * 60000).toISOString();
    const { data, error } = await supabase
      .from('tasks')
      .insert({
        user_id: userId,
        title: title.trim(),
        mode,
        deadline,
        priority,
        description: description || null,
        tags: tags || [],
      })
      .select()
      .single();
    if (data && !error) {
      setTasks(prev => prev.some(t => t.id === data.id) ? prev : [data as Task, ...prev]);
    }
    return { data: data as Task | null, error };
  };

  const completeTask = async (id: string) => {
    if (!userId) return;
    const { error } = await supabase
      .from('tasks')
      .update({ completed: true, completed_at: new Date().toISOString() })
      .eq('id', id)
      .eq('user_id', userId);
    if (!error) {
      setTasks(prev => prev.map(t => t.id === id ? { ...t, completed: true, completed_at: new Date().toISOString() } : t));
    }
  };

  const deleteTask = async (id: string) => {
    if (!userId) return;
    await supabase.from('tasks').delete().eq('id', id).eq('user_id', userId);
    setTasks(prev => prev.filter(t => t.id !== id));
  };

  const updateTask = async (id: string, updates: Partial<Task>) => {
    if (!userId) return { error: new Error('No user') };
    const { error } = await supabase
      .from('tasks')
      .update(updates)
      .eq('id', id)
      .eq('user_id', userId);
    if (!error) setTasks(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t));
    return { error };
  };

  const activeTasks = tasks.filter(t => !t.completed);
  const completedTasks = tasks.filter(t => t.completed);
  const overdueTasks = activeTasks.filter(t => new Date(t.deadline) < new Date());

  return { tasks, activeTasks, completedTasks, overdueTasks, loading, addTask, completeTask, deleteTask, updateTask, refetch: fetchTasks };
}
