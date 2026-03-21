// components/device/DeviceCard.tsx
import { ThemedText } from '@/components/themed-text';
import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { useColorScheme } from '@/hooks/use-color-scheme';

import { Device } from '@/constants/mock-data';  // hoặc đường dẫn khác nếu bạn đặt mock-data ở chỗ khác

type DeviceCardProps = {
  device: Device;
  isSelected: boolean;
  onSelect: () => void;
};

export default function DeviceCard({ device, isSelected, onSelect }: DeviceCardProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const isOnline = device.status === 'online';

  return (
    <TouchableOpacity
      style={[
        styles.card,
        isSelected && styles.selectedCard,
        {
          backgroundColor: colorScheme === 'dark' ? '#1e293b' : '#ffffff',
        },
      ]}
      onPress={onSelect}
      activeOpacity={0.8}
    >
      {/* Icon đại diện thiết bị */}
      <View style={styles.iconContainer}>
        <Ionicons
          name="leaf-outline"
          size={28}
          color={isOnline ? '#4ade80' : '#f87171'}
        />
      </View>

      {/* Thông tin chính */}
      <View style={styles.infoContainer}>
        <ThemedText type="defaultSemiBold" style={styles.deviceName}>
          {device.name}
        </ThemedText>
        <ThemedText style={styles.location}>{device.location}</ThemedText>
      </View>

      {/* Trạng thái online/offline */}
      <View style={styles.statusContainer}>
        <View
          style={[
            styles.statusDot,
            { backgroundColor: isOnline ? '#4ade80' : '#f87171' },
          ]}
        />
        <ThemedText
          style={[
            styles.statusText,
            { color: isOnline ? '#4ade80' : '#f87171' },
          ]}
        >
          {isOnline ? 'Online' : 'Offline'}
        </ThemedText>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 4,
  },
  selectedCard: {
    borderWidth: 2,
    borderColor: '#3b82f6',
    shadowOpacity: 0.2,
    elevation: 6,
  },
  iconContainer: {
    width: 52,
    height: 52,
    borderRadius: 12,
    backgroundColor: 'rgba(74, 144, 226, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  infoContainer: {
    flex: 1,
  },
  deviceName: {
    fontSize: 16,
    marginBottom: 4,
  },
  location: {
    fontSize: 13,
    opacity: 0.7,
  },
  statusContainer: {
    alignItems: 'center',
    justifyContent: 'center',
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