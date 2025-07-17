import React from 'react';
import { View, Text, FlatList, ActivityIndicator } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../hooks/useAuth'; // You may need to implement/adapt this hook for mobile
import axios from 'axios';

export default function DashboardScreen() {
  const { user } = useAuth();

  // Fetch dashboard stats
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['/api/dashboard/stats', user?.id],
    queryFn: async () => {
      const res = await axios.get(`/api/dashboard/stats?userId=${user?.id}`);
      return res.data;
    },
    enabled: !!user?.id,
  });

  // Fetch upcoming reminders
  const { data: upcoming, isLoading: upcomingLoading } = useQuery({
    queryKey: ['/api/dashboard/upcoming', user?.id],
    queryFn: async () => {
      const res = await axios.get(`/api/dashboard/upcoming?userId=${user?.id}`);
      return res.data;
    },
    enabled: !!user?.id,
  });

  return (
    <View className="flex-1 bg-white dark:bg-black p-4">
      <Text className="text-2xl font-bold text-black dark:text-white mb-4">Dashboard</Text>

      {/* Stats Section */}
      <View className="mb-6 flex-row justify-between">
        <View className="flex-1 items-center mr-2 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
          <Text className="text-base text-gray-600 dark:text-gray-300">Due This Week</Text>
          {statsLoading ? (
            <ActivityIndicator size="small" color="#888" className="mt-1" />
          ) : (
            <Text className="text-3xl font-bold text-gray-900 dark:text-white mt-1">{stats?.dueThisWeek || 0}</Text>
          )}
        </View>
        <View className="flex-1 items-center ml-2 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
          <Text className="text-base text-gray-600 dark:text-gray-300">Expiring Soon</Text>
          {statsLoading ? (
            <ActivityIndicator size="small" color="#888" className="mt-1" />
          ) : (
            <Text className="text-3xl font-bold text-gray-900 dark:text-white mt-1">{stats?.expiringSoon || 0}</Text>
          )}
        </View>
      </View>

      {/* Upcoming Reminders Section */}
      <Text className="text-lg font-semibold text-black dark:text-white mb-2">Upcoming Reminders</Text>
      {upcomingLoading ? (
        <ActivityIndicator size="large" color="#888" className="my-4" />
      ) : (
        <FlatList
          data={upcoming || []}
          keyExtractor={(item, idx) => item.id?.toString() || idx.toString()}
          renderItem={({ item }) => (
            <View className="mb-3 p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
              <Text className="text-base font-medium text-gray-900 dark:text-white">{item.title || 'Reminder'}</Text>
              <Text className="text-sm text-gray-500 dark:text-gray-400">{item.date ? String(item.date) : ''}</Text>
            </View>
          )}
          ListEmptyComponent={<Text className="text-gray-500 dark:text-gray-400">No upcoming reminders.</Text>}
        />
      )}
    </View>
  );
}
