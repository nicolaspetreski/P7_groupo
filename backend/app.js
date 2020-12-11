const express = require('express');
const helmet = require("helmet");
const bodyParser = require('body-parser');
const Sequelize = require('sequelize');

const app = express();
const path = require('path');

//Importation routes
const postRoutes = require('./routes/post');
const userRoutes = require('./routes/user');


app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    next();
});

app.use(helmet());

app.use(bodyParser.json());

app.use('/api/user', userRoutes);
app.use('/api/post', postRoutes);


module.exports = app;