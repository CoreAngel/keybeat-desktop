/* eslint global-require: off, no-console: off */
import 'reflect-metadata';
import 'core-js/stable';
import 'regenerator-runtime/runtime';
import MainWindow from './electron/mainWindow';

const bootsrap = async () => {
  const installExtensions = async () => {
    const installer = require('electron-devtools-installer');
    const forceDownload = !!process.env.UPGRADE_EXTENSIONS;
    const extensions = ['REACT_DEVELOPER_TOOLS'];

    return installer
      .default(
        extensions.map((name) => installer[name]),
        forceDownload,
      )
      .catch(console.log);
  };

  if (process.env.NODE_ENV === 'production') {
    const sourceMapSupport = require('source-map-support');
    sourceMapSupport.install();
  }

  if (process.env.NODE_ENV === 'development' || process.env.DEBUG_PROD === 'true') {
    require('electron-debug')();
    await installExtensions();
  }

  const mainWindow = new MainWindow();
  return {
    mainWindow,
  };
};

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-expect-error
let avoidGarbageCollector;
bootsrap()
  .then((val) => {
    avoidGarbageCollector = val;
  })
  .catch(console.log);
