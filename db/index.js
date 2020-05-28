'use strict';

const Sequelize = require('sequelize');

// creating and configuring a new instance of Sequelize
const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: 'fsjstd-restapi.db',
    logging: false
});

//declaring object to be used for storing sequelize models
const models = {};

// importing models
models.User = require('./models/user')(sequelize);
models.Course = require('./models/course')(sequelize);

// associating models
models.User.associate(models);
models.Course.associate(models);

// exporting database to be used in the app
const db = {
    Sequelize,
    sequelize,
    models
};

module.exports = db;