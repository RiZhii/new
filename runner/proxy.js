const http = require('http');
const httpProxy = require("http-proxy");

const proxy = httpProxy.createProxyServer({
    target: "http://browser-box:9222",
    ws: true,
    changeOrigin: true
});

const server = http.createServer((req, res) => {
    proxy.web(req, res);
});

server.on("upgrade", (req, socket, head) =>  {
    proxy.ws(req, socket, head);
});

server.listen(9223, "0.0.0.0", () => {
    console.log("Proxy running on 9223");
});