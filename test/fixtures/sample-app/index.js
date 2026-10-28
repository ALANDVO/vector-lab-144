function createWindow(options) {
  return { id: 1, ...options, created: true };
}

async function loadUrl(url, window) {
  return { url, windowId: window?.id, loaded: true };
}

function showWindow() {
  return { shown: true };
}

function hideWindow() {
  return { hidden: true };
}

function quitApp() {
  return { quit: true };
}

class AppManager {
  constructor() {
    this.windows = [];
  }

  registerWindow(window) {
    this.windows.push(window);
  }

  getWindows() {
    return this.windows;
  }

  closeAll() {
    this.windows = [];
  }
}

module.exports = {
  createWindow,
  loadUrl,
  showWindow,
  hideWindow,
  quitApp,
  AppManager
};
