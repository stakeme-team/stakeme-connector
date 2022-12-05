require('dotenv').config();
const { getNode } = require('../../nodes/NodeManager')

const config = require('../../config.json')
const fs = require("fs");
const shell = require("shelljs");

module.exports = async (req, res) => {
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
    const script = query.script;

    const result = await shell.exec(`source $HOME/.bash_profile && bash stakeme-connector/scripts/${script}`, {shell: '/bin/bash', silent: true});
    console.log(result.stdout + result.stderr);
    return res.status(200).json({
        message: `Code execute: ${result.code}`,
        status: result.code
    });
};
