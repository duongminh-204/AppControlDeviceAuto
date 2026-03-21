// constants/mock-data.ts
export type Device = {
  id: string;
  name: string;
  location: string;
  status: 'online' | 'offline';
  lastActive: string;
};

export const mockDevices: Device[] = [
  {
    id: '1',
    name: 'Greenhouse A',
    location: 'Vườn tiêu Phú Thọ',
    status: 'online',
    lastActive: 'Vừa xong',
  },
  {
    id: '2',
    name: 'Greenhouse B',
    location: 'Khu nhà kính 2',
    status: 'online',
    lastActive: '5 phút trước',
  },
  {
    id: '3',
    name: 'Greenhouse C',
    location: 'Vườn rau sạch',
    status: 'offline',
    lastActive: '2 giờ trước',
  },
  {
    id: '4',
    name: 'Hệ thống tưới 1',
    location: 'Khu A',
    status: 'online',
    lastActive: '10 giây trước',
  },
];