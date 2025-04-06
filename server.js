// server.js
const { createServer } = require("https");
const { parse } = require("url");
const next = require("next");
const fs = require("fs");

const dev = process.env.NODE_ENV !== "production";
const app = next({ dev });
const handle = app.getRequestHandler();

const httpsOptions = {
	key: fs.readFileSync("/etc/letsencrypt/live/dl.lug.center/privkey.pem"),
	cert: fs.readFileSync("/etc/letsencrypt/live/dl.lug.center/fullchain.pem"),
};

app.prepare().then(() => {
	createServer(httpsOptions, (req, res) => {
		const parsedUrl = parse(req.url || "", true);
		handle(req, res, parsedUrl);
	}).listen(443, (err) => {
		if (err) throw err;
		console.log("> Ready on https://dl.lug.center");
	});
});
