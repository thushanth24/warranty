import React, { useState, useEffect } from 'react';
import { Modal, View, Text, TextInput, TouchableOpacity } from 'react-native';

export interface ReminderFormValues {
  title: string;
  dueDate: string; // ISO string
  itemType: string;
  isActive: boolean;
}

interface Props {
  visible: boolean;
  onClose: () => void;
  onSubmit: (values: ReminderFormValues) => void;
  initialValues?: ReminderFormValues;
  isEditing?: boolean;
}

export default function ReminderFormModal({ visible, onClose, onSubmit, initialValues, isEditing }: Props) {
  const [title, setTitle] = useState(initialValues?.title || '');
  const [dueDate, setDueDate] = useState(initialValues?.dueDate || '');
  const [itemType, setItemType] = useState(initialValues?.itemType || 'warranty');
  const [isActive, setIsActive] = useState(initialValues?.isActive ?? true);

  useEffect(() => {
    if (visible) {
      setTitle(initialValues?.title || '');
      setDueDate(initialValues?.dueDate || '');
      setItemType(initialValues?.itemType || 'warranty');
      setIsActive(initialValues?.isActive ?? true);
    }
  }, [visible, initialValues]);

  function handleSubmit() {
    if (!title || !dueDate) return;
    onSubmit({ title, dueDate, itemType, isActive });
  }

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.25)', justifyContent: 'center', alignItems: 'center' }}>
        <View style={{ backgroundColor: '#fff', padding: 24, borderRadius: 14, width: '90%' }}>
          <Text style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 16 }}>{isEditing ? 'Edit Reminder' : 'Add Reminder'}</Text>
          <Text style={{ marginBottom: 4 }}>Title</Text>
          <TextInput
            value={title}
            onChangeText={setTitle}
            placeholder="e.g. Warranty Expiry"
            style={{ borderWidth: 1, borderColor: '#ccc', borderRadius: 6, padding: 8, marginBottom: 12 }}
          />
          <Text style={{ marginBottom: 4 }}>Due Date</Text>
          <TextInput
            value={dueDate}
            onChangeText={setDueDate}
            placeholder="YYYY-MM-DD"
            style={{ borderWidth: 1, borderColor: '#ccc', borderRadius: 6, padding: 8, marginBottom: 12 }}
          />
          <Text style={{ marginBottom: 4 }}>Item Type</Text>
          <TextInput
            value={itemType}
            onChangeText={setItemType}
            placeholder="warranty/subscription/other"
            style={{ borderWidth: 1, borderColor: '#ccc', borderRadius: 6, padding: 8, marginBottom: 12 }}
          />
          <Text style={{ marginBottom: 4 }}>Active</Text>
          <TouchableOpacity onPress={() => setIsActive(!isActive)} style={{ marginBottom: 16 }}>
            <Text style={{ color: isActive ? 'green' : 'red', fontWeight: 'bold' }}>{isActive ? 'Active' : 'Inactive'}</Text>
          </TouchableOpacity>
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
