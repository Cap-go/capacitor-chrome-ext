import { Capacitor } from '@capacitor/core';
import { DeviceConfig } from './deviceConfigs';
declare global {
  interface Window {
    Capacitor: typeof Capacitor;
  }
}
const originalCapacitor = window.Capacitor;
const registeredPlugins: Record<string, any> = {};

function getOrRegisterPlugin(pluginName: string) {
  if (!registeredPlugins[pluginName]) {
    registeredPlugins[pluginName] = Capacitor.registerPlugin(pluginName);
  }
  return registeredPlugins[pluginName];
}

function overrideSafeArea(device: DeviceConfig) {
  console.log(`Capacitor Safe Area Simulator: Overriding for ${device.name}`);
  
  window.Capacitor = {
    ...window.Capacitor,
    getPlatform: () => device.name.toLowerCase().includes('iphone') ? 'ios' : 'android',
    isNativePlatform: () => true,
    isPluginAvailable: () => true,
  };

  const StatusBar = getOrRegisterPlugin('StatusBar');
  const SafeArea = getOrRegisterPlugin('SafeArea');

  StatusBar.getInfo = async () => ({ statusBarHeight: device.safeArea.top });
  SafeArea.getSafeAreaInsets = async () => ({ insets: device.safeArea });
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
  Object.keys(registeredPlugins).forEach(key => delete registeredPlugins[key]);
});
