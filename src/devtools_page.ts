// devtools_page.ts

console.log('DevTools page script loaded');

const backgroundPageConnection = chrome.runtime.connect({
  name: "devtools-page"
});

backgroundPageConnection.postMessage({
  tabId: chrome.devtools.inspectedWindow.tabId,
  scriptToInject: "content_script.js"
});

chrome.devtools.panels.create(
  "Capacitor Safe Area",
  "/assets/icon16.png",
  "dist/panel.html",
  (panel) => {
    console.log("Capacitor Safe Area panel created");
  }
);
