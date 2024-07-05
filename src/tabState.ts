// tabState.ts

import { DeviceConfig, devices } from './deviceConfigs';

export interface TabState {
  isActive: boolean;
  isCameraVisible: boolean;
  currentDevice: DeviceConfig;
  checkIntervalId?: number;
}

const tabStates: { [tabId: number]: TabState } = {};

export function getTabState(tabId: number): TabState {
  if (!tabStates[tabId]) {
    tabStates[tabId] = {
      isActive: false,
      isCameraVisible: false,
      currentDevice: devices[0] // Set the first device as default
    };
  }
  return tabStates[tabId];
}

export function setTabState(tabId: number, state: Partial<TabState>) {
  tabStates[tabId] = { ...getTabState(tabId), ...state };
}
