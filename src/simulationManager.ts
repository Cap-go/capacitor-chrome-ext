// simulationManager.ts

import { DeviceConfig } from './deviceConfigs';
import { applySafeArea, removeSafeArea } from './safeAreaManager';
import { applyCamera, removeCamera } from './cameraManager';

export async function applySimulation(tabId: number, device: DeviceConfig, isCameraVisible: boolean) {
  try {
    if (!device || !device.safeArea) {
      throw new Error('Invalid device configuration');
    }
    
    await applySafeArea(tabId, device);
    
    // Only apply camera if the device has one and isCameraVisible is true
    if (device.camera && isCameraVisible) {
      await applyCamera(tabId, device, true);
    } else {
      await removeCamera(tabId);
    }
    
    await chrome.scripting.executeScript({
      target: { tabId },
      func: (device: DeviceConfig, cameraVisible: boolean) => {
        console.log(`Capacitor Safe Area Simulator: Activated for ${device.name} and camera ${cameraVisible ? 'visible' : 'hidden'}`);
        window.dispatchEvent(new CustomEvent('activateSafeArea', { detail: device }));
        (window as any).setSimulationStatus({
          isActive: true,
          isCameraVisible: cameraVisible && !!device.camera,
          currentDeviceName: device.name
        });
      },
      args: [device, isCameraVisible && !!device.camera]
    });
  } catch (error) {
    console.error('Error in applySimulation:', error);
  }
}

export async function removeSimulation(tabId: number) {
  await removeSafeArea(tabId);
  await removeCamera(tabId);

  await chrome.scripting.executeScript({
    target: { tabId },
    func: () => {
      window.dispatchEvent(new Event('resetSafeArea'));
      (window as any).setSimulationStatus({
        isActive: false,
        isCameraVisible: false,
        currentDeviceName: ''
      });
    }
  });
}
