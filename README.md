# ⚖️ Pocket Lawyer

> A desktop app combining a legal Q&A chatbot, document generator, and contract reviewer — powered entirely by a **local LLM** via [Ollama](https://ollama.com). No cloud API. No API key. No data ever leaves your machine.

![Status](https://img.shields.io/badge/status-in%20development-yellow) ![Platform](https://img.shields.io/badge/platform-Windows-blue) ![License](https://img.shields.io/badge/license-ISC-green)

---

## ✨ Features

| Feature | Status |
|---|---|
| 💬 Legal Q&A Chatbot | ✅ Done |
| 📄 Document Generator | ⏳ Coming soon |
| 🔍 Contract Reviewer | ⏳ Coming soon |

---

## 🛠️ Tech Stack

- **Electron** — desktop app shell (HTML/CSS/JS UI + Node.js backend)
- **Ollama** — runs the LLM locally (default model: `llama3.2`)

---

## 📋 Prerequisites

1. **[Node.js](https://nodejs.org)** (LTS version)
2. **[Ollama](https://ollama.com/download)** installed and running
3. A model pulled:
   ```
   ollama pull llama3.2
   ```

---

## 🚀 Setup

```
git clone https://github.com/Heckerman-0/Pocket-lawyer.git
cd Pocket-lawyer
npm install
npm start
```

Ollama must be running in the background (it usually starts automatically after installation).

---

## ⚙️ How It Works

- The Electron **main process** (`main.js`) sends prompts to Ollama's local API at `http://localhost:11434/api/generate`
- The **preload script** (`preload.js`) safely exposes an `askOllama` function to the frontend via context isolation
- The **frontend** (`index.html` + `chat.js`) is a simple chat UI that displays the conversation

---

## 📁 Project Structure

```
pocket-lawyer/
  main.js        # Electron main process + Ollama API calls
  preload.js     # Secure bridge between frontend and main process
  index.html     # App UI (chat interface)
  chat.js        # Frontend chat logic
  package.json
```

---

## 🔄 Changing the Model

Pull a different/larger model for better answer quality:

```
ollama pull mistral
```

Then update the `model` field inside the `ask-ollama` handler in `main.js`.

---

## ⚠️ Disclaimer

This app provides general legal information for **educational purposes only**. It is **not a substitute for advice from a licensed attorney**. Always consult a qualified lawyer for decisions involving your specific legal situation.

---

## 🗺️ Roadmap

- [ ] Document generator (template-based: NDA, lease, etc.)
- [ ] Document generator (free-form AI drafting from a prompt)
- [ ] Contract reviewer (upload/paste contract, get AI analysis of risky clauses)
- [ ] Model selector in-app
- [ ] Save/export generated documents

---

## 📜 License

ISC
