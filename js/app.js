const { ipcRenderer } = require('electron')
const ipc = ipcRenderer

const reduceBtn = document.getElementById("reduceBtn");
const sizeBtn = document.getElementById("sizeBtn");
const closeBtn = document.getElementById("closeBtn");

reduceBtn.addEventListener("click", () => {
  ipc.send("reduceApp");
});

sizeBtn.addEventListener("click", () => {
  ipc.send("sizeApp");
});

closeBtn.addEventListener("click", () => {
  ipc.send("closeApp");
});



// Gestion notification formulaire de connexion
function showNotification(message, type = 'error') {
  const notification = document.getElementById('notification');
  const notificationMessage = document.getElementById('notification-message');

  notificationMessage.textContent = message;
  notification.className = type; // classe "success" ou "error"
  notification.style.opacity = '1';
  notification.style.opacity = '1';

  setTimeout(() => {
    notification.style.opacity = '0';
    setTimeout(() => {
      notification.style.opacity = '0';
    }, 300); // temps de transition
  }, 5000); // Affiche la notification 
}

// Fonctionnalités liées à la connexion
if(document.getElementById('login-btn')) { 
  document.getElementById('login-btn').addEventListener('click', () => {
      const email = document.getElementById('form2Example17').value;
      const password = document.getElementById('form2Example27').value;

      if (!email || !password) {
        showNotification('Veuillez renseigner tous les champs !', 'error');
        return;
      }

    ipc.send('login', { email, password });
    
    
      ipc.once('login-success', () => {
        console.log('Connexion réussie !');
      });
    
      ipc.once('login-failed', (event, message) => {
        showNotification(message, 'error');
      });
  });
}

// Fonctionnalité de déconnexion
if(document.getElementById('logout-btn')) { 
  document.getElementById('logout-btn').addEventListener('click', () => {
    ipc.send('logout');
  });
}