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

export async function applyTailwindCapacitorSafeArea(tabId: number, device: DeviceConfig) {
  const { safeArea } = device;

  let css = `
    :root {
      --c-safe-area-top: ${safeArea.top}px;
      --c-safe-area-right: ${safeArea.right}px;
      --c-safe-area-bottom: ${safeArea.bottom}px;
      --c-safe-area-left: ${safeArea.left}px;
    }
  `;

  await chrome.scripting.insertCSS({
    target: { tabId },
    css: css
  });
}

export async function removeTailwindCapacitorSafeArea(tabId: number) {
  const css = `
    :root { 
      --c-safe-area-top: env(safe-area-inset-top);
      --c-safe-area-bottom: env(safe-area-inset-bottom);
      --c-safe-area-left: env(safe-area-inset-left);
      --c-safe-area-right: env(safe-area-inset-right);
    }
  `;

  await chrome.scripting.insertCSS({
    target: { tabId },
    css: css
  });
}

export async function applyKonstaSafeArea(tabId: number, device: DeviceConfig) {
  const { safeArea } = device;

  const script = `
    (function() {
      const style = document.createElement('style');
      style.id = 'konsta-safe-area-override';
      style.textContent = \`
        @supports (top: env(safe-area-inset-top)) {
          .safe-areas {
            --k-safe-area-top: ${safeArea.top}px !important;
            --k-safe-area-right: ${safeArea.right}px !important;
            --k-safe-area-bottom: ${safeArea.bottom}px !important;
            --k-safe-area-left: ${safeArea.left}px !important;
          }
        }
        :root {
          --k-safe-area-top: ${safeArea.top}px !important;
          --k-safe-area-right: ${safeArea.right}px !important;
          --k-safe-area-bottom: ${safeArea.bottom}px !important;
          --k-safe-area-left: ${safeArea.left}px !important;
        }
      \`;
      document.head.appendChild(style);

      // Also set on html element for immediate effect
      const html = document.documentElement;
      html.style.setProperty('--k-safe-area-top', '${safeArea.top}px', 'important');
      html.style.setProperty('--k-safe-area-right', '${safeArea.right}px', 'important');
      html.style.setProperty('--k-safe-area-bottom', '${safeArea.bottom}px', 'important');
      html.style.setProperty('--k-safe-area-left', '${safeArea.left}px', 'important');
    })();
  `;

  await chrome.scripting.executeScript({
    target: { tabId },
    func: (scriptContent) => {
      const script = document.createElement('script');
      script.textContent = scriptContent;
      document.head.appendChild(script);
      script.remove();
    },
    args: [script],
    world: "MAIN"
  });
}

export async function removeKonstaSafeArea(tabId: number) {
  const script = `
    (function() {
      const style = document.getElementById('konsta-safe-area-override');
      if (style) style.remove();

      const html = document.documentElement;
      html.style.removeProperty('--k-safe-area-top');
      html.style.removeProperty('--k-safe-area-right');
      html.style.removeProperty('--k-safe-area-bottom');
      html.style.removeProperty('--k-safe-area-left');
    })();
  `;

  await chrome.scripting.executeScript({
    target: { tabId },
    func: (scriptContent) => {
      const script = document.createElement('script');
      script.textContent = scriptContent;
      document.head.appendChild(script);
      script.remove();
    },
    args: [script],
    world: "MAIN"
  });
}

export async function applySafeArea(tabId: number, device: DeviceConfig) {
  await applyIonicSafeArea(tabId, device);
  await applyTailwindCapacitorSafeArea(tabId, device);
  await applyKonstaSafeArea(tabId, device);
}

export async function removeSafeArea(tabId: number) {
  await removeIonicSafeArea(tabId);
  await removeTailwindCapacitorSafeArea(tabId);
  await removeKonstaSafeArea(tabId);
}
