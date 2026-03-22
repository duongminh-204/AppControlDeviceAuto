// components/device/DeviceCard.tsx
import { ThemedText } from '@/components/themed-text';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, TouchableOpacity, View } from 'react-native';

import { Device } from '@/constants/mock-data';

type DeviceCardProps = {
  device: Device;
  isSelected: boolean;
  onSelect: () => void;
  onDelete?: (id: string) => void;
  onEdit?: (device: Device) => void;
};

const SignalBars = ({ signal }: { signal: number }) => {
  return (
    <View style={styles.signalBars}>
      {[...Array(4)].map((_, i) => (
        <View
          key={i}
          style={[
            styles.signalBar,
            { opacity: i < signal ? 1 : 0.2 },
          ]}
        />
      ))}
    </View>
  );
};

const WifiStatus = ({ signal, isOnline }: { signal: number; isOnline: boolean }) => {
  const getWifiLabel = () => {
    if (!isOnline) return 'Offline';
    if (signal === 4) return 'Excellent';
    if (signal === 3) return 'Good';
    if (signal === 2) return 'Fair';
    return 'Weak';
  };

  return (
    <View style={styles.wifiStatusContainer}>
      <Ionicons
        name={isOnline ? 'wifi' : 'wifi-outline'}
        size={14}
        color={isOnline ? '#3b82f6' : '#ef4444'}
      />
      <ThemedText style={styles.wifiStatusText}>{getWifiLabel()}</ThemedText>
    </View>
  );
};

const BatteryIndicator = ({ level }: { level: number }) => {
  const getBatteryColor = () => {
    if (level > 50) return '#10b981';
    if (level > 20) return '#f59e0b';
    return '#ef4444';
  };

  return (
    <View style={styles.batteryContainer}>
      <View style={[styles.batteryBar, { backgroundColor: getBatteryColor(), width: `${level}%` }]} />
      <ThemedText style={styles.batteryText}>{level}%</ThemedText>
    </View>
  );
};

