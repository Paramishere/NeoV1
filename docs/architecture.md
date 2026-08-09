# NEO Architecture Overview

## System Design

NEO follows a **3-tier desktop application** architecture:

```
┌─────────────────────────────────────────────────────────┐
│                    Electron Shell                        │
│  ┌─────────────┐                    ┌─────────────────┐  │
│  │  Main Process│◄──── IPC ────────►│ Renderer Process│  │
│  │  (Node.js)  │    (preload.ts)    │  (React + Vite) │  │
│  └──────┬──────┘                    └────────┬────────┘  │
│         │                                    │           │
│    Spawns subprocess                    HTTP requests     │
│         │                                    │           │
└─────────┼────────────────────────────────────┼───────────┘
          ▼                                    ▼
   ┌─────────────┐                    ┌─────────────────┐
   │  FastAPI    │◄─── REST API ─────►│   Axios Client  │
   │  Backend    │    port 8765        │   (services/)   │
   └──────┬──────┘                    └─────────────────┘
          │
    ┌─────┼──────────────────────┐
    ▼     ▼                      ▼
 SQLite  Ollama           Plugin System
  (ORM)  (AI)          (/plugins/ folder)
```

## Backend Architecture

```
backend/
├── main.py                 # FastAPI app factory + lifespan
├── core/
│   ├── config.py           # Pydantic Settings (all env vars)
│   └── logger.py           # Loguru multi-sink logging
├── api/routers/
│   ├── chat.py             # Conversations + messages
│   ├── memory.py           # Long-term memory CRUD
│   ├── settings_router.py  # App settings
│   ├── tasks.py            # Task management
│   ├── plugins.py          # Plugin discovery + management
│   ├── system.py           # Metrics + integration status
│   └── logs.py             # Log viewer
├── services/
│   ├── llm_service.py      # Ollama + cloud LLM interface
│   ├── voice_service.py    # Vosk/Piper/WakeWord interface
│   ├── memory_service.py   # Memory CRUD service
│   └── plugin_service.py   # Plugin loader + PluginBase
├── database/
│   ├── models.py           # SQLAlchemy ORM (7 tables)
│   ├── connection.py       # Async SQLAlchemy session
│   └── init_db.py          # Auto-creation + default seeding
├── models/
│   └── schemas.py          # Pydantic request/response DTOs
└── middleware/
    └── error_handler.py    # Global exception handler
```

## Frontend Architecture

```
frontend/src/
├── App.tsx                 # Router + splash gating + ErrorBoundary
├── main.tsx                # React root
├── components/
│   ├── core/
│   │   ├── Layout.tsx      # App shell (sidebar + topbar + right panel)
│   │   ├── SplashScreen.tsx # Animated intro sequence
│   │   ├── Sidebar.tsx     # Collapsible nav with active indicator
│   │   ├── TopBar.tsx      # Frameless controls + live clock
│   │   └── RightPanel.tsx  # System metrics + integration status
│   ├── chat/
│   │   ├── AICore.tsx      # Animated central orb
│   │   ├── ChatBubble.tsx  # Message + typing indicator
│   │   └── ChatInput.tsx   # Auto-resize textarea + mic + send
│   └── ui/
│       ├── ErrorBoundary.tsx
│       └── NotificationCenter.tsx
├── pages/                  # Route-level page components
├── hooks/
│   ├── useSystemStatus.ts  # Polls /api/system/status every 3s
│   └── useChat.ts          # Message send + state management
├── store/
│   └── index.ts            # Zustand: UIStore, SystemStore, ChatStore
├── services/
│   └── api.ts              # Axios instance + typed API functions
└── types/
    └── index.ts            # All TypeScript interfaces
```

## Database Schema

| Table | Purpose |
|---|---|
| `conversations` | Chat session metadata |
| `messages` | Individual chat messages |
| `memory` | Long-term memory entries |
| `settings` | App settings key-value store |
| `tasks` | Task management |
| `plugins` | Registered plugin records |
| `log_entries` | UI-visible log entries |
| `system_config` | System-level state |

## Plugin System

Plugins are auto-discovered from `/plugins/` on startup and reload:

```
plugins/
└── my-plugin/
    ├── manifest.json       # Metadata + capabilities
    └── plugin.py           # Plugin class inheriting PluginBase
```

`PluginBase` interface:
- `on_load()` → called on plugin load
- `on_unload()` → called on unload
- `on_message(message, context)` → called per chat message

## State Management (Zustand)

Three independent stores:
- **UIStore** — current page, notifications, sidebar state
- **SystemStore** — backend status, CPU/RAM/disk metrics
- **ChatStore** — conversations, messages, typing state

## Security Model

- All API keys in `.env` only (never source code)
- Electron: `contextIsolation: true`, `nodeIntegration: false`
- IPC bridge via `contextBridge` in preload.ts
- Global exception handler prevents stack trace leakage
- Input validation on all API endpoints via Pydantic

## Adding Future Modules

To add a new backend module:
1. Create `backend/services/your_service.py`
2. Create `backend/api/routers/your_router.py`
3. Mount in `backend/main.py`: `app.include_router(your_router.router, prefix="/api/your")`

To add a new UI page:
1. Create `frontend/src/pages/YourPage.tsx`
2. Add route in `App.tsx`
3. Add nav item in `Sidebar.tsx`
