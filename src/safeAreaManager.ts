// safeAreaManager.ts

import { DeviceConfig } from './deviceConfigs';

export async function applySafeArea(tabId: number, device: DeviceConfig) {
  const { safeArea } = device;

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
      --k-safe-area-right: var(safe-area-inset-right);
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

  await chrome.scripting.insertCSS({
    target: { tabId },
    css: css
  });
}

export async function removeSafeArea(tabId: number) {
  await chrome.scripting.insertCSS({
    target: { tabId },
    css: `
      :root { 
        --ion-safe-area-top: 0; --ion-safe-area-right: 0; --ion-safe-area-bottom: 0; --ion-safe-area-left: 0;
        --k-safe-area-top: 0; --k-safe-area-right: 0; --k-safe-area-bottom: 0; --k-safe-area-left: 0;
        --safe-area-inset-top: 0; --safe-area-inset-right: 0; --safe-area-inset-bottom: 0; --safe-area-inset-left: 0;
      }
      body { padding: 0 !important; }
    `
  });
}
