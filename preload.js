const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("external", {
  open: (url) => ipcRenderer.invoke("open-external", url),
});
