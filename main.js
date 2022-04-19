// Modules to control application life and create native browser window
const {app, BrowserWindow, Menu, ipcMain, globalShortcut} = require('electron')
const path = require('path')
const Config = require('electron-config');
const config = new Config();

const gotTheLock = app.requestSingleInstanceLock()
let mainWindow = null

ipcMain.on('ready', (e, msg) => {
    config.set('SOFTWARE', msg)

    let running = config.get('RUNNING')
    if (running === undefined || !running.hasOwnProperty('statistic')) {
        let date = new Date()

        running = {
            statistic: {
                create_time: date.toLocaleString(),
                launch_time: 1
            },
            config: {
                server: '',
                uuid: 'slog tool',
                save_path: __dirname + '/logs/'
            }
        }
    }

    running.statistic.launch_time++
    config.set('RUNNING', running)

    e.sender.send('conf', running)
})

ipcMain.on('save_config', (e, msg) => {
    let running = config.get('RUNNING')

    running.config = msg

    config.set('RUNNING', running)
})

function createWindow() {
    // Create the browser window.
    mainWindow = new BrowserWindow({
        resizable: false,
        width: 506,
        height: 800,
        icon: path.join(__dirname, './img/icon.ico'),
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            nodeIntegration: true
        }
    })

    // and load the index.html of the app.
    mainWindow.loadFile('index.html')

    // Open the DevTools.
    // mainWindow.webContents.openDevTools()
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
    // Hide Menu
    Menu.setApplicationMenu(null)

    createWindow()

    app.on('activate', function () {
        // On macOS it's common to re-create a window in the app when the
        // dock icon is clicked and there are no other windows open.
        if (BrowserWindow.getAllWindows().length === 0) createWindow()
    })
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', function () {
    if (process.platform !== 'darwin') app.quit()
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.

// Single Mode
if (gotTheLock) {
    app.on('second-instance', () => {
        if (mainWindow) {
            mainWindow.show()
        }
    })
} else {
    app.exit()
}

// 注册快捷键
app.on('ready', async () => {
    globalShortcut.register('Alt+B', function () {
        mainWindow.webContents.openDevTools();
    })
})
