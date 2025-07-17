import React, { useState } from 'react';
import { View, Text, ActivityIndicator, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useEnhancedWarranties } from '../../hooks/useEnhancedWarranties';
import EnhancedWarrantyFormModal, { EnhancedWarrantyFormValues } from '../components/EnhancedWarrantyFormModal';
import axios from 'axios';
import { BACKEND_URL } from '../../config/config';
import { useAuth } from '../../hooks/useAuth';
import { useQueryClient } from '@tanstack/react-query';

export default function EnhancedWarrantiesScreen() {
  const { data: enhancedWarranties, isLoading, error } = useEnhancedWarranties();
  const [modalVisible, setModalVisible] = useState(false);
  const [editingWarranty, setEditingWarranty] = useState<any | null>(null);
  const queryClient = useQueryClient();
  const { user } = useAuth();
  if (!user) {
    return <Text style={{ color: 'red', margin: 20 }}>You must be logged in to view this page.</Text>;
  }
  // TypeScript: user is guaranteed to be non-null after this point
  const safeUser = user as NonNullable<typeof user>;

  async function handleAddEditWarranty(values: EnhancedWarrantyFormValues) {
    try {
      if (editingWarranty) {
        await axios.put(`${BACKEND_URL}/api/enhanced-warranties/${editingWarranty.id}`, { ...values, userId: safeUser.id });
      } else {
        await axios.post(`${BACKEND_URL}/api/enhanced-warranties`, { ...values, userId: safeUser.id });
      }
      setModalVisible(false);
      setEditingWarranty(null);
      queryClient.invalidateQueries({ queryKey: ['enhanced-warranties', safeUser.id] });
    } catch (e: any) {
      Alert.alert('Error', 'Failed to save enhanced warranty.');
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
        <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#222', marginBottom: 16 }}>Enhanced Warranties</Text>
        <TouchableOpacity
          style={{ backgroundColor: '#2563eb', padding: 12, borderRadius: 8, marginBottom: 20, alignSelf: 'flex-start' }}
          onPress={openAddModal}
        >
          <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 16 }}>+ Add Enhanced Warranty</Text>
        </TouchableOpacity>
        {isLoading ? (
          <ActivityIndicator size="large" color="#2563eb" style={{ marginVertical: 40 }} />
        ) : error ? (
          <Text style={{ color: 'red', marginVertical: 20 }}>Failed to load enhanced warranties</Text>
        ) : enhancedWarranties && enhancedWarranties.length > 0 ? (
          enhancedWarranties.map((warranty) => (
            <View key={warranty.id} style={{ padding: 16, borderRadius: 8, backgroundColor: '#f1f5f9', marginBottom: 14 }}>
              <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#222' }}>{warranty.productName}</Text>
              <Text style={{ color: '#666', marginTop: 4 }}>Provider: {warranty.provider}</Text>
              <Text style={{ color: '#666', marginTop: 2 }}>Coverage: {warranty.coverageDetails}</Text>
              <Text style={{ color: '#666', marginTop: 2 }}>Expires: {new Date(warranty.expirationDate).toLocaleDateString()}</Text>
              <Text style={{ color: warranty.status === 'expired' ? 'red' : warranty.status === 'active' ? 'green' : '#eab308', marginTop: 2 }}>
                Status: {typeof warranty.status === 'string' && warranty.status.length > 0
  ? warranty.status.charAt(0).toUpperCase() + warranty.status.slice(1)
  : 'Unknown'}
              </Text>
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
                    Alert.alert('Delete Enhanced Warranty', 'Are you sure you want to delete this enhanced warranty?', [
                      { text: 'Cancel', style: 'cancel' },
                      { text: 'Delete', style: 'destructive', onPress: async () => {
                        try {
                          await axios.delete(`${BACKEND_URL}/api/enhanced-warranties/${warranty.id}`);
                          if (user?.id) {
                            queryClient.invalidateQueries({ queryKey: ['enhanced-warranties', safeUser.id] });
                          }
                        } catch (e) {
                          Alert.alert('Error', 'Failed to delete enhanced warranty.');
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
          <Text style={{ color: '#888', marginVertical: 30, textAlign: 'center' }}>No enhanced warranties found.</Text>
        )}
      </ScrollView>
      <EnhancedWarrantyFormModal
        visible={modalVisible}
        onClose={() => { setModalVisible(false); setEditingWarranty(null); }}
        onSubmit={handleAddEditWarranty}
        initialValues={editingWarranty ? {
          productName: editingWarranty.productName,
          provider: editingWarranty.provider,
          coverageDetails: editingWarranty.coverageDetails,
          expirationDate: editingWarranty.expirationDate?.slice(0,10) || '',
          status: editingWarranty.status || 'active',
        } : undefined}
        isEditing={!!editingWarranty}
      />
    </>
  );
}
