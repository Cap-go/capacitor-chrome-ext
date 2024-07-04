console.log('DevTools page script loaded');

chrome.devtools.panels.create(
  "Capacitor Safe Area",
  "/assets/icon16.png",
  "dist/panel.html",  // This is a separate HTML file for the panel content
  (panel) => {
    console.log("Capacitor Safe Area panel created");
  }
);

