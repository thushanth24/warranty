import React, { useState } from 'react';
import { View, Text, ActivityIndicator, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useReminders } from '../../hooks/useReminders';
import ReminderFormModal, { ReminderFormValues } from '../components/ReminderFormModal';
import axios from 'axios';
import { BACKEND_URL } from '../../config/config';
import { useAuth } from '../../hooks/useAuth';
import { useQueryClient } from '@tanstack/react-query';

export default function RemindersScreen() {
  const { data: reminders, isLoading, error } = useReminders();
  const [modalVisible, setModalVisible] = useState(false);
  const [editingReminder, setEditingReminder] = useState<any | null>(null);
  const queryClient = useQueryClient();
  const { user } = useAuth();
  if (!user) {
    return <Text style={{ color: 'red', margin: 20 }}>You must be logged in to view this page.</Text>;
  }
  // TypeScript: user is guaranteed to be non-null after this point
  const safeUser = user as NonNullable<typeof user>;

  async function handleAddEditReminder(values: ReminderFormValues) {
    try {
      const payload = {
        ...values,
        userId: safeUser.id,
      };
      // user is guaranteed to be non-null here
      if (editingReminder) {
        await axios.put(`${BACKEND_URL}/api/reminders/${editingReminder.id}`, payload);
      } else {
        await axios.post(`${BACKEND_URL}/api/reminders`, payload);
      }
      setModalVisible(false);
      setEditingReminder(null);
      queryClient.invalidateQueries({ queryKey: ['reminders', safeUser.id] });
    } catch (e: any) {
      Alert.alert('Error', 'Failed to save reminder.');
    }
  }

  function openAddModal() {
    setEditingReminder(null);
    setModalVisible(true);
  }

  function openEditModal(rem: any) {
    setEditingReminder(rem);
    setModalVisible(true);
  }

  return (
    <>
      <ScrollView style={{ flex: 1, backgroundColor: '#fff' }} contentContainerStyle={{ padding: 20 }}>
        <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#222', marginBottom: 16 }}>Reminders</Text>
        <TouchableOpacity
          style={{ backgroundColor: '#2563eb', padding: 12, borderRadius: 8, marginBottom: 20, alignSelf: 'flex-start' }}
          onPress={openAddModal}
        >
          <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 16 }}>+ Add Reminder</Text>
        </TouchableOpacity>
        {isLoading ? (
          <ActivityIndicator size="large" color="#2563eb" style={{ marginVertical: 40 }} />
        ) : error ? (
          <Text style={{ color: 'red', marginVertical: 20 }}>Failed to load reminders</Text>
        ) : reminders && reminders.length > 0 ? (
          reminders.map((rem) => (
            <View key={rem.id} style={{ padding: 16, borderRadius: 8, backgroundColor: '#f1f5f9', marginBottom: 14 }}>
              <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#222' }}>{rem.title}</Text>
              <Text style={{ color: '#666', marginTop: 4 }}>Due: {new Date(rem.dueDate).toLocaleDateString()}</Text>
              <Text style={{ color: rem.isActive ? 'green' : '#888', marginTop: 2 }}>
                {rem.isActive ? 'Active' : 'Inactive'}
              </Text>
              <Text style={{ color: '#888', marginTop: 2 }}>Type: {typeof rem.itemType === 'string' && rem.itemType.length > 0
  ? rem.itemType.charAt(0).toUpperCase() + rem.itemType.slice(1)
  : 'Unknown'}</Text>
              <View style={{ flexDirection: 'row', justifyContent: 'flex-end', marginTop: 8 }}>
                <TouchableOpacity
                  style={{ backgroundColor: '#eab308', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 6, marginRight: 8 }}
                  onPress={() => openEditModal(rem)}
                >
                  <Text style={{ color: '#fff', fontWeight: 'bold' }}>Edit</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={{ backgroundColor: '#ef4444', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 6 }}
                  onPress={() => {
                    Alert.alert('Delete Reminder', 'Are you sure you want to delete this reminder?', [
                      { text: 'Cancel', style: 'cancel' },
                      { text: 'Delete', style: 'destructive', onPress: async () => {
                        try {
                          await axios.delete(`${BACKEND_URL}/api/reminders/${rem.id}`);
                          if (user?.id) {
                            queryClient.invalidateQueries({ queryKey: ['reminders', safeUser.id] });
                          }
                        } catch (e) {
                          Alert.alert('Error', 'Failed to delete reminder.');
                        }
                      }}
                    ]);
                  }}
                >
                  <Text style={{ color: '#fff', fontWeight: 'bold' }}>Delete</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))
        ) : (
          <Text style={{ color: '#888', marginVertical: 30, textAlign: 'center' }}>No reminders found.</Text>
        )}
      </ScrollView>
      <ReminderFormModal
        visible={modalVisible}
        onClose={() => { setModalVisible(false); setEditingReminder(null); }}
        onSubmit={handleAddEditReminder}
        initialValues={editingReminder ? {
          title: editingReminder.title,
          dueDate: editingReminder.dueDate?.slice(0,10) || '',
          itemType: editingReminder.itemType || 'warranty',
          isActive: editingReminder.isActive ?? true,
        } : undefined}
        isEditing={!!editingReminder}
      />
    </>
  );
}
