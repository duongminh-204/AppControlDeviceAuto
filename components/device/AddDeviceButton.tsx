import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { StyleSheet, TouchableOpacity } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function AddDeviceButton() {
  const theme = useColorScheme() ?? 'light';

  const handlePress = () => {
    // Cách 1: chuyển sang modal quét QR
    router.push('/modals/scan-qr');

    // Cách 2: nếu muốn truyền param (ví dụ mode)
    // router.push({ pathname: '/modals/scan-qr', params: { purpose: 'add-device' } });
  };

  return (
    <TouchableOpacity
      style={[
        styles.btn,
        { backgroundColor: theme === 'dark' ? '#3b82f6' : '#2563eb' },
      ]}
      onPress={handlePress}
      activeOpacity={0.8}
    >
      <Ionicons name="qr-code-outline" size={22} color="#fff" />
      <ThemedText style={styles.text}>Thêm thiết bị bằng QR</ThemedText>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  btn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    marginHorizontal: 4,
    marginVertical: 12,
    paddingVertical: 14,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  text: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});