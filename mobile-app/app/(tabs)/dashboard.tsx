import React, { useRef, useState } from 'react';
import { View, Text, ActivityIndicator, ScrollView, TouchableOpacity, Animated, TouchableWithoutFeedback } from 'react-native';
import { MaterialIcons, FontAwesome5, Entypo } from '@expo/vector-icons';
import { useAuth } from '../../hooks/useAuth';
import { useDashboardStats, useUpcoming } from '../../hooks/useDashboard';
import styles from '../dashboard.styles';
import { ScrollView as HScrollView } from 'react-native-gesture-handler';
import AddActionSheet from '../components/AddActionSheet';
import WarrantyFormModal from '../components/WarrantyFormModal';
import SubscriptionFormModal from '../components/SubscriptionFormModal';
import ReminderFormModal from '../components/ReminderFormModal';

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
}

function getGreetingEmoji() {
  const hour = new Date().getHours();
  if (hour < 12) return '☀️';
  if (hour < 18) return '🌤️';
  return '🌙';
}

type StatCardProps = {
  children: React.ReactNode,
  color: string,
  shadowColor: string,
  style?: any
};

function StatCard({ children, color, shadowColor, style }: StatCardProps) {
  const scale = useRef(new Animated.Value(1)).current;
  const handlePressIn = () => {
    Animated.spring(scale, { toValue: 1.04, useNativeDriver: true, speed: 30, bounciness: 6 }).start();
  };
  const handlePressOut = () => {
    Animated.spring(scale, { toValue: 1, useNativeDriver: true, speed: 30, bounciness: 6 }).start();
  };
  return (
    <TouchableWithoutFeedback onPressIn={handlePressIn} onPressOut={handlePressOut}>
      <Animated.View style={[
        {
          width: 160,
          height: 110,
          backgroundColor: color,
          borderRadius: 20,
          paddingVertical: 18,
          paddingHorizontal: 12,
          shadowColor: shadowColor,
          shadowOpacity: 0.10,
          shadowRadius: 12,
          shadowOffset: { width: 0, height: 6 },
          elevation: 4,
          transform: [{ scale }],
          justifyContent: 'center',
        },
        style,
      ]}>
        {children}
      </Animated.View>
    </TouchableWithoutFeedback>
  );
}

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

  // AddActionSheet state
  const [showAddSheet, setShowAddSheet] = useState(false);
  const [showWarrantyModal, setShowWarrantyModal] = useState(false);
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
  const [showReminderModal, setShowReminderModal] = useState(false);

  // Handle AddActionSheet selection
  const handleAddSelect = (key: string) => {
    setShowAddSheet(false);
    if (key === 'warranty') {
      setShowWarrantyModal(true);
    } else if (key === 'subscription') {
      setShowSubscriptionModal(true);
    } else if (key === 'reminder') {
      setShowReminderModal(true);
    }
  };

  // Floating Add Button
  const onAddPress = () => {
    setShowAddSheet(true);
  };

  return (
    <View style={styles.screen}>
      {/* Header */}
      <View style={{ paddingTop: 32, paddingBottom: 8, paddingHorizontal: 18, backgroundColor: '#fff', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', elevation: 2, shadowColor: '#000', shadowOpacity: 0.04 }}>
        <View>
          <Text style={{ fontSize: 22, fontWeight: 'bold', color: '#222', fontFamily: 'System' }}>{getGreeting()}, {user?.firstName || user?.phoneNumber || 'User'}! <Text style={{ fontSize: 20 }}>{getGreetingEmoji()}</Text></Text>
        </View>
        <MaterialIcons name="account-circle" size={36} color="#a5b4fc" />
      </View>
      {/* Stats Cards: 2x2 grid, mobile optimized */}
      <View style={{ marginTop: 14, marginBottom: 12, paddingHorizontal: 16 }}>
        {statsLoading ? (
          <ActivityIndicator size="small" color="#2563eb" style={{ marginVertical: 20 }} />
        ) : statsError ? (
          <Text style={{ color: 'red', marginVertical: 20 }}>Failed to load stats</Text>
        ) : stats ? (
          <>
            <StatCard color="#e0e7ff" shadowColor="#2563eb" style={{ marginBottom: 18, width: '100%' }}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <MaterialIcons name="subscriptions" size={38} color="#2563eb" style={{ marginRight: 18 }} />
                <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Text style={[styles.statLabel, { fontSize: 15, color: '#1e293b', fontWeight: '600' }]}>Active Subscriptions</Text>
                  <Text style={[styles.statValue, { fontSize: 22, fontWeight: 'bold', color: '#2563eb' }]}>{stats.activeSubscriptions}</Text>
                </View>
              </View>
            </StatCard>
            <StatCard color="#d1fae5" shadowColor="#10b981" style={{ marginBottom: 18, width: '100%' }}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <MaterialIcons name="attach-money" size={38} color="#10b981" style={{ marginRight: 18 }} />
                <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Text style={[styles.statLabel, { fontSize: 15, color: '#065f46', fontWeight: '600' }]}>Monthly Spend</Text>
                  <Text style={[styles.statValue, { fontSize: 22, fontWeight: 'bold', color: '#065f46' }]}>{stats.monthlySpend ? `₹${stats.monthlySpend}` : '₹0'}</Text>
                </View>
              </View>
            </StatCard>
            <StatCard color="#f3e8ff" shadowColor="#a78bfa" style={{ marginBottom: 18, width: '100%' }}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <MaterialIcons name="shield" size={38} color="#7c3aed" style={{ marginRight: 18 }} />
                <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Text style={[styles.statLabel, { fontSize: 15, color: '#6d28d9', fontWeight: '600' }]}>Active Warranties</Text>
                  <Text style={[styles.statValue, { fontSize: 22, fontWeight: 'bold', color: '#6d28d9' }]}>{stats.activeWarranties}</Text>
                </View>
              </View>
            </StatCard>
            <StatCard color="#fef9c3" shadowColor="#eab308" style={{ width: '100%' }}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <MaterialIcons name="schedule" size={38} color="#eab308" style={{ marginRight: 18 }} />
                <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Text style={[styles.statLabel, { fontSize: 15, color: '#b45309', fontWeight: '600' }]}>Due This Week</Text>
                  <Text style={[styles.statValue, { fontSize: 22, fontWeight: 'bold', color: '#b45309' }]}>{stats.dueSoon}</Text>
                </View>
              </View>
            </StatCard>
          </>
        ) : null}
      </View>
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
      <AddActionSheet
        visible={showAddSheet}
        onClose={() => setShowAddSheet(false)}
        onSelect={handleAddSelect}
      />
      <WarrantyFormModal
        visible={showWarrantyModal}
        onClose={() => setShowWarrantyModal(false)}
        onSubmit={() => setShowWarrantyModal(false)}
        initialValues={undefined}
        isEditing={false}
      />
      <SubscriptionFormModal
        visible={showSubscriptionModal}
        onClose={() => setShowSubscriptionModal(false)}
        onSubmit={() => setShowSubscriptionModal(false)}
        initialValues={undefined}
        isEditing={false}
      />
      <ReminderFormModal
        visible={showReminderModal}
        onClose={() => setShowReminderModal(false)}
        onSubmit={() => setShowReminderModal(false)}
        initialValues={undefined}
        isEditing={false}
      />
    </View>
  );
}


