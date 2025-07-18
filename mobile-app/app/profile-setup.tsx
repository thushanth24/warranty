import React, { useState } from 'react';
import { View, Alert } from 'react-native';
import ProfileFormModal from './components/ProfileFormModal';
import { useRouter } from 'expo-router';
import { BACKEND_URL } from '../config/config';
import axios from 'axios';
import { useAuth } from '../hooks/useAuth';

export default function ProfileSetupScreen() {
  const [modalVisible, setModalVisible] = useState(true);
  const router = useRouter();
  const { user, login } = useAuth();

  if (!user) {
    // Optionally show an error or redirect to login
    return null;
  }

  async function handleProfileSubmit(values: any) {
    try {
      const res = await axios.put(`${BACKEND_URL}/api/users/${user!.id}/profile`, values);
      login({ ...user!, ...values, profileCompleted: true });
      setModalVisible(false);
      router.replace('/dashboard');
    } catch (e) {
      Alert.alert('Error', 'Failed to save profile.');
    }
  }

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' }}>
      <ProfileFormModal
        visible={modalVisible}
        onClose={() => {}}
        onSubmit={handleProfileSubmit}
        initialValues={undefined}
      />
    </View>
  );
}
