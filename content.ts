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

let registeredPlugins: { [key: string]: any } = {};

function getOrRegisterPlugin(pluginName: string) {
  if (!registeredPlugins[pluginName]) {
    registeredPlugins[pluginName] = Capacitor.registerPlugin(pluginName);
  }
  return registeredPlugins[pluginName];
}

function overrideSafeArea(device: DeviceConfig) {
  console.log(`Capacitor Safe Area Simulator: Overriding Capacitor for ${device.name}`);
  if (!window.Capacitor) {
    (window as any).Capacitor = {};
  }

  window.Capacitor.getPlatform = () => device.name.toLowerCase().includes('iphone') ? 'ios' : 'android';
  window.Capacitor.isNativePlatform = () => true;
  window.Capacitor.isPluginAvailable = () => true;

  // Use getOrRegisterPlugin instead of registering directly
  const StatusBar = getOrRegisterPlugin('StatusBar');
  const SafeArea = getOrRegisterPlugin('SafeArea');

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
  registeredPlugins = {}; // Clear registered plugins
});
