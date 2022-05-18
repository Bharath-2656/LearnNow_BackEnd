const express = require("express");
const routes = require('./routes');
var router = express.Router();
const app = express();

app.use(router);

module.exports = app;