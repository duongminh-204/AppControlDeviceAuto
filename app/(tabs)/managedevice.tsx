import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { router } from 'expo-router';
import { useState } from 'react';
import { FlatList, StyleSheet } from 'react-native';

import AddDeviceButton from '@/components/device/AddDeviceButton';
import DeviceCard from '@/components/device/DeviceCard';
import { mockDevices, type Device } from '@/constants/mock-data'; // bạn có thể tạo file này

export default function ManageDeviceScreen() {
  const [selectedId, setSelectedId] = useState<string>('1');

  const handleSelect = (device: Device) => {
    setSelectedId(device.id);
    router.push('/(tabs)/home');
  };

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title" style={styles.title}>
        Quản lý thiết bị
      </ThemedText>

      <ThemedText type="default" style={styles.subtitle}>
        Chọn thiết bị bạn muốn theo dõi và điều khiển
      </ThemedText>

      <AddDeviceButton />

      <FlatList
        data={mockDevices}
        renderItem={({ item }) => (
          <DeviceCard
            device={item}
            isSelected={item.id === selectedId}
            onSelect={() => handleSelect(item)}
          />
        )}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, paddingTop: 60 },
  title: { marginBottom: 8 },
  subtitle: { opacity: 0.7, marginBottom: 16 },
  list: { paddingBottom: 40 },
});