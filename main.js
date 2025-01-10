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
    win.minimize();
  });

  ipc.on("sizeApp", () => {
    if (win.isMaximized()) {
      win.restore();
    } else {
      win.maximize();
    }
  });

  ipc.on("closeApp", () => {
    win.close();
  });

  ipc.on("reload", () => {
    win.reload();
  });

  // Gestion de la connexion
  ipc.on('login', async (event, credentials) => {
    const { email, password } = credentials;
  
    if (!email || !password) {
      event.reply('login-failed', 'Veuillez renseigner tous les champs.');
      return;
    }
  
    try {
      const [rows] = await db.query(
        'SELECT * FROM users WHERE email = ? AND role = ?',
        [email, 'employee']
      );
  
      if (rows.length === 0) {
        event.reply('login-failed', 'Mot de passe ou email incorrect.');
        return;
      }
  
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
        event.reply('login-failed', 'Mot de passe ou email incorrect.');
      }
    } catch (error) {
      console.error('Erreur lors de la connexion :', error);
      event.reply('login-failed', 'Une erreur interne est survenue.');
    }
  });

  // Gestion de la déconnexion
  ipc.on('logout', () => {
    win.webContents.executeJavaScript(`localStorage.removeItem('isLoggedIn');`);
  
    win.loadFile('connexion.html');
  });

  // Gestion des incidents, select et update
  ipc.on('get-rooms', async (event) => {
    try {

      const [rows] = await db.query(`
            SELECT r.id, c.cinema_name, r.room_number, r.incident_notes
            FROM rooms r
            JOIN cinemas c ON r.cinema_id = c.id
      `);
  
      event.reply('rooms-data', rows); // Envoie les données au renderer process

    } catch (error) {
      console.error('Erreur lors de la récupération des salles :', error);
      event.reply('rooms-error', 'Impossible de récupérer les informations des salles.');
    }
  });

  ipc.on('add-incident', async (event, data) => {
    const { roomId, incidentDescription } = data;
  
    try {
      await db.query(
        'UPDATE rooms SET incident_notes = ? WHERE id = ?',
        [incidentDescription, roomId]
      );
  
      event.reply('incident-added', 'Incident ajouté avec succès.');

    } catch (error) {
      console.error('Erreur lors de l\'ajout de l\'incident :', error);
      event.reply('incident-error', 'Impossible d\'ajouter l\'incident.');
    }
  });

  // Récupère les données d'une salle pour la mise à jour
  ipc.on("get-incident", async (event, roomId) => {
    try {
      const [rows] = await db.query(
        "SELECT id, incident_notes FROM rooms WHERE id = ?",
        [roomId]
      );
      console.log(rows);
      if (rows.length > 0) {
        event.reply("incident-data", rows[0]); // Envoie les données de la salle au renderer process
      } else {
        event.reply("incident-update-error", "Salle non trouvée.");
      }
    } catch (error) {
      console.error("Erreur lors de la récupération des données de la salle :", error);
      event.reply("incident-update-error", "Erreur lors de la récupération des données.");
    }
  });

  // Met à jour un incident
  ipc.on("update-incident", async (event, data) => {
    const { roomId, incidentDescription } = data;

    try {
      await db.query(
        "UPDATE rooms SET incident_notes = ? WHERE id = ?",
        [incidentDescription, roomId]
      );
      event.reply("incident-updated", "Incident mis à jour avec succès.");

    } catch (error) {
      console.error("Erreur lors de la mise à jour de l'incident :", error);
      event.reply("incident-update-error", "Impossible de mettre à jour l'incident.");
    }
  });

  // Suppression d'un incident
  ipc.on("delete-incident", async (event, roomId) => {
    try {
      const [result] = await db.query("UPDATE rooms SET incident_notes = NULL WHERE id = ?", [roomId]);

      if (result.affectedRows > 0) {
        console.log(`Incident supprimé pour la salle ${roomId}`);
        event.reply("incident-deleted", "Incident supprimé avec succès.");
      } else {
        console.error(`Aucun incident trouvé pour la salle ${roomId}`);
        event.reply("incident-delete-error", "Aucun incident trouvé pour cette salle.");
      }
    } catch (error) {
      console.error("Erreur lors de la suppression de l'incident :", error);
      event.reply("incident-delete-error", "Impossible de supprimer l'incident.");
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
