"use strict";
/// <reference types="chrome"/>
let isActive = false;
chrome.action.onClicked.addListener((tab) => {
    if (tab.id === undefined)
        return;
    isActive = !isActive;
    if (isActive) {
        chrome.scripting.insertCSS({
            target: { tabId: tab.id },
            css: `
        :root {
          --safe-area-inset-top: 44px;
          --safe-area-inset-right: 0px;
          --safe-area-inset-bottom: 34px;
          --safe-area-inset-left: 0px;
        }
        body {
          padding: var(--safe-area-inset-top) var(--safe-area-inset-right) var(--safe-area-inset-bottom) var(--safe-area-inset-left);
        }
      `
        });
        chrome.scripting.executeScript({
            target: { tabId: tab.id },
            files: ['content.js']
        });
    }
    else {
        chrome.scripting.removeCSS({
            target: { tabId: tab.id },
            css: `
        :root {
          --safe-area-inset-top: 44px;
          --safe-area-inset-right: 0px;
          --safe-area-inset-bottom: 34px;
          --safe-area-inset-left: 0px;
        }
        body {
          padding: var(--safe-area-inset-top) var(--safe-area-inset-right) var(--safe-area-inset-bottom) var(--safe-area-inset-left);
        }
      `
        });
        chrome.scripting.executeScript({
            target: { tabId: tab.id },
            func: () => {
                window.dispatchEvent(new Event('resetSafeArea'));
            }
        });
    }
});
