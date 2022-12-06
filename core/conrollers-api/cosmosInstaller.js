require('dotenv').config();

const config = require('../../config.json')
const fs = require("fs");
const shell = require("shelljs");

module.exports = (NodeManager) => {
    return async (req, res) => {
        const headers = req.headers;
        const xApiKey = headers['x-api-key'];
        const PROTECTED_PASSWORD_ACCESS = config.PROTECTED_PASSWORD_ACCESS;
        if (!(xApiKey && xApiKey === PROTECTED_PASSWORD_ACCESS)) {
            return res.status(400).json({
                message: "Don't access"
            });
        }
        const query = req.body;
        const project = query.project;

        const node = NodeManager.getNode(project);
        const data = {
            'statusInstaller': node.getStatusInstall(),
            'logs': node
        }
        return res.status(200).json({
            message: JSON.stringify(data, null, 2),
            status: 0
        });
    };
}