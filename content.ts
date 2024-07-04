/// <reference types="@capacitor/core"/>
/// <reference path="deviceConfigs.ts" />
import { Capacitor } from '@capacitor/core';
import { DeviceConfig } from './deviceConfigs';

declare global {
  interface Window {
    Capacitor: typeof Capacitor;
  }
}

const originalCapacitor = window.Capacitor;

function overrideSafeArea(device: DeviceConfig) {
  console.log(`Capacitor Safe Area Simulator: Overriding Capacitor for ${device.name}`);
  if (!window.Capacitor) {
    (window as any).Capacitor = {};
  }

  window.Capacitor.getPlatform = () => device.name.toLowerCase().includes('iphone') ? 'ios' : 'android';
  window.Capacitor.isNativePlatform = () => true;
  window.Capacitor.isPluginAvailable = () => true;

  // Use registerPlugin instead of accessing Plugins directly
  const StatusBar: any = Capacitor.registerPlugin('StatusBar');
  const SafeArea: any = Capacitor.registerPlugin('SafeArea');

  StatusBar.getInfo = async () => {
    console.log(`Capacitor Safe Area Simulator: StatusBar.getInfo called for ${device.name}`);
    return { statusBarHeight: device.safeArea.top };
  };

  SafeArea.getSafeAreaInsets = async () => {
    console.log(`Capacitor Safe Area Simulator: SafeArea.getSafeAreaInsets called for ${device.name}`);
    return {
      insets: device.safeArea
    };
  };
}

window.addEventListener('activateSafeArea', ((event: CustomEvent<DeviceConfig>) => {
  if (event.detail) {
    overrideSafeArea(event.detail);
  } else {
    console.error('Device information not received in activateSafeArea event');
  }
}) as EventListener);

window.addEventListener('resetSafeArea', () => {
  console.log('Capacitor Safe Area Simulator: Resetting Capacitor');
  window.Capacitor = originalCapacitor;
});
