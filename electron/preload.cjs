// No privileged APIs are exposed to the renderer. The app is a self-contained
// static site, so the preload script only marks that it is running inside
// Electron in case the UI ever wants to adapt (it currently does not need to).
const { contextBridge } = require('electron');

contextBridge.exposeInMainWorld('dosageCalcEnv', {
  isElectron: true,
});
