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

// Fonctionnalités liées à la connexion
document.getElementById('login-btn').addEventListener('click', () => {
    const email = document.getElementById('form2Example17').value;
    const password = document.getElementById('form2Example27').value;
    console.log(email, password);
  
    ipc.send('login', { email, password });
  
    ipc.on('login-success', () => {
      alert('Connexion réussie !');
    });
  
    ipc.on('login-failed', (event, message) => {
      alert(`Erreur : ${message}`);
    });
  });
  