const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const fs = require('fs');
const url = require('url');

// Keep a global reference of the window object
let mainWindow;

function createWindow() {
  // Create the browser window
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    }
  });

  // In production, use the built files
  const startUrl = process.env.NODE_ENV === 'development' 
    ? 'http://localhost:8080' 
    : url.format({
        pathname: path.join(__dirname, './dist/index.html'),
        protocol: 'file:',
        slashes: true
      });
  
  // Load the app
  mainWindow.loadURL(startUrl);

  // Open DevTools in development mode
  if (process.env.NODE_ENV === 'development') {
    mainWindow.webContents.openDevTools();
  }

  // Handle window being closed
  mainWindow.on('closed', function () {
    mainWindow = null;
  });
}

// Create window when Electron is ready
app.whenReady().then(createWindow);

// Quit when all windows are closed
app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', function () {
  if (mainWindow === null) createWindow();
});

// Listen for save recording request
ipcMain.handle('save-recording', async (event, blobData) => {
  try {
    const { filePath } = await dialog.showSaveDialog({
      buttonLabel: 'Save Recording',
      defaultPath: `screen-recording-${new Date().toISOString().replace(/:/g, '-')}.webm`,
      filters: [
        { name: 'WebM Files', extensions: ['webm'] },
        { name: 'All Files', extensions: ['*'] }
      ]
    });

    if (filePath) {
      // Convert base64 to buffer and save
      const buffer = Buffer.from(blobData, 'base64');
      fs.writeFileSync(filePath, buffer);
      return { success: true, filePath };
    } else {
      return { success: false, message: 'Save operation cancelled' };
    }
  } catch (error) {
    console.error('Error saving recording:', error);
    return { success: false, message: error.message };
  }
});
