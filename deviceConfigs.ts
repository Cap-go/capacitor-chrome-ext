export interface DeviceConfig {
  name: string;
  safeArea: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
  camera?: {
    top: number;
    left?: number;
    width: number;
    height: number;
    shape: 'round' | 'pill';
  };
}

export const devices: DeviceConfig[] = [
  {
    name: "iPhone SE",
    safeArea: { top: 20, right: 0, bottom: 0, left: 0 }
  },
  {
    name: "iPhone XR",
    safeArea: { top: 44, right: 0, bottom: 34, left: 0 },
    camera: { top: 0, width: 209, height: 30, shape: 'pill' }
  },
  {
    name: "iPhone 12 Pro",
    safeArea: { top: 47, right: 0, bottom: 34, left: 0 },
    camera: { top: 0, width: 156, height: 34, shape: 'pill' }
  },
  {
    name: "iPhone 14 Pro Max",
    safeArea: { top: 59, right: 0, bottom: 34, left: 0 },
    camera: { top: 11, width: 126, height: 37, shape: 'pill' }
  },
  {
    name: "Pixel 7",
    safeArea: { top: 24, right: 0, bottom: 0, left: 0 },
    camera: { top: 0, width: 140, height: 24, shape: 'pill' }
  },
  {
    name: "Samsung Galaxy S8+",
    safeArea: { top: 24, right: 0, bottom: 0, left: 0 }
  },
  {
    name: "Samsung Galaxy S20 Ultra",
    safeArea: { top: 38, right: 0, bottom: 0, left: 0 },
    camera: { top: 0, width: 120, height: 38, shape: 'round' }
  },
  {
    name: "iPad Pro",
    safeArea: { top: 24, right: 20, bottom: 20, left: 20 }
  },
  {
    name: "Galaxy Z Fold 5",
    safeArea: { top: 32, right: 0, bottom: 0, left: 0 },
    camera: { top: 0, width: 120, height: 32, shape: 'pill' }
  },
  {
    name: "Samsung Galaxy A51/71",
    safeArea: { top: 32, right: 0, bottom: 0, left: 0 },
    camera: { top: 0, width: 100, height: 32, shape: 'round' }
  },
  {
    name: "Samsung Galaxy S21",
    safeArea: { top: 40, right: 0, bottom: 0, left: 0 },
    camera: { top: 6, width: 12, height: 12, shape: 'round' }
  },
  {
    name: "Xiaomi Mi 11",
    safeArea: { top: 40, right: 0, bottom: 0, left: 0 },
    camera: { top: 6, left: 20, width: 12, height: 12, shape: 'round' }
  }
];
