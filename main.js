const { app, BrowserWindow, ipcMain } = require('electron/main')
const path = require('node:path')
const ipc = ipcMain;

const createWindow = () => {
  const win = new BrowserWindow({
    width: 1280,
    height: 720, 
    minWidth: 1024,
    minHeight: 640,
    closable: true,
    darkTheme: true,
    frame: false,
    icon: path.join(__dirname, "./ico.ico"),
    webPreferences: {
        nodeIntegration: true,
        contextIsolation: false, // true,
        devTools: true,
        preload: path.join(__dirname, 'preload.js')
    }
  })

  win.webContents.openDevTools();
  win.loadFile('index.html')

  // Gestion des demandes IPC
  // Top menu
  ipc.on("reduceApp", () => {
    console.log("reduceApp");
    win.minimize();
  });
  ipc.on("sizeApp", () => {
    console.log("sizeApp");
    if (win.isMaximized()) {
      win.restore();
    } else {
      win.maximize();
    }
  });
  ipc.on("closeApp", () => {
    console.log("closeApp");
    win.close();
  });

  ipc.on("reload", () => {
    win.reload();
  });
}

app.whenReady().then(() => {
  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})