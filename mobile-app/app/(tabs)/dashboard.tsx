import React from 'react';
import { View, Text, ActivityIndicator, ScrollView } from 'react-native';
import { useAuth } from '../../hooks/useAuth';
import { useDashboardStats, useUpcoming } from '../../hooks/useDashboard';

export default function DashboardScreen() {
  const { user } = useAuth();
  const { data: stats, isLoading: statsLoading, error: statsError } = useDashboardStats();
  const { data: upcoming, isLoading: upcomingLoading, error: upcomingError } = useUpcoming();

  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#fff' }} contentContainerStyle={{ padding: 24, paddingTop: 5 }}>
      <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#222', marginBottom: 8 }}>Welcome to Dashboard</Text>
      {user && (
        <Text style={{ marginBottom: 16, color: '#222', fontSize: 18 }}>
          Hello, {user.firstName || user.phoneNumber || 'User'}!
        </Text>
      )}
      {statsLoading ? (
        <ActivityIndicator size="large" color="#2563eb" style={{ marginVertical: 20 }} />
      ) : statsError ? (
        <Text style={{ color: 'red', marginVertical: 20 }}>Failed to load stats</Text>
      ) : stats ? (
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 24 }}>
          <View style={{ alignItems: 'center', flex: 1 }}>
            <Text style={{ fontSize: 16, color: '#888' }}>Warranties</Text>
            <Text style={{ fontSize: 22, fontWeight: 'bold', color: '#2563eb' }}>{stats.warranties}</Text>
          </View>
          <View style={{ alignItems: 'center', flex: 1 }}>
            <Text style={{ fontSize: 16, color: '#888' }}>Subscriptions</Text>
            <Text style={{ fontSize: 22, fontWeight: 'bold', color: '#2563eb' }}>{stats.subscriptions}</Text>
          </View>
          <View style={{ alignItems: 'center', flex: 1 }}>
            <Text style={{ fontSize: 16, color: '#888' }}>Reminders</Text>
            <Text style={{ fontSize: 22, fontWeight: 'bold', color: '#2563eb' }}>{stats.reminders}</Text>
          </View>
          <View style={{ alignItems: 'center', flex: 1 }}>
            <Text style={{ fontSize: 16, color: '#888' }}>Due Soon</Text>
            <Text style={{ fontSize: 22, fontWeight: 'bold', color: '#eab308' }}>{stats.dueSoon}</Text>
          </View>
        </View>
      ) : null}

      <View style={{ marginTop: 40 }}>
        <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#222', marginBottom: 8 }}>Upcoming Reminders</Text>
      {upcomingLoading ? (
          <ActivityIndicator size="small" color="#2563eb" style={{ marginVertical: 10 }} />
        ) : upcomingError ? (
          <Text style={{ color: 'red', marginVertical: 10 }}>Failed to load upcoming reminders</Text>
        ) : upcoming && upcoming.length > 0 ? (
          upcoming.map((item) => (
            <View key={item.id} style={{ padding: 12, borderRadius: 8, backgroundColor: '#f1f5f9', marginBottom: 10 }}>
              <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#222' }}>{item.title}</Text>
              <Text style={{ color: '#666', marginTop: 2 }}>{item.type} • Due: {new Date(item.dueDate).toLocaleDateString()}</Text>
            </View>
          ))
        ) : (
          <Text style={{ color: '#888', marginVertical: 10 }}>No upcoming reminders</Text>
        )}
      </View>
    </ScrollView>
  );
}
