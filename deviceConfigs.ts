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
    width: number;
    height: number;
  };
}

export const devices: DeviceConfig[] = [
  {
    name: "iPhone X",
    safeArea: { top: 44, right: 0, bottom: 34, left: 0 },
    camera: { top: 0, width: 209, height: 30 }
  },
  {
    name: "iPhone 8",
    safeArea: { top: 20, right: 0, bottom: 0, left: 0 }
  },
  {
    name: "Pixel 5",
    safeArea: { top: 24, right: 0, bottom: 0, left: 0 },
    camera: { top: 0, width: 128, height: 24 }
  },
  {
    name: "iPad Pro",
    safeArea: { top: 24, right: 20, bottom: 20, left: 20 }
  }
];
