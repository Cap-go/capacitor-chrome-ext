// uiManager.ts

import { getTabState, setTabState, TabState } from './tabState';
import { DeviceConfig, devices } from './deviceConfigs';

export function updateIcon(tabId: number) {
  const state = getTabState(tabId);
  const path = state.isActive ? {
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

export function updateBadgeText(tabId: number) {
  const state = getTabState(tabId);
  chrome.action.setBadgeText({ 
    text: state.isActive ? state.currentDevice.name.slice(0, 4) : '', 
    tabId 
  });
}

export function syncState(tabId: number) {
  const state = getTabState(tabId);
  chrome.storage.local.set({ [tabId.toString()]: state });
  updateIcon(tabId);
  updateBadgeText(tabId);
  notifyStateChange(tabId, state);
}

export function notifyStateChange(tabId: number, state: TabState) {
  // Notify the content script
  chrome.tabs.sendMessage(tabId, { 
    action: 'updateState', 
    state: {
      isActive: state.isActive,
      currentDeviceName: state.currentDevice.name
    }
  }).catch(error => console.error('Error notifying content script:', error));

  // Notify the DevTools panel
  chrome.runtime.sendMessage({ 
    action: 'updateState', 
    tabId,
    state: {
      isActive: state.isActive,
      currentDevice: state.currentDevice
    }
  });
}

export async function updateState(tabId: number, updates: Partial<TabState>) {
  const currentState = getTabState(tabId);
  const newState = { ...currentState, ...updates };
  setTabState(tabId, newState);
  await syncState(tabId);
  return newState;
}

export async function initializeState(tabId: number) {
  const state = await chrome.storage.local.get(tabId.toString());
  if (state[tabId]) {
    setTabState(tabId, state[tabId]);
  } else {
    // Set default state if not found
    setTabState(tabId, {
      isActive: false,
      currentDevice: devices[0] // Set the first device as default
    });
  }
  syncState(tabId);
}

// Listen for tab updates
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete') {
    syncState(tabId);
  }
});

// Clean up state when a tab is closed
chrome.tabs.onRemoved.addListener((tabId) => {
  chrome.storage.local.remove(tabId.toString());
});
