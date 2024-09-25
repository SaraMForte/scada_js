import Express from "express";
import path from "path";
const clientWebServer = Express();
const port = 3020;
const webPath = path.resolve('web');
clientWebServer.use(Express.static(webPath));
const distWebPath = path.resolve('dist', 'web');
clientWebServer.use(Express.static(distWebPath, {
    setHeaders: (res, filePath) => {
        if (filePath.endsWith('.mjs')) {
            res.setHeader('Content-Type', 'application/javascript');
        }
    }
}));
clientWebServer.listen(port, () => {
    console.log(`Local client web server running in http://localhost:${port}`);
});
export default clientWebServer;
