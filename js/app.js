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