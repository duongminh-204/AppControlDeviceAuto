import { Link } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

export default function ModalScreen() {
  return (
    <ThemedView style={styles.container}>
      <View style={styles.card}>
        <ThemedText type="title" style={styles.title}>
          Thông tin nhanh
        </ThemedText>
        <ThemedText style={styles.description}>
          Đây là modal hiển thị nội dung phụ hoặc xác nhận. Bạn có thể tuỳ chỉnh nội dung này cho các
          thông báo quan trọng trong ứng dụng.
        </ThemedText>

        <Link href="/" dismissTo style={styles.link}>
          <ThemedText type="link">Quay lại màn hình chính</ThemedText>
        </Link>
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
    backgroundColor: 'rgba(15,23,42,0.9)',
  },
  card: {
    width: '100%',
    maxWidth: 420,
    padding: 24,
    borderRadius: 24,
    backgroundColor: 'rgba(15,23,42,1)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 18 },
    shadowOpacity: 0.25,
    shadowRadius: 24,
    elevation: 14,
  },
  title: {
    textAlign: 'center',
    marginBottom: 8,
  },
  description: {
    textAlign: 'center',
    fontSize: 14,
    opacity: 0.8,
    marginBottom: 18,
  },
  link: {
    marginTop: 8,
    paddingVertical: 10,
    alignSelf: 'center',
  },
});
