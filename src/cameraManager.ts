// cameraManager.ts

import { DeviceConfig } from './deviceConfigs';

export async function applyCamera(tabId: number, device: DeviceConfig, isCameraVisible: boolean) {
  await chrome.scripting.executeScript({
    target: { tabId },
    func: (device: DeviceConfig, isCameraVisible: boolean) => {
      let cameraElement = document.getElementById('capacitor-safe-area-camera');
      if (!cameraElement) {
        cameraElement = document.createElement('div');
        cameraElement.id = 'capacitor-safe-area-camera';
        document.body.appendChild(cameraElement);
      }

      if (device.camera && isCameraVisible) {
        const { top, left, width, height, shape } = device.camera;
        cameraElement.style.cssText = `
          position: fixed;
          top: ${top}px;
          left: ${left !== undefined ? `${left}px` : '50%'};
          transform: ${left === undefined ? 'translateX(-50%)' : 'none'};
          width: ${width}px;
          height: ${height}px;
          background-color: #000;
          border-radius: ${shape === 'round' ? '50%' : `${height / 2}px`};
          z-index: 10000;
        `;
      } else {
        cameraElement.style.display = 'none';
      }
    },
    args: [device, isCameraVisible]
  });
}

export async function removeCamera(tabId: number) {
  await chrome.scripting.executeScript({
    target: { tabId },
    func: () => {
      const cameraElement = document.getElementById('capacitor-safe-area-camera');
      if (cameraElement) {
        cameraElement.remove();
      }
    }
  });
}
