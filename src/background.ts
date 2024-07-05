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
        setTabState(tabId, { 
          currentDevice: newDevice, 
          isActive: true,
        });
        await applySimulation(tabId, newDevice);
      } else {
        throw new Error('Invalid device index');
      }
      break;
    case 'toggleSimulation':
      setTabState(tabId, { isActive: message.isActive });
      if (message.isActive) {
        await applySimulation(tabId, state.currentDevice);
      } else {
        await removeSimulation(tabId);
      }
      break;
    default:
      throw new Error('Unknown action');
  }

  return { success: true, state: getTabState(tabId) };
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
      applySimulation(tabId, state.currentDevice)
        .catch(error => console.error('Error reapplying simulation:', error));
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


async function cleanupSimulation(tabId: number) {
  const state = getTabState(tabId);
  if (state.isActive) {
    await removeSimulation(tabId);
    setTabState(tabId, { isActive: false });
    syncState(tabId);
  }
}

chrome.runtime.onConnect.addListener((port) => {
  if (port.name === "devtools-page") {
    let tabId: number | undefined;

    port.onMessage.addListener((message) => {
      if (message.tabId) {
        tabId = message.tabId;
      }
    });

    port.onDisconnect.addListener(() => {
      if (tabId !== undefined) {
        cleanupSimulation(tabId);
      }
    });
  }
});

chrome.tabs.onRemoved.addListener((tabId) => {
  cleanupSimulation(tabId);
  chrome.storage.local.remove(tabId.toString());
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'loading') {
    cleanupSimulation(tabId);
  }
});
