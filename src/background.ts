// background.ts

import { devices } from './deviceConfigs';
import { getTabState, setTabState } from './tabState';
import { syncState } from './uiManager';
import { applySimulation, removeSimulation } from './simulationManager';

async function handleMessage(tabId: number, message: any): Promise<any> {
  const state = getTabState(tabId);

  switch (message.action) {
    case 'getState':
      return { success: true, state: state };
    case 'changeDevice':
      const newDevice = devices[message.deviceIndex];
      if (newDevice) {
        setTabState(tabId, { currentDevice: newDevice, isActive: true });
        await applySimulation(tabId, newDevice, state.isCameraVisible);
      } else {
        throw new Error('Invalid device index');
      }
      break;
    case 'toggleSimulation':
      setTabState(tabId, { isActive: message.isActive });
      if (message.isActive) {
        await applySimulation(tabId, state.currentDevice, state.isCameraVisible);
      } else {
        removeSimulation(tabId);
      }
      break;
    case 'toggleCamera':
      setTabState(tabId, { isCameraVisible: message.isVisible });
      await applySimulation(tabId, state.currentDevice, message.isVisible);
      break;
    default:
      throw new Error('Unknown action');
  }

  return { success: true, state: getTabState(tabId) };
}


function stopCameraElementCheck(tabId: number) {
  const state = getTabState(tabId);
  if (state.checkIntervalId) {
    clearInterval(state.checkIntervalId);
    setTabState(tabId, { ...state, checkIntervalId: undefined });
  }
}

// Define the startCameraElementCheck function if not already defined
function startCameraElementCheck(tabId: number) {
  const state = getTabState(tabId);
  
  // Clear existing interval if it exists
  if (state.checkIntervalId) {
    clearInterval(state.checkIntervalId);
  }

  const checkIntervalId = setInterval(() => {
    chrome.tabs.get(tabId, (tab) => {
      if (chrome.runtime.lastError || !tab) {
        stopCameraElementCheck(tabId);
        return;
      }
      chrome.tabs.sendMessage(tabId, { action: 'checkCameraElement' }, (response) => {
        if (chrome.runtime.lastError) {
          console.error('Error checking camera element:', chrome.runtime.lastError);
          return;
        }
        if (response) {
          const currentState = getTabState(tabId);
          if (currentState.isCameraVisible !== response.isPresent) {
            setTabState(tabId, { isCameraVisible: response.isPresent });
            syncState(tabId);
          }
        }
      });
    });
  }, 1000); // Check every second

  setTabState(tabId, { ...state, checkIntervalId });
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log('Received message in background:', message);

  if (!message || typeof message !== 'object') {
    console.error('Received invalid message');
    sendResponse({error: 'Invalid message'});
    return false;
  }

  const tabId = sender.tab?.id;
  if (!tabId) {
    console.error('Message received from unknown tab');
    sendResponse({error: 'Unknown tab'});
    return false;
  }

  // Handle the message asynchronously
  handleMessage(tabId, message).then(response => {
    console.log('Sending response:', response);
    sendResponse(response);
  }).catch(error => {
    console.error('Error handling message:', error);
    sendResponse({error: error.message});
  });

  // Return true to indicate that we will send a response asynchronously
  return true;
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
  stopCameraElementCheck(tabId);
  chrome.storage.local.remove(tabId.toString());
});

// Reapply simulation when a tab is updated
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete') {
    const state = getTabState(tabId);
    if (state.isActive) {
      applySimulation(tabId, state.currentDevice, state.isCameraVisible)
        .catch(error => console.error('Error reapplying simulation:', error));
      startCameraElementCheck(tabId);
    } else {
      stopCameraElementCheck(tabId);
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

