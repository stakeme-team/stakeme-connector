const fs = require("fs");

const configRawData = fs.readFileSync('config.json');
const config = JSON.parse(configRawData);

const NibiruNode = require('./nibiru/NibiruNode')
const GitopiaNode = require("./gitopia/GitopiaNode");

function NodeManager() {
    const nibiruNode = new NibiruNode(
        config.security.STAKEME_MONIKER,
        config.security.STAKEME_WALLET,
        config.security.STAKEME_PASSWORD,
        'nibid'
    );
    const gitopiaNode = new GitopiaNode(
        config.security.STAKEME_MONIKER,
        config.security.STAKEME_WALLET,
        config.security.STAKEME_PASSWORD,
        'gitopiad'
    )
    function getNode(nameProject) {
        const projects = {
            'nibiru': nibiruNode,
            'gitopia': gitopiaNode
        }
        return projects[nameProject];
    }
    return {
        getNode
    }
}


module.exports = NodeManager
