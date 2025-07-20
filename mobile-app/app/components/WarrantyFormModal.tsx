import React, { useState, useEffect } from 'react';
import { Modal, View, Text, TextInput, TouchableOpacity, Platform } from 'react-native';
import DatePickerField from './DatePickerField';

export interface WarrantyFormValues {
  productName: string;
  vendor: string;
  purchaseDate: string; // ISO string (YYYY-MM-DD)
  warrantyDuration: number; // months
  description?: string;
}

interface Props {
  visible: boolean;
  onClose: () => void;
  onSubmit: (values: WarrantyFormValues) => void;
  initialValues?: WarrantyFormValues;
  isEditing?: boolean;
}

export default function WarrantyFormModal({ visible, onClose, onSubmit, initialValues, isEditing }: Props) {
  const [productName, setProductName] = useState(initialValues?.productName || '');
  const [vendor, setVendor] = useState(initialValues?.vendor || '');
  const [purchaseDate, setPurchaseDate] = useState(initialValues?.purchaseDate || '');
  const [warrantyDuration, setWarrantyDuration] = useState(initialValues?.warrantyDuration?.toString() || '12');
  const [description, setDescription] = useState(initialValues?.description || '');

  // Import DatePickerField at the top
  // import DatePickerField from './DatePickerField';

  useEffect(() => {
    if (visible) {
      setProductName(initialValues?.productName || '');
      setVendor(initialValues?.vendor || '');
      setPurchaseDate(initialValues?.purchaseDate || '');
      setWarrantyDuration(initialValues?.warrantyDuration?.toString() || '12');
      setDescription(initialValues?.description || '');
    }
  }, [visible, initialValues]);

  function handleSubmit() {
    if (!productName.trim() || !vendor.trim() || !purchaseDate || !warrantyDuration) return;
    onSubmit({
      productName: productName.trim(),
      vendor: vendor.trim(),
      purchaseDate,
      warrantyDuration: parseInt(warrantyDuration, 10),
      description: description.trim() || undefined,
    });
  }

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.25)', justifyContent: 'center', alignItems: 'center' }}>
        <View style={{ backgroundColor: '#fff', padding: 24, borderRadius: 14, width: '90%' }}>
          <Text style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 16 }}>{isEditing ? 'Edit Warranty' : 'Add Warranty'}</Text>

          <Text style={{ marginBottom: 4 }}>Product Name *</Text>
          <TextInput
            value={productName}
            onChangeText={setProductName}
            placeholder="e.g., MacBook Pro 16, iPhone 14 Pro"
            style={{ borderWidth: 1, borderColor: '#ccc', borderRadius: 6, marginBottom: 16, padding: 8 }}
          />

          <Text style={{ marginBottom: 4 }}>Vendor/Manufacturer *</Text>
          <TextInput
            value={vendor}
            onChangeText={setVendor}
            placeholder="e.g., Apple, Samsung, Sony"
            style={{ borderWidth: 1, borderColor: '#ccc', borderRadius: 6, marginBottom: 16, padding: 8 }}
          />

          <DatePickerField
            value={purchaseDate}
            onChange={setPurchaseDate}
            label="Purchase Date *"
          />

          <Text style={{ marginBottom: 4 }}>Warranty Duration (Months) *</Text>
          <TextInput
            value={warrantyDuration}
            onChangeText={setWarrantyDuration}
            placeholder="12"
            keyboardType="numeric"
            style={{ borderWidth: 1, borderColor: '#ccc', borderRadius: 6, marginBottom: 16, padding: 8 }}
          />

          <Text style={{ marginBottom: 4 }}>Description (Optional)</Text>
          <TextInput
            value={description}
            onChangeText={setDescription}
            placeholder="Add any notes about this warranty..."
            multiline
            numberOfLines={3}
            style={{ borderWidth: 1, borderColor: '#ccc', borderRadius: 6, marginBottom: 16, padding: 8, textAlignVertical: 'top' }}
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
