// constants/mock-data.ts
export type Device = {
  id: string;
  name: string;
  location: string;
  status: 'online' | 'offline';
  lastActive: string;
  temperature: number;
  humidity: number;
  soilMoisture: number;
  battery: number; // 0-100%
  signal: number; // 0-4 bars
  hasAlert: boolean;
  alertMessage?: string;
};

export const mockDevices: Device[] = [
  {
    id: '1',
    name: 'Greenhouse A',
    location: 'Vườn tiêu Phú Thọ',
    status: 'online',
    lastActive: 'Vừa xong',
    temperature: 26,
    humidity: 64,
    soilMoisture: 45,
    battery: 85,
    signal: 4,
    hasAlert: false,
  },
  {
    id: '2',
    name: 'Greenhouse B',
    location: 'Khu nhà kính 2',
    status: 'online',
    lastActive: '5 phút trước',
    temperature: 28,
    humidity: 72,
    soilMoisture: 28,
    battery: 45,
    signal: 3,
    hasAlert: true,
    alertMessage: 'Độ ẩm đất thấp - cần tưới nước',
  },
  {
    id: '3',
    name: 'Greenhouse C',
    location: 'Vườn rau sạch',
    status: 'offline',
    lastActive: '2 giờ trước',
    temperature: 22,
    humidity: 58,
    soilMoisture: 52,
    battery: 15,
    signal: 0,
    hasAlert: true,
    alertMessage: 'Thiết bị ngoại tuyến',
  },
  {
    id: '4',
    name: 'Hệ thống tưới 1',
    location: 'Khu A',
    status: 'online',
    lastActive: '10 giây trước',
    temperature: 24,
    humidity: 68,
    soilMoisture: 62,
    battery: 92,
    signal: 4,
    hasAlert: false,
  },
];