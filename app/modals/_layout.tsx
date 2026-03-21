import { Stack } from 'expo-router';

export default function ModalsLayout() {
  return (
    <Stack
      screenOptions={{
        presentation: 'modal',
        headerShown: false,
        animation: 'slide_from_bottom',
      }}
    >
      <Stack.Screen name="modal" options={{ title: 'Modal' }} />
      <Stack.Screen name="scan-qr" options={{ title: 'Quét mã QR' }} />
    </Stack>
  );
}