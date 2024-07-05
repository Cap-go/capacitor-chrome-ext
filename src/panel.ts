// panel.ts

import { DeviceConfig, devices } from './deviceConfigs';

const deviceSelector = document.getElementById('deviceSelector') as HTMLSelectElement;
const toggleSimulation = document.getElementById('toggleSimulation') as HTMLInputElement;
const statusElement = document.getElementById('status') as HTMLDivElement;

function updateUI(isActive: boolean, currentDevice: DeviceConfig | null) {
  toggleSimulation.checked = isActive;
  statusElement.textContent = isActive ? 'Simulation Active' : 'Simulation Inactive';
  statusElement.className = isActive ? 'font-bold text-green-500' : 'font-bold text-red-500';
  
  if (currentDevice) {
    const deviceIndex = devices.findIndex(d => d.name === currentDevice.name);
    if (deviceIndex !== -1) {
      deviceSelector.value = deviceIndex.toString();
    } else {
      console.warn('Current device not found in the list:', currentDevice.name);
    }
  } else {
    console.warn('No current device provided');
    deviceSelector.value = "0";
  }
}

devices.forEach((device, index) => {
  const option = document.createElement('option');
  option.value = index.toString();
  option.textContent = device.name;
  deviceSelector.appendChild(option);
});

function sendMessage(message: any): Promise<any> {
  return new Promise((resolve, reject) => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs.length === 0) {
        reject(new Error('No active tab found'));
        return;
      }
      const activeTabId = tabs[0].id;
      if (!activeTabId) {
        reject(new Error('Active tab has no ID'));
        return;
      }
      chrome.tabs.sendMessage(activeTabId, message, (response) => {
        if (chrome.runtime.lastError) {
          reject(new Error(chrome.runtime.lastError.message));
        } else {
          resolve(response);
        }
      });
    });
  });
}

deviceSelector.addEventListener('change', async (event) => {
  const selectedIndex = parseInt((event.target as HTMLSelectElement).value);
  try {
    const response = await sendMessage({ action: 'changeDevice', deviceIndex: selectedIndex });
    console.log('Device change response:', response);
    if (response && response.success) {
      updateUI(response.state.isActive, response.state.currentDevice);
    } else {
      console.error('Failed to change device:', response.error);
    }
  } catch (error) {
    console.error('Error changing device:', error);
  }
});

toggleSimulation.addEventListener('change', async () => {
  const isChecked = toggleSimulation.checked;
  console.log('Toggle simulation changed:', isChecked);
  try {
    const response = await sendMessage({ action: 'toggleSimulation', isActive: isChecked });
    console.log('Toggle simulation response:', response);
    if (response && response.success) {
      updateUI(response.state.isActive, response.state.currentDevice);
    } else {
      console.error('Failed to toggle simulation:', response.error);
      toggleSimulation.checked = !isChecked; // Revert the checkbox state
    }
  } catch (error) {
    console.error('Error toggling simulation:', error);
    toggleSimulation.checked = !isChecked; // Revert the checkbox state
  }
});

// Initialize the panel
chrome.tabs.query({ active: true, currentWindow: true }, async (tabs) => {
  if (tabs.length === 0 || !tabs[0].id) {
    console.error('No active tab found');
    return;
  }
  try {
    const response = await sendMessage({ action: 'getState' });
    console.log('Initial state:', response);
    if (response && response.success) {
      updateUI(response.state.isActive, response.state.currentDevice);
    }
  } catch (error) {
    console.error('Error getting initial state:', error);
  }
});

// Listen for state updates from the background script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'updateState') {
    console.log('Received state update:', message);
    updateUI(message.state.isActive, message.state.currentDevice);
  }
});
