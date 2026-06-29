const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const fs = require('fs');

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

ipcMain.handle('draft-document', async (event, description) => {
  try {
    const prompt = 'You are a legal document drafting assistant. Draft a complete, well-formatted legal document based on the following description. Use clear section headings, numbered clauses where appropriate, and professional legal language. Do not include any commentary before or after the document itself, only the document text. Description: ' + description;
    const response = await fetch('http://localhost:11434/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'llama3.2',
        prompt: prompt,
        stream: false
      })
    });
    const data = await response.json();
    return data.response;
  } catch (err) {
    return 'Error talking to Ollama: ' + err.message + ' (Is Ollama running?)';
  }
});

ipcMain.handle('save-pdf', async (event, htmlContent) => {
  const win = BrowserWindow.getFocusedWindow();
  const { canceled, filePath } = await dialog.showSaveDialog(win, {
    title: 'Save document as PDF',
    defaultPath: 'document.pdf',
    filters: [{ name: 'PDF', extensions: ['pdf'] }]
  });

  if (canceled || !filePath) return { success: false };

  const pdfWindow = new BrowserWindow({ show: false });
  await pdfWindow.loadURL('data:text/html;charset=UTF-8,' + encodeURIComponent(htmlContent));
  const pdfBuffer = await pdfWindow.webContents.printToPDF({});
  fs.writeFileSync(filePath, pdfBuffer);
  pdfWindow.close();

  return { success: true, path: filePath };
});

const SYSTEM_PROMPTS = {
  general: 'You are a helpful legal assistant. Answer clearly, but remind the user this is not a substitute for a real lawyer when relevant. Question: ',
  security: 'You are a legal assistant specialized in helping security researchers understand the legal side of authorized security testing and bug bounty programs. You help with topics like: how computer fraud laws (e.g. the CFAA in the US) apply to authorized testing, what safe harbor language in a bug bounty program means and protects, responsible disclosure best practices and timelines, how to read a program scope and rules of engagement, and what to do if a researcher finds something out of scope or faces a legal threat despite participating in good faith. You only discuss authorized, permission-based testing and responsible disclosure. If a question describes accessing a system without authorization or outside an explicit program scope, you decline to give legal cover for it and instead explain why authorization matters and direct the user to get explicit permission or stay within a program scope first. Remind the user this is general information, not a substitute for a real lawyer, especially before taking any action with legal risk. Question: '
};

ipcMain.handle('ask-ollama', async (event, payload) => {
  const prompt = typeof payload === 'string' ? payload : payload.prompt;
  const mode = typeof payload === 'string' ? 'general' : (payload.mode || 'general');
  try {
    const fullPrompt = SYSTEM_PROMPTS[mode] + prompt;
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

