const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
  askOllama: (payload) => ipcRenderer.invoke('ask-ollama', payload),
  draftDocument: (description) => ipcRenderer.invoke('draft-document', description),
  savePDF: (htmlContent) => ipcRenderer.invoke('save-pdf', htmlContent)
});
