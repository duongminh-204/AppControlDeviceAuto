import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Network from 'expo-network';
import { Redirect } from 'expo-router';
import 'expo-router/entry';
import { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import 'react-native-gesture-handler';

const getApiBaseUrl = async (): Promise<string> => {
  try {
    const storedUrl = await AsyncStorage.getItem('apiBaseUrl');
    if (storedUrl) {
      return storedUrl;
    }

    // Auto-detect server IP on the same network
    const deviceIP = await Network.getIpAddressAsync();
    if (deviceIP && deviceIP !== 'unknown') {
      const parts = deviceIP.split('.');
      if (parts.length === 4) {
        const base = parts.slice(0, 3).join('.') + '.';
        const foundUrl = await findServerIP(base, 3000);
        if (foundUrl) {
          console.log('[API Config] Auto-detected server at:', foundUrl);
          await AsyncStorage.setItem('apiBaseUrl', foundUrl); // Cache it
          return foundUrl;
        }
      }
    }

    const fallbackUrl = 'http://192.168.0.104:3000';
    return fallbackUrl;
  } catch (e) {
    console.error('[API Config] Error detecting URL:', e);
    return 'http://192.168.0.104:3000';
  }
};

// Function to scan network for server
async function findServerIP(base: string, port: number): Promise<string | null> {
  console.log('[Auto-detect] Scanning network with base:', base);
  const promises = [];
  for (let i = 100; i <= 120; i++) { // Scan range, adjust if needed
    const ip = `${base}${i}`;
    console.log('[Auto-detect] Trying IP:', ip);
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2000); // 2s timeout
    promises.push(
      fetch(`http://${ip}:${port}/ping`, {
        method: 'GET',
        signal: controller.signal,
      })
        .then(() => {
          clearTimeout(timeoutId);
          console.log('[Auto-detect] Found server at:', ip);
          return ip;
        })
        .catch(() => {
          clearTimeout(timeoutId);
          return null;
        })
    );
  }
  const results = await Promise.all(promises);
  const found = results.find(ip => ip !== null);
  if (found) {
    console.log('[Auto-detect] Server found at:', found);
  } else {
    console.log('[Auto-detect] No server found in range');
  }
  return found ? `http://${found}:${port}` : null;
}

export default function Index() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    const checkToken = async () => {
      try {
        const apiUrl = await getApiBaseUrl();
        const token = await AsyncStorage.getItem('authToken');
        if (token) {
          const res = await fetch(`${apiUrl}/me`, {
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