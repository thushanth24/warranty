import React, { useState, useEffect } from 'react';
import { Modal, View, Text, TextInput, TouchableOpacity } from 'react-native';
import DatePickerField from './DatePickerField';

export interface SubscriptionFormValues {
  name: string;
  nextRenewalDate: string; // ISO string
  amount: string;
  billingCycle: string;
  category: string;
  description?: string;
}

interface Props {
  visible: boolean;
  onClose: () => void;
  onSubmit: (values: SubscriptionFormValues) => void;
  initialValues?: SubscriptionFormValues;
  isEditing?: boolean;
}

import RNPickerSelect from 'react-native-picker-select';


export default function SubscriptionFormModal({ visible, onClose, onSubmit, initialValues, isEditing }: Props) {
  const [name, setName] = useState(initialValues?.name || '');
  const [nextRenewalDate, setNextRenewalDate] = useState(initialValues?.nextRenewalDate || '');
  const [amount, setAmount] = useState(initialValues?.amount || '');
  const [billingCycle, setBillingCycle] = useState(initialValues?.billingCycle || '');
  const [category, setCategory] = useState(initialValues?.category || '');
  const [description, setDescription] = useState(initialValues?.description || '');

  useEffect(() => {
    if (visible) {
      setName(initialValues?.name || '');
      setNextRenewalDate(initialValues?.nextRenewalDate || '');
      setAmount(initialValues?.amount || '');
      setBillingCycle(initialValues?.billingCycle || '');
      setCategory(initialValues?.category || '');
      setDescription(initialValues?.description || '');
    }
  }, [visible, initialValues]);

  function handleSubmit() {
    if (!name || !amount || !billingCycle || !nextRenewalDate) return;
    onSubmit({ name, nextRenewalDate, amount: String(amount), billingCycle, category, description: description || undefined });
  }

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.25)', justifyContent: 'center', alignItems: 'center' }}>
        <View style={{ backgroundColor: '#fff', padding: 24, borderRadius: 14, width: '90%' }}>
          <Text style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 16 }}>{isEditing ? 'Edit Subscription' : 'Add Subscription'}</Text>

          

          <Text style={{ marginBottom: 4 }}>Name *</Text>
<TextInput
  value={name}
  onChangeText={setName}
  placeholder="e.g. Netflix"
  style={{ borderWidth: 1, borderColor: '#ccc', borderRadius: 6, padding: 8, marginBottom: 12 }}
/>
          <Text style={{ marginBottom: 4 }}>Amount *</Text>
          <TextInput
            value={amount}
            onChangeText={val => setAmount(val.toString())}
            placeholder="$9.99"
            keyboardType="decimal-pad"
            style={{ borderWidth: 1, borderColor: '#ccc', borderRadius: 6, padding: 8, marginBottom: 12 }}
          />
          <Text style={{ marginBottom: 4 }}>Billing Cycle *</Text>
          <View style={{ borderWidth: 1, borderColor: '#ccc', borderRadius: 6, marginBottom: 12, backgroundColor: '#fafafa', paddingHorizontal: 8, paddingVertical: 2 }}>
  <RNPickerSelect
    value={billingCycle}
    onValueChange={setBillingCycle}
    placeholder={{ label: 'Select billing cycle', value: '', color: '#888' }}
    items={[
      { label: 'Weekly', value: 'weekly' },
      { label: 'Monthly', value: 'monthly' },
      { label: 'Quarterly', value: 'quarterly' },
      { label: 'Yearly', value: 'yearly' },
    ]}
    style={{
      inputIOS: { height: 40, padding: 8, color: '#222' },
      inputAndroid: { height: 40, padding: 8, color: '#222' },
      placeholder: { color: '#888' },
      viewContainer: { minHeight: 40, justifyContent: 'center' },
    }}
    useNativeAndroidPickerStyle={false}
    Icon={() => (
      <View style={{ position: 'absolute', right: 10, top: 14 }}>
        <Text style={{ fontSize: 18, color: '#888' }}>▼</Text>
      </View>
    )}
  />
</View>
          <Text style={{ marginBottom: 4 }}>Category</Text>
          <RNPickerSelect
            value={category}
            onValueChange={setCategory}
            placeholder={{ label: 'Select category...', value: '' }}
            items={[
              { label: 'Entertainment', value: 'entertainment' },
              { label: 'Productivity', value: 'productivity' },
              { label: 'Cloud Storage', value: 'cloud-storage' },
              { label: 'Software', value: 'software' },
              { label: 'Fitness', value: 'fitness' },
              { label: 'Education', value: 'education' },
              { label: 'Other', value: 'other' },
            ]}
            style={{
              inputIOS: {
                borderWidth: 1,
                borderColor: '#ccc',
                borderRadius: 6,
                padding: 12,
                marginBottom: 16,
                backgroundColor: '#f9f9f9',
                color: '#333',
              },
              inputAndroid: {
                borderWidth: 1,
                borderColor: '#ccc',
                borderRadius: 6,
                padding: 12,
                marginBottom: 16,
                backgroundColor: '#f9f9f9',
                color: '#333',
              },
              placeholder: {
                color: '#888',
              },
              iconContainer: {
                top: 18,
                right: 12,
              },
            }}
            useNativeAndroidPickerStyle={false}
            Icon={() => (
              <View style={{ position: 'absolute', right: 16, top: 18 }}>
                <Text style={{ fontSize: 18, color: '#888' }}>▼</Text>
              </View>
            )}
          />
          <DatePickerField
            value={nextRenewalDate}
            onChange={setNextRenewalDate}
            label="Next Renewal Date *"
          />
          <Text style={{ marginBottom: 4 }}>Description (Optional)</Text>
          <TextInput
            value={description}
            onChangeText={setDescription}
            placeholder="Add any notes about this subscription..."
            multiline
            numberOfLines={3}
            style={{ borderWidth: 1, borderColor: '#ccc', borderRadius: 6, padding: 8, marginBottom: 16, textAlignVertical: 'top' }}
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
