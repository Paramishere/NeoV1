"""
NEO — Plugin Loader Service
=============================
Discovers and loads plugins from the /plugins directory.
Plugins are Python packages with a manifest.json.
"""
import importlib
import json
import sys
from pathlib import Path
from typing import Dict, List, Optional

from core.logger import logger


class PluginBase:
    """Base class all NEO plugins must inherit from."""

    plugin_id: str = ""
    name: str = ""
    version: str = "1.0.0"
    description: str = ""
    author: str = ""
    capabilities: List[str] = []

    async def on_load(self) -> bool:
        """Called when plugin is loaded. Return True on success."""
        return True

    async def on_unload(self) -> None:
        """Called when plugin is unloaded."""
        pass

    async def on_message(self, message: str, context: dict) -> Optional[str]:
        """Called when a chat message matches this plugin's capabilities."""
        return None

    def get_manifest(self) -> dict:
        return {
            "plugin_id": self.plugin_id,
            "name": self.name,
            "version": self.version,
            "description": self.description,
            "author": self.author,
            "capabilities": self.capabilities,
        }


class PluginLoader:
    """Discovers, loads, and manages NEO plugins."""

    def __init__(self):
        self.plugins_dir = Path(__file__).parent.parent.parent / "plugins"
        self._loaded_plugins: Dict[str, PluginBase] = {}
        self._plugin_manifests: List[dict] = []

    async def discover_plugins(self) -> List[dict]:
        """Scan plugins directory and return manifest list."""
        self._plugin_manifests = []
        self.plugins_dir.mkdir(parents=True, exist_ok=True)

        for item in self.plugins_dir.iterdir():
            if item.is_dir() and not item.name.startswith("_"):
                manifest_path = item / "manifest.json"
                if manifest_path.exists():
                    try:
                        with open(manifest_path) as f:
                            manifest = json.load(f)
                        manifest["_path"] = str(item)
                        self._plugin_manifests.append(manifest)
                        logger.info(f"Discovered plugin: {manifest.get('name', item.name)}")
                    except Exception as e:
                        logger.warning(f"Failed to read plugin manifest {manifest_path}: {e}")

        logger.info(f"Discovered {len(self._plugin_manifests)} plugins")
        return self._plugin_manifests

    async def load_plugin(self, plugin_id: str) -> bool:
        """Load a specific plugin by ID."""
        manifest = next(
            (m for m in self._plugin_manifests if m.get("plugin_id") == plugin_id), None
        )
        if not manifest:
            logger.warning(f"Plugin not found: {plugin_id}")
            return False

        plugin_path = Path(manifest["_path"])
        if str(plugin_path.parent) not in sys.path:
            sys.path.insert(0, str(plugin_path.parent))

        try:
            module = importlib.import_module(plugin_path.name)
            plugin_class = getattr(module, "Plugin", None)
            if not plugin_class or not issubclass(plugin_class, PluginBase):
                logger.warning(f"Plugin {plugin_id} missing Plugin class")
                return False

            instance = plugin_class()
            success = await instance.on_load()
            if success:
                self._loaded_plugins[plugin_id] = instance
                logger.info(f"✅ Plugin loaded: {plugin_id}")
                return True
        except Exception as e:
            logger.error(f"Failed to load plugin {plugin_id}: {e}")

        return False

    async def load_all(self) -> int:
        """Load all discovered plugins. Returns count loaded."""
        await self.discover_plugins()
        loaded = 0
        for manifest in self._plugin_manifests:
            if manifest.get("enabled", True):
                if await self.load_plugin(manifest["plugin_id"]):
                    loaded += 1
        return loaded

    def get_loaded_plugins(self) -> Dict[str, PluginBase]:
        return self._loaded_plugins

    def get_manifests(self) -> List[dict]:
        return self._plugin_manifests


# Singleton
plugin_loader = PluginLoader()
