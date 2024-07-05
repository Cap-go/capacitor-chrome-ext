// panel.ts

import { devices } from './deviceConfigs';

const deviceSelector = document.getElementById('deviceSelector') as HTMLSelectElement;
const toggleSimulation = document.getElementById('toggleSimulation') as HTMLInputElement;
const toggleCamera = document.getElementById('toggleCamera') as HTMLInputElement;
const statusElement = document.getElementById('status') as HTMLDivElement;

let currentTabId: number;
let port: chrome.runtime.Port;

function updateUI(isActive: boolean, isCameraVisible: boolean, currentDeviceIndex: number) {
  deviceSelector.value = currentDeviceIndex.toString();
  toggleSimulation.checked = isActive;
  toggleCamera.checked = isCameraVisible;
  statusElement.textContent = isActive ? 'Simulation Active' : 'Simulation Inactive';
  statusElement.className = isActive ? 'font-bold text-green-500' : 'font-bold text-red-500';
}

devices.forEach((device, index) => {
  const option = document.createElement('option');
  option.value = index.toString();
  option.textContent = device.name;
  deviceSelector.appendChild(option);
});

deviceSelector.addEventListener('change', (event) => {
  const selectedIndex = parseInt((event.target as HTMLSelectElement).value);
  chrome.runtime.sendMessage({ action: 'changeDevice', deviceIndex: selectedIndex, tabId: currentTabId }, (response) => {
    if (chrome.runtime.lastError) {
      console.error(chrome.runtime.lastError);
    }
  });
});

toggleSimulation.addEventListener('change', () => {
  chrome.runtime.sendMessage({ action: 'toggleSimulation', isActive: toggleSimulation.checked, tabId: currentTabId }, (response) => {
    if (chrome.runtime.lastError) {
      console.error(chrome.runtime.lastError);
    }
  });
});

toggleCamera.addEventListener('change', () => {
  const isChecked = toggleCamera.checked;
  chrome.runtime.sendMessage({ 
    action: 'toggleCamera', 
    isVisible: isChecked, 
    tabId: currentTabId 
  }, (response) => {
    if (chrome.runtime.lastError) {
      console.error(chrome.runtime.lastError);
      // Revert the checkbox state if there was an error
      toggleCamera.checked = !isChecked;
    } else {
      // Update the UI based on the response
      updateUI(response.state.isActive, response.state.isCameraVisible, response.state.currentDeviceIndex);
    }
  });
});


// Initialize connection and state
currentTabId = chrome.devtools.inspectedWindow.tabId;
port = chrome.runtime.connect({ name: "devtools-page" });

port.onMessage.addListener((message) => {
  if (message.action === 'initState') {
    updateUI(message.state.isActive, message.state.isCameraVisible, message.state.currentDeviceIndex);
  }
});

port.postMessage({ action: 'init', tabId: currentTabId });

// Listen for state updates
chrome.runtime.onMessage.addListener((message) => {
  if (message.action === 'updateState' && message.tabId === currentTabId) {
    const { isActive, isCameraVisible, currentDevice } = message.state;
    const currentDeviceIndex = devices.findIndex(d => d.name === currentDevice.name);
    updateUI(isActive, isCameraVisible, currentDeviceIndex);
  }
});
