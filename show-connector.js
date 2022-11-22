const shell = require('shelljs');
const fs = require("fs");

require('dotenv').config();

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
        console.log("Use: cd $HOME/stakeme-connector && npm run start")
        return;
    }
    const ipAddress = shell.exec('curl -s eth0.me', {silent: true}).stdout.trim();
    console.log(`🟢 Your unique data (copy) -> ${ipAddress}:${config.listenCorePort}@${config.PROTECTED_PASSWORD_ACCESS}`);
})();



