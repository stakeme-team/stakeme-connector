require('dotenv').config();
const { getNode } = require('../../nodes/NodeManager')

const config = require('../../config.json')

module.exports = async (req, res) => {
    const headers = req.headers;
    const xApiKey = headers['x-api-key'];
    const PROTECTED_PASSWORD_ACCESS = config.PROTECTED_PASSWORD_ACCESS;
    if (!(xApiKey && xApiKey === PROTECTED_PASSWORD_ACCESS)) {
        return res.status(400).json({
            message: "Don't access"
        });
    }

    const query = req.query;
    const type = query.type;
    const project = query.project;

    switch (type) {
        case 'info':
            const message = JSON.stringify(getNode(project).info());
            return res.status(200).json({
                type: 'info',
                message: message
            });
        case 'install':
            try {
                const message = await getNode(project).install();
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
                const message = await getNode(project).restart();
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
                message: (await getNode(project)).logs()
            });
        case 'stop':
            try {
                const message = await getNode(project).stop();
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
            const messageDelete = await getNode(project).delete();
            return res.status(200).json({
                type: 'delete',
                message: messageDelete
            });
        case 'exist':
            return res.status(200).json({
                type: 'exist',
                message: await getNode(project).exist()
            });
        case 'wallet':
            const argument = query.argument;
            switch (argument) {
                case 'exist':
                    return res.status(200).json({
                        type: 'wallet',
                        argument: argument,
                        message: getNode(project).existWallet()
                    });
                case 'create':
                    return res.status(200).json({
                        type: 'wallet',
                        argument: argument,
                        message: getNode(project).createWallet()
                    });
                case 'existValidator':
                    return res.status(200).json({
                        type: 'wallet',
                        argument: argument,
                        message: getNode(project).existValidator()
                    });
                case 'createValidator':
                    const moniker = query.moniker;
                    const details = query.details;
                    const identify = query.identify;
                    return res.status(200).json({
                        type: 'wallet',
                        argument: argument,
                        message: getNode(project).createValidator(moniker, details, identify)
                    });
            }
    }
};
