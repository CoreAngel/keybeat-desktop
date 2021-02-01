/* no-console: off */
import { app, BrowserWindow, shell, powerMonitor, globalShortcut } from 'electron';
import path from 'path';
import isDev from 'electron-is-dev';
import AppUpdater from './appUpdater';
import MainTray from './tray';
import { ActivityActions } from '../react/services/activityService';
import CommunicationManager from './communicationManager';

export default class MainWindow {
  mainWindow: BrowserWindow | null = null;
  updater: AppUpdater | null = null;
  tray: MainTray | null = null;
  communication = new CommunicationManager();
  isQuiting = false;

  static RESOURCES_PATH = app.isPackaged
    ? path.join(process.resourcesPath, 'assets')
    : path.join(__dirname, '../../assets');

  constructor() {
    this.onReady();
    this.onActivate();
    this.onReadyToShow();
  }

  init = async () => {
    app.allowRendererProcessReuse = false;
    // 800 x 700
    this.mainWindow = new BrowserWindow({
      show: false,
      width: 800,
      height: 720,
      title: 'KeyBeat',
      backgroundColor: '#212121',
      icon: MainWindow.getAssetPath('icon.png'),
      webPreferences: {
        nodeIntegration: true,
        contextIsolation: false,
        enableRemoteModule: true,
      },
    });
    this.mainWindow.removeMenu();

    this.buildTray();
    this.onReadyToShow();
    this.onClose();
    this.onClosed();
    this.onOpenExternalLink();
    this.onWindowStateChange();
    await this.communication.init();

    this.updater = new AppUpdater();

    const devIndexPath = path.resolve(__dirname, '../index.html');
    const prodIndexPath = path.resolve(__dirname, 'index.html');
    await this.mainWindow.loadURL(`file:${isDev ? devIndexPath : prodIndexPath}`);
  };

  setQuiting = (val: boolean) => {
    this.isQuiting = val;
  };

  buildTray = () => {
    if (this.mainWindow) {
      const iconPath = MainWindow.getAssetPath('icon.png');
      this.tray = new MainTray(this.mainWindow, iconPath, this.setQuiting);
    }
  };

  static getAssetPath = (...paths: string[]): string => {
    return path.join(MainWindow.RESOURCES_PATH, ...paths);
  };

  onReadyToShow = () => {
    this.mainWindow?.on('ready-to-show', () => {
      if (!this.mainWindow) {
        throw new Error('"mainWindow" is not defined');
      }
      if (process.env.START_MINIMIZED) {
        this.mainWindow?.minimize();
      } else {
        this.mainWindow?.show();
        this.mainWindow?.focus();
      }
    });
  };

  onClosed = () => {
    this.mainWindow?.on('closed', () => {
      this.mainWindow = null;
    });
  };

  onClose = () => {
    this.mainWindow?.on('close', (e) => {
      if (!this.isQuiting) {
        e.preventDefault();
        this.mainWindow?.hide();
      } else {
        globalShortcut.unregisterAll();
        app.quit();
      }
    });
  };

  onOpenExternalLink = () => {
    this.mainWindow?.webContents.on('new-window', (event, url) => {
      event.preventDefault();
      shell.openExternal(url);
    });
  };

  onReady = () => {
    app.whenReady().then(this.init).catch(console.log);
  };

  onWindowAllClosed = () => {
    app.on('window-all-closed', () => {
      if (process.platform !== 'darwin') {
        app.quit();
      }
    });
  };

  onActivate = () => {
    app.on('activate', () => {
      if (this.mainWindow === null) this.init();
    });
  };

  onWindowStateChange = () => {
    this.mainWindow.on('blur', () => this.mainWindow.webContents.send(ActivityActions.REFRESH));
    this.mainWindow.on('focus', () => this.mainWindow.webContents.send(ActivityActions.REFRESH));
    this.mainWindow.on('show', () => this.mainWindow.webContents.send(ActivityActions.REFRESH));
    this.mainWindow.on('hide', () => this.mainWindow.webContents.send(ActivityActions.CLOSE));
    powerMonitor.on('suspend', () => this.mainWindow.webContents.send(ActivityActions.CLOSE));
    powerMonitor.on('shutdown', () => this.mainWindow.webContents.send(ActivityActions.CLOSE));
    powerMonitor.on('lock-screen', () => this.mainWindow.webContents.send(ActivityActions.CLOSE));
  };
}
