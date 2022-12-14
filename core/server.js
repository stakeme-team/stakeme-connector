const http = require('http');
const express = require('express');
const bodyParser = require('body-parser');
const { mainRouter } = require('./routers');
const cron = require("node-cron");
const shell = require("shelljs");
const fs = require("fs");

const configRawData = JSON.parse(fs.readFileSync('config.json'));

cron.schedule('*/1 * * * *', async () => {
    console.log('[Core] Fetch updates');
    if (shell.exec('git pull origin master', {silent: true}).stdout.trim() !== 'Already up to date.') {
        console.log('New version! Updating..');
        const nameFilesInLastCommit = shell.exec(
            'git diff-tree --no-commit-id --name-only -r $(git rev-parse HEAD)',
            {silent: true}
        ).stdout.trim().split('\n');
        const filterNameFilesWithoutScript = nameFilesInLastCommit.filter(x => {
            return !x.startsWith('scripts/');
        });
        if (filterNameFilesWithoutScript.length === 0) {
            console.log('Found only scripts. Without reload connector.');
            return;
        }
        shell.exec('npm install', {silent: true});
        process.exit(0);
    }
});

try {
    const PORT = configRawData.listenCorePort || 25566;
    const app = express();
    app.use(bodyParser.urlencoded({ extended: true }));
    app.use(bodyParser.json());
    app.use(`/`, mainRouter);
    const server = http.createServer(app);
    server.listen(PORT, () => {
        console.log(`[Core] Running: 0.0.0.0:${PORT}`);
    });
} catch (e) {
    console.log('SERVER ERROR: ', e.message);
}

