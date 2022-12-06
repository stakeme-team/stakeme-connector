const express = require('express');
const api = require('./conrollers-api');
const NodeManager = require('../nodes/NodeManager')

const mainRouter = new express.Router();
mainRouter.post('/cosmos', api.cosmosEndpoint(NodeManager()));
mainRouter.post('/cosmos/update', api.cosmosUpdate(NodeManager()));
mainRouter.post('/cosmos/installer', api.cosmosInstaller(NodeManager()));

exports.mainRouter = mainRouter;