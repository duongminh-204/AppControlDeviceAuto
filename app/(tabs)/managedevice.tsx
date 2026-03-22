import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useCallback, useState } from 'react';
import {
  Alert,
  FlatList,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import AddDeviceButton from '@/components/device/AddDeviceButton';
import DeviceCard from '@/components/device/DeviceCard';
import { mockDevices, type Device } from '@/constants/mock-data';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function ManageDeviceScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const [selectedId, setSelectedId] = useState<string>('1');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'online' | 'offline'>('all');
  const [devices, setDevices] = useState(mockDevices);
  const [refreshing, setRefreshing] = useState(false);

  // Filter devices based on search query and status filter
  const filteredDevices = devices.filter((device) => {
    const matchesSearch =
      device.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      device.location.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      filterStatus === 'all' || device.status === filterStatus;

    return matchesSearch && matchesStatus;
  });

  const handleSelect = (device: Device) => {
    setSelectedId(device.id);
    router.push('/(tabs)/home');
  };

  const handleDelete = (deviceId: string) => {
    const deviceName = devices.find((d) => d.id === deviceId)?.name;
    Alert.alert(
      'Xóa thiết bị',
      `Bạn có chắc chắn muốn xóa "${deviceName}"?`,
      [
        { text: 'Hủy', onPress: () => {}, style: 'cancel' },
        {
          text: 'Xóa',
          onPress: () => {
            setDevices(devices.filter((d) => d.id !== deviceId));
            Alert.alert('Thành công', `Đã xóa "${deviceName}"`);
          },
          style: 'destructive',
        },
      ]
    );
  };

  const handleEdit = (device: Device) => {
    Alert.alert(
      'Chỉnh sửa thiết bị',
      `Chỉnh sửa "${device.name}"`,
      [
        {
          text: 'Đổi tên',
          onPress: () => {
            Alert.prompt(
              'Đổi tên thiết bị',
              'Nhập tên mới:',
              [
                { text: 'Hủy', onPress: () => {} },
                {
                  text: 'Lưu',
                  onPress: (newName: string | undefined) => {
                    if (newName?.trim()) {
                      setDevices(
                        devices.map((d) =>
                          d.id === device.id ? { ...d, name: newName } : d
                        )
                      );
                      Alert.alert('Thành công', 'Đã cập nhật tên thiết bị');
                    }
                  },
                },
              ],
              'plain-text',
              device.name
            );
          },
        },
        {
          text: 'Đổi vị trí',
          onPress: () => {
            Alert.prompt(
              'Đổi vị trí',
              'Nhập vị trí mới:',
              [
                { text: 'Hủy', onPress: () => {} },
                {
                  text: 'Lưu',
                  onPress: (newLocation: string | undefined) => {
                    if (newLocation?.trim()) {
                      setDevices(
                        devices.map((d) =>
                          d.id === device.id
                            ? { ...d, location: newLocation }
                            : d
                        )
                      );
                      Alert.alert('Thành công', 'Đã cập nhật vị trí thiết bị');
                    }
                  },
                },
              ],
              'plain-text',
              device.location
            );
          },
        },
        { text: 'Đóng', onPress: () => {} },
      ]
    );
  };

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setDevices(mockDevices);
    setRefreshing(false);
  }, []);

  const deviceCount = filteredDevices.length;
  const onlineCount = filteredDevices.filter((d) => d.status === 'online').length;

  return (
    <ThemedView style={styles.container}>
      {/* Device List */}
      {filteredDevices.length > 0 ? (
        <FlatList
          ListHeaderComponent={
            <>
              {/* Header */}
              <View style={styles.header}>
                <View></View>
              </View>

              {/* Search Bar */}
              <View style={[styles.searchContainer, { backgroundColor: colorScheme === 'dark' ? '#1e293b' : '#f3f4f6' }]}>
                <Ionicons name="search" size={18} color="#999" />
                <TextInput
                  style={styles.searchInput}
                  placeholder="Tìm kiếm thiết bị..."
                  placeholderTextColor="#999"
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                />
                {searchQuery && (
                  <TouchableOpacity onPress={() => setSearchQuery('')}>
                    <Ionicons name="close-circle" size={18} color="#999" />
                  </TouchableOpacity>
                )}
              </View>

              {/* Filter Buttons */}
              <View style={styles.filterRow}>
                <TouchableOpacity
                  style={[
                    styles.filterBtn,
                    filterStatus === 'all' && styles.filterBtnActive,
                  ]}
                  onPress={() => setFilterStatus('all')}
                >
                  <ThemedText
                    style={[
                      styles.filterBtnText,
                      filterStatus === 'all' && styles.filterBtnTextActive,
                    ]}
                  >
                    Tất cả
                  </ThemedText>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.filterBtn,
                    filterStatus === 'online' && styles.filterBtnActive,
                  ]}
                  onPress={() => setFilterStatus('online')}
                >
                  <View style={styles.onlineDot} />
                  <ThemedText
                    style={[
                      styles.filterBtnText,
                      filterStatus === 'online' && styles.filterBtnTextActive,
                    ]}
                  >
                    Online
                  </ThemedText>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.filterBtn,
                    filterStatus === 'offline' && styles.filterBtnActive,
                  ]}
                  onPress={() => setFilterStatus('offline')}
                >
                  <View style={styles.offlineDot} />
                  <ThemedText
                    style={[
                      styles.filterBtnText,
                      filterStatus === 'offline' && styles.filterBtnTextActive,
                    ]}
                  >
                    Offline
                  </ThemedText>
                </TouchableOpacity>
              </View>

              <AddDeviceButton />
            </>
          }
          data={filteredDevices}
          renderItem={({ item }) => (
            <DeviceCard
              device={item}
              isSelected={item.id === selectedId}
              onSelect={() => handleSelect(item)}
              onDelete={handleDelete}
              onEdit={handleEdit}
            />
          )}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          refreshing={refreshing}
          onRefresh={handleRefresh}
        />
      ) : (
        <View style={styles.emptyState}>
          <Ionicons name="search-outline" size={48} color="#999" />
          <ThemedText style={styles.emptyText}>
            Không tìm thấy thiết bị
          </ThemedText>
          <ThemedText style={styles.emptySubtext}>
            Thử thay đổi tiêu chí tìm kiếm
          </ThemedText>
        </View>
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  title: {
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 12,
    opacity: 0.6,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginHorizontal: 0,
    borderRadius: 12,
    marginBottom: 16,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#333',
  },
  filterRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
    paddingHorizontal: 16,
  },
  filterBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    gap: 6,
  },
  filterBtnActive: {
    backgroundColor: '#2563eb',
  },
  filterBtnText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#666',
  },
  filterBtnTextActive: {
    color: '#fff',
  },
  onlineDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#4ade80',
  },
  offlineDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#f87171',
  },
  list: {
    paddingBottom: 80,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  emptySubtext: {
    fontSize: 12,
    opacity: 0.6,
    textAlign: 'center',
  },
});