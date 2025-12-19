
const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('pooolLaunchpadApp', {
  node: () => process.versions.node,
  chrome: () => process.versions.chrome,
  electron: () => process.versions.electron,
  openDevTools: () => ipcRenderer.invoke('openDevTools'),
  initLaunchPad: async () => ipcRenderer.invoke('initLaunchPad'),
  onButton: (callback) => {
    ipcRenderer.on('launchpad-button', (event, button) => {
      callback(button)
    })
  },
});
