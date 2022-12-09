require('dotenv').config();

const config = require('../../../config.json')
const fs = require("fs");

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
        const type = query.type;
        const project = query.project;
        try {
            switch (type) {
                case 'info':
                    const message = JSON.stringify(NodeManager.getNode(project).info());
                    return res.status(200).json({
                        type: 'info',
                        message: message
                    });
                case 'install':
                    try {
                        const message = NodeManager.getNode(project).install();
                        return res.status(200).json({
                            type: 'install',
                            message: message
                        });
                    } catch (e) {
                        return res.status(400).json({
                            type: 'install',
                            message: 'Error install node'
                        });
                    }
                case 'restart':
                    try {
                        const message = NodeManager.getNode(project).restart();
                        return res.status(200).json({
                            type: 'restart',
                            message: message
                        });
                    } catch (e) {
                        return res.status(400).json({
                            type: 'restart',
                            message: 'Error restart node'
                        });
                    }
                case 'logs':
                    return res.status(200).json({
                        type: 'logs',
                        message: NodeManager.getNode(project).logs()
                    });
                case 'stop':
                    try {
                        const message = NodeManager.getNode(project).stop();
                        return res.status(200).json({
                            type: 'stop',
                            message: message
                        });
                    } catch (e) {
                        return res.status(400).json({
                            type: 'stop',
                            message: 'Error stop node'
                        });
                    }
                case 'delete':
                    const messageDelete = NodeManager.getNode(project).delete();
                    return res.status(200).json({
                        type: 'delete',
                        message: messageDelete
                    });
                case 'exist':
                    return res.status(200).json({
                        type: 'exist',
                        message: NodeManager.getNode(project).exist()
                    });
                case 'wallet':
                    const argument = query.argument;
                    switch (argument) {
                        case 'exist':
                            return res.status(200).json({
                                type: 'wallet',
                                argument: argument,
                                message: NodeManager.getNode(project).existWallet()
                            });
                        case 'create':
                            return res.status(200).json({
                                type: 'wallet',
                                argument: argument,
                                message: NodeManager.getNode(project).createWallet()
                            });
                        case 'existValidator':
                            return res.status(200).json({
                                type: 'wallet',
                                argument: argument,
                                message: NodeManager.getNode(project).existValidator()
                            });
                        case 'createValidator':
                            const moniker = query.moniker;
                            const details = query.details;
                            const identify = query.identify;
                            return res.status(200).json({
                                type: 'wallet',
                                argument: argument,
                                message: NodeManager.getNode(project).createValidator(moniker, details, identify)
                            });
                        case 'sendTokens':
                            const toWallet = query.toWallet;
                            return res.status(200).json({
                                type: 'wallet',
                                argument: argument,
                                message: NodeManager.getNode(project).sendTokens(toWallet, query.amount)
                            });
                        case 'delegateTokens':
                            const toValoper = query.toValoper;
                            return res.status(200).json({
                                type: 'wallet',
                                argument: argument,
                                message: NodeManager.getNode(project).delegateTokens(toValoper, query.amount)
                            });
                        case 'faucet':
                            return res.status(200).json({
                                type: 'wallet',
                                argument: argument,
                                message: NodeManager.getNode(project).faucet()
                            });
                    }
                    break;
                case 'setUser':
                    const telegramUserId = query.telegramUserId
                    config['telegramUserId'] = telegramUserId;
                    const data = JSON.stringify(config, null, 2);
                    fs.writeFileSync('config.json', data);
                    return res.status(200).json({
                        type: 'setUser',
                        message: 'success'
                    });
            }
        } catch (e) {
            console.log(e);
            return res.status(400).json({
                message: "stakeme-connector error. Check logs"
            });
        }

    };
}