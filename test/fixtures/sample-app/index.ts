/**
 * Sample Electron app main process
 */

export interface WindowOptions {
  width: number;
  height: number;
  title: string;
}

/**
 * Creates a new browser window
 * @param options Window configuration options
 * @returns Window instance
 */
export function createWindow(options: WindowOptions): Electron.BrowserWindow {
  const { BrowserWindow } = require('electron');
  return new BrowserWindow({
    width: options.width,
    height: options.height,
    title: options.title,
  });
}

/**
 * Loads a URL in the main window
 * @param url The URL to load
 * @param window Optional window instance
 */
export async function loadUrl(url: string, window?: Electron.BrowserWindow): Promise<void> {
  const targetWindow = window || getMainWindow();
  if (targetWindow) {
    await targetWindow.loadURL(url);
  }
}

let mainWindow: Electron.BrowserWindow | null = null;

function getMainWindow(): Electron.BrowserWindow | null {
  return mainWindow;
}

/**
 * Shows the main window
 */
export function showWindow(): void {
  if (mainWindow) {
    mainWindow.show();
  }
}

/**
 * Hides the main window
 */
export function hideWindow(): void {
  if (mainWindow) {
    mainWindow.hide();
  }
}

/**
 * Quits the application
 */
export function quitApp(): void {
  const { app } = require('electron');
  app.quit();
}

export class AppManager {
  private windows: Electron.BrowserWindow[] = [];

  /**
   * Register a window
   */
  registerWindow(window: Electron.BrowserWindow): void {
    this.windows.push(window);
  }

  /**
   * Get all windows
   */
  getWindows(): Electron.BrowserWindow[] {
    return this.windows;
  }

  /**
   * Close all windows
   */
  closeAll(): void {
    for (const window of this.windows) {
      window.close();
    }
    this.windows = [];
  }
}
