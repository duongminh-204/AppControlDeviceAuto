import { ThemedText } from '@/components/themed-text';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Linking from 'expo-linking';
import * as Network from 'expo-network';
import { router } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
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

const { width, height } = Dimensions.get('window');

// Phải khớp với "scheme" trong app.json
const APP_SCHEME = 'myapp';

const GOOGLE_AUTH_FALLBACK_BASE = 'https://2a38-42-119-42-58.ngrok-free.app';
const GOOGLE_AUTH_ENDPOINTS = [
  '/auth/google',
  '/api/auth/google',
  '/auth/google/login',
  '/api/v1/auth/google',
  '/oauth/google',
];

const findGoogleAuthEndpoint = async (baseUrl: string): Promise<string | null> => {
  const normalized = baseUrl.replace(/\/$/, '');
  for (const endpoint of GOOGLE_AUTH_ENDPOINTS) {
    const candidate = `${normalized}${endpoint}`;
    try {
      const response = await fetch(candidate, { method: 'GET', redirect: 'manual' });
      console.log('[Google Auth probe]', candidate, '→ status', response.status);
      if ([301, 302, 307, 308, 200, 401, 403].includes(response.status)) {
        return candidate;
      }
    } catch (err) {
      console.log('[Google probe failed]', candidate, err);
    }
  }
  return null;
};

const getApiBaseUrl = async (): Promise<string> => {
  try {
    const storedUrl = await AsyncStorage.getItem('apiBaseUrl');
    if (storedUrl) return storedUrl;

    const deviceIP = await Network.getIpAddressAsync();
    if (deviceIP && deviceIP !== 'unknown') {
      const parts = deviceIP.split('.');
      if (parts.length === 4) {
        const base = parts.slice(0, 3).join('.') + '.';
        const foundUrl = await findServerIP(base, 3000);
        if (foundUrl) {
          console.log('[API] Auto-detected:', foundUrl);
          await AsyncStorage.setItem('apiBaseUrl', foundUrl);
          return foundUrl;
        }
      }
    }
    return GOOGLE_AUTH_FALLBACK_BASE;
  } catch (e) {
    console.error('[API Config] Error:', e);
    return 'http://192.168.0.104:3000'; // fallback cứng nếu cần
  }
};

