// simulationManager.ts
import { DeviceConfig } from './deviceConfigs';
import { getTabState } from './tabState';

export function applySafeAreaAndCamera(tabId: number) {
  const { safeArea, camera } = getTabState(tabId).currentDevice;
  const isCameraVisible = getTabState(tabId).isCameraVisible;

  let css = `
    :root {
      --ion-safe-area-top: ${safeArea.top}px;
      --ion-safe-area-right: ${safeArea.right}px;
      --ion-safe-area-bottom: ${safeArea.bottom}px;
      --ion-safe-area-left: ${safeArea.left}px;

      --k-safe-area-top: ${safeArea.top}px;
      --k-safe-area-right: ${safeArea.right}px;
      --k-safe-area-bottom: ${safeArea.bottom}px;
      --k-safe-area-left: ${safeArea.left}px;

      --safe-area-inset-top: ${safeArea.top}px;
      --safe-area-inset-right: ${safeArea.right}px;
      --safe-area-inset-bottom: ${safeArea.bottom}px;
      --safe-area-inset-left: ${safeArea.left}px;
    }

    @supports (top: env(safe-area-inset-top)) {
      :root {
        --safe-area-inset-top: env(safe-area-inset-top);
        --safe-area-inset-right: env(safe-area-inset-right);
        --safe-area-inset-bottom: env(safe-area-inset-bottom);
        --safe-area-inset-left: env(safe-area-inset-left);
      }
    }

    .safe-areas {
      --k-safe-area-top: var(--safe-area-inset-top);
      --k-safe-area-right: var(--safe-area-inset-right);
      --k-safe-area-bottom: var(--safe-area-inset-bottom);
      --k-safe-area-left: var(--safe-area-inset-left);
    }

    body {
      padding-top: var(--safe-area-inset-top);
      padding-right: var(--safe-area-inset-right);
      padding-bottom: var(--safe-area-inset-bottom);
      padding-left: var(--safe-area-inset-left);
      box-sizing: border-box;
    }
  `;

  if (camera && isCameraVisible) {
    css += `
      body::before {
        content: '';
        position: fixed;
        top: ${camera.top}px;
        left: ${camera.left ?? '50%'};
        transform: ${camera.left === undefined ? 'translateX(-50%)' : 'none'};
        width: ${camera.width}px;
        height: ${camera.height}px;
        background-color: #000;
        border-radius: ${camera.shape === 'round' ? '50%' : `${camera.height / 2}px`};
        z-index: 10000;
      }
    `;
  }

  chrome.scripting.insertCSS({ target: { tabId }, css });
}

export function applySimulation(tabId: number) {
  applySafeAreaAndCamera(tabId);
  chrome.scripting.executeScript({
    target: { tabId },
    func: (device: DeviceConfig, cameraVisible: boolean) => {
      console.log(`Capacitor Safe Area Simulator: Activated for ${device.name} and camera ${cameraVisible ? 'visible' : 'hidden'}`);
      window.dispatchEvent(new CustomEvent('activateSafeArea', { detail: device }));
    },
    args: [getTabState(tabId).currentDevice, getTabState(tabId).isCameraVisible]
  });
}

export function removeSimulation(tabId: number) {
  chrome.scripting.insertCSS({
    target: { tabId },
    css: `
      :root { 
        --ion-safe-area-top: 0; --ion-safe-area-right: 0; --ion-safe-area-bottom: 0; --ion-safe-area-left: 0;
        --k-safe-area-top: 0; --k-safe-area-right: 0; --k-safe-area-bottom: 0; --k-safe-area-left: 0;
        --safe-area-inset-top: 0; --safe-area-inset-right: 0; --safe-area-inset-bottom: 0; --safe-area-inset-left: 0;
      }
      body { padding: 0 !important; }
      body::before { display: none !important; }
    `
  });
  chrome.scripting.executeScript({
    target: { tabId },
    func: () => window.dispatchEvent(new Event('resetSafeArea'))
  });
}
