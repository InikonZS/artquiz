// import config from './config'
import { resolve, normalize, join } from 'path'
import { 
    createServer, 
    RequestListener,
} from 'http'
import { readFile } from 'fs' 
import './socket-service'

const webAppBasePath = '../web_app';

const handleWebApp: RequestListener = (req, res) => {
    const resolvedBase = resolve(__dirname ,webAppBasePath);
    const safeSuffix = normalize(req.url || '')
        .replace(/^(\.\.[\/\\])+/, '');
    const fileLocation = join(resolvedBase, safeSuffix);
    
    readFile(fileLocation, function(err, data) {
        if (err) {
            res.writeHead(404, 'Not Found');
            res.write('404: File Not Found!');
            return res.end();
        }
        
        res.statusCode = 200;

        res.write(data);
        return res.end();
    });

};

const httpServer = createServer(handleWebApp)

httpServer.listen("5000", () => {
    console.info('Listen on 5000 port')
})

