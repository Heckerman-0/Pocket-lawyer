const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const fs = require('fs');
const { PDFParse } = require('pdf-parse');
const mammoth = require('mammoth');

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

ipcMain.handle('pick-and-read-file', async () => {
  const win = BrowserWindow.getFocusedWindow();
  const { canceled, filePaths } = await dialog.showOpenDialog(win, {
    title: 'Select a document to summarize',
    filters: [{ name: 'Documents', extensions: ['pdf', 'docx', 'txt'] }],
    properties: ['openFile']
  });

  if (canceled || !filePaths.length) return { success: false };

  const filePath = filePaths[0];
  const ext = path.extname(filePath).toLowerCase();
  const fileName = path.basename(filePath);

  try {
    let text = '';
    if (ext === '.pdf') {
      const buffer = fs.readFileSync(filePath);
      const parser = new PDFParse({ data: buffer });
      const result = await parser.getText();
      await parser.destroy();
      text = result.text;
    } else if (ext === '.docx') {
      const result = await mammoth.extractRawText({ path: filePath });
      text = result.value;
    } else if (ext === '.txt') {
      text = fs.readFileSync(filePath, 'utf8');
    } else {
      return { success: false, error: 'Unsupported file type' };
    }

    return { success: true, fileName, text };
  } catch (err) {
    return { success: false, error: err.message };
  }
});

ipcMain.handle('summarize-document', async (event, text) => {
  try {
    const truncated = text.length > 12000 ? text.slice(0, 12000) : text;
    const prompt = 'You are a legal document summarization assistant. Summarize the following document in plain, clear language for someone without a legal background. Include: (1) a brief overview of what the document is, (2) the key terms or obligations, (3) anything that seems important or worth paying attention to. Be concise but thorough. Document text:\n\n' + truncated;
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



