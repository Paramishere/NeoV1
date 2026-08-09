# NEO Plugin Development Guide

## Quick Start

Create a new plugin in 3 steps:

### 1. Create the folder

```
plugins/
└── my-weather-plugin/
    ├── manifest.json
    └── plugin.py
```

### 2. Write manifest.json

```json
{
  "plugin_id": "weather",
  "name": "Weather Plugin",
  "version": "1.0.0",
  "description": "Get current weather information",
  "author": "Your Name",
  "capabilities": ["chat", "automation"],
  "enabled": true,
  "config": {
    "api_key_env": "WEATHER_API_KEY"
  }
}
```

**Capabilities:**
- `chat` — plugin can respond to chat messages
- `voice` — plugin provides voice commands
- `automation` — plugin can be used in automation workflows
- `system` — plugin provides system-level features
- `web` — plugin accesses the internet

### 3. Write plugin.py

```python
from typing import Optional
from backend.services.plugin_service import PluginBase


class Plugin(PluginBase):
    plugin_id = "weather"
    name = "Weather Plugin"
    version = "1.0.0"
    description = "Get current weather information"
    capabilities = ["chat"]

    async def on_load(self) -> bool:
        """Initialize your plugin here."""
        print(f"[{self.name}] Loaded!")
        return True

    async def on_unload(self) -> None:
        """Cleanup when plugin is disabled."""
        pass

    async def on_message(self, message: str, context: dict) -> Optional[str]:
        """
        Process incoming chat messages.
        Return a string response, or None to let other plugins/LLM handle it.
        """
        if "weather" in message.lower():
            return "🌤️ Weather plugin is active! (Configure your weather API key)"
        return None
```

### 4. Reload

Click **Reload** in the Plugins page, or call:
```
POST /api/plugins/reload
```

---

## Plugin API Reference

### PluginBase Methods

| Method | Signature | Description |
|---|---|---|
| `on_load` | `async () -> bool` | Called when plugin loads. Return `True` on success. |
| `on_unload` | `async () -> None` | Called when plugin is disabled/unloaded. |
| `on_message` | `async (message: str, context: dict) -> Optional[str]` | Handle chat messages. |

### Context Dictionary

The `context` dict passed to `on_message` contains:
```python
{
    "conversation_id": str,       # Current conversation session
    "user_settings": dict,        # User preferences from DB
    "memory": list,               # Recent memory entries
    "system_status": dict,        # Current system metrics
}
```

---

## Example Plugins

### System Info Plugin

```python
from backend.services.plugin_service import PluginBase
from backend.services.system_service import system_service

class Plugin(PluginBase):
    plugin_id = "system_info"
    name = "System Info"
    capabilities = ["chat"]

    async def on_message(self, message: str, context: dict):
        if any(w in message.lower() for w in ["cpu", "ram", "memory usage", "system"]):
            cpu = system_service.get_cpu_percent()
            ram = system_service.get_ram_info()
            return f"🖥️ CPU: {cpu:.1f}% | RAM: {ram['percent']:.1f}% ({ram['used_gb']}/{ram['total_gb']} GB)"
        return None
```

### Greeting Plugin

```python
from datetime import datetime
from backend.services.plugin_service import PluginBase

class Plugin(PluginBase):
    plugin_id = "greetings"
    name = "Greetings"
    capabilities = ["chat"]

    async def on_message(self, message: str, context: dict):
        greetings = ["hello", "hi", "hey", "good morning", "good evening"]
        if any(g in message.lower() for g in greetings):
            hour = datetime.now().hour
            time_of_day = "morning" if hour < 12 else "afternoon" if hour < 17 else "evening"
            return f"👋 Good {time_of_day}! I'm NEO. How can I help you today?"
        return None
```
