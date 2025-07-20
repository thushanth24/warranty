import React, { useState } from 'react';
import { View, Text, ActivityIndicator, ScrollView, TouchableOpacity, Alert, RefreshControl } from 'react-native';
import { useSubscriptions } from '../../hooks/useSubscriptions';
import SubscriptionFormModal, { SubscriptionFormValues } from '../components/SubscriptionFormModal';
import axios from 'axios';
import { BACKEND_URL } from '../../config/config';
import { useAuth } from '../../hooks/useAuth';
import { useQueryClient } from '@tanstack/react-query';
import type { Subscription } from '../../types/types';

export default function SubscriptionsScreen() {
  const { data: subscriptions, isLoading, error, refetch, isFetching } = useSubscriptions();
  const typedSubscriptions = subscriptions as Subscription[] | undefined;
  const [modalVisible, setModalVisible] = useState(false);
  const [editingSubscription, setEditingSubscription] = useState<any | null>(null);
  const queryClient = useQueryClient();
  const { user } = useAuth();
  if (!user) {
    return <Text style={{ color: 'red', margin: 20 }}>You must be logged in to view this page.</Text>;
  }
  // TypeScript: user is guaranteed to be non-null after this point
  const safeUser = user as NonNullable<typeof user>;

  async function handleAddEditSubscription(values: SubscriptionFormValues) {
    try {
      const payload = {
        ...values,
        amount: values.amount !== undefined && values.amount !== null ? String(values.amount) : undefined,
      };

      if (editingSubscription) {
        await axios.put(`${BACKEND_URL}/api/subscriptions/${safeUser.id}/${editingSubscription.id}`, payload);
      } else {
        await axios.post(`${BACKEND_URL}/api/subscriptions/${safeUser.id}`, payload);
      }
      setModalVisible(false);
      setEditingSubscription(null);
      queryClient.invalidateQueries({ queryKey: ['subscriptions', safeUser.id] });
    } catch (e: any) {
      Alert.alert('Error', 'Failed to save subscription.');
    }
  }

  function openAddModal() {
    setEditingSubscription(null);
    setModalVisible(true);
  }

  function openEditModal(sub: any) {
    setEditingSubscription(sub);
    setModalVisible(true);
  }

  return (
    <>
      <ScrollView
        style={{ flex: 1, backgroundColor: '#fff' }}
        contentContainerStyle={{ padding: 20 }}
        refreshControl={
          <RefreshControl
            refreshing={isFetching}
            onRefresh={refetch}
            colors={['#2563eb']}
          />
        }
      >
        <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#222', marginBottom: 16 }}>Subscriptions</Text>
        <TouchableOpacity
          style={{ backgroundColor: '#2563eb', padding: 12, borderRadius: 8, marginBottom: 20, alignSelf: 'flex-start' }}
          onPress={openAddModal}
        >
          <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 16 }}>+ Add Subscription</Text>
        </TouchableOpacity>
        {isLoading ? (
          <ActivityIndicator size="large" color="#2563eb" style={{ marginVertical: 40 }} />
        ) : error ? (
          <Text style={{ color: 'red', marginVertical: 20 }}>Failed to load subscriptions</Text>
        ) : subscriptions && subscriptions.length > 0 ? (
          subscriptions.map((sub) => (
            <View key={sub.id} style={{ padding: 16, borderRadius: 8, backgroundColor: '#f1f5f9', marginBottom: 14 }}>
              <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#222' }}>{sub.name}</Text>
              <Text style={{ color: '#666', marginTop: 4 }}>Next Renewal: {new Date(sub.nextRenewalDate).toLocaleDateString()}</Text>
              {(() => {
                const now = new Date();
                const renewal = new Date(sub.nextRenewalDate);
                let status: 'Active' | 'Overdue' | 'Inactive';
                let color: string;
                if (sub.isActive === false) {
                  status = 'Inactive';
                  color = '#eab308';
                } else if (renewal < now) {
                  status = 'Overdue';
                  color = 'red';
                } else {
                  status = 'Active';
                  color = 'green';
                }
                return (
                  <Text style={{ color, marginTop: 2 }}>
                    Status: {status}
                  </Text>
                );
              })()}



              {typeof sub.amount === 'number' && !isNaN(sub.amount) ? (
                <Text style={{ color: '#222', marginTop: 2 }}>Amount: ${sub.amount.toFixed(2)}</Text>
              ) : typeof sub.amount === 'string' && sub.amount !== undefined && sub.amount !== null && (sub.amount as string).trim() !== '' && !isNaN(Number(sub.amount)) ? (
                <Text style={{ color: '#222', marginTop: 2 }}>Amount: ${parseFloat(sub.amount).toFixed(2)}</Text>
              ) : (
                <Text style={{ color: '#222', marginTop: 2 }}>Amount: N/A</Text>
              )}
              {sub.category && (
                <Text style={{ color: '#888', marginTop: 2 }}>Category: {sub.category}</Text>
              )}
              <View style={{ flexDirection: 'row', justifyContent: 'flex-end', marginTop: 8 }}>
                <TouchableOpacity
                  style={{ backgroundColor: '#22c55e', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 6, marginRight: 8 }}
                  onPress={async () => {
                    // Calculate new nextRenewalDate
                    let nextDate = new Date(sub.nextRenewalDate);
                    switch (sub.billingCycle) {
                      case 'weekly':
                        nextDate.setDate(nextDate.getDate() + 7);
                        break;
                      case 'monthly':
                        nextDate.setMonth(nextDate.getMonth() + 1);
                        break;
                      case 'quarterly':
                        nextDate.setMonth(nextDate.getMonth() + 3);
                        break;
                      case 'yearly':
                        nextDate.setFullYear(nextDate.getFullYear() + 1);
                        break;
                    }
                    try {
                      await axios.put(`${BACKEND_URL}/api/subscriptions/${safeUser.id}/${sub.id}`, {
                        nextRenewalDate: nextDate.toISOString().slice(0, 10), // Send as YYYY-MM-DD
                      });
                      queryClient.invalidateQueries({ queryKey: ['subscriptions', safeUser.id] });
                    } catch (e) {
                      Alert.alert('Error', 'Failed to mark as renewed.');
                    }
                  }}
                >
                  <Text style={{ color: '#fff', fontWeight: 'bold' }}>Mark as Renewed</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={{ backgroundColor: '#eab308', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 6, marginRight: 8 }}
                  onPress={() => openEditModal(sub)}
                >
                  <Text style={{ color: '#fff', fontWeight: 'bold' }}>Edit</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={{ backgroundColor: '#ef4444', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 6 }}
                  onPress={() => {
                    Alert.alert('Delete Subscription', 'Are you sure you want to delete this subscription?', [
                      { text: 'Cancel', style: 'cancel' },
                      { text: 'Delete', style: 'destructive', onPress: async () => {
                        try {
                          await axios.delete(`${BACKEND_URL}/api/subscriptions/${safeUser.id}/${sub.id}`);
                          if (user?.id) {
                            queryClient.invalidateQueries({ queryKey: ['subscriptions', safeUser.id] });
                          }
                        } catch (e) {
                          Alert.alert('Error', 'Failed to delete subscription.');
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
          <Text style={{ color: '#888', marginVertical: 30, textAlign: 'center' }}>No subscriptions found.</Text>
        )}
      </ScrollView>
      <SubscriptionFormModal
        visible={modalVisible}
        onClose={() => { setModalVisible(false); setEditingSubscription(null); }}
        onSubmit={handleAddEditSubscription}
        initialValues={editingSubscription ? {
          name: editingSubscription.name,
          nextRenewalDate: editingSubscription.nextRenewalDate?.slice(0,10) || '',
          amount: editingSubscription.amount?.toString() || '',
          billingCycle: editingSubscription.billingCycle || '',
          category: editingSubscription.category || '',
        } : undefined}
        isEditing={!!editingSubscription}
      />
    </>
  );
}
