import { Image } from 'expo-image';
import { StyleSheet, Switch, View, Dimensions } from 'react-native';
import { useState, useEffect } from 'react';

import Svg, { Circle, Text as SvgText } from 'react-native-svg';
import Animated, {
  useSharedValue,
  useAnimatedProps,
  withTiming,
  Easing,
} from 'react-native-reanimated';

import ParallaxScrollView from '@/components/parallax-scroll-view';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useThemeColor } from '@/hooks/use-theme-color';

const { width } = Dimensions.get('window');

// Component Gauge tròn đẹp, responsive + animation mượt (điền tiến độ + text value)
const AnimatedCircle = Animated.createAnimatedComponent(Circle);

interface GaugeProps {
  value: number;
  maxValue: number;
  label: string;
  unit: string;
  color: string;
  icon: string;
  size?: number;
}

function Gauge({ value, maxValue, label, unit, color, icon, size }: GaugeProps) {
  const gaugeSize = size ?? Math.min(width * 0.28, 140); // Responsive theo mọi màn hình
  const textColor = useThemeColor({}, 'text');
  const radius = (gaugeSize - 20) / 2;
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
    <View style={{ alignItems: 'center', marginBottom: 16, width: gaugeSize }}>
      <Svg width={gaugeSize} height={gaugeSize} viewBox={`0 0 ${gaugeSize} ${gaugeSize}`}>
        {/* Vòng nền xám */}
        <Circle
          cx={gaugeSize / 2}
          cy={gaugeSize / 2}
          r={radius}
          stroke="#E0E0E0"
          strokeWidth={strokeWidth}
          fill="none"
        />

        {/* Vòng tiến độ có animation */}
        <AnimatedCircle
          cx={gaugeSize / 2}
          cy={gaugeSize / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={circumference}
          animatedProps={animatedProps}
          strokeLinecap="round"
          transform={`rotate(-90 ${gaugeSize / 2} ${gaugeSize / 2})`} // Kim bắt đầu từ đỉnh
        />

        {/* Giá trị chính giữa (animation khi value thay đổi) */}
        <SvgText
          x={gaugeSize / 2}
          y={gaugeSize / 2 + 6}
          textAnchor="middle"
          fontSize={20}
          fontWeight="700"
          fill={textColor}
        >
          {Math.round(value)}{unit}
        </SvgText>
      </Svg>

      <View style={styles.gaugeLabelRow}>
        <ThemedText style={styles.gaugeIconText}>{icon}</ThemedText>
        <ThemedText type="defaultSemiBold" style={styles.gaugeLabelText}>
          {label}
        </ThemedText>
      </View>
    </View>
  );
}

export default function HomeScreen() {
  // Giá trị cảm biến (demo live)
  const [temperature, setTemperature] = useState(26.5);
  const [humidity, setHumidity] = useState(64);
  const [soilMoisture, setSoilMoisture] = useState(42);
  const gaugeSize = Math.min(width * 0.28, 140);

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
      headerBackgroundColor={{ light: '#FFFFFF', dark: '#151718' }}
      headerImage={
        <View style={styles.headerLogoWrapper}>
          <Image
            source={require('@/assets/images/LogoVinaSoil.png')}
            style={styles.headerLogo}
          />
        </View>
      }>
      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title">Vina Smart soil</ThemedText>
      </ThemedView>

      <ThemedView style={styles.section}>
        <ThemedText type="subtitle" style={{ marginBottom: 16 }}>
          Chỉ số cảm biến thời gian thực
        </ThemedText>

        <View>
          <View style={styles.gaugesRow}>
          <Gauge
            value={temperature}
            maxValue={50}
            label="Temperature"
            unit="°C"
            color="#FF3B5C"
            icon="🌡️"
            size={gaugeSize}
          />
          <Gauge
            value={humidity}
            maxValue={100}
            label="Humidity"
            unit="%"
            color="#4A90E2"
            icon="💧"
            size={gaugeSize}
          />
          </View>

          <View style={styles.gaugesRow}>
            <Gauge
              value={soilMoisture}
              maxValue={100}
              label="Soil Moisture"
              unit="%"
              color="#50C878"
              icon="🌱"
              size={gaugeSize}
            />
            <View style={{ width: gaugeSize }} />
          </View>
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
              trackColor={{ false: '#E5E7EB', true: '#16A34A' }}
              thumbColor={manualControl ? '#FFFFFF' : '#F4F3F4'}
              ios_backgroundColor="#E5E7EB"
              style={{ transform: [{ scale: 1.2 }] }} // Animation scale đẹp hơn
            />
            <ThemedText
              style={{
                fontSize: 12,
                opacity: 0.85,
                marginTop: 4,
                color: manualControl ? '#16A34A' : '#6B7280',
              }}>
              {manualControl ? 'Bật - Điều khiển thủ công' : 'Tắt'}
            </ThemedText>
          </View>

          {/* Toggle 2: Pump Auto */}
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
              }}>
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
    // ThemedText will apply theme color to the emoji glyph, but most platforms still render emoji colors.
    // If emoji appears monochrome on your device, user can switch to different icon later.
  },
  gaugeLabelText: {
    fontSize: 14,
    lineHeight: 18,
    textAlign: 'center',
  },
});