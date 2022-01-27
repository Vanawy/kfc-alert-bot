const { Sequelize, Op, Model, DataTypes } = require("sequelize");

class Storage {
    constructor() {
        this.sequelize = new Sequelize({
            dialect: 'sqlite',
            storage: '\/..\/kfc-bot.db'
        });
        this.auth();
    }

    async auth() {
        await sequelize.authenticate();
        console.log('Connection has been established successfully.');
    }
}

module.exports = new Storage();