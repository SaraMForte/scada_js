import { app, BrowserWindow } from 'electron'
import './client-web-server.js'

function openMainWindow() {
    const mainWindow = new BrowserWindow({
        width: 800,
        height: 600
    })
    mainWindow.loadURL(`http://localhost:3020/index/index.html`)

    mainWindow.webContents.setWindowOpenHandler(({ frameName, features }) => {
        const options = parseFeatures(features)

        return {
            action: 'allow',
            overrideBrowserWindowOptions: {
                width: Number(options['width']),
                height: Number(options['height']),
                autoHideMenuBar: options['menubar'] === 'no',
                title: frameName,
                webPreferences: {
                    nodeIntegration: false
                }
            }
        }
    })
}

app.whenReady()
    .then(() => {
        openMainWindow()
    })
    .catch(error => {
        console.error(error)
    })

//------------------- Funtions ---------------------------
type Features = { [key: string]: string }

function parseFeatures(featuresText: string): Features {
    const featuresEntries: string[][] = featuresText.split(',').map(text => text.split('='))
    return Object.fromEntries(featuresEntries)
}
