// background.ts

import { devices } from './deviceConfigs';
import { getTabState, setTabState } from './tabState';
import { syncState } from './uiManager';
import { applySimulation, removeSimulation } from './simulationManager';

function handleMessage(message: any, sender: chrome.runtime.MessageSender, sendResponse: (response?: any) => void) {
  const tabId = message.tabId || sender.tab?.id;
  if (!tabId) {
    sendResponse({ error: 'No tab ID provided' });
    return;
  }

  const state = getTabState(tabId);

  switch (message.action) {
    case 'changeDevice':
      setTabState(tabId, {
        currentDevice: devices[message.deviceIndex],
        isActive: true
      });
      break;
    case 'toggleSimulation':
      setTabState(tabId, { isActive: message.isActive });
      break;
    case 'toggleCamera':
      setTabState(tabId, { isCameraVisible: message.isVisible });
      break;
    case 'getState':
      sendResponse({ 
        isActive: state.isActive, 
        isCameraVisible: state.isCameraVisible, 
        currentDeviceIndex: devices.findIndex(d => d.name === state.currentDevice.name) 
      });
      return;
  }

  syncState(tabId);

  if (getTabState(tabId).isActive) {
    applySimulation(tabId);
  } else {
    removeSimulation(tabId);
  }

  sendResponse({ success: true });
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  handleMessage(message, sender, sendResponse);
  return true;  // Indicates that we will send a response asynchronously
});

// Initialize state when a new tab is created
chrome.tabs.onCreated.addListener((tab) => {
  if (tab.id) {
    setTabState(tab.id, {
      isActive: false,
      isCameraVisible: false,
      currentDevice: devices[0]
    });
    syncState(tab.id);
  }
});

// Clean up state when a tab is removed
chrome.tabs.onRemoved.addListener((tabId) => {
  chrome.storage.local.remove(tabId.toString());
});

// Reapply simulation when a tab is updated
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete') {
    const state = getTabState(tabId);
    if (state.isActive) {
      applySimulation(tabId);
    }
  }
});

// Sync state with storage on startup
chrome.runtime.onStartup.addListener(() => {
  chrome.tabs.query({}, (tabs) => {
    tabs.forEach((tab) => {
      if (tab.id) {
        chrome.storage.local.get(tab.id.toString(), (result) => {
          if (result[tab.id!]) {
            setTabState(tab.id!, result[tab.id!]);
            syncState(tab.id!);
          }
        });
      }
    });
  });
});
