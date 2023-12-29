const { DataTypes} = require('sequelize');



module.exports = (sequelize) => {

    sequelize.define('Token', {

        id:{
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
            allowNull: false
        },

        token: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
            primaryKey: true
        },
        userId: {
            type: DataTypes.STRING,
            references: {
                model: 'Users', // Nombre de la tabla de usuarios
                key: 'id'       // Nombre de la columna de ID en la tabla de usuarios
            }
        }

    }, {
        timestamps: false
    });




};