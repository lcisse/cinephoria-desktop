const { app, BrowserWindow, ipcMain } = require('electron/main');
const path = require('node:path');
const db = require('./js/db'); // Module de connexion à la base de données MySQL
const bcrypt = require('bcrypt');
const ipc = ipcMain;

let win;

const createWindow = () => {
  win = new BrowserWindow({
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
      contextIsolation: false,
      devTools: true,
      preload: path.join(__dirname, 'preload.js'),
    },
  });

  win.webContents.openDevTools();
  win.loadFile('connexion.html'); // Charge la page de connexion par défaut

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

  // Gestion de la connexion
  ipc.on('login', async (event, credentials) => {
    const { email, password } = credentials;
  
    try {
      const [rows] = await db.query(
        'SELECT * FROM users WHERE email = ? AND role = ?',
        [email, 'employee']
      );

      if (rows.length > 0) {
        const user = rows[0];
        let storedPasswordHash = user.password;

        if (storedPasswordHash.startsWith('$2y$')) {
          storedPasswordHash = storedPasswordHash.replace('$2y$', '$2b$');
        }
        
        const isPasswordValid = await bcrypt.compare(password, storedPasswordHash);

        if (isPasswordValid) { 
          event.reply('login-success');
          win.webContents.executeJavaScript(`localStorage.setItem('isLoggedIn', 'true');`);
          win.loadFile('index.html'); // Redirige vers la page principale
        } else {
          event.reply('login-failed', 'Mot de passe incorrect');
        }
      } else {
        event.reply('login-failed', 'Utilisateur non trouvé ou non autorisé');
      }
    } catch (error) {
      console.error('Erreur lors de la connexion :', error);
      event.reply('login-failed', 'Erreur interne');
    }
  });
};

app.whenReady().then(() => {
  createWindow();

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
