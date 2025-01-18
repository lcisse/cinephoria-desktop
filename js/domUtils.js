window.domUtils = {
  showNotification(message, type = "error") {
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
          }, 300);
        }, 3000);
      }
    });
  },

  isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },

  isNonEmpty(value) {
    return value.trim() !== "";
  },

  displayRooms(rooms) {
    const tableBody = document.querySelector("#cinemas_list tbody");
    
    if (tableBody) {
      tableBody.innerHTML = ""; // Réinitialise le tableau
      rooms.forEach((room) => {
        const row = window.domUtils.generateTableRow(room);
        tableBody.insertAdjacentHTML("beforeend", row);
      });
      this.initializeIncidentHandlers();
    }
  },

  generateTableRow(room) {
    const cinemaName = this.escapeHTML(room.cinema_name);
    const roomNumber = this.escapeHTML(room.room_number);
    const incidentNotes = this.escapeHTML(room.incident_notes);

    const incidentClass = incidentNotes ? "table-warning" : "";
    return `
      <tr class="room-row">
        <td>${cinemaName}</td>
        <td>${roomNumber}</td>
        <td class="${incidentClass}">${incidentNotes || "Aucun incident signalé"}</td>
        <td>
          <button class="btn incident-btn" id="incident-btn" type="button" data-room-id="${room.id}" data-bs-toggle="modal" data-bs-target="#modal-incident">Signaler un Incident</button>
          <button class="btn update-btn" id="update-btn" type="button" data-room-id="${room.id}" data-bs-toggle="modal" data-bs-target="#modal-incident-update">Modifier</button>
          <button class="btn delete-btn" id="delete-btn" type="button" data-room-id="${room.id}"><i class="fa fa-trash" aria-hidden="true"></i></button>
        </td>
      </tr>
    `;
  },

  escapeHTML(str) {
    if (typeof str !== "string") return str;
    return str
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  },

  initializeIncidentHandlers() {
    // Gestion des boutons "Signaler un Incident"
    const incidentBtn = document.querySelectorAll(".incident-btn");
    incidentBtn.forEach((button) => {
      button.addEventListener("click", (event) => {
        const roomId = event.target.getAttribute("data-room-id");

        // Réinitialise le champ texte du modal
        const incidentInput = document.getElementById("new-incident");
        incidentInput.value = "";
        incidentInput.setAttribute("data-room-id", roomId); // Associe le roomId
      });
    });

    // Gestion des boutons "Ajouter un Incident"
    const modalIncidentBtn = document.querySelector("#modal-incident .btn");
    modalIncidentBtn.addEventListener("click", () => {
      const incidentDescription = document.getElementById("new-incident").value;
      const roomId = document.getElementById("new-incident").getAttribute("data-room-id");
      if (!incidentDescription) {
        this.showNotification("Veuillez décrire l'incident.");
        return;
      }
      window.ipcHandlers.send(window.electronAPI, "add-incident", { roomId, incidentDescription });
    });

    // Gestion des boutons "Modifier"
    document.querySelectorAll(".update-btn").forEach((button) => {
      button.addEventListener("click", (event) => {
        const roomId = event.target.getAttribute("data-room-id");
        
        //ipc.send("get-incident", roomId); // Demande les données de l'incident
        window.ipcHandlers.send(window.electronAPI, "get-incident", roomId); // Demande les données de l'incident
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
    const confirmDeleteBtn = document.getElementById("confirm-delete-btn");
    if(confirmDeleteBtn) {
      document.getElementById("confirm-delete-btn").addEventListener("click", () => {
        if (roomIdToDelete) {
          //ipc.send("delete-incident", roomIdToDelete); // Envoie la requête pour supprimer l'incident
          window.ipcHandlers.send(window.electronAPI, "delete-incident", roomIdToDelete); // Envoie la requête pour supprimer l'incident
          roomIdToDelete = null; 
        }
    
        const modalElement = document.getElementById("modal-confirm-delete");
        const modalInstance = bootstrap.Modal.getInstance(modalElement);
        modalInstance.hide();
      });
    }

  },

  // Gestionnaire pour la mise à jour de l'incident
  updateIncidentBtn() { 
    if(document.querySelector("#update-incident-btn")){
      document.querySelector("#update-incident-btn").addEventListener("click", () => {
        const incidentDescription = document.getElementById("new-incident-update").value;
        const roomId = document.getElementById("new-incident-update").getAttribute("data-room-id");
      
        if (!incidentDescription) {
          this.showNotification("Veuillez décrire l'incident.");
          return;
        }
      
        //ipc.send("update-incident", { roomId, incidentDescription });
        window.ipcHandlers.send(window.electronAPI, "update-incident", { roomId, incidentDescription });
      });
    }
  },

  filterManagerByCinema() {
    document.querySelectorAll('.filter-cinema').forEach((item) => {
      item.addEventListener('click', (event) => {
        event.preventDefault(); // Empêche le rechargement de la page
        const selectedCinema = event.target.getAttribute('data-cinema');
        
        localStorage.setItem('selectedCinema', selectedCinema);
        
        const storedFilter = localStorage.getItem("selectedCinema") || "all";
        this.itemDropdownActive(storedFilter);
        
        window.ipcHandlers.send(window.electronAPI, "filter-rooms", selectedCinema);
      });
    });
  },

  reloadFilteredRooms() {
    const storedFilter = localStorage.getItem("selectedCinema") || "all";
    window.ipcHandlers.send(window.electronAPI, "filter-rooms", storedFilter);

    this.itemDropdownActive(storedFilter);
  },

  itemDropdownActive(storedFilter) {
    // Mettre à jour l'interface du menu dropdown pour indiquer le filtre actif
    const dropdownItems = document.querySelectorAll('.filter-cinema');
    dropdownItems.forEach((item) => {
      if (item.getAttribute('data-cinema') === storedFilter) {
        item.classList.add('active'); // Ajoute une classe "active" pour le style (facultatif)
      } else {
        item.classList.remove('active');
      }
    });
  },

  sidbarToggleBtn() {
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
  }
};
