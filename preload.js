const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
  askOllama: (payload) => ipcRenderer.invoke('ask-ollama', payload),
  draftDocument: (description) => ipcRenderer.invoke('draft-document', description),
  savePDF: (htmlContent) => ipcRenderer.invoke('save-pdf', htmlContent),
  pickAndReadFile: () => ipcRenderer.invoke('pick-and-read-file'),
  summarizeDocument: (text) => ipcRenderer.invoke('summarize-document', text)
});
