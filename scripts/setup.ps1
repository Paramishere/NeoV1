# ====================================================
# NEO — Windows Setup & Launch Script (PowerShell)
# ====================================================
# Run this once: .\scripts\setup.ps1
# After setup, use: cd frontend && npm run dev
# ====================================================

$ErrorActionPreference = "Continue"
$ROOT = Split-Path -Parent $PSScriptRoot

Write-Host ""
Write-Host " ███╗   ██╗███████╗ ██████╗ " -ForegroundColor Cyan
Write-Host " ████╗  ██║██╔════╝██╔═══██╗" -ForegroundColor Cyan
Write-Host " ██╔██╗ ██║█████╗  ██║   ██║" -ForegroundColor Cyan
Write-Host " ██║╚██╗██║██╔══╝  ██║   ██║" -ForegroundColor Cyan
Write-Host " ██║ ╚████║███████╗╚██████╔╝" -ForegroundColor Cyan
Write-Host " ╚═╝  ╚═══╝╚══════╝ ╚═════╝ " -ForegroundColor Cyan
Write-Host ""
Write-Host "NEO Setup Script — Windows" -ForegroundColor White
Write-Host "===========================" -ForegroundColor DarkCyan
Write-Host ""

# ─── Step 1: Check prerequisites ─────────────────────────────

Write-Host "[1/6] Checking prerequisites..." -ForegroundColor Yellow

# Check Node.js
try {
    $nodeVersion = node --version 2>$null
    Write-Host "  ✅ Node.js $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "  ❌ Node.js not found. Install from https://nodejs.org" -ForegroundColor Red
    exit 1
}

# Check Python
try {
    $pythonVersion = python --version 2>$null
    Write-Host "  ✅ $pythonVersion" -ForegroundColor Green
} catch {
    Write-Host "  ❌ Python not found. Install from https://python.org" -ForegroundColor Red
    exit 1
}

# Check Ollama (optional)
try {
    $ollamaVersion = ollama --version 2>$null
    Write-Host "  ✅ Ollama found" -ForegroundColor Green
} catch {
    Write-Host "  ⚠️  Ollama not found (optional). Install from https://ollama.ai" -ForegroundColor Yellow
}

# ─── Step 2: Create directories ──────────────────────────────

Write-Host ""
Write-Host "[2/6] Creating directories..." -ForegroundColor Yellow

$dirs = @("$ROOT\logs", "$ROOT\memory", "$ROOT\models", "$ROOT\voice", "$ROOT\plugins")
foreach ($dir in $dirs) {
    New-Item -ItemType Directory -Force -Path $dir | Out-Null
    Write-Host "  ✅ $dir" -ForegroundColor Green
}

# ─── Step 3: Copy .env ───────────────────────────────────────

Write-Host ""
Write-Host "[3/6] Setting up environment..." -ForegroundColor Yellow

if (-not (Test-Path "$ROOT\.env")) {
    Copy-Item "$ROOT\.env.example" "$ROOT\.env"
    Write-Host "  ✅ Created .env from .env.example" -ForegroundColor Green
    Write-Host "  ℹ️  Edit .env to add optional API keys" -ForegroundColor Cyan
} else {
    Write-Host "  ✅ .env already exists" -ForegroundColor Green
}

# ─── Step 4: Python virtual environment ──────────────────────

Write-Host ""
Write-Host "[4/6] Setting up Python environment..." -ForegroundColor Yellow

$venvPath = "$ROOT\.venv311"
if (-not (Test-Path $venvPath)) {
    Write-Host "  Creating virtual environment with Python 3.11..." -ForegroundColor DarkGray
    py -3.11 -m venv $venvPath
    Write-Host "  ✅ Virtual environment created" -ForegroundColor Green
} else {
    Write-Host "  ✅ Virtual environment exists" -ForegroundColor Green
}

# Install Python dependencies
Write-Host "  Installing Python packages..." -ForegroundColor DarkGray
& "$venvPath\Scripts\pip.exe" install -r "$ROOT\backend\requirements.txt" --quiet
Write-Host "  ✅ Python packages installed" -ForegroundColor Green

# ─── Step 5: Node.js packages ────────────────────────────────

Write-Host ""
Write-Host "[5/6] Installing Node.js packages..." -ForegroundColor Yellow

Set-Location "$ROOT\frontend"
npm install --silent
if ($LASTEXITCODE -eq 0) {
    Write-Host "  ✅ Node packages installed" -ForegroundColor Green
} else {
    Write-Host "  ❌ npm install failed" -ForegroundColor Red
}

# ─── Step 6: Initialize database ─────────────────────────────

Write-Host ""
Write-Host "[6/6] Initializing database..." -ForegroundColor Yellow

# Run a quick Python script to init the DB
$initScript = @"
import asyncio, sys
sys.path.insert(0, r'$ROOT\backend')
from database.init_db import init_database
asyncio.run(init_database())
print('Database initialized')
"@

& "$venvPath\Scripts\python.exe" -c $initScript
Write-Host "  ✅ Database ready" -ForegroundColor Green

# ─── Done ────────────────────────────────────────────────────

Write-Host ""
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host "  ✅ NEO Setup Complete!" -ForegroundColor Green
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "To start NEO:" -ForegroundColor White
Write-Host "  cd frontend" -ForegroundColor Cyan
Write-Host "  npm run dev" -ForegroundColor Cyan
Write-Host ""
Write-Host "Optional: Install Ollama and pull a model:" -ForegroundColor White
Write-Host "  ollama pull llama3.2" -ForegroundColor Cyan
Write-Host ""

Set-Location $ROOT
