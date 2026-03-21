import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Modal, StyleSheet, TouchableOpacity, View } from 'react-native';
import { ThemedText } from './themed-text';
import { ThemedView } from './themed-view';

interface DeviceHeaderProps {
  deviceName: string;
  isOnline: boolean;
  lastUpdated: string;
  temperature: number;
  humidity: number;
  soilMoisture: number;
  onSelectDevice: (device: string) => void;
}

const devices = ['Greenhouse A', 'Greenhouse B', 'Greenhouse C']; // Mock devices

export default function DeviceHeader({
  deviceName,
  isOnline,
  lastUpdated,
  temperature,
  humidity,
  soilMoisture,
  onSelectDevice,
}: DeviceHeaderProps) {
  const [modalVisible, setModalVisible] = useState(false);

  const statusColor = isOnline ? '#4CAF50' : '#F44336'; // Green for online, red for offline

  return (
    <ThemedView style={styles.container}>
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={() => setModalVisible(true)} style={styles.deviceNameContainer}>
          <ThemedText type="title" style={styles.deviceName}>
            {deviceName}
          </ThemedText>
          <Ionicons name="chevron-down" size={20} color="#666" />
        </TouchableOpacity>
        <View style={[styles.statusIndicator, { backgroundColor: statusColor }]} />
      </View>

      <View style={styles.statusRow}>
        <ThemedText style={styles.statusText}>
          {isOnline ? 'Online' : 'Offline'}
        </ThemedText>
        <ThemedText style={styles.lastUpdatedText}>
          {lastUpdated}
        </ThemedText>
      </View>

      <View style={styles.sensorsRow}>
        <View style={styles.sensorItem}>
          <Ionicons name="thermometer" size={16} color="#FF5722" />
          <ThemedText style={styles.sensorValue}>{temperature}°C</ThemedText>
        </View>
        <View style={styles.sensorItem}>
          <Ionicons name="water" size={16} color="#2196F3" />
          <ThemedText style={styles.sensorValue}>{humidity}%</ThemedText>
        </View>
        <View style={styles.sensorItem}>
          <Ionicons name="leaf" size={16} color="#4CAF50" />
          <ThemedText style={styles.sensorValue}>{soilMoisture}%</ThemedText>
        </View>
      </View>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <ThemedText type="subtitle" style={styles.modalTitle}>
              Chọn thiết bị
            </ThemedText>
            {devices.map((device) => (
              <TouchableOpacity
                key={device}
                style={styles.deviceOption}
                onPress={() => {
                  onSelectDevice(device);
                  setModalVisible(false);
                }}
              >
                <ThemedText style={styles.deviceOptionText}>{device}</ThemedText>
              </TouchableOpacity>
            ))}
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setModalVisible(false)}
            >
              <ThemedText style={styles.closeButtonText}>Đóng</ThemedText>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    margin: 16,
    marginTop: 60,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  deviceNameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  deviceName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginRight: 8,
  },
  statusIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  statusText: {
    fontSize: 14,
    color: '#666',
  },
  lastUpdatedText: {
    fontSize: 12,
    color: '#999',
  },
  sensorsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  sensorItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sensorValue: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 4,
    color: '#333',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    width: '80%',
    maxHeight: '60%',
  },
  modalTitle: {
    marginBottom: 16,
    textAlign: 'center',
    color: '#007AFF',
  },
  deviceOption: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
  },
  deviceOptionText: {
    fontSize: 16,
    color: '#333',
  },
  closeButton: {
    marginTop: 16,
    paddingVertical: 12,
    backgroundColor: '#007AFF',
    borderRadius: 8,
    alignItems: 'center',
  },
  closeButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});