import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert, TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, BorderRadius, Shadows } from '../../theme';
import { useProfile } from '../../hooks/useProfile';
import { useAuth } from '../../hooks/useAuth';
import type { User } from '@supabase/supabase-js';

interface Props {
  userId: string;
  user: User;
}

export function ProfileScreen({ userId, user }: Props) {
  const { profile, updateProfile } = useProfile(userId);
  const { signOut } = useAuth();
  const [editingName, setEditingName] = useState(false);
  const [nameInput, setNameInput] = useState('');

  const handleSignOut = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign Out', style: 'destructive', onPress: signOut },
    ]);
  };

  const handleSaveName = async () => {
    if (nameInput.trim()) {
      await updateProfile({ full_name: nameInput.trim() });
    }
    setEditingName(false);
  };

  const displayName = profile?.full_name || user.email?.split('@')[0] || 'User';
  const initials = displayName.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2);

  const getPlanLabel = (plan: string | null) => {
    if (!plan) return 'Free';
    return plan.charAt(0).toUpperCase() + plan.slice(1);
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Profile</Text>
        </View>

        {/* Avatar & Name */}
        <View style={styles.profileCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{initials}</Text>
          </View>
          <View style={styles.profileInfo}>
            {editingName ? (
              <View style={styles.nameEditRow}>
                <TextInput
                  style={styles.nameInput}
                  value={nameInput}
                  onChangeText={setNameInput}
                  autoFocus
                  onSubmitEditing={handleSaveName}
                />
                <TouchableOpacity onPress={handleSaveName} style={styles.nameSaveBtn}>
                  <Ionicons name="checkmark" size={20} color={Colors.primary} />
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity
                style={styles.nameRow}
                onPress={() => { setNameInput(profile?.full_name || ''); setEditingName(true); }}
              >
                <Text style={styles.name}>{displayName}</Text>
                <Ionicons name="pencil-outline" size={16} color={Colors.textMuted} />
              </TouchableOpacity>
            )}
            <Text style={styles.email}>{user.email}</Text>
          </View>
        </View>

        {/* Plan badge */}
        {profile && (
          <View style={styles.planCard}>
            <View style={styles.planInfo}>
              <Ionicons name="star" size={18} color={Colors.accent} />
              <View>
                <Text style={styles.planLabel}>Current Plan</Text>
                <Text style={styles.planValue}>{getPlanLabel(profile.plan)}</Text>
              </View>
            </View>
            {profile.trial_ends_at && (
              <Text style={styles.trialText}>
                Trial ends {new Date(profile.trial_ends_at).toLocaleDateString()}
              </Text>
            )}
          </View>
        )}

        {/* Info rows */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>
          <View style={styles.infoCard}>
            <InfoRow icon="mail-outline" label="Email" value={user.email || ''} />
            <InfoRow icon="calendar-outline" label="Member since" value={new Date(user.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })} />
            {profile?.company && <InfoRow icon="business-outline" label="Company" value={profile.company} />}
            {profile?.use_case && <InfoRow icon="briefcase-outline" label="Use case" value={profile.use_case} />}
          </View>
        </View>

        {/* App info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>App</Text>
          <View style={styles.infoCard}>
            <InfoRow icon="phone-portrait-outline" label="Platform" value="Ananke Mobile" />
            <InfoRow icon="code-slash-outline" label="Version" value="1.0.0" />
          </View>
        </View>

        {/* Actions */}
        <View style={styles.section}>
          <TouchableOpacity style={styles.dangerBtn} onPress={handleSignOut}>
            <Ionicons name="log-out-outline" size={20} color={Colors.danger} />
            <Text style={styles.dangerBtnText}>Sign Out</Text>
          </TouchableOpacity>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>⚡ Ananke — Productivity Enforcement Engine</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function InfoRow({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <View style={styles.infoRow}>
      <Ionicons name={icon as any} size={18} color={Colors.textSecondary} />
      <View style={styles.infoRowContent}>
        <Text style={styles.infoLabel}>{label}</Text>
        <Text style={styles.infoValue} numberOfLines={1}>{value}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  header: { paddingHorizontal: Spacing.md, paddingTop: Spacing.md, paddingBottom: Spacing.sm },
  title: { fontSize: 28, fontWeight: '800', color: Colors.textPrimary },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: Spacing.md,
    marginBottom: Spacing.md,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    gap: Spacing.md,
    ...Shadows.sm,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },
  avatarText: { fontSize: 24, fontWeight: '800', color: '#fff' },
  profileInfo: { flex: 1 },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 },
  name: { fontSize: 20, fontWeight: '700', color: Colors.textPrimary },
  email: { fontSize: 13, color: Colors.textSecondary },
  nameEditRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 },
  nameInput: {
    flex: 1,
    fontSize: 18,
    fontWeight: '700',
    color: Colors.textPrimary,
    borderBottomWidth: 2,
    borderBottomColor: Colors.primary,
    paddingBottom: 4,
  },
  nameSaveBtn: { padding: 4 },
  planCard: {
    marginHorizontal: Spacing.md,
    backgroundColor: '#FEF9EC',
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: '#F5E6B8',
    marginBottom: Spacing.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  planInfo: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  planLabel: { fontSize: 11, fontWeight: '600', color: Colors.textMuted, textTransform: 'uppercase' },
  planValue: { fontSize: 16, fontWeight: '700', color: Colors.primary },
  trialText: { fontSize: 12, color: Colors.textSecondary },
  section: { paddingHorizontal: Spacing.md, marginBottom: Spacing.md },
  sectionTitle: { fontSize: 13, fontWeight: '700', color: Colors.textMuted, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: Spacing.sm },
  infoCard: { backgroundColor: Colors.surface, borderRadius: BorderRadius.md, overflow: 'hidden', ...Shadows.sm },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, padding: Spacing.md, borderBottomWidth: 1, borderBottomColor: Colors.borderLight },
  infoRowContent: { flex: 1 },
  infoLabel: { fontSize: 11, fontWeight: '600', color: Colors.textMuted, textTransform: 'uppercase', letterSpacing: 0.3 },
  infoValue: { fontSize: 14, color: Colors.textPrimary, marginTop: 1 },
  dangerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    backgroundColor: '#FEF2F2',
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  dangerBtnText: { fontSize: 15, fontWeight: '700', color: Colors.danger },
  footer: { alignItems: 'center', paddingVertical: Spacing.xl },
  footerText: { fontSize: 12, color: Colors.textMuted },
});
