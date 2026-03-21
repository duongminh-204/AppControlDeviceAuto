import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Ionicons } from '@expo/vector-icons';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';

export default function ScanQRModal() {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);

  const handleClose = () => router.back();

  const handleBarCodeScanned = ({ data }: { data: string; type: string }) => {
    if (scanned) return;
    setScanned(true);
    console.log('QR scanned:', data);
    // Xử lý thêm thiết bị ở đây
    router.back();
  };

  if (!permission) {
    return <ThemedText>Đang kiểm tra quyền camera...</ThemedText>;
  }

  if (!permission.granted) {
    return (
      <ThemedView style={styles.noPermissionContainer}>
        <ThemedText style={styles.noPermissionText}>
          Cần quyền truy cập camera để quét mã QR thiết bị
        </ThemedText>
        <TouchableOpacity
          onPress={requestPermission}
          style={styles.permissionButton}
        >
          <ThemedText style={styles.buttonText}>Cấp quyền camera</ThemedText>
        </TouchableOpacity>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleClose}>
          <Ionicons name="close" size={28} color="white" />
        </TouchableOpacity>
        <ThemedText type="subtitle" style={{ color: 'white' }}>
          Quét mã QR thiết bị
        </ThemedText>
        <View style={{ width: 28 }} />
      </View>

      <CameraView
        style={styles.scanner}
        facing="back"
        onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
        barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
      />

      <ThemedText style={styles.hint}>
        Đưa camera vào mã QR trên thiết bị để thêm tự động
      </ThemedText>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 20,
  },
  scanner: { flex: 1 },
  hint: {
    color: 'white',
    textAlign: 'center',
    padding: 24,
    paddingBottom: 60,
    opacity: 0.9,
  },
  noPermissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
    padding: 20,
  },
  noPermissionText: {
    color: 'white',
    textAlign: 'center',
    fontSize: 18,
    marginBottom: 20,
  },
  permissionButton: {
    backgroundColor: '#2563eb',
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 12,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});