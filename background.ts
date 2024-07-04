/// <reference types="chrome"/>
import { DeviceConfig, devices } from './deviceConfigs';

let isActive = false;
let isCameraVisible = false;
let currentDevice: DeviceConfig = devices[0];

function updateIcon() {
  console.log('Updating icon', isActive);
  const path = isActive ? {
    "16": "/assets/icon16_active.png",
    "48": "/assets/icon48_active.png",
    "128": "/assets/icon128_active.png"
  } : {
    "16": "/assets/icon16.png",
    "48": "/assets/icon48.png",
    "128": "/assets/icon128.png"
  };
  chrome.action.setIcon({ path });
}

function updateBadgeText() {
  console.log('Updating badge text', currentDevice.name);
  chrome.action.setBadgeText({ text: isActive ? currentDevice.name.slice(0, 4) : '' });
}

chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.sync.set({ currentDevice: JSON.stringify(currentDevice) });
});

chrome.storage.sync.get(['currentDevice'], (result) => {
  if (result.currentDevice) {
    currentDevice = JSON.parse(result.currentDevice);
  }
});

function applySafeAreaAndCamera(tabId: number) {
  const { safeArea, camera } = currentDevice;
  let css = `
    :root {
      --safe-area-inset-top: ${safeArea.top}px;
      --safe-area-inset-right: ${safeArea.right}px;
      --safe-area-inset-bottom: ${safeArea.bottom}px;
      --safe-area-inset-left: ${safeArea.left}px;
    }
    body {
      padding: var(--safe-area-inset-top) var(--safe-area-inset-right) var(--safe-area-inset-bottom) var(--safe-area-inset-left) !important;
      box-sizing: border-box !important;
    }
  `;

  if (camera && isCameraVisible) {
    const left = camera.left !== undefined 
      ? `left: ${camera.left}px;` 
      : 'left: 50%; transform: translateX(-50%);';
    const borderRadius = camera.shape === 'round' 
      ? '50%' 
      : `${camera.height / 2}px`;

    css += `
      body::before {
        content: '';
        position: fixed;
        top: ${camera.top}px;
        ${left}
        width: ${camera.width}px;
        height: ${camera.height}px;
        background-color: #000;
        border-radius: ${borderRadius};
        z-index: 10000;
      }
    `;
  }

  chrome.scripting.insertCSS({
    target: { tabId: tabId },
    css: css
  });
}

function applySimulation(tabId: number) {
  console.log('Applying simulation for device:', currentDevice.name);
  
  applySafeAreaAndCamera(tabId);

  chrome.scripting.executeScript({
    target: { tabId: tabId },
    func: (device, cameraVisible) => {
      console.log(`Capacitor Safe Area Simulator: Activated for ${device.name}`);
      console.log(`Camera visible: ${cameraVisible}`);
      window.dispatchEvent(new CustomEvent('activateSafeArea', { detail: device }));
    },
    args: [currentDevice, isCameraVisible]
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
        padding: 0 !important;
      }
      body::before {
        display: none !important;
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

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'changeDevice') {
    currentDevice = devices[message.deviceIndex];
    chrome.storage.sync.set({ currentDevice });
    updateBadgeText();
    chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
      if (tabs[0] && tabs[0].id) {
        if (isActive) {
          removeSimulation(tabs[0].id);
        }
        isActive = true;
        applySimulation(tabs[0].id);
        updateIcon();
      }
    });
    // Notify all DevTools instances about the change
    chrome.runtime.sendMessage({ action: 'updateDeviceSelection', deviceIndex: message.deviceIndex });
  } else if (message.action === 'toggleSimulation') {
    isActive = message.isActive;
    chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
      if (tabs[0] && tabs[0].id) {
        if (isActive) {
          applySimulation(tabs[0].id);
        } else {
          removeSimulation(tabs[0].id);
        }
        updateIcon();
        updateBadgeText();
      }
    });
  } else if (message.action === 'toggleCamera') {
    isCameraVisible = message.isVisible;
    if (isActive) {
      chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
        if (tabs[0] && tabs[0].id) {
          removeSimulation(tabs[0].id);
          applySimulation(tabs[0].id);
        }
      });
    }
  }
});

// Add this function to handle tab updates
function handleTabUpdate(tabId: number, changeInfo: chrome.tabs.TabChangeInfo, tab: chrome.tabs.Tab) {
  if (changeInfo.status === 'complete' && isActive) {
    applySafeAreaAndCamera(tabId);
  }
}

// Add listener for tab updates
chrome.tabs.onUpdated.addListener(handleTabUpdate);

console.log('Background script loaded');
