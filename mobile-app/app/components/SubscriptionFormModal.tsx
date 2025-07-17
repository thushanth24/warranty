import React, { useState, useEffect } from 'react';
import { Modal, View, Text, TextInput, TouchableOpacity } from 'react-native';

export interface SubscriptionFormValues {
  name: string;
  nextRenewalDate: string; // ISO string
  amount: string;
  category: string;
  status: string;
}

interface Props {
  visible: boolean;
  onClose: () => void;
  onSubmit: (values: SubscriptionFormValues) => void;
  initialValues?: SubscriptionFormValues;
  isEditing?: boolean;
}

export default function SubscriptionFormModal({ visible, onClose, onSubmit, initialValues, isEditing }: Props) {
  const [name, setName] = useState(initialValues?.name || '');
  const [nextRenewalDate, setNextRenewalDate] = useState(initialValues?.nextRenewalDate || '');
  const [amount, setAmount] = useState(initialValues?.amount || '');
  const [category, setCategory] = useState(initialValues?.category || '');
  const [status, setStatus] = useState(initialValues?.status || 'active');

  useEffect(() => {
    if (visible) {
      setName(initialValues?.name || '');
      setNextRenewalDate(initialValues?.nextRenewalDate || '');
      setAmount(initialValues?.amount || '');
      setCategory(initialValues?.category || '');
      setStatus(initialValues?.status || 'active');
    }
  }, [visible, initialValues]);

  function handleSubmit() {
    if (!name || !nextRenewalDate) return;
    onSubmit({ name, nextRenewalDate, amount, category, status });
  }

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.25)', justifyContent: 'center', alignItems: 'center' }}>
        <View style={{ backgroundColor: '#fff', padding: 24, borderRadius: 14, width: '90%' }}>
          <Text style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 16 }}>{isEditing ? 'Edit Subscription' : 'Add Subscription'}</Text>
          <Text style={{ marginBottom: 4 }}>Name</Text>
          <TextInput
            value={name}
            onChangeText={setName}
            placeholder="e.g. Netflix"
            style={{ borderWidth: 1, borderColor: '#ccc', borderRadius: 6, padding: 8, marginBottom: 12 }}
          />
          <Text style={{ marginBottom: 4 }}>Next Renewal Date</Text>
          <TextInput
            value={nextRenewalDate}
            onChangeText={setNextRenewalDate}
            placeholder="YYYY-MM-DD"
            style={{ borderWidth: 1, borderColor: '#ccc', borderRadius: 6, padding: 8, marginBottom: 12 }}
          />
          <Text style={{ marginBottom: 4 }}>Amount</Text>
          <TextInput
            value={amount}
            onChangeText={setAmount}
            placeholder="$9.99"
            keyboardType="decimal-pad"
            style={{ borderWidth: 1, borderColor: '#ccc', borderRadius: 6, padding: 8, marginBottom: 12 }}
          />
          <Text style={{ marginBottom: 4 }}>Category</Text>
          <TextInput
            value={category}
            onChangeText={setCategory}
            placeholder="e.g. Streaming"
            style={{ borderWidth: 1, borderColor: '#ccc', borderRadius: 6, padding: 8, marginBottom: 12 }}
          />
          <Text style={{ marginBottom: 4 }}>Status</Text>
          <TextInput
            value={status}
            onChangeText={setStatus}
            placeholder="active/overdue/cancelled"
            style={{ borderWidth: 1, borderColor: '#ccc', borderRadius: 6, padding: 8, marginBottom: 16 }}
          />
          <View style={{ flexDirection: 'row', justifyContent: 'flex-end' }}>
            <TouchableOpacity onPress={onClose} style={{ marginRight: 16 }}>
              <Text style={{ color: '#888', fontWeight: 'bold' }}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleSubmit} style={{ backgroundColor: '#2563eb', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 6 }}>
              <Text style={{ color: '#fff', fontWeight: 'bold' }}>{isEditing ? 'Save' : 'Add'}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}
