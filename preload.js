
const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('pooolLaunchpadApp', {
  node: () => process.versions.node,
  chrome: () => process.versions.chrome,
  electron: () => process.versions.electron,
  openDevTools: () => ipcRenderer.invoke('openDevTools'),
})