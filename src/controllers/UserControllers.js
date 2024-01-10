const axios = require('axios');
const admin = require('firebase-admin');  // Asegúrate de importar Firebase Admin SDK
const { User } = require('../DB_connection');

const createUser = async (req, res) => {
    const { id, name, password, email, client_id, org_id, approle_id, warehouse_id, ad_language, url, token, documents, status } = req.body;

    console.log(id, name, password, email, client_id, org_id, approle_id, warehouse_id, ad_language, url, token, documents, status);

    try {
        const existingUser = await User.findOne({
            where: {
                id: id
            }
        });

        // Si el usuario ya existe, responder con un error
        if (existingUser) {
            const existingTokens = existingUser.token || [];


            if (!existingTokens.includes(token)) {

            const updatedTokens = [...existingTokens, token];

            // Filtra los tokens válidos antes de actualizar la base de datos
            const validTokens = await Promise.all(updatedTokens.map(async (existingToken) => {
                try {


                    // Intenta enviar un mensaje de prueba para verificar la validez del token
                    await admin.messaging().send({
                        token: existingToken,
                        data: { test: 'test' },
                    });

                    // Si no se lanza ninguna excepción, el token es válido
                    return existingToken;
                } catch (error) {
                    // Si se lanza una excepción, el token no es válido y no se incluirá en la lista de tokens válidos
                    console.error(`Token inválido: ${existingToken}, error: ${error.message}`);
                    return null;
                }
            }));

            // Actualiza la base de datos con los tokens válidos
            await existingUser.update({ token: validTokens.filter(token => token !== null) });

            return res.status(200).json({ message: 'Email already exists', user: existingUser });
            }else{
                return res.status(200).json({ message: 'token already exists'});
            }
        }

        // Si el correo electrónico no existe, crea un nuevo usuario
        const user = await User.create({
            id,
            name,
            password,
            email,
            client_id,
            org_id,
            approle_id,
            warehouse_id,
            ad_language,
            url,
            token: [token],
            documents,
            status
        });

        res.json(user);
    } catch (error) {
        res.status(500).json({ message: 'Error creating user ' + error });
    }
}




const logoutUser = async (req, res) => {
    const { userId, token } = req.body;

    try {
        const existingUser = await User.findOne({
            where: {
                id: userId
            }
        });

        console.log(existingUser);

        console.log("user id", userId);
        console.log("token", token);

        if (existingUser) {
            const existingTokens = existingUser.token || [];
            
            // Filtra el token a eliminar
            const updatedTokens = existingTokens.filter(existingToken => existingToken !== token);

            // Actualiza la base de datos con los tokens restantes
            await existingUser.update({ token: updatedTokens });

            return res.status(200).json({ message: 'Logout successful' });
        } else {
            return res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        console.error('Error logging out user:', error);
        res.status(500).json({ message: 'Error logging out user' });
    }
};








module.exports = {
    createUser,
    logoutUser
}
