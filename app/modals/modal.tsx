import { router } from 'expo-router';
import { StyleSheet, TouchableOpacity, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useThemeColor } from '@/hooks/use-theme-color';

export default function ModalScreen() {
  const cardBackground = useThemeColor({}, 'card'); 
  const textColor = useThemeColor({}, 'text');
  const backdropColor = useThemeColor({}, 'backdrop');

  const handleDismiss = () => {
    router.dismiss(); // Dismiss modal an toàn nhất
    // Hoặc router.back() nếu muốn quay về màn hình trước đó
  };

  return (
    <ThemedView style={[styles.container, { backgroundColor: backdropColor || 'rgba(0,0,0,0.6)' }]}>
      {/* Backdrop click để dismiss (tùy chọn) */}
      <TouchableOpacity
        style={StyleSheet.absoluteFill}
        activeOpacity={1}
        onPress={handleDismiss}
      />

      <View style={[styles.card, { backgroundColor: cardBackground }]}>
        <ThemedText type="title" style={styles.title}>
          Thông tin nhanh
        </ThemedText>

        <ThemedText style={[styles.description, { color: textColor }]}>
          Đây là modal hiển thị nội dung phụ hoặc xác nhận. Bạn có thể tùy chỉnh nội dung này cho các thông báo quan trọng trong ứng dụng.
        </ThemedText>

        <TouchableOpacity
          onPress={handleDismiss}
          style={styles.button}
          accessibilityLabel="Quay lại màn hình chính"
          accessibilityRole="button"
        >
          <ThemedText type="link" style={styles.buttonText}>
            Quay lại màn hình chính
          </ThemedText>
        </TouchableOpacity>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  card: {
    width: '100%',
    maxWidth: 420,
    padding: 24,
    borderRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 18 },
    shadowOpacity: 0.25,
    shadowRadius: 24,
    elevation: 14,
  },
  title: {
    textAlign: 'center',
    marginBottom: 12,
  },
  description: {
    textAlign: 'center',
    fontSize: 14,
    opacity: 0.85,
    marginBottom: 24,
    lineHeight: 20,
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignSelf: 'center',
    backgroundColor: 'rgba(22,163,74,0.1)', // xanh nhẹ, hoặc dùng theme
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});