"""
NEO — System Monitoring Service
=================================
Real-time CPU, RAM, disk metrics using psutil.
"""
import platform
import time
from datetime import datetime
from typing import Dict, Any

import psutil

from core.logger import logger


class SystemService:
    """Provides system resource monitoring."""

    def __init__(self):
        self._boot_time = psutil.boot_time()
        self._process_start = time.time()

    def get_cpu_percent(self) -> float:
        return psutil.cpu_percent(interval=0.1)

    def get_ram_info(self) -> Dict[str, float]:
        mem = psutil.virtual_memory()
        return {
            "percent": mem.percent,
            "used_gb": round(mem.used / (1024**3), 2),
            "total_gb": round(mem.total / (1024**3), 2),
            "available_gb": round(mem.available / (1024**3), 2),
        }

    def get_disk_info(self) -> Dict[str, float]:
        disk = psutil.disk_usage("/")
        return {
            "percent": disk.percent,
            "used_gb": round(disk.used / (1024**3), 2),
            "total_gb": round(disk.total / (1024**3), 2),
        }

    def get_network_info(self) -> Dict[str, Any]:
        net = psutil.net_io_counters()
        return {
            "bytes_sent_mb": round(net.bytes_sent / (1024**2), 2),
            "bytes_recv_mb": round(net.bytes_recv / (1024**2), 2),
        }

    def get_system_info(self) -> Dict[str, Any]:
        return {
            "platform": platform.system(),
            "platform_version": platform.version(),
            "processor": platform.processor(),
            "cpu_count": psutil.cpu_count(logical=True),
            "cpu_count_physical": psutil.cpu_count(logical=False),
        }

    @property
    def uptime_seconds(self) -> float:
        return time.time() - self._process_start


# Singleton
system_service = SystemService()
