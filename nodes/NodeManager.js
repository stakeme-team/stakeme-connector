const fs = require("fs");

const CelestiaNode = require('./celestia/CelestiaNode')
const NibiruNode = require('./nibiru/NibiruNode')
const GitopiaNode = require("./gitopia/GitopiaNode");
const configRawData = fs.readFileSync('config.json');
const config = JSON.parse(configRawData);

function getNode(nameProject) {
    const projects = {
        'celestia': new CelestiaNode(
            config.security.STAKEME_MONIKER,
            config.security.STAKEME_WALLET,
            config.security.STAKEME_PASSWORD
        ),
        'nibiru': new NibiruNode(
            config.security.STAKEME_MONIKER,
            config.security.STAKEME_WALLET,
            config.security.STAKEME_PASSWORD
        ),
        'gitopia': new GitopiaNode(
            config.security.STAKEME_MONIKER,
            config.security.STAKEME_WALLET,
            config.security.STAKEME_PASSWORD
        )
    }
    return projects[nameProject];
}

module.exports = { getNode }
