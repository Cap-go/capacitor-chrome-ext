import { devices } from './deviceConfigs';

const deviceSelector = document.getElementById('deviceSelector') as HTMLSelectElement;
const toggleButton = document.getElementById('toggleSimulation') as HTMLButtonElement;

devices.forEach((device, index) => {
  const option = document.createElement('option');
  option.value = index.toString();
  option.textContent = device.name;
  deviceSelector.appendChild(option);
});

deviceSelector.addEventListener('change', (event) => {
  const selectedIndex = parseInt((event.target as HTMLSelectElement).value);
  chrome.runtime.sendMessage({ action: 'changeDevice', deviceIndex: selectedIndex });
});

toggleButton.addEventListener('click', () => {
  chrome.runtime.sendMessage({ action: 'toggleSimulation' });
});

chrome.runtime.onMessage.addListener((message) => {
  if (message.action === 'updateDeviceSelection') {
    deviceSelector.value = message.deviceIndex.toString();
  }
});

console.log('Panel script loaded');
