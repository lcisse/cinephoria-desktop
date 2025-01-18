const ipc = window.electronAPI;

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

function showNotification(message, type = "error") {
  const notifications = document.querySelectorAll(".notification");

  notifications.forEach((notification) => {
    const notificationMessage = notification.querySelector(".notification-message");

    if (notificationMessage) {
      notificationMessage.textContent = message; 
      notification.classList.add(type); 
      notification.style.opacity = "1"; 

      setTimeout(() => {
        notification.style.opacity = "0";
        setTimeout(() => {
          notification.classList.remove(type); 
        }, 300); // Temps de transition
      }, 3000);
    }
  });
}

//Bouton toggle sidbar
if(document.getElementById("sidebarToggle")) {
  document.getElementById("sidebarToggle").addEventListener("click", () => {
    const logo = document.getElementById("sidebar-logo");
    const sidebar = document.getElementById('accordionSidebar');
    const contentWrapper = document.getElementById('content-wrapper');
    const content = document.getElementById('content');
    const  topMenu = document.getElementById('topMenu');
    
    logo.classList.toggle("hidden-logo");

    sidebar.classList.toggle('reduced');
    contentWrapper.classList.toggle('reduced');
    content.classList.toggle('reduced');
    topMenu.classList.toggle('reduced');
  });
}


// Fonctionnalités liées à la connexion
if (document.getElementById("login-btn")) {
  document.getElementById("login-btn").addEventListener("click", () => {
    const email = document.getElementById("form2Example17").value;
    const password = document.getElementById("form2Example27").value;

    if (!email || !password) {
      showNotification("Veuillez renseigner tous les champs !", "error");
      return;
    }

    ipc.send("login", { email, password });

    ipc.once("login-success", (event, data) => {
      localStorage.removeItem('selectedCinema');
      localStorage.setItem('isLoggedIn', 'true');
      console.log("Connexion réussie !");
    });

    ipc.once("login-failed", (event, message) => {
      showNotification(message, "error");
    });
  });
}

// Fonctionnalité de déconnexion
if (document.getElementById("logout-btn")) {
  document.getElementById("logout-btn").addEventListener("click", () => {
    ipc.send("logout");
  });
}

// ********* Gestion des incidents
ipc.send("get-rooms"); // Demande les données des salles au chargement de la page

ipc.on("rooms-data", (rooms) => {
  const tableBody = document.querySelector("#cinemas_list tbody");

  if (tableBody) {
    tableBody.innerHTML = ""; // Réinitialise le tableau
  }

  
  rooms.forEach((room) => {
    const row = generateTableRow(room);

    if (tableBody) {
      tableBody.insertAdjacentHTML("beforeend", row);
    }
  });

  // Réinitialise les gestionnaires d'événements
  initializeIncidentHandlers();
});

ipc.on("rooms-error", (event, message) => {
  console.error(message);
});

// Initialise les gestionnaires d'événements pour les boutons "ajouter un Incident" et "Modifier"
function initializeIncidentHandlers() {
  const incidentBtn = document.querySelectorAll(".incident-btn");
  const modalIncidentBtn = document.querySelector("#modal-incident .btn");
  const confirmDeleteBtn = document.getElementById("confirm-delete-btn");

  // Gestion des boutons "Signaler un Incident"
  if(incidentBtn) {
    incidentBtn.forEach((button) => {
      button.addEventListener("click", (event) => {
        const roomId = event.target.getAttribute("data-room-id");
        
        // Réinitialise le champ texte du modal
        const incidentInput = document.getElementById("new-incident");
        incidentInput.value = ""; // Vide le champ texte
  
        incidentInput.setAttribute("data-room-id", roomId); // Associe le roomId
      });
    });
  }

  // Gestion des boutons "Ajouter un Incident"
  if(modalIncidentBtn) {
    modalIncidentBtn.addEventListener("click", () => {
      const incidentDescription = document.getElementById("new-incident").value;
      const roomId = document
        .getElementById("new-incident")
        .getAttribute("data-room-id");
    
      if (!incidentDescription) {
        showNotification("Veuillez décrire l'incident.");
        return;
      }
  
      ipc.send("add-incident", { roomId, incidentDescription });
    });
  }

  // Gestion des boutons "Modifier"
  document.querySelectorAll(".update-btn").forEach((button) => {
    button.addEventListener("click", (event) => {
      const roomId = event.target.getAttribute("data-room-id");
      
      ipc.send("get-incident", roomId); // Demande les données de l'incident
    });
  });

  // Gestion des boutons "Supprimer"
  let roomIdToDelete = null; // Variable pour stocker l'ID de la salle à supprimer
  document.querySelectorAll(".delete-btn").forEach((button) => {
    button.addEventListener("click", (event) => {
      const roomId = event.currentTarget.getAttribute("data-room-id");
      roomIdToDelete = roomId;

      // Affiche la modal de confirmation
      const modalElement = document.getElementById("modal-confirm-delete");
      const modalInstance = new bootstrap.Modal(modalElement);
      modalInstance.show();
    });
  });

  // Gestion du clic sur le bouton "Confirmer la suppression"
  if(confirmDeleteBtn) {
    document.getElementById("confirm-delete-btn").addEventListener("click", () => {
      if (roomIdToDelete) {
        ipc.send("delete-incident", roomIdToDelete); // Envoie la requête pour supprimer l'incident
        roomIdToDelete = null; 
      }
  
      const modalElement = document.getElementById("modal-confirm-delete");
      const modalInstance = bootstrap.Modal.getInstance(modalElement);
      modalInstance.hide();
    });
  }

}

