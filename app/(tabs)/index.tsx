import { useEffect, useState } from 'react';
import {
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
  TouchableWithoutFeedback,
  Keyboard,
  Image,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from 'react-native-reanimated';

import { ThemedText } from '@/components/themed-text';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width, height } = Dimensions.get('window');
const API_BASE_URL = 'https://your-api-url.com'; 

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const checkExistingToken = async () => {
      try {
        const token = await AsyncStorage.getItem('authToken');
        if (!token) return;

       
        try {
          const res = await fetch(`${API_BASE_URL}/me`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          if (res.ok) {
            router.replace('/explore');
          } else {
            await AsyncStorage.removeItem('authToken');
          }
        } catch {
          
        }
      } catch {
       
      }
    };

    checkExistingToken();
  }, []);

  // Animation khi focus input
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

    try {
      setIsLoading(true);

      const response = await fetch(`${API_BASE_URL}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Đăng nhập thất bại, vui lòng kiểm tra lại thông tin');
      }

      const data = await response.json();
      const token = data.token || data.accessToken;

      if (!token) {
        throw new Error('Không nhận được token từ server');
      }

      await AsyncStorage.setItem('authToken', token);
      router.replace('/explore');
    } catch (error: any) {
      alert(error?.message || 'Có lỗi xảy ra, vui lòng thử lại');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}>
        <View style={styles.innerContainer}>
          <View style={styles.brandContainer}>
            <Image
              source={require('@/assets/images/LogoVinaSoil.png')}
              style={styles.logo}
              resizeMode="contain"
            />
            <ThemedText type="title" style={styles.title}>
              <ThemedText type="title" style={styles.brandStrong}>
                Vina Smart soil
              </ThemedText>
            </ThemedText>
          </View>

          <View style={styles.form}>
            <Animated.View style={[styles.inputContainer, animatedEmailStyle]}>
              <ThemedText type="defaultSemiBold" style={styles.inputLabel}>
                Email
              </ThemedText>
              <TextInput
                style={styles.input}
                placeholder="Nhập email của bạn"
                placeholderTextColor="#888"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                onFocus={() => {
                  emailScale.value = withTiming(1.03, { duration: 200 });
                }}
                onBlur={() => {
                  emailScale.value = withTiming(1, { duration: 200 });
                }}
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
                onFocus={() => {
                  passwordScale.value = withTiming(1.03, { duration: 200 });
                }}
                onBlur={() => {
                  passwordScale.value = withTiming(1, { duration: 200 });
                }}
              />
            </Animated.View>

            <TouchableOpacity
              style={[styles.button, isLoading && styles.buttonDisabled]}
              onPress={handleLogin}
              disabled={isLoading}
              activeOpacity={0.8}>
              <ThemedText style={styles.buttonText}>
                {isLoading ? 'Đang đăng nhập...' : 'Đăng nhập'}
              </ThemedText>
            </TouchableOpacity>

            <View style={styles.linksRow}>
              <TouchableOpacity activeOpacity={0.7}>
                <ThemedText style={styles.linkText}>Quên mật khẩu?</ThemedText>
              </TouchableOpacity>
              <TouchableOpacity activeOpacity={0.7}>
                <ThemedText style={styles.linkText}>Tạo tài khoản mới</ThemedText>
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
    backgroundColor: '#FFFFFF', // nền trắng full như bạn yêu cầu
  },
  innerContainer: {
    flex: 1,
    padding: 20,
    paddingTop: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerImage: {
    width: 0,
    height: 0,
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
  brandStrong: {
    fontSize: 34,
    fontWeight: '700',
  },
  subtitle: {
    fontSize: 16,
    opacity: 0.9,
    marginTop: 4,
    marginBottom: 8,
    textAlign: 'center',
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
    borderColor: 'rgba(74,222,128,0.6)', // viền xanh lá nhẹ
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