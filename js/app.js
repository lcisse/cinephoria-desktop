const ipc = window.electronAPI;

window.ipcHandlers.initializeIpcListeners(ipc, window.domUtils);

document.getElementById("reduceBtn").addEventListener("click", () => {
  ipc.send("reduceApp");
});

document.getElementById("sizeBtn").addEventListener("click", () => {
  ipc.send("sizeApp");
});

document.getElementById("closeBtn").addEventListener("click", () => {
  ipc.send("closeApp");
});

// Connexion
if (document.getElementById("login-btn")) {
  document.getElementById("login-btn").addEventListener("click", () => {
    const email = document.getElementById("form2Example17").value;
    const password = document.getElementById("form2Example27").value;

    if (!email || !password) {
      window.domUtils.showNotification("Veuillez renseigner tous les champs !", "error");
      return;
    }

    if (!window.domUtils.isNonEmpty(email) || !window.domUtils.isNonEmpty(password)) {
      window.domUtils.showNotification("Veuillez renseigner tous les champs !", "error");
      return;
    }

    if (!window.domUtils.isValidEmail(email)) {
      window.domUtils.showNotification("Veuillez saisir une adresse email valide !", "error");
      return;
    }

    window.ipcHandlers.send(ipc, "login", { email, password });

    window.ipcHandlers.once(ipc, "login-success", (event, data) => {
      localStorage.removeItem('selectedCinema');
      localStorage.setItem('isLoggedIn', 'true');
      console.log("Connexion réussie !");
    });

    window.ipcHandlers.once(ipc, "login-failed", (message) => {
      window.domUtils.showNotification(message, "error");
    });

  });
}

// Déconnexion
if (document.getElementById("logout-btn")) {
  document.getElementById("logout-btn").addEventListener("click", () => {
    ipc.send("logout");
  });

  window.ipcHandlers.once(ipc, "logout-success", (event) => {
    localStorage.removeItem('isLoggedIn');
  });
}

// ********* Gestion des incidents
window.ipcHandlers.send(ipc, "get-rooms"); // Demande les données des salles au chargement de la page

// Gestionnaire pour la mise à jour de l'incident
window.domUtils.updateIncidentBtn();

// Gestion du filtrage par cinéma
window.domUtils.filterManagerByCinema();

// Appliquer le filtre au chargement de la page
document.addEventListener('DOMContentLoaded', () => {
  window.domUtils.reloadFilteredRooms();
});

//Bouton toggle sidbar
window.domUtils.sidbarToggleBtn();



