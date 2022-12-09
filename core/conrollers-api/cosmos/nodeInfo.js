require('dotenv').config();

const config = require('../../../config.json')

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
        try {
            const query = req.body;
            const project = query.project;
            const message = JSON.stringify(NodeManager.getNode(project).info());
            return res.status(200).json({
                message: message
            });
        } catch (e) {
            console.log('🔴 Error', e.message);
            return res.status(400).json({
                message: 'Error in stakeme-connector. Check logs'
            });
        }
    };
}