/// <reference types="chrome"/>
import { DeviceConfig, devices } from './deviceConfigs';


let isActive = false;
let currentDevice: DeviceConfig = devices[0];

function updateIcon(tabId: number) {
  const path = isActive ? {
    "16": "/assets/icon16_active.png",
    "48": "/assets/icon48_active.png",
    "128": "/assets/icon128_active.png"
  } : {
    "16": "/assets/icon16.png",
    "48": "/assets/icon48.png",
    "128": "/assets/icon128.png"
  };
  chrome.action.setIcon({ path, tabId });
}


function updateBadgeText() {
  chrome.action.setBadgeText({ text: isActive ? currentDevice.name.slice(0, 4) : '' });
}

chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.sync.set({ currentDevice: currentDevice });
});

chrome.storage.sync.get(['currentDevice'], (result) => {
  if (result.currentDevice) {
    currentDevice = result.currentDevice;
  }
});

chrome.action.onClicked.addListener((tab) => {
  if (tab.id === undefined) return;

  isActive = !isActive;
  updateIcon(tab.id);
  updateBadgeText();
  
  if (isActive) {
    applySimulation(tab.id);
  } else {
    removeSimulation(tab.id);
  }

  // Reload the tab after a short delay
  setTimeout(() => chrome.tabs.reload(tab.id!), 100);
});

function applySimulation(tabId: number) {
  const { safeArea, camera } = currentDevice;
  let css = `
    :root {
      --safe-area-inset-top: ${safeArea.top}px;
      --safe-area-inset-right: ${safeArea.right}px;
      --safe-area-inset-bottom: ${safeArea.bottom}px;
      --safe-area-inset-left: ${safeArea.left}px;
    }
    body {
      padding: var(--safe-area-inset-top) var(--safe-area-inset-right) var(--safe-area-inset-bottom) var(--safe-area-inset-left);
    }
  `;

  if (camera) {
    css += `
      body::before {
        content: '';
        position: fixed;
        top: 0;
        left: 50%;
        transform: translateX(-50%);
        width: ${camera.width}px;
        height: ${camera.height}px;
        background-color: #000;
        border-bottom-left-radius: 10px;
        border-bottom-right-radius: 10px;
        z-index: 10000;
      }
    `;
  }

  chrome.scripting.insertCSS({
    target: { tabId: tabId },
    css: css
  });

  chrome.scripting.executeScript({
    target: { tabId: tabId },
    func: (device) => {
      console.log(`Capacitor Safe Area Simulator: Activated for ${device.name}`);
      window.dispatchEvent(new CustomEvent('activateSafeArea', { detail: device }));
    },
    args: [currentDevice]
  });
}

function removeSimulation(tabId: number) {
  chrome.scripting.removeCSS({
    target: { tabId: tabId },
    css: `
      :root {
        --safe-area-inset-top: 0px;
        --safe-area-inset-right: 0px;
        --safe-area-inset-bottom: 0px;
        --safe-area-inset-left: 0px;
      }
      body {
        padding: 0;
      }
      body::before {
        display: none;
      }
    `
  });

  chrome.scripting.executeScript({
    target: { tabId: tabId },
    func: () => {
      console.log('Capacitor Safe Area Simulator: Deactivated');
      window.dispatchEvent(new Event('resetSafeArea'));
    }
  });
}

// Add a context menu to select devices
chrome.runtime.onInstalled.addListener(() => {
  devices.forEach((device, index) => {
    chrome.contextMenus.create({
      id: `device_${index}`,
      title: device.name,
      contexts: ['action']
    });
  });
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  const menuItemId = info.menuItemId as string;
  if (menuItemId.startsWith('device_')) {
    const index = parseInt(menuItemId.split('_')[1]);
    currentDevice = devices[index];
    chrome.storage.sync.set({ currentDevice: currentDevice });
    updateBadgeText();
    if (isActive && tab && tab.id) {
      removeSimulation(tab.id);
      applySimulation(tab.id);
      chrome.tabs.reload(tab.id);
    }
  }
});

// Ensure the icon and badge are set correctly when a new tab is opened
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete') {
    updateIcon(tabId);
    updateBadgeText();
  }
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'changeDevice') {
    currentDevice = devices[message.deviceIndex];
    chrome.storage.sync.set({ currentDevice });
    updateBadgeText();
    if (isActive) {
      chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
        if (tabs[0] && tabs[0].id) {
          removeSimulation(tabs[0].id);
          applySimulation(tabs[0].id);
          chrome.tabs.reload(tabs[0].id);
        }
      });
    }
    // Notify all DevTools instances about the change
    chrome.runtime.sendMessage({ action: 'updateDeviceSelection', deviceIndex: message.deviceIndex });
  }
});

