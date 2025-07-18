import React from 'react';
import { View, Text, ActivityIndicator, ScrollView, TouchableOpacity } from 'react-native';
import { MaterialIcons, FontAwesome5, Entypo } from '@expo/vector-icons';
import { useAuth } from '../../hooks/useAuth';
import { useDashboardStats, useUpcoming } from '../../hooks/useDashboard';
import styles from '../dashboard.styles';
import { ScrollView as HScrollView } from 'react-native-gesture-handler';

export default function DashboardScreen() {
  const { user } = useAuth();
  const { data: stats, isLoading: statsLoading, error: statsError } = useDashboardStats();
  const { data: upcoming, isLoading: upcomingLoading, error: upcomingError } = useUpcoming();

  // Service icon logic
  const getServiceIcon = (name: string) => {
    const lower = name.toLowerCase();
    if (lower.includes('netflix')) return <MaterialIcons name="ondemand-video" size={28} color="#e50914" style={styles.upcomingIcon} />;
    if (lower.includes('spotify')) return <FontAwesome5 name="spotify" size={28} color="#1db954" style={styles.upcomingIcon} />;
    if (lower.includes('dropbox')) return <FontAwesome5 name="dropbox" size={28} color="#0061ff" style={styles.upcomingIcon} />;
    if (lower.includes('warranty')) return <Entypo name="shield" size={28} color="#6366f1" style={styles.upcomingIcon} />;
    return <MaterialIcons name="credit-card" size={28} color="#2563eb" style={styles.upcomingIcon} />;
  };

  // Urgency color logic
  const getUrgencyColor = (days: number) => {
    if (days <= 3) return '#ef4444'; // red
    if (days <= 7) return '#eab308'; // yellow
    return '#2563eb'; // blue
  };

  // Floating Add Button (for demonstration, triggers alert)
  const onAddPress = () => {
    // You can open a modal or navigate to add screen
    alert('Add Subscription or Warranty');
  };

  return (
    <View style={styles.screen}>
      {/* Header */}
      <View style={{ paddingTop: 32, paddingBottom: 8, paddingHorizontal: 18, backgroundColor: '#fff', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', elevation: 2, shadowColor: '#000', shadowOpacity: 0.04 }}>
        <View>
          <Text style={{ fontSize: 22, fontWeight: 'bold', color: '#222' }}>Dashboard</Text>
          {user && (
            <Text style={{ color: '#6366f1', fontSize: 15, marginTop: 2 }}>Hi, {user.firstName || user.phoneNumber || 'User'}!</Text>
          )}
        </View>
        <MaterialIcons name="account-circle" size={36} color="#a5b4fc" />
      </View>
      {/* Stats Cards: horizontal scroll */}
      <HScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 14, marginBottom: 12 }} contentContainerStyle={{ paddingHorizontal: 12 }}>
        {statsLoading ? (
          <ActivityIndicator size="small" color="#2563eb" style={{ marginHorizontal: 20 }} />
        ) : statsError ? (
          <Text style={{ color: 'red', marginHorizontal: 20 }}>Failed to load stats</Text>
        ) : stats ? (
          <>
            <View style={[styles.statCard, { minWidth: 130, marginRight: 10 }]}> 
              <MaterialIcons name="shield" size={32} color="#6366f1" style={styles.statIcon} />
              <Text style={styles.statLabel}>Warranties</Text>
              <Text style={styles.statValue}>{stats.warranties}</Text>
            </View>
            <View style={[styles.statCard, { minWidth: 130, marginRight: 10 }]}> 
              <MaterialIcons name="subscriptions" size={32} color="#2563eb" style={styles.statIcon} />
              <Text style={styles.statLabel}>Subscriptions</Text>
              <Text style={styles.statValue}>{stats.subscriptions}</Text>
            </View>
            <View style={[styles.statCard, { minWidth: 130, marginRight: 10 }]}> 
              <MaterialIcons name="notifications-active" size={32} color="#10b981" style={styles.statIcon} />
              <Text style={styles.statLabel}>Reminders</Text>
              <Text style={styles.statValue}>{stats.reminders}</Text>
            </View>
            <View style={[styles.statCard, { minWidth: 130 }]}> 
              <MaterialIcons name="schedule" size={32} color="#eab308" style={styles.statIcon} />
              <Text style={styles.statLabel}>Due Soon</Text>
              <Text style={[styles.statValue, styles.statValueWarning]}>{stats.dueSoon}</Text>
            </View>
          </>
        ) : null}
      </HScrollView>
      {/* Upcoming Section: vertical list */}
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.sectionTitle}>Upcoming</Text>
        {upcomingLoading ? (
          <ActivityIndicator size="small" color="#2563eb" style={{ marginVertical: 10 }} />
        ) : upcomingError ? (
          <Text style={{ color: 'red', marginVertical: 10 }}>Failed to load upcoming reminders</Text>
        ) : upcoming && upcoming.length > 0 ? (
          upcoming.map((item: any) => {
            const days = item.daysUntil || 10;
            return (
              <TouchableOpacity key={item.id} style={[styles.upcomingCard, { borderLeftWidth: 5, borderLeftColor: getUrgencyColor(days) }]}
                activeOpacity={0.85} onPress={() => alert(`Open details for ${item.title}`)}>
                {getServiceIcon(item.serviceName || item.type || item.title)}
                <View style={styles.upcomingInfo}>
                  <Text style={styles.upcomingTitle}>{item.title}</Text>
                  <Text style={styles.upcomingMeta}>{item.type} • Due: {new Date(item.dueDate).toLocaleDateString()}</Text>
                </View>
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{days}d</Text>
                </View>
              </TouchableOpacity>
            );
          })
        ) : (
          <Text style={{ color: '#888', marginVertical: 10 }}>No upcoming reminders</Text>
        )}
      </ScrollView>
      <TouchableOpacity style={styles.addButton} onPress={onAddPress}>
        <Text style={styles.addButtonText}>+</Text>
      </TouchableOpacity>
    </View>
  );
}


