import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import { FlatList, StyleSheet, TouchableOpacity, View } from 'react-native';

type Device = {
  id: string;
  name: string;
  location: string;
  status: 'online' | 'offline';
  lastActive: string;
};

const mockDevices: Device[] = [
  { id: '1', name: 'Greenhouse A', location: 'Vườn tiêu Phú Thọ', status: 'online', lastActive: 'Vừa xong' },
  { id: '2', name: 'Greenhouse B', location: 'Khu nhà kính 2', status: 'online', lastActive: '5 phút trước' },
  { id: '3', name: 'Greenhouse C', location: 'Vườn rau sạch', status: 'offline', lastActive: '2 giờ trước' },
  { id: '4', name: 'Hệ thống tưới 1', location: 'Khu A', status: 'online', lastActive: '10 giây trước' },
];

export default function ManageDeviceScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const [selectedDeviceId, setSelectedDeviceId] = useState('1');

  const handleSelectDevice = (device: Device) => {
    setSelectedDeviceId(device.id);
   
    router.push('/(tabs)/home');
  };

  const renderItem = ({ item }: { item: Device }) => {
    const isSelected = item.id === selectedDeviceId;
    const isOnline = item.status === 'online';

    return (
      <TouchableOpacity
        style={[
          styles.deviceCard,
          isSelected && styles.selectedCard,
          { backgroundColor: colorScheme === 'dark' ? '#1e293b' : '#ffffff' },
        ]}
        onPress={() => handleSelectDevice(item)}
      >
        <View style={styles.deviceIconContainer}>
          <Ionicons
            name="leaf"
            size={28}
            color={isOnline ? '#4ade80' : '#f87171'}
          />
        </View>

        <View style={styles.deviceInfo}>
          <ThemedText type="defaultSemiBold" style={styles.deviceName}>
            {item.name}
          </ThemedText>
          <ThemedText style={styles.deviceLocation}>{item.location}</ThemedText>
        </View>

        <View style={styles.statusContainer}>
          <View
            style={[
              styles.statusDot,
              { backgroundColor: isOnline ? '#4ade80' : '#f87171' },
            ]}
          />
          <ThemedText style={styles.statusText}>
            {isOnline ? 'Online' : 'Offline'}
          </ThemedText>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title" style={styles.title}>
        Quản lý thiết bị
      </ThemedText>

      <ThemedText type="default" style={styles.subtitle}>
        Chọn thiết bị bạn muốn theo dõi và điều khiển
      </ThemedText>

      <FlatList
        data={mockDevices}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    paddingTop: 70,
  },
  title: {
    marginBottom: 8,
  },
  subtitle: {
    opacity: 0.7,
    marginBottom: 24,
  },
  listContent: {
    paddingBottom: 40,
  },
  deviceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  selectedCard: {
    borderWidth: 2,
    borderColor: '#3b82f6',
  },
  deviceIconContainer: {
    width: 52,
    height: 52,
    borderRadius: 12,
    backgroundColor: 'rgba(74, 144, 226, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  deviceInfo: {
    flex: 1,
  },
  deviceName: {
    fontSize: 16,
    marginBottom: 4,
  },
  deviceLocation: {
    fontSize: 13,
    opacity: 0.7,
  },
  statusContainer: {
    alignItems: 'center',
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginBottom: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
});