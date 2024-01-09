const { DataTypes } = require('sequelize');


module.exports = (sequelize) => {

    sequelize.define('User', {

        id: {
            type: DataTypes.STRING,
            // autoIncrement: true,
            primaryKey: true,
            allowNull: false
        },

        name: {
            type: DataTypes.STRING,
            allowNull: false
        },
        password: {
            type: DataTypes.STRING,
            allowNull: false
        },

        email: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        client_id: {
            type: DataTypes.STRING,
            allowNull: false
        },
        org_id: {
            type: DataTypes.STRING,
            allowNull: false
        },
        approle_id: {
            type: DataTypes.STRING,
            allowNull: false
        },
        warehouse_id: {
            type: DataTypes.STRING,
            allowNull: false
        },
        ad_language: {
            type: DataTypes.STRING,
            allowNull: false
        },
        url: {
            type: DataTypes.STRING,
            allowNull: false
        },
        token: {
            type: DataTypes.ARRAY(DataTypes.STRING),
            allowNull: true,
        },
        documents: {
            type: DataTypes.JSON,
            allowNull: true
        },
        status: {
            type: DataTypes.BOOLEAN,
            allowNull: false
        },

    }, {
        timestamps: false
    })


};


