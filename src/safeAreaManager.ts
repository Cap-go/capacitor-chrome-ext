// safeAreaManager.ts

import { DeviceConfig } from './deviceConfigs';

export async function applyIonicSafeArea(tabId: number, device: DeviceConfig) {
  const { safeArea } = device;

  let css = `
    :root {
      --ion-safe-area-top: ${safeArea.top}px;
      --ion-safe-area-right: ${safeArea.right}px;
      --ion-safe-area-bottom: ${safeArea.bottom}px;
      --ion-safe-area-left: ${safeArea.left}px;
    }
  `;

  await chrome.scripting.insertCSS({
    target: { tabId },
    css: css
  });
}

export async function applyKonstaSafeArea(tabId: number, device: DeviceConfig) {
  const { safeArea } = device;

  let css = `
    :root {
      --k-safe-area-top: ${safeArea.top}px !important;
      --k-safe-area-right: ${safeArea.right}px;
      --k-safe-area-bottom: ${safeArea.bottom}px;
      --k-safe-area-left: ${safeArea.left}px;
    }
  `;

  await chrome.scripting.insertCSS({
    target: { tabId },
    css: css
  });
}

export async function removeIonicSafeArea(tabId: number) {
  const css = `
    :root { 
      --ion-safe-area-top: env(safe-area-inset-top);
      --ion-safe-area-bottom: env(safe-area-inset-bottom);
      --ion-safe-area-left: env(safe-area-inset-left);
      --ion-safe-area-right: env(safe-area-inset-right);
    }
  `;

  await chrome.scripting.insertCSS({
    target: { tabId },
    css: css
  });
}

export async function removeKonstaSafeArea(tabId: number) {
  const css = `
    :root { 
      --k-safe-area-top: env(safe-area-inset-top);
      --k-safe-area-bottom: env(safe-area-inset-bottom);
      --k-safe-area-left: env(safe-area-inset-left);
      --k-safe-area-right: env(safe-area-inset-right);
    }
  `;

  await chrome.scripting.insertCSS({
    target: { tabId },
    css: css
  });
}

export async function applySafeArea(tabId: number, device: DeviceConfig) {
  await applyIonicSafeArea(tabId, device);
  await applyKonstaSafeArea(tabId, device);
}

export async function removeSafeArea(tabId: number) {
  await removeIonicSafeArea(tabId);
  await removeKonstaSafeArea(tabId);
}
