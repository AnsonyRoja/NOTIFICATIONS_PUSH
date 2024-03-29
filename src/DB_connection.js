require('dotenv').config();
const { Sequelize } = require('sequelize');
const TokenModel = require('./models/Token');
const UserModel = require('./models/User');
const { DB_USER, DB_PASSWORD, DB_HOST, DB_PORT, DB_NAME } = process.env;

// EJERCICIO 03
// A la instancia de Sequelize le falta la URL de conexión. ¡Agrégala!
// Recuerda pasarle la información de tu archivo '.env'.

// URL ----> postgres://DB_USER:DB_PASSWORD@DB_HOST/rickandmorty

const sequelize = new Sequelize(
   `postgres://${DB_USER}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/${DB_NAME}`,
   {

      logging: false, native: false

   }

);


// TokenModel(sequelize);
UserModel(sequelize);

const { Token, User, Document } = sequelize.models;
// User.hasMany(Token, { foreignKey: 'userId' });
// Token.belongsTo(User, { foreignKey: 'userId' });

// EJERCICIO 05
// Debajo de este comentario puedes ejecutar la función de los modelos.

// FavoriteModel(sequelize);
// UserModel(sequelize);
//

//

// Ejercicio 06
// ¡Relaciona tus modelos aquí abajo!
// const { User, Favorite } = sequelize.models;
// User.belongsToMany(Favorite, { through: "user_favorite" }, { timestamps: false });
// Favorite.belongsToMany(User, { through: "user_favorite" }, { timestamps: false });


module.exports = {
   Token,
   User,
   Document,
   conn: sequelize,
};