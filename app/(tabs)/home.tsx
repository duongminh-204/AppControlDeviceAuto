import { Image } from 'expo-image';
import { memo, useEffect, useState } from 'react';
import { Dimensions, StyleSheet, Switch, View } from 'react-native';
import Animated, { Easing, useAnimatedProps, useSharedValue, withTiming } from 'react-native-reanimated';
import Svg, { Circle } from 'react-native-svg';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

import ParallaxScrollView from '@/components/parallax-scroll-view';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useColorScheme } from '@/hooks/use-color-scheme';

const { width } = Dimensions.get('window');

// ── Constants ────────────────────────────────────────────────────────────────
const GAUGE_SIZE_BASE = Math.min(width * 0.28, 140);

const GAUGE_CONFIG = {
  temperature: { maxValue: 50, color: '#FF3B5C', icon: '🌡️', unit: '°C', label: 'Temperature' },
  humidity: { maxValue: 100, color: '#4A90E2', icon: '💧', unit: '%', label: 'Humidity' },
  soilMoisture: { maxValue: 100, color: '#50C878', icon: '🌱', unit: '%', label: 'Soil Moisture' },
} as const;

// ── Gauge Component (memoized) ──────────────────────────────────────────────
interface GaugeProps {
  value: number;
  maxValue: number;
  label: string;
  unit: string;
  color: string;
  icon: string;
  size?: number;
}

const Gauge = memo(function Gauge({
  value,
  maxValue,
  label,
  unit,
  color,
  icon,
  size = GAUGE_SIZE_BASE,
}: GaugeProps) {
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
  }, [value, maxValue, progress]);

  const animatedProps = useAnimatedProps(() => {
    const offset = circumference * (1 - progress.value / 100);
    return { strokeDashoffset: offset };
  });

  const displayValue = `${Math.round(value)}${unit}`;

  return (
    <View style={{ alignItems: 'center', marginBottom: 16, width: size, position: 'relative' }}>
      <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {/* Background circle */}
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#E0E0E0"
          strokeWidth={strokeWidth}
          fill="none"
        />
        {/* Animated progress circle */}
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
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </Svg>

      {/* Center value text - viết liền mạch, không xuống dòng thừa */}
      <ThemedText
        style={{
          position: 'absolute',
          top: size / 2 - 10,
          left: 0,
          right: 0,
          textAlign: 'center',
          fontSize: 20,
          fontWeight: '700',
        }}
      >
        {displayValue}
      </ThemedText>

      {/* Label row */}
      <View style={styles.gaugeLabelRow}>
        <ThemedText style={styles.gaugeIconText}>{icon}</ThemedText>
        <ThemedText type="defaultSemiBold" style={styles.gaugeLabelText}>
          {label}
        </ThemedText>
      </View>
    </View>
  );
});

// ── Main Home Screen ────────────────────────────────────────────────────────
export default function HomeScreen() {
  const colorScheme = useColorScheme() ?? 'light';

  // Sensor values (demo)
  const [temperature, setTemperature] = useState(26.5);
  const [humidity, setHumidity] = useState(64);
  const [soilMoisture, setSoilMoisture] = useState(42);

  // Device controls
  const [manualControl, setManualControl] = useState(false);
  const [pumpAuto, setPumpAuto] = useState(true);

  // Simulate live sensor data
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
      headerBackgroundColor={{ light: '#FFFFFF', dark: '#151718' }}
      headerImage={
        <View style={styles.headerLogoWrapper}>
          <Image
            source={require('@/assets/images/LogoVinaSoil.png')}
            style={styles.headerLogo}
            contentFit="contain"
          />
        </View>
      }
    >
      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title">Vina Smart Soil</ThemedText>
      </ThemedView>

      {/* Sensor Gauges */}
      <ThemedView style={styles.section}>
        <ThemedText type="subtitle" style={{ marginBottom: 16 }}>
          Chỉ số cảm biến thời gian thực
        </ThemedText>

        <View>
          <View style={styles.gaugesRow}>
            <Gauge value={temperature} {...GAUGE_CONFIG.temperature} />
            <Gauge value={humidity} {...GAUGE_CONFIG.humidity} />
          </View>

          <View style={styles.gaugesRow}>
            <Gauge value={soilMoisture} {...GAUGE_CONFIG.soilMoisture} />
            <View style={{ width: GAUGE_SIZE_BASE }} /> {/* placeholder cho layout cân đối */}
          </View>
        </View>
      </ThemedView>

      {/* Device Controls */}
      <ThemedView style={styles.section}>
        <ThemedText type="subtitle" style={{ marginBottom: 20 }}>
          Điều khiển thiết bị
        </ThemedText>

        <View style={styles.togglesContainer}>
          <View style={styles.toggleCard}>
            <ThemedText type="defaultSemiBold">Manual Control</ThemedText>
            <Switch
              value={manualControl}
              onValueChange={setManualControl}
              trackColor={{ false: '#E5E7EB', true: '#16A34A' }}
              thumbColor={manualControl ? '#FFFFFF' : '#F4F3F4'}
              ios_backgroundColor="#E5E7EB"
              style={{ transform: [{ scale: 1.2 }] }}
            />
            <ThemedText
              style={{
                fontSize: 12,
                opacity: 0.85,
                marginTop: 4,
                color: manualControl ? '#16A34A' : '#6B7280',
              }}
            >
              {manualControl ? 'Bật - Điều khiển thủ công' : 'Tắt'}
            </ThemedText>
          </View>

          <View style={styles.toggleCard}>
            <ThemedText type="defaultSemiBold">Pump Auto</ThemedText>
            <Switch
              value={pumpAuto}
              onValueChange={setPumpAuto}
              trackColor={{ false: '#E5E7EB', true: '#16A34A' }}
              thumbColor={pumpAuto ? '#FFFFFF' : '#F4F3F4'}
              ios_backgroundColor="#E5E7EB"
              style={{ transform: [{ scale: 1.2 }] }}
            />
            <ThemedText
              style={{
                fontSize: 12,
                opacity: 0.85,
                marginTop: 4,
                color: pumpAuto ? '#16A34A' : '#6B7280',
              }}
            >
              {pumpAuto ? 'Bật - Bơm tự động' : 'Tắt'}
            </ThemedText>
          </View>
        </View>
      </ThemedView>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  headerLogoWrapper: {
    height: '100%',
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerLogo: {
    width: 120,
    height: 120,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
    marginBottom: 20,
    paddingHorizontal: 4,
  },
  section: {
    marginBottom: 28,
    gap: 8,
  },
  gaugesRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  togglesContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 16,
  },
  toggleCard: {
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 24,
    width: width * 0.44,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 14 },
    shadowOpacity: 0.2,
    shadowRadius: 24,
    elevation: 10,
  },
  gaugeLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 8,
    paddingHorizontal: 8,
  },
  gaugeIconText: {
    fontSize: 18,
  },
  gaugeLabelText: {
    fontSize: 14,
    lineHeight: 18,
    textAlign: 'center',
  },
});