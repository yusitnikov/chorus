const http = require("http");
const https = require("https");
const fs = require("fs");
const next = require("next");
const url = require("url");
const dotenv = require("dotenv");

dotenv.config();

const port = Number(process.argv[2] || 80);

const app = next({ dev: false });
const handle = app.getRequestHandler();

console.log("Initialized, waiting for connections...");

const processMainRequest = async(request, response) => {
    console.log(`--> ${request.method} ${request.url}`);

    const parsedUrl = url.parse(request.url, true);
    handle(request, response, parsedUrl);
};

app.prepare().then(() => {
    if (process.env.SSL_KEY_PATH) {
        const httpsOptions = {
            key: fs.readFileSync(process.env.SSL_KEY_PATH),
            cert: fs.readFileSync(process.env.SSL_CERT_PATH),
            ca: fs.readFileSync(process.env.SSL_CA_PATH),
        };
        https.createServer(httpsOptions, processMainRequest).listen(443);

        // Redirect all HTTP to HTTPS
        http.createServer((request, response) => {
            console.log(`REDIRECT ${request.url} to HTTPS`);
            response.writeHead(302, {
                Location: `https://${request.headers.host}${request.url}`
            });
            response.end();
        }).listen(port);
    } else {
        http.createServer(processMainRequest).listen(port);
    }
});
