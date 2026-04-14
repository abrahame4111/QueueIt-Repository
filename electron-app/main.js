const { app, BrowserWindow, Menu, shell, dialog } = require('electron');
const path = require('path');

const ADMIN_URL = 'https://queueit.live/admin';
const CUSTOMER_URL = 'https://queueit.live/request';

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1000,
    minHeight: 700,
    title: 'QueueIt',
    icon: path.join(__dirname, 'assets/icon.png'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true
    },
    backgroundColor: '#0a0a0a',
    show: false
  });

  mainWindow.loadURL(ADMIN_URL);

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
    createMenu();
  });

  // Show branded offline page if site fails to load or shows old cached version
  mainWindow.webContents.on('did-fail-load', () => {
    mainWindow.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(OFFLINE_HTML)}`);
  });

  mainWindow.webContents.on('did-finish-load', () => {
    // Detect Emergent sleep mode (old "Hostel Beats" or "Frontend Preview Only")
    mainWindow.webContents.executeJavaScript(`
      document.title.includes('Hostel') || 
      document.body.innerText.includes('Frontend Preview Only') ||
      document.body.innerText.includes('HOSTEL BEATS') ||
      document.body.innerText.includes('Wake up servers')
    `).then((isOffline) => {
      if (isOffline) {
        mainWindow.loadURL('data:text/html;charset=utf-8,' + encodeURIComponent(OFFLINE_HTML));
      }
    }).catch(() => {});
  });

  // Let Spotify OAuth happen INSIDE the Electron window.
  // Do NOT open it externally — the redirect_uri points back to our app URL,
  // so the ?code= will land back in this window and be handled by React.

  mainWindow.on('closed', () => { mainWindow = null; });
}

const OFFLINE_HTML = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>QueueIt - Offline</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@700;900&family=JetBrains+Mono:wght@400;600&display=swap');
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      background: #0a0a0a; color: #fff; font-family: 'JetBrains Mono', monospace;
      display: flex; align-items: center; justify-content: center; height: 100vh;
      overflow: hidden;
    }
    .container { text-align: center; max-width: 500px; padding: 40px; }
    .logo { font-family: 'Orbitron', sans-serif; font-size: 48px; font-weight: 900; margin-bottom: 8px; }
    .logo span:first-child { color: #00f0ff; }
    .logo span:last-child { color: #ff2a6d; }
    .status { color: #ff2a6d; font-size: 12px; letter-spacing: 3px; text-transform: uppercase; margin-bottom: 40px; }
    .message { color: #666; font-size: 14px; line-height: 1.8; margin-bottom: 40px; }
    .retry {
      background: transparent; border: 1px solid #00f0ff; color: #00f0ff;
      padding: 14px 40px; font-family: 'Orbitron', sans-serif; font-size: 13px;
      font-weight: 700; letter-spacing: 2px; cursor: pointer; text-transform: uppercase;
      transition: all 0.2s;
    }
    .retry:hover { background: #00f0ff; color: #0a0a0a; box-shadow: 0 0 30px #00f0ff40; }
    .pulse { width: 8px; height: 8px; background: #ff2a6d; display: inline-block; margin-right: 8px; animation: pulse 2s infinite; }
    @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.3; } }
    .border-line { height: 1px; background: linear-gradient(90deg, transparent, #00f0ff30, transparent); margin: 30px 0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="logo"><span>QUEUE</span><span>IT</span></div>
    <div class="status"><span class="pulse"></span>servers offline</div>
    <div class="border-line"></div>
    <p class="message">
      The QueueIt servers are currently sleeping.<br>
      Wake them up from the Emergent dashboard,<br>
      or try again in a moment.
    </p>
    <button class="retry" onclick="window.location.href='https://queueit.live/admin'">RETRY CONNECTION</button>
  </div>
</body>
</html>`;

function runInPage(js) {
  if (mainWindow && mainWindow.webContents) {
    mainWindow.webContents.executeJavaScript(js).catch(() => {});
  }
}

function createMenu() {
  const isMac = process.platform === 'darwin';

  const template = [
    ...(isMac ? [{
      label: 'QueueIt',
      submenu: [
        { role: 'about' },
        { type: 'separator' },
        { role: 'hide' },
        { role: 'hideOthers' },
        { role: 'unhide' },
        { type: 'separator' },
        { role: 'quit' }
      ]
    }] : []),

    // File
    {
      label: 'File',
      submenu: [
        {
          label: 'Reload',
          accelerator: 'CmdOrCtrl+R',
          click: () => mainWindow && mainWindow.reload()
        },
        {
          label: 'Force Reload',
          accelerator: 'CmdOrCtrl+Shift+R',
          click: () => mainWindow && mainWindow.webContents.reloadIgnoringCache()
        },
        { type: 'separator' },
        isMac ? { role: 'close' } : { role: 'quit' }
      ]
    },

    // Edit
    {
      label: 'Edit',
      submenu: [
        { role: 'undo' },
        { role: 'redo' },
        { type: 'separator' },
        { role: 'cut' },
        { role: 'copy' },
        { role: 'paste' },
        { role: 'selectAll' }
      ]
    },

    // Spotify
    {
      label: 'Spotify',
      submenu: [
        {
          label: 'Login to Spotify',
          accelerator: 'CmdOrCtrl+L',
          click: () => {
            runInPage(`
              (function() {
                var btn = document.querySelector('[data-testid="spotify-login-button"]');
                if (btn) { btn.click(); return; }
                var redirectUri = encodeURIComponent(window.location.origin + '/admin');
                fetch(window.location.origin + '/api/spotify/auth-url?redirect_uri=' + redirectUri, {
                  headers: { 'Authorization': 'Bearer ' + localStorage.getItem('admin_token') }
                })
                .then(r => r.json())
                .then(d => { if (d.auth_url) window.location.href = d.auth_url; })
                .catch(() => alert('Please login as admin first'));
              })()
            `);
          }
        },
        {
          label: 'Logout from Spotify',
          click: () => {
            runInPage(`
              (function() {
                var token = localStorage.getItem('admin_token');
                if (!token) { alert('Not logged in as admin'); return; }
                if (!confirm('Logout from Spotify? You will need to re-authorize on next login.')) return;
                fetch(window.location.origin + '/api/spotify/logout', {
                  method: 'POST',
                  headers: { 'Authorization': 'Bearer ' + token }
                })
                .then(() => { alert('Logged out from Spotify. Reloading...'); location.reload(); })
                .catch(() => alert('Failed to logout from Spotify'));
              })()
            `);
          }
        },
        {
          label: 'Switch Spotify Account',
          click: () => {
            runInPage(`
              (function() {
                var token = localStorage.getItem('admin_token');
                if (!token) { alert('Please login as admin first'); return; }
                if (!confirm('This will log you out and let you sign in with a different Spotify account.')) return;
                var redirectUri = encodeURIComponent(window.location.origin + '/admin');
                fetch(window.location.origin + '/api/spotify/logout', {
                  method: 'POST',
                  headers: { 'Authorization': 'Bearer ' + token }
                })
                .then(() => fetch(window.location.origin + '/api/spotify/auth-url?redirect_uri=' + redirectUri, {
                  headers: { 'Authorization': 'Bearer ' + token }
                }))
                .then(r => r.json())
                .then(d => { if (d.auth_url) window.location.href = d.auth_url; })
                .catch(() => alert('Failed to switch account'));
              })()
            `);
          }
        },
        { type: 'separator' },
        {
          label: 'Open Spotify Web Player',
          click: () => shell.openExternal('https://open.spotify.com')
        },
        {
          label: 'Open Spotify Account Settings',
          click: () => shell.openExternal('https://www.spotify.com/account/overview/')
        },
        { type: 'separator' },
        {
          label: 'Check Connection Status',
          click: () => {
            runInPage(`
              (function() {
                var token = localStorage.getItem('admin_token');
                if (!token) { alert('Not logged in as admin'); return; }
                fetch(window.location.origin + '/api/spotify/token', {
                  headers: { 'Authorization': 'Bearer ' + token }
                })
                .then(r => r.json())
                .then(d => {
                  if (d.has_token) alert('Spotify is connected and active.');
                  else alert('Spotify is not connected. Use Spotify > Login to connect.');
                })
                .catch(() => alert('Could not check Spotify status'));
              })()
            `);
          }
        }
      ]
    },

    // View
    {
      label: 'View',
      submenu: [
        {
          label: 'Zoom In',
          accelerator: 'CmdOrCtrl+Plus',
          click: () => {
            if (mainWindow) {
              const z = mainWindow.webContents.getZoomLevel();
              mainWindow.webContents.setZoomLevel(z + 0.5);
            }
          }
        },
        {
          label: 'Zoom Out',
          accelerator: 'CmdOrCtrl+-',
          click: () => {
            if (mainWindow) {
              const z = mainWindow.webContents.getZoomLevel();
              mainWindow.webContents.setZoomLevel(z - 0.5);
            }
          }
        },
        {
          label: 'Reset Zoom',
          accelerator: 'CmdOrCtrl+0',
          click: () => mainWindow && mainWindow.webContents.setZoomLevel(0)
        },
        { type: 'separator' },
        { role: 'togglefullscreen' },
        { type: 'separator' },
        {
          label: 'Developer Tools',
          accelerator: 'CmdOrCtrl+Shift+I',
          click: () => mainWindow && mainWindow.webContents.toggleDevTools()
        }
      ]
    },

    // Window
    {
      label: 'Window',
      submenu: [
        { role: 'minimize' },
        { role: 'zoom' },
        { type: 'separator' },
        {
          label: 'Always on Top',
          type: 'checkbox',
          click: (item) => mainWindow && mainWindow.setAlwaysOnTop(item.checked)
        }
      ]
    },

    // Help
    {
      label: 'Help',
      submenu: [
        {
          label: 'Open Admin Portal in Browser',
          click: () => shell.openExternal(ADMIN_URL)
        },
        {
          label: 'Open Customer Portal in Browser',
          click: () => shell.openExternal(CUSTOMER_URL)
        },
        { type: 'separator' },
        {
          label: 'About QueueIt',
          click: () => {
            dialog.showMessageBox(mainWindow, {
              type: 'info',
              title: 'About QueueIt',
              message: 'QueueIt v1.0.0',
              detail: 'The smart music queue system for your venue.\nLet your guests DJ their experience.\n\nConnect your Spotify Premium account,\ngenerate QR codes, and let guests request songs.',
              buttons: ['OK']
            });
          }
        }
      ]
    }
  ];

  Menu.setApplicationMenu(Menu.buildFromTemplate(template));
}

app.whenReady().then(createWindow);
app.on('window-all-closed', () => { if (process.platform !== 'darwin') app.quit(); });
app.on('activate', () => { if (BrowserWindow.getAllWindows().length === 0) createWindow(); });
