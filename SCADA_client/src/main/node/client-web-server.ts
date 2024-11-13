import Express from "express"
import path from "path"

const clientWebServer = Express()
const port = 3020

const webPath = path.resolve('src/main/webapp')
clientWebServer.use(Express.static(webPath, {
    setHeaders: (res, filePath) => {
        if (filePath.endsWith('.js') || filePath.endsWith('.mjs')) {
            res.setHeader('Content-Type', 'application/javascript');
        }
    }
}))

clientWebServer.listen(port, () => {
    console.log(`Local client web server running in http://localhost:${port}`)
})

export default clientWebServer

