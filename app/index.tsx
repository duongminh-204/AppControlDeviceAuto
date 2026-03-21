import AsyncStorage from '@react-native-async-storage/async-storage';
import { Redirect } from 'expo-router';
import 'expo-router/entry';
import { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import 'react-native-gesture-handler';

export default function Index() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    const checkToken = async () => {
      try {
        const token = await AsyncStorage.getItem('authToken');
        if (token) {
          const res = await fetch('http://192.168.1.7:3000/me', {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (res.ok) {
            setIsAuthenticated(true);
            return;
          }
        }
        setIsAuthenticated(false);
      } catch (error) {
        console.error('Auth check error:', error);
        setIsAuthenticated(false);
      }
    };
    checkToken();
  }, []);

  if (isAuthenticated === null) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return isAuthenticated
    ? <Redirect href="/(tabs)/home" />
    : <Redirect href="/auth/login" />;
}