// uiManager.ts

import { getTabState } from './tabState';

export function updateIcon(tabId: number) {
  const state = getTabState(tabId);
  const path = state.isActive  ? {
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
  chrome.storage.local.set({ [tabId]: state });
  updateIcon(tabId);
  updateBadgeText(tabId);
  chrome.runtime.sendMessage({ 
    action: 'updateState', 
    tabId,
    state
  });
}
