import React, { useState } from 'react';
import { View, Text, ActivityIndicator, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useWarranties } from '../../hooks/useWarranties';
import WarrantyFormModal, { WarrantyFormValues } from '../components/WarrantyFormModal';
import axios from 'axios';
import { BACKEND_URL } from '../../config/config';
import { useAuth } from '../../hooks/useAuth';
import { useQueryClient } from '@tanstack/react-query';

export default function WarrantiesScreen() {
  const { data: warranties, isLoading, error } = useWarranties();
  const [modalVisible, setModalVisible] = useState(false);
  const [editingWarranty, setEditingWarranty] = useState<any | null>(null);
  const queryClient = useQueryClient();
  const { user } = useAuth();
  if (!user) {
    return <Text style={{ color: 'red', margin: 20 }}>You must be logged in to view this page.</Text>;
  }
  // TypeScript: user is guaranteed to be non-null after this point
  const safeUser = user as NonNullable<typeof user>;

  async function handleAddEditWarranty(values: WarrantyFormValues) {
    try {
      if (editingWarranty) {
        // Compute expirationDate
        const purchaseDate = new Date(values.purchaseDate);
        const expirationDate = new Date(purchaseDate);
        expirationDate.setMonth(expirationDate.getMonth() + Number(values.warrantyDuration));
        await axios.put(`${BACKEND_URL}/api/warranties/${safeUser.id}/${editingWarranty.id}`, { ...values, expirationDate: expirationDate.toISOString(), userId: safeUser.id });
      } else {
        // Compute expirationDate
        const purchaseDate = new Date(values.purchaseDate);
        const expirationDate = new Date(purchaseDate);
        expirationDate.setMonth(expirationDate.getMonth() + Number(values.warrantyDuration));
        await axios.post(`${BACKEND_URL}/api/warranties/${safeUser.id}`, { ...values, expirationDate: expirationDate.toISOString(), userId: safeUser.id });
      }
      setModalVisible(false);
      setEditingWarranty(null);
      queryClient.invalidateQueries({ queryKey: ['warranties', safeUser.id] });
    } catch (e: any) {
      Alert.alert('Error', 'Failed to save warranty.');
    }
  }

  function openAddModal() {
    setEditingWarranty(null);
    setModalVisible(true);
  }

  function openEditModal(warranty: any) {
    setEditingWarranty(warranty);
    setModalVisible(true);
  }

  return (
    <>
      <ScrollView style={{ flex: 1, backgroundColor: '#fff' }} contentContainerStyle={{ padding: 20 }}>
        <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#222', marginBottom: 16 }}>Warranties</Text>
        <TouchableOpacity
          style={{ backgroundColor: '#2563eb', padding: 12, borderRadius: 8, marginBottom: 20, alignSelf: 'flex-start' }}
          onPress={openAddModal}
        >
          <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 16 }}>+ Add Warranty</Text>
        </TouchableOpacity>
        {isLoading ? (
          <ActivityIndicator size="large" color="#2563eb" style={{ marginVertical: 40 }} />
        ) : error ? (
          <Text style={{ color: 'red', marginVertical: 20 }}>Failed to load warranties</Text>
        ) : warranties && warranties.length > 0 ? (
          warranties.map((warranty) => (
            <View key={warranty.id} style={{ padding: 16, borderRadius: 8, backgroundColor: '#f1f5f9', marginBottom: 14 }}>
              <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#222' }}>{warranty.productName}</Text>
              <Text style={{ color: '#666', marginTop: 4 }}>Expires: {new Date(warranty.expirationDate).toLocaleDateString()}</Text>
              {(() => {
                // Compute status like web app
                let computedStatus = 'unknown';
                if (warranty.expirationDate) {
                  const today = new Date();
                  const exp = new Date(warranty.expirationDate);
                  computedStatus = exp < today ? 'expired' : 'active';
                }
                return (
                  <Text style={{ color: computedStatus === 'expired' ? 'red' : computedStatus === 'active' ? 'green' : '#eab308', marginTop: 2 }}>
                    Status: {computedStatus.charAt(0).toUpperCase() + computedStatus.slice(1)}
                  </Text>
                );
              })()}
              {warranty.isTransferred && (
                <Text style={{ color: '#2563eb', marginTop: 2 }}>Transferred</Text>
              )}
              <View style={{ flexDirection: 'row', justifyContent: 'flex-end', marginTop: 8 }}>
                <TouchableOpacity
                  style={{ backgroundColor: '#eab308', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 6, marginRight: 8 }}
                  onPress={() => openEditModal(warranty)}
                >
                  <Text style={{ color: '#fff', fontWeight: 'bold' }}>Edit</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={{ backgroundColor: '#ef4444', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 6 }}
                  onPress={() => {
                    Alert.alert('Delete Warranty', 'Are you sure you want to delete this warranty?', [
                      { text: 'Cancel', style: 'cancel' },
                      { text: 'Delete', style: 'destructive', onPress: async () => {
                        try {
                          await axios.delete(`${BACKEND_URL}/api/warranties/${safeUser.id}/${warranty.id}`);
                          if (user?.id) {
                            queryClient.invalidateQueries({ queryKey: ['warranties', safeUser.id] });
                          }
                        } catch (e) {
                          Alert.alert('Error', 'Failed to delete warranty.');
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
          <Text style={{ color: '#888', marginVertical: 30, textAlign: 'center' }}>No warranties found.</Text>
        )}
      </ScrollView>
      <WarrantyFormModal
        visible={modalVisible}
        onClose={() => { setModalVisible(false); setEditingWarranty(null); }}
        onSubmit={handleAddEditWarranty}
        initialValues={editingWarranty ? {
          productName: editingWarranty.productName || '',
          vendor: editingWarranty.vendor || '',
          purchaseDate: editingWarranty.purchaseDate?.slice(0,10) || '',
          warrantyDuration: editingWarranty.warrantyDuration || 12,
          description: editingWarranty.description || '',
        } : undefined}
        isEditing={!!editingWarranty}
      />
    </>
  );
}
