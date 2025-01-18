window.ipcHandlers = {
  initializeIpcListeners(ipc, domUtils) {
    ipc.on("rooms-data", (rooms) => {
      domUtils.displayRooms(rooms);
    });

    ipc.on("rooms-error", (message) => {
      console.error(message);
    });

    ipc.on("incident-added", (message) => {
      const modalElement = document.querySelector("#modal-incident");
      const modalInstance = bootstrap.Modal.getInstance(modalElement);

      domUtils.reloadFilteredRooms();
      domUtils.showNotification("Incident ajouté avec succès", "success");

      setTimeout(() => {
        modalInstance.hide(); 
      }, 1000);
    });

    ipc.on("incident-error", (message) => {
      domUtils.showNotification(message, "error");
    });

    ipc.on("incident-data", (incident) => {
      const incidentDescription = document.getElementById("new-incident-update");
      incidentDescription.value = incident.incident_notes || "";
      incidentDescription.setAttribute("data-room-id", incident.id);
    });

    ipc.on("incident-updated", (message) => {
      domUtils.reloadFilteredRooms();
      domUtils.showNotification("Incident mis à jour avec succès", "success");

      const modalElement = document.querySelector("#modal-incident-update");
      const modalInstance = bootstrap.Modal.getInstance(modalElement);
      setTimeout(() => {
        modalInstance.hide(); 
      }, 1000);
    });

    ipc.on("incident-delete-error", (message) => {
      domUtils.showNotification(message, "error");
    });

    ipc.on("incident-deleted", (message) => {
      domUtils.showNotification(message, "success");
      domUtils.reloadFilteredRooms();
    });

    ipc.on("incident-delete-error", (message) => {
      console.error(message);
      domUtils.showNotification(message, "error");
    });

    ipc.on('filtered-rooms-data', (rooms) => {
      domUtils.displayRooms(rooms);
    });

  },

  send(ipc, channel, data = null) {
    ipc.send(channel, data);
  },

  once(ipc, channel, data) {
    ipc.once(channel, data);
  },
};
