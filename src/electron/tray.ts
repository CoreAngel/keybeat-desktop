import { BrowserWindow, Menu, Tray, app } from 'electron';

export default class MainTray {
  mainWindow: BrowserWindow;
  tray: Tray | undefined;

  constructor(main: BrowserWindow, iconPath: string, setQuiting: (val: boolean) => void) {
    this.mainWindow = main;
    this.buildTray(iconPath, setQuiting);
    this.onEnd();
  }

  private buildTray = (iconPath: string, setQuiting: (val: boolean) => void) => {
    app.whenReady().then(() => {
      this.tray = new Tray(iconPath);
      const contextMenu = Menu.buildFromTemplate([
        {
          label: 'Quit',
          click: () => {
            setQuiting(true);
            app.quit();
          },
        },
      ]);
      this.tray.setToolTip('KeyBeat');
      this.tray.setContextMenu(contextMenu);
      this.tray.on('click', () => this.mainWindow.show());
    });
  };

  private onEnd = () => {
    app.on('window-all-closed', () => {
      if (process.platform !== 'darwin') {
        this.tray?.destroy();
      }
    });
  };
}
