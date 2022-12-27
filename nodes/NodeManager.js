const fs = require("fs");

const configRawData = fs.readFileSync('config.json');
const config = JSON.parse(configRawData);

const NibiruNode = require('./nibiru/NibiruNode')
const GitopiaNode = require("./gitopia/GitopiaNode");
const Okp4Node = require("./okp4/Okp4Node");

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
    const okp4Node = new Okp4Node(
        config.security.STAKEME_MONIKER,
        config.security.STAKEME_WALLET,
        config.security.STAKEME_PASSWORD,
        'okp4d'
    )
    function getNode(nameProject) {
        const projects = {
            'nibiru': nibiruNode,
            'gitopia': gitopiaNode,
            'okp4': okp4Node
        }
        return projects[nameProject];
    }
    return {
        getNode
    }
}


module.exports = NodeManager
