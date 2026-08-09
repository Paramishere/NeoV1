const { app, BrowserWindow, ipcMain, shell, screen } = require('electron')
const { spawn } = require('child_process')
const path = require('path')
const fs = require('fs')

const isDev = process.env.NODE_ENV === 'development'
const BACKEND_PORT = 8765
const VITE_PORT = 5173

let mainWindow = null
let backendProcess = null

// ─── Backend Launcher ─────────────────────────────────────────────────────────

function startBackend() {
  const rootDir = path.join(__dirname, '../..')
  const backendDir = path.join(rootDir, 'backend')

  // Find python: prefer venv
  const venvPythonWin = path.join(rootDir, '.venv311', 'Scripts', 'python.exe')
  const venvPythonWinOld = path.join(rootDir, '.venv', 'Scripts', 'python.exe')
  const venvPythonUnix = path.join(rootDir, '.venv311', 'bin', 'python')
  const pythonCmd = process.platform === 'win32' ? 'python' : 'python3'

  const finalPython = fs.existsSync(venvPythonWin)
    ? venvPythonWin
    : fs.existsSync(venvPythonWinOld)
    ? venvPythonWinOld
    : fs.existsSync(venvPythonUnix)
    ? venvPythonUnix
    : pythonCmd

  console.log(`[NEO] Starting backend: ${finalPython} main.py`)

  backendProcess = spawn(finalPython, ['main.py'], {
    cwd: backendDir,
    stdio: 'pipe',
    env: { ...process.env, PYTHONUNBUFFERED: '1' },
  })

  backendProcess.stdout.on('data', (data) => {
    process.stdout.write(`[BACKEND] ${data}`)
  })

  backendProcess.stderr.on('data', (data) => {
    process.stderr.write(`[BACKEND] ${data}`)
  })

  backendProcess.on('exit', (code) => {
    console.log(`[BACKEND] Exited with code ${code}`)
    backendProcess = null
  })
}

// ─── Window Creation ───────────────────────────────────────────────────────────

function createWindow() {
  const { width: screenWidth, height: screenHeight } = screen.getPrimaryDisplay().workAreaSize

  mainWindow = new BrowserWindow({
    width: Math.min(1600, screenWidth - 80),
    height: Math.min(960, screenHeight - 80),
    minWidth: 1200,
    minHeight: 700,
    frame: false,
    transparent: false,
    backgroundColor: '#020810',
    titleBarStyle: 'hidden',
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
      webSecurity: !isDev,
    },
    show: false,
    center: true,
  })

  if (isDev) {
    mainWindow.loadURL(`http://localhost:${VITE_PORT}`)
    mainWindow.webContents.openDevTools({ mode: 'detach' })
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'))
  }

  mainWindow.once('ready-to-show', () => {
    mainWindow.show()
    mainWindow.focus()
  })

  mainWindow.on('closed', () => {
    mainWindow = null
  })

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url)
    return { action: 'deny' }
  })
}

// ─── IPC Handlers ─────────────────────────────────────────────────────────────

function setupIPC() {
  ipcMain.on('window:minimize', () => mainWindow && mainWindow.minimize())
  ipcMain.on('window:maximize', () => {
    if (!mainWindow) return
    if (mainWindow.isMaximized()) mainWindow.restore()
    else mainWindow.maximize()
  })
  ipcMain.on('window:close', () => mainWindow && mainWindow.close())
  ipcMain.handle('window:is-maximized', () => (mainWindow ? mainWindow.isMaximized() : false))
  ipcMain.handle('backend:is-running', () => backendProcess !== null)
  ipcMain.handle('backend:port', () => BACKEND_PORT)
  ipcMain.handle('app:version', () => app.getVersion())
  ipcMain.handle('app:path', () => app.getPath('userData'))
  ipcMain.handle('app:platform', () => process.platform)
}

// ─── App Lifecycle ─────────────────────────────────────────────────────────────

app.whenReady().then(() => {
  startBackend()
  setupIPC()
  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    if (backendProcess) {
      backendProcess.kill()
      backendProcess = null
    }
    app.quit()
  }
})

app.on('before-quit', () => {
  if (backendProcess) {
    backendProcess.kill()
  }
})
