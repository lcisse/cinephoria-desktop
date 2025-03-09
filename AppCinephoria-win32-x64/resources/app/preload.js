const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electronAPI", {
  send: (channel, data) => ipcRenderer.send(channel, data),
  on: (channel, callback) => ipcRenderer.on(channel, (event, ...args) => callback(...args)),
  once: (channel, callback) => ipcRenderer.once(channel, (event, ...args) => callback(...args)),
});

