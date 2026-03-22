const { app, BrowserWindow, Menu, shell, dialog } = require('electron');
const path = require('path');

const ADMIN_URL = 'https://queue-it-preview.preview.emergentagent.com/admin';
const CUSTOMER_URL = 'https://queue-it-preview.preview.emergentagent.com/';

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

  // Let Spotify OAuth happen INSIDE the Electron window.
  // Do NOT open it externally — the redirect_uri points back to our app URL,
  // so the ?code= will land back in this window and be handled by React.

  mainWindow.on('closed', () => { mainWindow = null; });
}

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
                fetch(window.location.origin + '/api/spotify/auth-url', {
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
                fetch(window.location.origin + '/api/spotify/logout', {
                  method: 'POST',
                  headers: { 'Authorization': 'Bearer ' + token }
                })
                .then(() => fetch(window.location.origin + '/api/spotify/auth-url', {
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
