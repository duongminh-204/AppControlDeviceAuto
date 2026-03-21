import { Stack } from 'expo-router';

export default function ModalsLayout() {
  return (
    <Stack
      screenOptions={{
        presentation: 'modal',
        headerShown: false,
        animation: 'slide_from_bottom', // hoặc 'fade'
      }}
    >
      <Stack.Screen name="info" options={{ title: 'Thông tin' }} />
    </Stack>
  );
}