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
            const node = NodeManager.getNode(project);
            switch (type) {
                case 'info':
                    try {
                        const startDate = new Date();
                        const info = node.info();
                        const endDate = new Date();
                        console.log('🟠 Debug timeout info:', endDate - startDate);
                        const message = JSON.stringify(info);
                        return res.status(200).json({
                            type: 'info',
                            message: message
                        });
                    } catch (e) {
                        console.log('Error', e.message)
                        return res.status(400).json({
                            type: 'info',
                            message: e.message
                        });
                    }
                case 'restart':
                    try {
                        const message = node.restart();
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
                        message: node.logs()
                    });
                case 'stop':
                    try {
                        const message = node.stop();
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
                    const messageDelete = node.delete();
                    return res.status(200).json({
                        type: 'delete',
                        message: messageDelete
                    });
                case 'exist':
                    return res.status(200).json({
                        type: 'exist',
                        message: node.exist()
                    });
                case 'wallet':
                    const argument = query.argument;
                    switch (argument) {
                        case 'exist':
                            return res.status(200).json({
                                type: 'wallet',
                                argument: argument,
                                message: node.existWallet()
                            });
                        case 'create':
                            return res.status(200).json({
                                type: 'wallet',
                                argument: argument,
                                message: node.createWallet()
                            });
                        case 'existValidator':
                            return res.status(200).json({
                                type: 'wallet',
                                argument: argument,
                                message: node.existValidator()
                            });
                        case 'createValidator':
                            const moniker = query.moniker;
                            const details = query.details;
                            const identify = query.identify;
                            return res.status(200).json({
                                type: 'wallet',
                                argument: argument,
                                message: node.createValidator(moniker, details, identify)
                            });
                        case 'sendTokens':
                            const toWallet = query.toWallet;
                            return res.status(200).json({
                                type: 'wallet',
                                argument: argument,
                                message: node.sendTokens(toWallet, query.amount)
                            });
                        case 'delegateTokens':
                            const toValoper = query.toValoper;
                            return res.status(200).json({
                                type: 'wallet',
                                argument: argument,
                                message: node.delegateTokens(toValoper, query.amount)
                            });
                        case 'faucet':
                            return res.status(200).json({
                                type: 'wallet',
                                argument: argument,
                                message: node.faucet()
                            });
                    }
                    break;
                default:
                    return res.status(400).json({
                        message: "Please set type"
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