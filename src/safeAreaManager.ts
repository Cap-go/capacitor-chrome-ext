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

    body {
      padding-top: var(--safe-area-inset-top);
      padding-right: var(--safe-area-inset-right);
      padding-bottom: var(--safe-area-inset-bottom);
      padding-left: var(--safe-area-inset-left);
      box-sizing: border-box;
    }
  `;

  await chrome.scripting.insertCSS({
    target: { tabId },
    css: css
  });
}

export async function applyKonstaSafeArea(tabId: number, device: DeviceConfig) {
  const { safeArea } = device;

  await chrome.scripting.executeScript({
    target: { tabId },
    func: (safeArea) => {
      const htmlEl = document.documentElement;
      const theme = htmlEl.classList.contains('k-ios') ? 'ios' : 'material';
      
      if (theme === 'ios') {
        htmlEl.style.setProperty('--k-safe-area-top', '44px');
        htmlEl.style.setProperty('--k-safe-area-bottom', '34px');
      } else {
        htmlEl.style.setProperty('--k-safe-area-top', `${safeArea.top}px`);
        htmlEl.style.setProperty('--k-safe-area-right', `${safeArea.right}px`);
        htmlEl.style.setProperty('--k-safe-area-bottom', `${safeArea.bottom}px`);
        htmlEl.style.setProperty('--k-safe-area-left', `${safeArea.left}px`);
      }

      // Dispatch an event to notify the app that safe areas have been updated
      window.dispatchEvent(new CustomEvent('safeAreasChanged'));
    },
    args: [safeArea]
  });
}

export async function removeIonicSafeArea(tabId: number) {
  const css = `
    :root { 
      --ion-safe-area-top: 0; --ion-safe-area-right: 0; --ion-safe-area-bottom: 0; --ion-safe-area-left: 0;
      --safe-area-inset-top: 0; --safe-area-inset-right: 0; --safe-area-inset-bottom: 0; --safe-area-inset-left: 0;
    }
    body { padding: 0 !important; }
  `;

  await chrome.scripting.insertCSS({
    target: { tabId },
    css: css
  });
}

export async function removeKonstaSafeArea(tabId: number) {
  await chrome.scripting.executeScript({
    target: { tabId },
    func: () => {
      const htmlEl = document.documentElement;
      htmlEl.style.removeProperty('--k-safe-area-top');
      htmlEl.style.removeProperty('--k-safe-area-right');
      htmlEl.style.removeProperty('--k-safe-area-bottom');
      htmlEl.style.removeProperty('--k-safe-area-left');

      // Dispatch an event to notify the app that safe areas have been removed
      window.dispatchEvent(new CustomEvent('safeAreasChanged'));
    }
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
