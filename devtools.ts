/// <reference types="chrome"/>

import { devices } from './deviceConfigs';

const deviceSelector = document.getElementById('deviceSelector') as HTMLSelectElement;

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

chrome.runtime.onMessage.addListener((message) => {
  if (message.action === 'updateDeviceSelection') {
    deviceSelector.value = message.deviceIndex.toString();
  }
});
