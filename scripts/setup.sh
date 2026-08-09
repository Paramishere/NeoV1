#!/bin/bash
# ====================================================
# NEO — Linux/macOS Setup Script
# ====================================================
set -e

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
CYAN='\033[0;36m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo ""
echo -e "${CYAN}███╗   ██╗███████╗ ██████╗${NC}"
echo -e "${CYAN}████╗  ██║██╔════╝██╔═══██╗${NC}"
echo -e "${CYAN}██╔██╗ ██║█████╗  ██║   ██║${NC}"
echo -e "${CYAN}██║╚██╗██║██╔══╝  ██║   ██║${NC}"
echo -e "${CYAN}██║ ╚████║███████╗╚██████╔╝${NC}"
echo -e "${CYAN}╚═╝  ╚═══╝╚══════╝ ╚═════╝${NC}"
echo ""
echo "NEO Setup Script — Linux/macOS"
echo "==============================="
echo ""

# Check Node.js
if command -v node &>/dev/null; then
    echo -e "${GREEN}✅ Node.js $(node --version)${NC}"
else
    echo -e "${RED}❌ Node.js not found. Install from https://nodejs.org${NC}"
    exit 1
fi

# Check Python
if command -v python3 &>/dev/null; then
    echo -e "${GREEN}✅ $(python3 --version)${NC}"
else
    echo -e "${RED}❌ Python3 not found.${NC}"
    exit 1
fi

# Check Ollama (optional)
if command -v ollama &>/dev/null; then
    echo -e "${GREEN}✅ Ollama found${NC}"
else
    echo -e "${YELLOW}⚠️  Ollama not found (optional). Install from https://ollama.ai${NC}"
fi

# Create directories
echo ""
echo -e "${YELLOW}Creating directories...${NC}"
mkdir -p "$ROOT/logs" "$ROOT/memory" "$ROOT/models" "$ROOT/voice" "$ROOT/plugins"
echo -e "${GREEN}✅ Directories created${NC}"

# Copy .env
if [ ! -f "$ROOT/.env" ]; then
    cp "$ROOT/.env.example" "$ROOT/.env"
    echo -e "${GREEN}✅ Created .env${NC}"
fi

# Python venv
echo ""
echo -e "${YELLOW}Setting up Python environment...${NC}"
if [ ! -d "$ROOT/.venv311" ]; then
    python3 -m venv "$ROOT/.venv311"
    echo -e "${GREEN}✅ Virtual environment created${NC}"
fi

"$ROOT/.venv311/bin/pip" install -r "$ROOT/backend/requirements.txt" -q
echo -e "${GREEN}✅ Python packages installed${NC}"

# Node packages
echo ""
echo -e "${YELLOW}Installing Node packages...${NC}"
cd "$ROOT/frontend" && npm install --silent
echo -e "${GREEN}✅ Node packages installed${NC}"

# Init DB
echo ""
echo -e "${YELLOW}Initializing database...${NC}"
"$ROOT/.venv/bin/python" -c "
import asyncio, sys
sys.path.insert(0, '$ROOT/backend')
from database.init_db import init_database
asyncio.run(init_database())
print('Database initialized')
"
echo -e "${GREEN}✅ Database ready${NC}"

echo ""
echo -e "${CYAN}=====================================${NC}"
echo -e "${GREEN}  ✅ NEO Setup Complete!${NC}"
echo -e "${CYAN}=====================================${NC}"
echo ""
echo "To start NEO:"
echo -e "  ${CYAN}cd frontend && npm run dev${NC}"
echo ""
