const { app, BrowserWindow, ipcMain, shell } = require("electron");
const path = require("path");

function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  win.loadFile("src/index.html");
}

ipcMain.handle("open-external", async (_, url) => {
  await shell.openExternal(url);
});

app.whenReady().then(createWindow);