async function findServerIP(base: string, port: number): Promise<string | null> {
  const promises: Promise<string | null>[] = [];
  for (let i = 100; i <= 120; i++) {
    const ip = `${base}${i}`;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 1800);

    promises.push(
      fetch(`http://${ip}:${port}/ping`, {
        method: 'GET',
        signal: controller.signal,
      })
        .then(() => {
          clearTimeout(timeoutId);
          return ip;
        })
        .catch(() => {
          clearTimeout(timeoutId);
          return null;
        })
    );
  }

  const results = await Promise.all(promises);
  const found = results.find((ip) => ip !== null);
  if (found) {
    const url = `http://${found}:${port}`;
    console.log('[Server found]', url);
    return url;
  }
  console.log('[Auto-detect] Không tìm thấy server local');
  return null;
}

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [apiBaseUrl, setApiBaseUrl] = useState(GOOGLE_AUTH_FALLBACK_BASE);

  // Load API base url khi mount
  useEffect(() => {
    getApiBaseUrl().then(setApiBaseUrl);
  }, []);

  // Xử lý deep link (Google OAuth callback + có thể dùng cho các flow khác)
  useEffect(() => {
    const handleDeepLink = ({ url }: { url: string }) => {
      if (!url.startsWith(`${APP_SCHEME}://`)) return;

      const parsed = Linking.parse(url);

      // ← Thay bằng đoạn xử lý an toàn
      const queryParams = parsed.queryParams;
      let token: string | undefined;

      if (queryParams?.token) {
        if (Array.isArray(queryParams.token)) {
          token = queryParams.token[0]; // lấy giá trị đầu tiên nếu có nhiều
        } else {
          token = queryParams.token;
        }
      }

      if (token) {
        AsyncStorage.setItem('authToken', token)
          .then(() => {
            console.log('[Deep link] Token saved, navigating to home');
            router.replace('/(tabs)/home');
          })
          .catch((err) => console.error('Lưu token thất bại:', err));
      } else {
        console.log('[Deep link] Không tìm thấy token trong URL:', url);
        // hoặc alert('Không tìm thấy token trong link') nếu bạn muốn hiển thị thông báo
      }
    };

    const subscription = Linking.addEventListener('url', handleDeepLink);

    // Kiểm tra URL khởi động (nếu mở app từ link)
    Linking.getInitialURL().then((initialUrl) => {
      if (initialUrl) handleDeepLink({ url: initialUrl });
    });

    return () => subscription.remove();
  }, []);

  const handleEmailLogin = async () => {
    if (!email.trim() || !password.trim()) {
      alert('Vui lòng nhập đầy đủ email và mật khẩu');
      return;
    }

    setIsLoading(true);

    try {
      const url = `${apiBaseUrl}/login`;
      console.log('[Login] Gọi:', url);

      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password: password.trim() }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Đăng nhập thất bại');
      }

      const data = await response.json();
      const token = data.token || data.accessToken;

      if (!token) throw new Error('Không nhận được token từ server');

      await AsyncStorage.setItem('authToken', token);
      router.replace('/(tabs)/home');
    } catch (error: any) {
      console.error('─── Email Login Error ───');
      console.error('Message:', error.message);
      console.error('URL:', `${apiBaseUrl}/login`);

      if (error.name === 'AbortError') {
        alert('Kết nối timeout – kiểm tra server và mạng WiFi');
      } else {
        alert(error.message || 'Có lỗi xảy ra, vui lòng thử lại');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsLoading(true);

    try {

      let authUrl = await findGoogleAuthEndpoint(GOOGLE_AUTH_FALLBACK_BASE);


      if (!authUrl) {

        if (apiBaseUrl !== GOOGLE_AUTH_FALLBACK_BASE) {
          authUrl = await findGoogleAuthEndpoint(apiBaseUrl);
        }
        if (!authUrl) {
          alert(
            'Không thể kết nối Google OAuth.\n' +
            'Kiểm tra:\n' +
            '1. Ngrok đang chạy (ngrok http 3000)\n' +
            '2. Backend expose /auth/google\n' +
            '3. GOOGLE_CALLBACK_URL trong .env khớp chính xác với ngrok URL[](https://xxxx.ngrok-free.app/auth/google/callback)\n' +
            '4. Google Console Allowed redirect URIs có chứa đúng URL ngrok callback'
          );
          return;
        }
      }

      console.log('[Google Login] Sử dụng URL (ngrok forced):', authUrl);

      const result = await WebBrowser.openAuthSessionAsync(
        authUrl,
        `${APP_SCHEME}://callback`,
        { preferEphemeralSession: true }
      );

      if (result.type === 'success' && result.url) {
        const parsed = Linking.parse(result.url);

        // ← Thay bằng đoạn xử lý an toàn
        const queryParams = parsed.queryParams;
        let token: string | undefined;

        if (queryParams?.token) {
          if (Array.isArray(queryParams.token)) {
            token = queryParams.token[0]; // lấy giá trị đầu tiên nếu có nhiều
          } else {
            token = queryParams.token;
          }
        }

        if (token) {
          await AsyncStorage.setItem('authToken', token);
          router.replace('/(tabs)/home');
        } else {
          alert('Không nhận được token từ Google login');
        }

      } else if (result.type === 'dismiss') {
        console.log('User hủy Google login');
      }
    } catch (error: any) {
      console.error('Google login error:', error);
      alert(
        'Lỗi khi mở Google OAuth:\n' +
        '- Kiểm tra ngrok chạy và backend OK?\n' +
        '- .env GOOGLE_CALLBACK_URL phải khớp 100% với ngrok (https, không dư /)\n' +
        '- Google Console redirect URIs phải khớp chính xác'
      );
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
            <View style={styles.inputContainer}>
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
                autoCorrect={false}
              />
            </View>

            <View style={styles.inputContainer}>
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
                autoCorrect={false}
              />
            </View>

            <TouchableOpacity
              style={[styles.button, isLoading && styles.buttonDisabled]}
              onPress={handleEmailLogin}
              disabled={isLoading}
            >
              <ThemedText style={styles.buttonText}>
                {isLoading ? 'Đang đăng nhập...' : 'Đăng nhập'}
              </ThemedText>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.googleButton, isLoading && styles.buttonDisabled]}
              onPress={handleGoogleLogin}
              disabled={isLoading}
            >
              <ThemedText style={styles.googleButtonText}>
                {isLoading ? 'Đang xử lý...' : 'Đăng nhập bằng Google'}
              </ThemedText>
            </TouchableOpacity>

            <View style={styles.linksRow}>
              <TouchableOpacity>
                <ThemedText style={styles.linkText}>Quên mật khẩu?</ThemedText>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => router.push('/auth/register')}>
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
  googleButton: {
    backgroundColor: '#4285F4',
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
  googleButtonText: {
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