// Gestion modal "Signaler un Incident"
ipc.on("incident-added", (event, message) => {
  reloadFilteredRooms();
  const modalElement = document.querySelector("#modal-incident");
  const modalInstance = bootstrap.Modal.getInstance(modalElement);
  showNotification("Incident ajouté avec succès", "success");
  setTimeout(() => {
    modalInstance.hide(); 
  }, 1000);
});

ipc.on("incident-error", (message) => {
  showNotification(message, "error");
});


// Gestion des données reçues pour préremplir le formulaire de mise à jour
ipc.on("incident-data", (incident) => {
  const incidentDescription = document.getElementById("new-incident-update");
  incidentDescription.value = incident.incident_notes || ""; 
  incidentDescription.setAttribute("data-room-id", incident.id); // Associe l'ID de la salle au champ
});

// Gestionnaire pour la mise à jour de l'incident
if(document.querySelector("#update-incident-btn")){
  document.querySelector("#update-incident-btn").addEventListener("click", () => {
    const incidentDescription = document.getElementById("new-incident-update").value;
    const roomId = document.getElementById("new-incident-update").getAttribute("data-room-id");
  
    if (!incidentDescription) {
      showNotification("Veuillez décrire l'incident.");
      return;
    }
  
    ipc.send("update-incident", { roomId, incidentDescription });
  });
}

ipc.on("incident-updated", (event, message) => {
  reloadFilteredRooms();
  const modalElement = document.querySelector("#modal-incident-update");
  const modalInstance = bootstrap.Modal.getInstance(modalElement);
  showNotification("Incident mis à jour avec succès", "success");
  setTimeout(() => {
    modalInstance.hide(); 
  }, 1000);
});

ipc.on("incident-update-error", (message) => {
  console.error("Erreur lors de la mise à jour :", message);
  showNotification(message);
});


// Gestion de la réponse après suppression
ipc.on("incident-deleted", (message) => {
  showNotification(message, "success");
  reloadFilteredRooms();
});

ipc.on("incident-delete-error", (message) => {
  console.error(message);
  showNotification(message, "error");
});

//    *************************** Gestion du filtre par cinéma ************************* 
// Gestion du filtrage par cinéma
document.querySelectorAll('.filter-cinema').forEach((item) => {
  item.addEventListener('click', (event) => {
    event.preventDefault(); // Empêche le rechargement de la page
    const selectedCinema = event.target.getAttribute('data-cinema');

    localStorage.setItem('selectedCinema', selectedCinema);

    ipc.send('filter-rooms', selectedCinema);
  });
});

// Réception des données filtrées
ipc.on('filtered-rooms-data', (rooms) => {
  const tableBody = document.querySelector('#cinemas_list tbody');
  if (tableBody) {
    tableBody.innerHTML = ''; // Réinitialise le tableau
  }

  rooms.forEach((room) => {
    const row = generateTableRow(room);

    if (tableBody) {
      tableBody.insertAdjacentHTML('beforeend', row);
    }
  });

  initializeIncidentHandlers(); // Réinitialise les gestionnaires d'événements
});

// Appliquer le filtre au chargement de la page
document.addEventListener('DOMContentLoaded', () => {
  reloadFilteredRooms();
});

function reloadFilteredRooms() {
  const storedFilter = localStorage.getItem('selectedCinema') || 'all';
 
  ipc.send('filter-rooms', storedFilter);

  // Mettre à jour l'interface du menu dropdown pour indiquer le filtre actif
  const dropdownItems = document.querySelectorAll('.filter-cinema');
  dropdownItems.forEach((item) => {
    if (item.getAttribute('data-cinema') === storedFilter) {
      item.classList.add('active'); // Ajoute une classe "active" pour le style (facultatif)
    } else {
      item.classList.remove('active');
    }
  });
}


// ************************** Fonction pour Générer les rows du tableau *****************
function generateTableRow(room) {
  const incidentClass = room.incident_notes ? "table-warning" : "";
  return `
    <tr class="room-row">
      <td>${room.cinema_name}</td>
      <td>${room.room_number}</td>
      <td class="${incidentClass}">${room.incident_notes || "Aucun incident signalé"}</td>
      <td>
        <button class="btn incident-btn" id="incident-btn" type="button" data-room-id="${room.id}" data-bs-toggle="modal" data-bs-target="#modal-incident">Signaler un Incident</button> 
        <button class="btn update-btn" id="update-btn" type="button" data-room-id="${room.id}" data-bs-toggle="modal" data-bs-target="#modal-incident-update">Modifier</button>
        <button class="btn delete-btn" id="delete-btn" type="button" data-room-id="${room.id}"><i class="fa fa-trash" aria-hidden="true"></i></button>
      </td>
    </tr>
  `;
}



