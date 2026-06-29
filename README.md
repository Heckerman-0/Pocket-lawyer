# Pocket Lawyer

A desktop app combining a legal Q&A chatbot, document generator, and contract reviewer, powered entirely by a local LLM via Ollama. No cloud API, no API key, no data leaving your machine.

## Features

- Legal Q&A Chatbot - ask plain-language legal questions, answered by a local AI model (DONE)
- Document Generator - coming soon (template-based + AI-drafted documents)
- Contract Reviewer - coming soon (upload/paste a contract, get a plain-language breakdown and flagged risks)

## Tech Stack

- Electron - desktop app shell (HTML/CSS/JS UI + Node.js backend)
- Ollama - runs the LLM locally (default model: llama3.2)

## Prerequisites

Before running this app, make sure you have:

1. Node.js (LTS version) - https://nodejs.org
2. Ollama installed and running - https://ollama.com/download
3. A model pulled, e.g.: ollama pull llama3.2

## Setup

git clone https://github.com/Heckerman-0/Pocket-lawyer.git
cd Pocket-lawyer
npm install
npm start

The app window will open. Ollama must be running in the background (it usually starts automatically after installation).

## How It Works

- The Electron main process (main.js) sends prompts to Ollama local API at http://localhost:11434/api/generate
- The preload script (preload.js) safely exposes an askOllama function to the frontend using context isolation
- The frontend (index.html + chat.js) is a simple chat UI that displays the conversation

## Project Structure

pocket-lawyer/
  main.js        - Electron main process + Ollama API calls
  preload.js     - Secure bridge between frontend and main process
  index.html     - App UI (chat interface)
  chat.js        - Frontend chat logic
  package.json

## Changing the Model

To use a different/larger model for better answer quality, pull it with Ollama:

ollama pull mistral

Then update the model field in main.js ask-ollama handler to match.

## Disclaimer

This app provides general legal information for educational purposes only. It is not a substitute for advice from a licensed attorney. Always consult a qualified lawyer for decisions involving your specific legal situation.

## Roadmap

- [ ] Document generator (template-based: NDA, lease, etc.)
- [ ] Document generator (free-form AI drafting from a prompt)
- [ ] Contract reviewer (upload/paste contract, get AI analysis of risky clauses)
- [ ] Model selector in-app (switch between Ollama models without editing code)
- [ ] Save/export generated documents

## License

ISC
