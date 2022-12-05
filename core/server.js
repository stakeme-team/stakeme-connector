const http = require('http');
const express = require('express');
const bodyParser = require('body-parser');
const { mainRouter } = require('./routers');
const cron = require("node-cron");
const shell = require("shelljs");
const axios = require("axios");
const fs = require("fs");

const configRawData = fs.readFileSync('config.json');

cron.schedule('*/1 * * * *', async () => {
    console.log('[Core] Fetch updates');
    if (shell.exec('git pull', {silent: true}).stdout.trim() !== 'Already up to date.') {
        console.log('New version! Updating..');
        const nameFilesInLastCommit = shell.exec(
            'git diff-tree --no-commit-id --name-only -r $(git rev-parse HEAD)',
            {silent: true}
        ).stdout.trim().split('\n');
        console.log(nameFilesInLastCommit);
        const filterNameFilesWithoutScript = nameFilesInLastCommit.filter(x => {
            return !x.startsWith('scripts/');
        });
        console.log(filterNameFilesWithoutScript);
        if (filterNameFilesWithoutScript.length === 0) {
            console.log('Found only scripts. Without reload connector.');
            return;
        }
        console.log('New version! Updating..');
        shell.exec('npm install', {silent: true});
        //♻️ The connector has been updated. Now it has been updated to the latest version.
        const ipAddress = shell.exec('curl -s eth0.me', {silent: true}).stdout.trim();
        const connectorRaw = `${ipAddress}:${configRawData.listenCorePort}@${configRawData.PROTECTED_PASSWORD_ACCESS}`;
        const response = await axios.post(`http://stakeme.pro/telegrambot`,  {
                params: {
                    "type": "update",
                    "data": "success",
                    "connectorRaw": connectorRaw
                },
            }
        );

        return response.data;
    }
});

function startCore(port) {
    const PORT = port|| 25566;
    const app = express();
    app.use(bodyParser.urlencoded({ extended: true }));
    app.use(bodyParser.json());
    app.use(`/`, mainRouter);
    const server = http.createServer(app);
    server.listen(PORT, () => {
        console.log(`[Core] Running: 0.0.0.0:${PORT}`);
    });
}

startCore();
