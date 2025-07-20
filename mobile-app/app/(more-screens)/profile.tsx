import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import ProfileFormModal from '../components/ProfileFormModal';
import axios from 'axios';
import { BACKEND_URL } from '../../config/config';
import { useAuth } from '../../hooks/useAuth';
import type { User } from '../../types/types';

export default function ProfileScreen() {
  const { user, login } = useAuth() as { user: User | null, login: (u: User) => void };
  const [modalVisible, setModalVisible] = useState(false);

  function handleEditProfile(values: any) {
    if (!user) return;
    axios.put(`${BACKEND_URL}/api/users/${user.id}/profile`, values)
      .then(res => {
        login({ ...user, ...values, profileCompleted: true });
        setModalVisible(false);
      })
      .catch(() => {
        Alert.alert('Error', 'Failed to update profile.');
      });
  }
  if (!user) {
    return <Text style={{ color: 'red', margin: 20 }}>You must be logged in to view this page.</Text>;
  }
  if (!user.profileCompleted) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 }}>
        <Text style={{ fontSize: 18, color: '#eab308', marginBottom: 16 }}>Please complete your profile to continue.</Text>
        <TouchableOpacity
          style={{ backgroundColor: '#2563eb', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 6 }}
          onPress={() => setModalVisible(true)}
        >
          <Text style={{ color: '#fff', fontWeight: 'bold' }}>Complete Profile</Text>
        </TouchableOpacity>
        <ProfileFormModal
          visible={modalVisible}
          onClose={() => setModalVisible(false)}
          onSubmit={handleEditProfile}
          initialValues={user}
        />
      </View>
    );
  }

  return (
    <>
      <ScrollView style={{ flex: 1, backgroundColor: '#fff' }} contentContainerStyle={{ padding: 20 }}>
        <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#222', marginBottom: 16 }}>Profile</Text>
        {/* Centered Avatar and Basic Info */}
        <View style={{ alignItems: 'center', marginBottom: 24 }}>
          <View style={{ width: 100, height: 100, borderRadius: 50, backgroundColor: '#2563eb', justifyContent: 'center', alignItems: 'center', marginBottom: 12 }}>
            <Text style={{ color: '#fff', fontSize: 40, fontWeight: 'bold' }}>
              {(user.firstName?.[0] || 'U').toUpperCase()}{(user.lastName?.[0] || 'N').toUpperCase()}
            </Text>
          </View>
          <Text style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 4 }}>{user.firstName || ''} {user.lastName || ''}</Text>
          <Text style={{ color: '#555', marginBottom: 4 }}>{user.email || 'No email set'}</Text>
          <Text style={{ color: user.profileCompleted ? 'green' : '#eab308', marginBottom: 4, fontWeight: 'bold' }}>
            {user.profileCompleted ? 'Profile Complete' : 'Profile Incomplete'}
          </Text>
        </View>
        {/* Personal Information Card */}
        <View style={{ backgroundColor: '#f1f5f9', borderRadius: 12, padding: 20, marginBottom: 16 }}>
          <Text style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 18, textAlign: 'center' }}>Personal Information</Text>
          <View style={{ marginBottom: 10 }}>
            <Text style={{ fontWeight: '600', color: '#444' }}>First Name</Text>
            <Text style={{ fontSize: 16, marginBottom: 8 }}>{user.firstName || 'Not set'}</Text>
            <Text style={{ fontWeight: '600', color: '#444' }}>Last Name</Text>
            <Text style={{ fontSize: 16, marginBottom: 8 }}>{user.lastName || 'Not set'}</Text>
            <Text style={{ fontWeight: '600', color: '#444' }}>Phone Number</Text>
            <Text style={{ fontSize: 16, marginBottom: 8 }}>{user.phoneNumber || 'Not set'}</Text>
            <Text style={{ fontWeight: '600', color: '#444' }}>Email Address</Text>
            <Text style={{ fontSize: 16, marginBottom: 8 }}>{user.email || 'No email set'}</Text>
            <Text style={{ fontWeight: '600', color: '#444' }}>Date of Birth</Text>
            <Text style={{ fontSize: 16, marginBottom: 8 }}>{user.dateOfBirth || 'Not set'}</Text>
            <Text style={{ fontWeight: '600', color: '#444' }}>Member Since</Text>
            <Text style={{ fontSize: 16 }}>{user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Not set'}</Text>
          </View>
        </View>
        <View style={{ flexDirection: 'row', justifyContent: 'flex-end', marginTop: 8 }}>
          <TouchableOpacity
            style={{ backgroundColor: '#2563eb', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 6, marginRight: 8 }}
            onPress={() => setModalVisible(true)}
          >
            <Text style={{ color: '#fff', fontWeight: 'bold' }}>Edit Profile</Text>
          </TouchableOpacity>
          {/* Delete Account logic unchanged */}
        </View>
      </ScrollView>
      <ProfileFormModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onSubmit={handleEditProfile}
        initialValues={user ?? undefined}
      />
    </>
  );
}

