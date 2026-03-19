import { Image } from 'expo-image';
import { Platform, StyleSheet, Switch, View, Dimensions } from 'react-native';
import { useState, useEffect } from 'react';

import Svg, { Circle, Text as SvgText } from 'react-native-svg';
import Animated, {
  useSharedValue,
  useAnimatedProps,
  withTiming,
  Easing,
} from 'react-native-reanimated';

import { HelloWave } from '@/components/hello-wave';
import ParallaxScrollView from '@/components/parallax-scroll-view';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

const { width } = Dimensions.get('window');

// Component Gauge tròn đẹp, responsive + animation mượt (điền tiến độ + text value)
const AnimatedCircle = Animated.createAnimatedComponent(Circle);

interface GaugeProps {
  value: number;
  maxValue: number;
  label: string;
  unit: string;
  color: string;
}

function Gauge({ value, maxValue, label, unit, color }: GaugeProps) {
  const size = Math.min(width * 0.28, 140); // Responsive theo mọi màn hình (iPhone 15, Android nhỏ/lớn)
  const radius = (size - 20) / 2;
  const strokeWidth = 12;
  const circumference = 2 * Math.PI * radius;

  const progress = useSharedValue(0);

  useEffect(() => {
    const target = Math.min(Math.max((value / maxValue) * 100, 0), 100);
    progress.value = withTiming(target, {
      duration: 1200,
      easing: Easing.out(Easing.ease),
    });
  }, [value]);

  const animatedProps = useAnimatedProps(() => {
    const offset = circumference * (1 - progress.value / 100);
    return {
      strokeDashoffset: offset,
    };
  });

  return (
    <View style={{ alignItems: 'center', marginBottom: 16 }}>
      <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {/* Vòng nền xám */}
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#E0E0E0"
          strokeWidth={strokeWidth}
          fill="none"
        />

        {/* Vòng tiến độ có animation */}
        <AnimatedCircle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={circumference}
          animatedProps={animatedProps}
          strokeLinecap="round"
          transform={`rotate(-90 ${size / 2} ${size / 2})`} // Kim bắt đầu từ đỉnh
        />

        {/* Giá trị chính giữa (animation khi value thay đổi) */}
        <SvgText
          x={size / 2}
          y={size / 2 + 6}
          textAnchor="middle"
          fontSize={20}
          fontWeight="700"
          fill="#111"
        >
          {Math.round(value)}{unit}
        </SvgText>
      </Svg>

      <ThemedText type="subtitle" style={{ marginTop: 8, textAlign: 'center' }}>
        {label}
      </ThemedText>
    </View>
  );
}

export default function HomeScreen() {
  // Giá trị cảm biến (demo live)
  const [temperature, setTemperature] = useState(26.5);
  const [humidity, setHumidity] = useState(64);
  const [soilMoisture, setSoilMoisture] = useState(42);

  // Trạng thái toggle
  const [manualControl, setManualControl] = useState(false);
  const [pumpAuto, setPumpAuto] = useState(true);

  // Animation live: giá trị thay đổi tự động (demo cảm biến thực tế)
  useEffect(() => {
    const interval = setInterval(() => {
      setTemperature((prev) => Math.max(15, Math.min(48, prev + (Math.random() - 0.5) * 2.5)));
      setHumidity((prev) => Math.max(35, Math.min(92, prev + (Math.random() - 0.5) * 4)));
      setSoilMoisture((prev) => Math.max(12, Math.min(85, prev + (Math.random() - 0.5) * 5)));
    }, 2800);

    return () => clearInterval(interval);
  }, []);

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#0F172A', dark: '#020617' }}
      headerImage={
        <Image
          source={require('@/assets/images/partial-react-logo.png')}
          style={styles.reactLogo}
        />
      }>
      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title">Dashboard</ThemedText>
        <HelloWave />
      </ThemedView>

      <ThemedView style={styles.section}>
        <ThemedText type="subtitle" style={{ marginBottom: 16 }}>
          Chỉ số cảm biến thời gian thực
        </ThemedText>

        <View style={styles.gaugesContainer}>
          <Gauge
            value={temperature}
            maxValue={50}
            label="Temperature"
            unit="°C"
            color="#FF3B5C"
          />
          <Gauge
            value={humidity}
            maxValue={100}
            label="Humidity"
            unit="%"
            color="#4A90E2"
          />
          <Gauge
            value={soilMoisture}
            maxValue={100}
            label="Soil Moisture"
            unit="%"
            color="#50C878"
          />
        </View>
      </ThemedView>

      <ThemedView style={styles.section}>
        <ThemedText type="subtitle" style={{ marginBottom: 20 }}>
          Điều khiển thiết bị
        </ThemedText>

        <View style={styles.togglesContainer}>
          {/* Toggle 1: Manual Control */}
          <View style={styles.toggleCard}>
            <ThemedText type="defaultSemiBold">Manual Control</ThemedText>
            <Switch
              value={manualControl}
              onValueChange={setManualControl}
              trackColor={{ false: '#767577', true: '#34C759' }}
              thumbColor={manualControl ? '#FFFFFF' : '#F4F3F4'}
              ios_backgroundColor="#3E3E3E"
              style={{ transform: [{ scale: 1.2 }] }} // Animation scale đẹp hơn
            />
            <ThemedText style={{ fontSize: 12, opacity: 0.7, marginTop: 4 }}>
              {manualControl ? 'Bật - Điều khiển thủ công' : 'Tắt'}
            </ThemedText>
          </View>

          {/* Toggle 2: Pump Auto */}
          <View style={styles.toggleCard}>
            <ThemedText type="defaultSemiBold">Pump Auto</ThemedText>
            <Switch
              value={pumpAuto}
              onValueChange={setPumpAuto}
              trackColor={{ false: '#767577', true: '#34C759' }}
              thumbColor={pumpAuto ? '#FFFFFF' : '#F4F3F4'}
              ios_backgroundColor="#3E3E3E"
              style={{ transform: [{ scale: 1.2 }] }}
            />
            <ThemedText style={{ fontSize: 12, opacity: 0.7, marginTop: 4 }}>
              {pumpAuto ? 'Bật - Bơm tự động' : 'Tắt'}
            </ThemedText>
          </View>
        </View>
      </ThemedView>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 20,
  },
  section: {
    marginBottom: 28,
    gap: 8,
  },
  gaugesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    gap: 12,
  },
  togglesContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    gap: 20,
  },
  toggleCard: {
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.08)', // Hỗ trợ dark mode
    padding: 16,
    borderRadius: 16,
    width: width * 0.42, // Responsive card
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  reactLogo: {
    height: 178,
    width: 290,
    bottom: 0,
    left: 0,
    position: 'absolute',
  },
});