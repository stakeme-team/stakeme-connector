const http = require('http');
const express = require('express');
const bodyParser = require('body-parser');
const { mainRouter } = require('./routers');
const config = require('../config.json')


function startCore(port) {
    const PORT = port|| 25566;
    const app = express();
    app.use(bodyParser.urlencoded({ extended: true }));
    app.use(`/`, mainRouter);
    const server = http.createServer(app);
    server.listen(PORT, () => {
        console.log(`[Core] Running: 0.0.0.0:${PORT}`);
    });
}

module.exports = { startCore }
