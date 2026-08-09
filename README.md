# NEO — AI Desktop Assistant

<div align="center">

```
███╗   ██╗███████╗ ██████╗ 
████╗  ██║██╔════╝██╔═══██╗
██╔██╗ ██║█████╗  ██║   ██║
██║╚██╗██║██╔══╝  ██║   ██║
██║ ╚████║███████╗╚██████╔╝
╚═╝  ╚═══╝╚══════╝ ╚═════╝ 
```

**Futuristic AI Desktop Assistant — Production Foundation**

![License](https://img.shields.io/badge/license-MIT-cyan)
![Python](https://img.shields.io/badge/python-3.11+-blue)
![React](https://img.shields.io/badge/react-18-cyan)
![Electron](https://img.shields.io/badge/electron-33-purple)

</div>

---

## Overview

NEO is a futuristic, modular AI desktop assistant inspired by Jarvis but designed as an original product. It is built as a permanent production foundation that can evolve into a full AI Operating System.

**Key Principles:**
- 🧩 **Modular** — Every feature is a pluggable module
- 🔒 **Secure** — No secrets hardcoded, all via environment variables
- 🌐 **Cross-platform ready** — Windows first, Linux/macOS architecture in place
- 🎨 **Production UI** — Glassmorphism, Framer Motion, 60fps animations
- 🤖 **Local AI first** — Ollama with graceful cloud provider fallbacks

---

## Quick Start

### Prerequisites
- [Node.js](https://nodejs.org) 18+
- [Python](https://python.org) 3.11+
- [Ollama](https://ollama.ai) *(optional, for AI chat)*

### 1. Setup (first time only)

**Windows:**
```powershell
.\scripts\setup.ps1
```

**Linux/macOS:**
```bash
chmod +x scripts/setup.sh && ./scripts/setup.sh
```

### 2. Start NEO

```bash
cd frontend
npm run dev
```

This single command starts:
- 🐍 FastAPI backend (port 8765)
- ⚡ Vite dev server (port 5173)
- 🖥️ Electron desktop window

### 3. Optional: Enable AI Chat

```bash
# Install Ollama from https://ollama.ai, then:
ollama pull llama3.2
```

---

## Project Structure

```
NeoV1/
├── frontend/                    # Electron + React + Vite
│   ├── electron/                # Main process + preload (IPC)
│   ├── src/
│   │   ├── components/          # Reusable UI components
│   │   │   ├── core/            # Layout, Sidebar, TopBar, RightPanel
│   │   │   ├── chat/            # AICore orb, ChatInput, ChatBubble
│   │   │   └── ui/              # ErrorBoundary, NotificationCenter
│   │   ├── pages/               # Full page components
│   │   ├── hooks/               # useChat, useSystemStatus
│   │   ├── store/               # Zustand state (UI, System, Chat)
│   │   ├── services/            # Typed API client (Axios)
│   │   └── types/               # TypeScript type definitions
│   ├── package.json
│   ├── vite.config.ts
│   └── tailwind.config.ts       # NEO design system tokens
│
├── backend/                     # Python FastAPI
│   ├── api/routers/             # chat, memory, settings, tasks, plugins, system, logs
│   ├── core/                    # config.py, logger.py
│   ├── database/                # SQLAlchemy models, connection, init
│   ├── middleware/              # Global error handler
│   ├── models/                  # Pydantic schemas
│   ├── services/                # LLM, voice, memory, plugin services
│   └── main.py                  # FastAPI app entry point
│
├── plugins/                     # Drop-in plugin directory
├── memory/                      # Long-term memory files
├── voice/                       # Vosk/Piper/WakeWord models
├── logs/                        # Application logs (auto-created)
├── config/                      # Shared configuration
├── docs/                        # Documentation
├── scripts/                     # Setup scripts (setup.ps1, setup.sh)
├── tests/                       # Test suites
├── .env                         # Environment variables (never commit)
└── .env.example                 # Template with all keys
```

---

## Configuration

All settings are in `.env`. Missing keys **gracefully disable** that feature — NEO never crashes due to a missing API key.

```env
# Local AI (free, no key needed)
OLLAMA_URL=http://localhost:11434
OLLAMA_DEFAULT_MODEL=llama3.2

# Optional cloud providers (leave blank to disable)
OPENAI_API_KEY=
ANTHROPIC_API_KEY=
GOOGLE_API_KEY=
ELEVENLABS_API_KEY=
```

---

## API Reference

Backend runs at `http://127.0.0.1:8765`

| Endpoint | Description |
|---|---|
| `GET /api/health` | Health check |
| `POST /api/chat/send` | Send message, get AI response |
| `GET /api/chat/conversations` | List all conversations |
| `GET /api/system/status` | CPU, RAM, disk, model status |
| `GET /api/system/integrations` | Integration status (API keys) |
| `GET /api/memory/` | List memory entries |
| `GET /api/settings/` | Get all settings |
| `PUT /api/settings/{key}` | Update a setting |
| `GET /api/plugins/` | List discovered plugins |
| `GET /api/logs/file` | Read log file |

Full interactive docs (dev mode): `http://127.0.0.1:8765/api/docs`

---

## Adding Plugins

1. Create a folder in `/plugins/your-plugin-name/`
2. Add `manifest.json`:
```json
{
  "plugin_id": "your_plugin",
  "name": "Your Plugin",
  "version": "1.0.0",
  "description": "What it does",
  "author": "You",
  "capabilities": ["chat"],
  "enabled": true
}
```
3. Add `plugin.py` with a `Plugin` class inheriting `PluginBase`
4. Click **Reload** in the Plugins page

---

## Adding AI Models

```bash
# Pull any Ollama model
ollama pull llama3.2
ollama pull mistral
ollama pull codellama
ollama pull phi3

# Change default model in .env
OLLAMA_DEFAULT_MODEL=mistral
```

Or change it live in **Settings → AI Engine**.

---

## Roadmap

The architecture already supports plugging in:
- 🎤 Wake word detection (openWakeWord)
- 🗣️ Voice I/O (Vosk STT + Piper TTS)
- 🔍 RAG / semantic search
- 🌐 Internet search (SerpAPI)
- 📅 Calendar integration
- 📧 Email / WhatsApp / Discord
- 🖥️ Screen understanding + computer vision
- 🏠 Home automation
- ☁️ Cloud sync + remote access

---

## Tech Stack

| Layer | Technology |
|---|---|
| Desktop | Electron 33 |
| Frontend | React 18, TypeScript, Vite 6 |
| Styling | TailwindCSS 3, Framer Motion 11 |
| State | Zustand 5 |
| Backend | Python FastAPI + Uvicorn |
| Database | SQLite + SQLAlchemy (async) |
| AI | Ollama (local), multi-provider ready |
| Voice | Vosk (STT), Piper (TTS), openWakeWord |

---

## License

MIT — build anything with it.
