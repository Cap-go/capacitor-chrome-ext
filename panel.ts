import { devices } from './deviceConfigs';

const deviceSelector = document.getElementById('deviceSelector') as HTMLSelectElement;
const toggleSimulation = document.getElementById('toggleSimulation') as HTMLInputElement;
const statusElement = document.getElementById('status') as HTMLDivElement;

let isSimulationActive = false;

function updateStatus() {
  statusElement.textContent = isSimulationActive ? 'Simulation Active' : 'Simulation Inactive';
  statusElement.className = isSimulationActive ? 'font-bold text-green-500' : 'font-bold text-red-500';
}

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

toggleSimulation.addEventListener('change', () => {
  isSimulationActive = toggleSimulation.checked;
  chrome.runtime.sendMessage({ action: 'toggleSimulation', isActive: isSimulationActive });
  updateStatus();
});

chrome.runtime.onMessage.addListener((message) => {
  if (message.action === 'updateDeviceSelection') {
    deviceSelector.value = message.deviceIndex.toString();
  } else if (message.action === 'updateSimulationStatus') {
    isSimulationActive = message.isActive;
    toggleSimulation.checked = isSimulationActive;
    updateStatus();
  }
});

// Initialize status
updateStatus();
