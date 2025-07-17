import React, { useState, useEffect } from 'react';
import { Modal, View, Text, TextInput, TouchableOpacity } from 'react-native';
import DatePickerField from './DatePickerField';
import type { UserProfile } from '../../hooks/useProfile';

interface Props {
  visible: boolean;
  onClose: () => void;
  onSubmit: (values: Partial<UserProfile>) => void;
  initialValues?: UserProfile;
}

export default function ProfileFormModal({ visible, onClose, onSubmit, initialValues }: Props) {
  const [firstName, setFirstName] = useState(initialValues?.firstName || '');
  const [lastName, setLastName] = useState(initialValues?.lastName || '');
  const [email, setEmail] = useState(initialValues?.email || '');
  const [dateOfBirth, setDateOfBirth] = useState(initialValues?.dateOfBirth || '');

  useEffect(() => {
    if (visible && initialValues) {
      setFirstName(initialValues.firstName || '');
      setLastName(initialValues.lastName || '');
      setEmail(initialValues.email || '');
      setDateOfBirth(initialValues.dateOfBirth || '');
    }
  }, [visible, initialValues]);

  function handleSubmit() {
    if (!firstName || !lastName || !email || !dateOfBirth) return;
    onSubmit({ firstName, lastName, email, dateOfBirth, profileCompleted: true });
  }

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.25)', justifyContent: 'center', alignItems: 'center' }}>
        <View style={{ backgroundColor: '#fff', padding: 24, borderRadius: 14, width: '90%' }}>
          <Text style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 16 }}>Edit Profile</Text>
          <Text style={{ marginBottom: 4 }}>First Name</Text>
          <TextInput
            value={firstName}
            onChangeText={setFirstName}
            placeholder="First Name"
            style={{ borderWidth: 1, borderColor: '#ccc', borderRadius: 6, padding: 8, marginBottom: 12 }}
          />
          <Text style={{ marginBottom: 4 }}>Last Name</Text>
          <TextInput
            value={lastName}
            onChangeText={setLastName}
            placeholder="Last Name"
            style={{ borderWidth: 1, borderColor: '#ccc', borderRadius: 6, padding: 8, marginBottom: 12 }}
          />
          <Text style={{ marginBottom: 4 }}>Email</Text>
          <TextInput
            value={email}
            onChangeText={setEmail}
            placeholder="Email"
            keyboardType="email-address"
            style={{ borderWidth: 1, borderColor: '#ccc', borderRadius: 6, padding: 8, marginBottom: 12 }}
          />
          <DatePickerField
            label="Date of Birth"
            value={dateOfBirth}
            onChange={setDateOfBirth}
          />
          <View style={{ flexDirection: 'row', justifyContent: 'flex-end' }}>
            <TouchableOpacity onPress={onClose} style={{ marginRight: 16 }}>
              <Text style={{ color: '#888', fontWeight: 'bold' }}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleSubmit} style={{ backgroundColor: '#2563eb', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 6 }}>
              <Text style={{ color: '#fff', fontWeight: 'bold' }}>Save</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}
