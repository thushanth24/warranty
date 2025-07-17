import React, { useState, useEffect } from 'react';
import { Modal, View, Text, TextInput, TouchableOpacity } from 'react-native';

export interface EnhancedWarrantyFormValues {
  productName: string;
  provider: string;
  coverageDetails: string;
  expirationDate: string;
  status: string;
}

interface Props {
  visible: boolean;
  onClose: () => void;
  onSubmit: (values: EnhancedWarrantyFormValues) => void;
  initialValues?: EnhancedWarrantyFormValues;
  isEditing?: boolean;
}

export default function EnhancedWarrantyFormModal({ visible, onClose, onSubmit, initialValues, isEditing }: Props) {
  const [productName, setProductName] = useState(initialValues?.productName || '');
  const [provider, setProvider] = useState(initialValues?.provider || '');
  const [coverageDetails, setCoverageDetails] = useState(initialValues?.coverageDetails || '');
  const [expirationDate, setExpirationDate] = useState(initialValues?.expirationDate || '');
  const [status, setStatus] = useState(initialValues?.status || 'active');

  useEffect(() => {
    if (visible) {
      setProductName(initialValues?.productName || '');
      setProvider(initialValues?.provider || '');
      setCoverageDetails(initialValues?.coverageDetails || '');
      setExpirationDate(initialValues?.expirationDate || '');
      setStatus(initialValues?.status || 'active');
    }
  }, [visible, initialValues]);

  function handleSubmit() {
    if (!productName || !provider || !expirationDate) return;
    onSubmit({ productName, provider, coverageDetails, expirationDate, status });
  }

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.25)', justifyContent: 'center', alignItems: 'center' }}>
        <View style={{ backgroundColor: '#fff', padding: 24, borderRadius: 14, width: '90%' }}>
          <Text style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 16 }}>{isEditing ? 'Edit Enhanced Warranty' : 'Add Enhanced Warranty'}</Text>
          <Text style={{ marginBottom: 4 }}>Product Name</Text>
          <TextInput
            value={productName}
            onChangeText={setProductName}
            placeholder="e.g. MacBook Pro"
            style={{ borderWidth: 1, borderColor: '#ccc', borderRadius: 6, padding: 8, marginBottom: 12 }}
          />
          <Text style={{ marginBottom: 4 }}>Provider</Text>
          <TextInput
            value={provider}
            onChangeText={setProvider}
            placeholder="e.g. AppleCare"
            style={{ borderWidth: 1, borderColor: '#ccc', borderRadius: 6, padding: 8, marginBottom: 12 }}
          />
          <Text style={{ marginBottom: 4 }}>Coverage Details</Text>
          <TextInput
            value={coverageDetails}
            onChangeText={setCoverageDetails}
            placeholder="e.g. Accidental damage, theft"
            style={{ borderWidth: 1, borderColor: '#ccc', borderRadius: 6, padding: 8, marginBottom: 12 }}
          />
          <Text style={{ marginBottom: 4 }}>Expiration Date</Text>
          <TextInput
            value={expirationDate}
            onChangeText={setExpirationDate}
            placeholder="YYYY-MM-DD"
            style={{ borderWidth: 1, borderColor: '#ccc', borderRadius: 6, padding: 8, marginBottom: 12 }}
          />
          <Text style={{ marginBottom: 4 }}>Status</Text>
          <TextInput
            value={status}
            onChangeText={setStatus}
            placeholder="active/expired/expiring"
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
