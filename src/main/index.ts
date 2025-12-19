import path from 'node:path';

import { app, BrowserWindow, ipcMain, nativeTheme } from 'electron';
import sound from 'sound-play';

import LaunchpadController from './LaunchpadController.js';
import LaunchPadMk2 from './LaunchPadMk2.js';

let launchpad = null;

// Nettoyer à la fermeture
app.on('before-quit', () => {
  if (launchpad) {
    launchpad.disconnect();
  }
});

const createWindow = () => {
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(app.getAppPath(), './.vite/build/preload.js'),
    },
  });

  mainWindow.on('closed', () => {
    if (launchpad) {
      launchpad.disconnect();
    }
  });

  ipcMain.handle('openDevTools', () => {
    if (mainWindow.webContents.isDevToolsOpened()) {
      mainWindow.webContents.closeDevTools();
      return;
    }

    mainWindow.webContents.openDevTools();
  });

  ipcMain.handle('initLaunchPad', async () => {
    try {
      LaunchPadMk2.displayNoteGrid();
      launchpad = new LaunchpadController();
      launchpad.listPorts();
      launchpad.connect();

      // Reset du Launchpad
      launchpad.clearAll();

      // Allumer quelques LEDs de test
      launchpad.setLED(0, 0, LaunchpadController.colors.GREEN);
      launchpad.setLED(7, 0, LaunchpadController.colors.RED);
      launchpad.setLED(0, 7, LaunchpadController.colors.BLUE);
      launchpad.setLED(7, 7, LaunchpadController.colors.YELLOW);

      console.log({ launchpad });
      

      // Écouter les boutons
      launchpad.onButton(async (button) => {
        if (button.pressed) {
          console.log(`Button has been pressed: Note ${button.note} (x: ${button.x}, y: ${button.y}, raw: ${button.raw})`);
        } else {
          console.log(`Button has been released: Note ${button.note}(x: ${button.x}, y: ${button.y}, raw: ${button.raw})`);
        }

        let soundToPlay;

        try {
          const response = await fetch ('http://localhost:6999/sounds', {});
          const { sounds } = await response.json();
          console.log({ sounds });
          soundToPlay = sounds.find((s) => s.note === button.note);

        } catch (error) {
          console.error('Fetch error: ', error);
        }

        if (button.pressed) {
          // Allumer en rouge
          launchpad.setLED(button.x, button.y, LaunchpadController.colors.YELLOW);

          // Envoyer l'événement au renderer
          if (mainWindow) {
            mainWindow.webContents.send('launchpad-button', button);
          }

          if (soundToPlay) {
            sound.play(path.join(__dirname, `./sounds/${soundToPlay.audio}`));
          }
        } else {
          // Éteindre
          launchpad.clearLED(button.x, button.y);
        }
      });

      return { success: true, message: 'Launchpad initialisé' };
    } catch (error) {
      console.error('Erreur:', error);
      return { success: false, error: error.message };
    }
  });

  let grantedDeviceThroughPermHandler;

  mainWindow.webContents.session.on('select-usb-device', (event, details, callback) => {
    // Add events to handle devices being added or removed before the callback on
    // `select-usb-device` is called.
    mainWindow.webContents.session.on('usb-device-added', (event, device) => {
      console.log('usb-device-added FIRED WITH', device)
      // Optionally update details.deviceList
    })

    mainWindow.webContents.session.on('usb-device-removed', (event, device) => {
      console.log('usb-device-removed FIRED WITH', device)
      // Optionally update details.deviceList
    })

    event.preventDefault()
    if (details.deviceList && details.deviceList.length > 0) {
      const deviceToReturn = details.deviceList.find((device) => {
        return !grantedDeviceThroughPermHandler || (device.deviceId !== grantedDeviceThroughPermHandler.deviceId)
      })
      if (deviceToReturn) {
        callback(deviceToReturn.deviceId)
      } else {
        callback()
      }
    }
  });

  mainWindow.webContents.session.setPermissionCheckHandler((webContents, permission, requestingOrigin, details) => {
    if (permission === 'usb' && details.securityOrigin === 'file:///') {
      return true
    }
  });

  mainWindow.webContents.session.setDevicePermissionHandler((details) => {
    const { device } = details;
    console.log("usb device permission request for device: ", device);
    
    if (details.deviceType === 'usb' && details.origin === 'file://') {
      if (!grantedDeviceThroughPermHandler) {
        grantedDeviceThroughPermHandler = details.device
        return true
      } else {
        return false
      }
    }
  });

  mainWindow.webContents.session.setUSBProtectedClassesHandler((details) => {
    console.log("usb protected classes : ", details);
    
    return details.protectedClasses.filter((usbClass) => {
      // Exclude classes except for audio classes
      return usbClass.indexOf('audio') === -1
    })
  });

  if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
    const url = new URL(MAIN_WINDOW_VITE_DEV_SERVER_URL);
    url.searchParams.set('theme',
      nativeTheme.shouldUseDarkColors ? 'dark' : 'light');

    mainWindow.loadURL(url.toString());
  } else {
    mainWindow.loadFile(
      path.join(app.getAppPath(),
        `./.vite/renderer/${MAIN_WINDOW_VITE_NAME}/index.html`),
      { query: {
        theme: nativeTheme.shouldUseDarkColors ? 'dark' : 'light',
      } },
    );
  }
};

app.whenReady().then(() => {
  createWindow();

  app.commandLine.appendSwitch('disable-usb-blocklist');

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

process.on('exit', () => {
  if (launchpad) {
    launchpad.disconnect();
  }
  if (input) {
    input.closePort();
  }
  if (output) {
    output.closePort();
  }
});
