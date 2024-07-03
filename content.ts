/// <reference types="@capacitor/core"/>

interface Window {
  Capacitor: typeof import('@capacitor/core').Capacitor;
}

const originalCapacitor = window.Capacitor;

function overrideSafeArea() {
  if (!window.Capacitor) {
    (window as any).Capacitor = {};
  }

  window.Capacitor.getPlatform = () => 'ios';
  window.Capacitor.isNativePlatform = () => true;
  window.Capacitor.isPluginAvailable = () => true;

  window.Capacitor.Plugins = {
    ...window.Capacitor.Plugins,
    StatusBar: {
      ...window.Capacitor.Plugins?.StatusBar,
      getInfo: async () => ({ statusBarHeight: 44 }),
    },
    SafeArea: {
      ...window.Capacitor.Plugins?.SafeArea,
      getSafeAreaInsets: async () => ({
        insets: {
          top: 44,
          right: 0,
          bottom: 34,
          left: 0
        }
      }),
    },
  };
}

overrideSafeArea();

window.addEventListener('resetSafeArea', () => {
  window.Capacitor = originalCapacitor;
});
