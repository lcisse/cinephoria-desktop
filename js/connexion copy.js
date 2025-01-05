//const { ipcRenderer } = require('electron');
const ipc = window.ipcRenderer;

document.getElementById('login-btn').addEventListener('click', () => {
  console.log('biennn');
  const email = document.getElementById('form2Example17').value;
  const password = document.getElementById('form2Example27').value;

  ipc.send('login', { email, password });

  ipc.on('login-success', () => {
    alert('Connexion réussie !');
  });

  /*ipc.on('login-failed', (event, message) => {
    alert(`Erreur : ${message}`);
  });*/
});


