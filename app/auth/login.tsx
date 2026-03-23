import { useEffect, useState } from 'react';
import {
  Dimensions,
  Image,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import { ThemedText } from '@/components/themed-text';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Network from 'expo-network';
import { router } from 'expo-router';

const { width, height } = Dimensions.get('window');


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
          await AsyncStorage.setItem('apiBaseUrl', foundUrl); 
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
    alert('Không tìm thấy server trên mạng. Kiểm tra backend có chạy /ping và cùng mạng WiFi.');
  }
  return found ? `http://${found}:${port}` : null;
}

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [apiBaseUrl, setApiBaseUrl] = useState('http://192.168.0.104:3000'); 

 
  useEffect(() => {
    getApiBaseUrl().then((url) => {
      setApiBaseUrl(url);
    });
  }, []);


  const emailScale = useSharedValue(1);
  const passwordScale = useSharedValue(1);

  const animatedEmailStyle = useAnimatedStyle(() => ({
    transform: [{ scale: emailScale.value }],
  }));

  const animatedPasswordStyle = useAnimatedStyle(() => ({
    transform: [{ scale: passwordScale.value }],
  }));

  const handleLogin = async () => {
    if (!email || !password) {
      alert('Vui lòng nhập email và mật khẩu');
      return;
    }

    setIsLoading(true);

    try {
      console.log('[Login] Calling:', `${apiBaseUrl}/login`);

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000); 

      const response = await fetch(`${apiBaseUrl}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Đăng nhập thất bại');
      }

      const data = await response.json();
      const token = data.token || data.accessToken;

      if (!token) throw new Error('Không nhận được token');

      await AsyncStorage.setItem('authToken', token);
      router.replace('/(tabs)/home');
    } catch (error: any) {
      console.log('─── Login Error Details ───');
      console.log('Message:', error.message);
      console.log('Name:', error.name);
      console.log('URL called:', `${apiBaseUrl}/login`);

      if (error.name === 'AbortError') {
        alert('Kết nối timeout – kiểm tra server/mạng nhé!');
      } else {
        alert(error?.message || 'Có lỗi xảy ra, thử lại nhé!');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <View style={styles.innerContainer}>
          <View style={styles.brandContainer}>
            <Image
              source={require('@/assets/images/LogoVinaSoil.png')}
              style={styles.logo}
              resizeMode="contain"
            />
            <ThemedText type="title" style={styles.title}>
              Vina Smart Soil
            </ThemedText>
          </View>

          <View style={styles.form}>
            <Animated.View style={[styles.inputContainer, animatedEmailStyle]}>
              <ThemedText type="defaultSemiBold" style={styles.inputLabel}>
                Email
              </ThemedText>
              <TextInput
                style={styles.input}
                placeholder="Nhập email"
                placeholderTextColor="#888"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                onFocus={() => emailScale.value = withTiming(1.03, { duration: 200 })}
                onBlur={() => emailScale.value = withTiming(1, { duration: 200 })}
              />
            </Animated.View>

            <Animated.View style={[styles.inputContainer, animatedPasswordStyle]}>
              <ThemedText type="defaultSemiBold" style={styles.inputLabel}>
                Mật khẩu
              </ThemedText>
              <TextInput
                style={styles.input}
                placeholder="Nhập mật khẩu"
                placeholderTextColor="#888"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                autoCapitalize="none"
                onFocus={() => passwordScale.value = withTiming(1.03, { duration: 200 })}
                onBlur={() => passwordScale.value = withTiming(1, { duration: 200 })}
              />
            </Animated.View>

            <TouchableOpacity
              style={[styles.button, isLoading && styles.buttonDisabled]}
              onPress={handleLogin}
              disabled={isLoading}
            >
              <ThemedText style={styles.buttonText}>
                {isLoading ? 'Đang đăng nhập...' : 'Đăng nhập'}
              </ThemedText>
            </TouchableOpacity>

            <View style={styles.linksRow}>
              <TouchableOpacity>
                <ThemedText style={styles.linkText}>Quên mật khẩu?</ThemedText>
              </TouchableOpacity>
              <TouchableOpacity>
                <ThemedText style={styles.linkText}>Tạo tài khoản</ThemedText>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
    backgroundColor: '#FFFFFF',
  },
  innerContainer: {
    flex: 1,
    padding: 20,
    paddingTop: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandContainer: {
    width: '100%',
    maxWidth: 460,
    marginBottom: 24,
    alignItems: 'center',
  },
  logo: {
    width: 140,
    height: 140,
    marginBottom: 16,
  },
  title: {
    fontSize: 34,
    marginBottom: 6,
    textAlign: 'center',
    letterSpacing: 0.3,
  },
  form: {
    width: '100%',
    maxWidth: 460,
    padding: 24,
    paddingBottom: 26,
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
    gap: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 18 },
    shadowOpacity: 0.25,
    shadowRadius: 24,
    elevation: 12,
  },
  inputContainer: {
    gap: 6,
  },
  inputLabel: {
    fontSize: 14,
    opacity: 0.9,
  },
  input: {
    backgroundColor: '#F9FAFB',
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 16,
    fontSize: 16,
    borderWidth: 1,
    borderColor: 'rgba(74,222,128,0.6)',
  },
  button: {
    backgroundColor: '#16A34A',
    borderRadius: 999,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: 'white',
    fontSize: 17,
    fontWeight: '600',
  },
  linksRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
  },
  linkText: {
    color: '#16A34A',
    fontSize: 13,
  },
});