import { useEffect, useState } from 'react';
import { Dimensions, Image, Modal, ScrollView, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useColorScheme } from '@/hooks/use-color-scheme';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';

const hanniImage = require('@/assets/images/hanni.jpg');

interface UserInfo {
  name: string;
  email: string;
  phone: string;
  location: string;
  joinDate: string;
  avatar?: string;
}

export default function Profile() {
  const [userInfo, setUserInfo] = useState<UserInfo>({
    name: 'Nguyễn Văn A',
    email: 'user@example.com',
    phone: '0123 456 789',
    location: 'Hà Nội, Việt Nam',
    joinDate: 'Tháng 1, 2024',
    avatar: 'hanni.jpg',
  });

  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  useEffect(() => {
    // Load user info from AsyncStorage or API
    loadUserInfo();
  }, []);

  const loadUserInfo = async () => {
    try {
      const savedUser = await AsyncStorage.getItem('userInfo');
      if (savedUser) {
        setUserInfo(JSON.parse(savedUser));
      }
    } catch (error) {
      console.error('Error loading user info:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await AsyncStorage.removeItem('authToken');
    await AsyncStorage.removeItem('userInfo');
    router.replace('/auth/login');
  };

  const openImageModal = () => {
    setModalVisible(true);
  };

  const closeImageModal = () => {
    setModalVisible(false);
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ThemedView style={{ flex: 1 }}>
        <ScrollView
          style={{ flex: 1 }}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            flexGrow: 1,
            minHeight: Dimensions.get('window').height + 100,
            paddingBottom: 30
          }}
          keyboardShouldPersistTaps="handled"
          bounces={false}
        >
        {/* Header Section with Avatar */}
        <View
          style={{
            paddingVertical: 30,
            paddingHorizontal: 20,
            alignItems: 'center',
            borderBottomWidth: 1,
            borderBottomColor: isDark ? '#333' : '#E5E5E5',
          }}
        >
          {/* Avatar */}
          <TouchableOpacity onPress={openImageModal}>
            <View
              style={{
                width: 120,
                height: 120,
                borderRadius: 60,
                backgroundColor: isDark ? '#333' : '#F0F0F0',
                justifyContent: 'center',
                alignItems: 'center',
                marginBottom: 20,
                borderWidth: 3,
                borderColor: '#FF3B5C',
                overflow: 'hidden',
              }}
            >
              {userInfo.avatar ? (
                <Image
                  source={hanniImage}
                  style={{ width: '100%', height: '100%' }}
                />
              ) : (
                <ThemedText style={{ fontSize: 48, fontWeight: 'bold' }}>
                  {userInfo.name.charAt(0)}
                </ThemedText>
              )}
            </View>
          </TouchableOpacity>

          {/* User Name */}
          <ThemedText
            type="title"
            style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 8 }}
          >
            {userInfo.name}
          </ThemedText>
          <ThemedText style={{ fontSize: 14, opacity: 0.7 }}>
            Thành viên từ {userInfo.joinDate}
          </ThemedText>
        </View>

        {/* User Info Section */}
        <View style={{ paddingHorizontal: 20, paddingVertical: 20 }}>
          <ThemedText
            type="subtitle"
            style={{ fontSize: 16, fontWeight: '600', marginBottom: 16 }}
          >
            Thông tin cá nhân
          </ThemedText>

          {/* Info Cards */}
          <View
            style={{
              backgroundColor: isDark ? '#1C1C1C' : '#F9F9F9',
              borderRadius: 12,
              padding: 16,
              marginBottom: 12,
            }}
          >
            <ThemedText style={{ fontSize: 12, opacity: 0.6, marginBottom: 4 }}>
              Email
            </ThemedText>
            <ThemedText style={{ fontSize: 14, fontWeight: '500' }}>
              {userInfo.email}
            </ThemedText>
          </View>

          <View
            style={{
              backgroundColor: isDark ? '#1C1C1C' : '#F9F9F9',
              borderRadius: 12,
              padding: 16,
              marginBottom: 12,
            }}
          >
            <ThemedText style={{ fontSize: 12, opacity: 0.6, marginBottom: 4 }}>
              Số điện thoại
            </ThemedText>
            <ThemedText style={{ fontSize: 14, fontWeight: '500' }}>
              {userInfo.phone}
            </ThemedText>
          </View>

          <View
            style={{
              backgroundColor: isDark ? '#1C1C1C' : '#F9F9F9',
              borderRadius: 12,
              padding: 16,
              marginBottom: 12,
            }}
          >
            <ThemedText style={{ fontSize: 12, opacity: 0.6, marginBottom: 4 }}>
              Địa chỉ
            </ThemedText>
            <ThemedText style={{ fontSize: 14, fontWeight: '500' }}>
              {userInfo.location}
            </ThemedText>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={{ paddingHorizontal: 20, paddingTop: 10 }}>
          <TouchableOpacity
            style={{
              borderWidth: 1,
              borderColor: '#FF3B5C',
              paddingVertical: 14,
              borderRadius: 12,
              alignItems: 'center',
              marginBottom: 12,
            }}
          >
            <ThemedText style={{ color: '#FF3B5C', fontWeight: '600', fontSize: 16 }}>
              Thay đổi mật khẩu
            </ThemedText>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleLogout}
            style={{
              backgroundColor: '#FF3B5C',
              paddingVertical: 14,
              borderRadius: 12,
              alignItems: 'center',
            }}
          >
            <ThemedText style={{ color: 'white', fontWeight: '600', fontSize: 16 }}>
              Đăng xuất
            </ThemedText>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </ThemedView>

    {/* Full Image Modal */}
    <Modal
      visible={modalVisible}
      transparent={true}
      animationType="fade"
      onRequestClose={closeImageModal}
    >
      <View
        style={{
          flex: 1,
          backgroundColor: 'rgba(0, 0, 0, 0.9)',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        {/* Close Button */}
        <TouchableOpacity
          onPress={closeImageModal}
          style={{
            position: 'absolute',
            top: 50,
            right: 20,
            zIndex: 1,
            backgroundColor: 'rgba(255, 255, 255, 0.2)',
            borderRadius: 20,
            padding: 10,
          }}
        >
          <ThemedText style={{ color: 'white', fontSize: 18, fontWeight: 'bold' }}>
            ✕
          </ThemedText>
        </TouchableOpacity>

        {/* Full Size Image */}
        <TouchableOpacity onPress={closeImageModal} style={{ flex: 1, justifyContent: 'center' }}>
          <Image
            source={hanniImage}
            style={{
              width: Dimensions.get('window').width * 0.9,
              height: Dimensions.get('window').width * 0.9,
              borderRadius: 10,
            }}
            resizeMode="contain"
          />
        </TouchableOpacity>
      </View>
    </Modal>
    </SafeAreaView>
  );
}