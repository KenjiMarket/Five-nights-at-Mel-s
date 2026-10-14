const { app, BrowserWindow } = require('electron');
app.whenReady().then(() => {
  const w = new BrowserWindow({ width: 1280, height: 720, autoHideMenuBar: true, backgroundColor: '#000', webPreferences: { autoplayPolicy: 'no-user-gesture-required' } });
  w.loadFile('index.html');
});
app.on('window-all-closed', () => app.quit());
