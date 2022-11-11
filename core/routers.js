const express = require('express');
const api = require('./conrollers-api');

const mainRouter = new express.Router();
mainRouter.get('/cosmos', api.cosmosEndpoint);

exports.mainRouter = mainRouter;