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
      applySimulation(tabId);
      break;

    case 'cameraElementStatus':
      if (state.isCameraVisible !== message.isPresent) {
        setTabState(tabId, { isCameraVisible: message.isPresent });
        syncState(tabId);
      }
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

  sendResponse({ success: true, state: getTabState(tabId) });
}

// Add this function to periodically check the camera element status
function startCameraElementCheck(tabId: number) {
  const checkInterval = setInterval(() => {
    chrome.tabs.get(tabId, (tab) => {
      if (chrome.runtime.lastError || !tab) {
        clearInterval(checkInterval);
        return;
      }
      chrome.tabs.sendMessage(tabId, { action: 'checkCameraElement' }, (response) => {
        if (response) {
          const state = getTabState(tabId);
          if (state.isCameraVisible !== response.isPresent) {
            setTabState(tabId, { isCameraVisible: response.isPresent });
            syncState(tabId);
          }
        }
      });
    });
  }, 1000); // Check every second
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
      startCameraElementCheck(tabId);
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

