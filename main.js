const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');

function createWindow() {
  const win = new BrowserWindow({
    width: 1000,
    height: 700,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false
    }
  });

  win.loadFile('index.html');
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

ipcMain.handle('ask-ollama', async (event, prompt) => {
  try {
    const fullPrompt = 'You are a helpful legal assistant. Answer clearly, but remind the user this is not a substitute for a real lawyer when relevant. Question: ' + prompt;
    const response = await fetch('http://localhost:11434/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'llama3.2',
        prompt: fullPrompt,
        stream: false
      })
    });
    const data = await response.json();
    return data.response;
  } catch (err) {
    return 'Error talking to Ollama: ' + err.message + ' (Is Ollama running?)';
  }
});
