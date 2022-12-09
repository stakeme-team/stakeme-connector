const express = require('express');
const api = require('./conrollers-api');
const NodeManager = require('../nodes/NodeManager')

const mainRouter = new express.Router();
const nodeManager = NodeManager();
mainRouter.post('/cosmos', api.cosmosEndpoint(nodeManager));
mainRouter.post('/cosmos/update', api.cosmosUpdate(nodeManager));
mainRouter.post('/cosmos/installer', api.cosmosInstaller(nodeManager));

exports.mainRouter = mainRouter;