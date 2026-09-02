"use strict";

const http = require("node:http");
const fs = require("node:fs");
const path = require("node:path");

const port = Number(process.env.PORT) || 3000;
const files = {
  "/": ["index.html", "text/html; charset=utf-8"],
  "/index.html": ["index.html", "text/html; charset=utf-8"],
  "/styles.css": ["styles.css", "text/css; charset=utf-8"],
  "/script.js": ["script.js", "text/javascript; charset=utf-8"],
  "/favicon.svg": ["favicon.svg", "image/svg+xml"],
};

http.createServer((request, response) => {
  const pathname = new URL(request.url, "http://localhost").pathname;
  const asset = files[pathname];
  if (!asset || !["GET", "HEAD"].includes(request.method)) {
    response.writeHead(404, { "Content-Type": "text/plain" });
    response.end("Not found");
    return;
  }
  fs.readFile(path.join(__dirname, asset[0]), (error, data) => {
    if (error) {
      response.writeHead(500);
      response.end("Unable to load the page.");
      return;
    }
    response.writeHead(200, { "Content-Type": asset[1], "Cache-Control": "no-cache" });
    response.end(request.method === "HEAD" ? undefined : data);
  });
}).listen(port, "127.0.0.1", () => {
  console.log(`Your bouquet is ready at http://localhost:${port}`);
});
