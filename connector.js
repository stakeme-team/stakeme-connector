const fs = require('fs');
const shell = require('shelljs');
const readline = require('readline-async');

require('dotenv').config();
console.log('🙋 Welcome to STAKEME Connector');

async function init(config) {
    console.log('Write your moniker:')
    const moniker = await readline();
    console.log('Write your name wallet:')
    const wallet = await readline();
    console.log ('Write your chosen password:')
    const password = await readline();
    const randomString = Array(40)
        .fill("0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz#$%^&*()")
        .map(function(x) { return x[Math.floor(Math.random() * x.length)] }).join('');

    config.security.STAKEME_MONIKER = moniker;
    config.security.STAKEME_WALLET = wallet;
    config.security.STAKEME_PASSWORD = password;
    config.PROTECTED_PASSWORD_ACCESS = randomString;

    const rawData = JSON.stringify(config, null, '\t');
    fs.writeFileSync('config.json', rawData);
}

function existInit(config) {
    const STAKEME_MONIKER = config.security.STAKEME_MONIKER || false;
    const STAKEME_WALLET = config.security.STAKEME_WALLET || false;
    const STAKEME_PASSWORD = config.security.STAKEME_PASSWORD || false;
    const PROTECTED_PASSWORD_ACCESS = config.PROTECTED_PASSWORD_ACCESS || false;
    return STAKEME_MONIKER && STAKEME_WALLET && STAKEME_PASSWORD && PROTECTED_PASSWORD_ACCESS
}

(async function() {
    const configRawData = fs.readFileSync('config.json');
    const config = JSON.parse(configRawData);
    if (!existInit(config)) {
        console.log("Since this is the first time you've run the script, you'll need to go through the installation.");
        await init(config);
    }
    const ipAddress = shell.exec('curl -s eth0.me', {silent: true}).stdout.trim();
    console.log(`🟢 Your unique data (copy) -> ${ipAddress}:${config.listenCorePort}@${config.PROTECTED_PASSWORD_ACCESS}`);
    shell.exec('NODE= forever start -m 100000 --minUptime 1000 core/server.js', {silent: true});
})();