export default function DeviceCard({
  device,
  isSelected,
  onSelect,
  onDelete,
  onEdit,
}: DeviceCardProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const isOnline = device.status === 'online';

  const isSoilMoistureAlert = device.soilMoisture < 30 && isOnline;
  const hasAlert = device.hasAlert || isSoilMoistureAlert;

  return (
    <TouchableOpacity
      style={[
        styles.card,
        isSelected && styles.selectedCard,
        hasAlert && styles.alertCard,
        {
          backgroundColor: colorScheme === 'dark' ? '#1e293b' : '#ffffff',
        },
      ]}
      onPress={onSelect}
      activeOpacity={0.8}
    >
      {/* Alert Indicator */}
      {hasAlert && (
        <View style={styles.alertBadge}>
          <Ionicons name="warning" size={14} color="#fff" />
        </View>
      )}

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
        <View style={styles.headerRow}>
          <ThemedText type="defaultSemiBold" style={styles.deviceName}>
            {device.name}
          </ThemedText>
          <View style={styles.statusBadge}>
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
        </View>

        <ThemedText style={styles.location}>{device.location}</ThemedText>

        {/* Sensor Readings */}
        {isOnline && (
          <View style={styles.sensorsRow}>
            <View style={styles.sensorItem}>
              <Ionicons name="thermometer-outline" size={14} color="#FF5722" />
              <ThemedText style={styles.sensorValue}>{Math.round(device.temperature)}°</ThemedText>
            </View>
            <View style={styles.sensorDivider} />
            <View style={styles.sensorItem}>
              <Ionicons name="water-outline" size={14} color="#2196F3" />
              <ThemedText style={styles.sensorValue}>{Math.round(device.humidity)}%</ThemedText>
            </View>
            <View style={styles.sensorDivider} />
            <View style={styles.sensorItem}>
              <Ionicons name="leaf-outline" size={14} color="#4CAF50" />
              <ThemedText
                style={[
                  styles.sensorValue,
                  isSoilMoistureAlert && styles.alertValue,
                ]}
              >
                {Math.round(device.soilMoisture)}%
              </ThemedText>
            </View>
          </View>
        )}

        {/* Battery and Signal */}
        <View style={styles.bottomRow}>
          <WifiStatus signal={device.signal} isOnline={isOnline} />
          {!isOnline && (
            <ThemedText style={styles.lastActiveText}>
              {device.lastActive}
            </ThemedText>
          )}
        </View>

        {/* Alert Message */}
        {hasAlert && device.alertMessage && (
          <View style={styles.alertMessage}>
            <Ionicons name="alert-circle" size={12} color="#FF5722" />
            <ThemedText style={styles.alertText}>{device.alertMessage}</ThemedText>
          </View>
        )}
      </View>

      {/* Action Buttons */}
      <View style={styles.actionButtons}>
        {onEdit && (
          <TouchableOpacity
            style={styles.actionBtn}
            onPress={() => onEdit(device)}
          >
            <Ionicons name="create-outline" size={16} color="#3b82f6" />
          </TouchableOpacity>
        )}
        {onDelete && (
          <TouchableOpacity
            style={[styles.actionBtn, styles.deletBtn]}
            onPress={() => onDelete(device.id)}
          >
            <Ionicons name="trash-outline" size={16} color="#ef4444" />
          </TouchableOpacity>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 12,
    borderRadius: 16,
    marginBottom: 12,
    marginHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 4,
    position: 'relative',
  },
  selectedCard: {
    borderWidth: 2,
    borderColor: '#3b82f6',
    shadowOpacity: 0.2,
    elevation: 6,
  },
  alertCard: {
    borderWidth: 1,
    borderColor: '#FF5722',
  },
  alertBadge: {
    position: 'absolute',
    top: -6,
    right: 12,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#FF5722',
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: 'rgba(74, 144, 226, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  infoContainer: {
    flex: 1,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  deviceName: {
    fontSize: 15,
    fontWeight: '600',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: 'rgba(0, 0, 0, 0.04)',
    borderRadius: 12,
  },
  location: {
    fontSize: 12,
    opacity: 0.7,
    marginBottom: 6,
  },
  sensorsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 6,
    paddingVertical: 8,
    paddingHorizontal: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.03)',
    borderRadius: 8,
  },
  sensorItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  sensorValue: {
    fontSize: 12,
    fontWeight: '500',
  },
  alertValue: {
    color: '#FF5722',
    fontWeight: '600',
  },
  sensorDivider: {
    width: 1,
    height: 14,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    marginHorizontal: 8,
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 6,
  },
  batteryContainer: {
    width: 50,
    height: 16,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 4,
    overflow: 'hidden',
    position: 'relative',
  },
  batteryBar: {
    height: '100%',
  },
  batteryText: {
    position: 'absolute',
    fontSize: 8,
    fontWeight: '600',
    top: 2,
    left: 2,
    color: '#fff',
  },
  signalBars: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 2,
  },
  signalBar: {
    width: 2,
    backgroundColor: '#3b82f6',
    borderRadius: 1,
  },
  lastActiveText: {
    fontSize: 11,
    opacity: 0.6,
  },
  alertMessage: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 6,
    paddingHorizontal: 8,
    paddingVertical: 6,
    backgroundColor: '#FFF5F0',
    borderRadius: 8,
  },
  alertText: {
    fontSize: 11,
    color: '#FF5722',
    fontWeight: '500',
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 4,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
  },
  wifiStatusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    borderRadius: 6,
  },
  wifiStatusText: {
    fontSize: 11,
    fontWeight: '500',
    color: '#3b82f6',
  },
  actionButtons: {
    flexDirection: 'column',
    alignItems: 'center',
    gap: 8,
  },
  actionBtn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
  },
  deletBtn: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
  },
});