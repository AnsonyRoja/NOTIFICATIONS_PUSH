
const axios = require('axios');
const { User } = require('../DB_connection');


const createUser = async (req, res) => {

    const { id, name, password, email, client_id, org_id, approle_id, warehouse_id, ad_language, url, token, documents, status } = req.body;

    console.log(id, name, password, email, client_id, org_id, approle_id, warehouse_id, ad_language, url, documents, status);
    try {
        const existingUser = await User.findOne({
            where: {
                email: email
            }
        });

        // Si el usuario ya existe, responder con un error
        if (existingUser) {
            // Verifica si el nuevo token es diferente del token existente
            if (existingUser.token !== token) {
                existingUser = await existingUser.update({ token: token }); // Actualiza el token
            }

            return res.status(200).json({ message: 'Email already exists', user: existingUser });
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
            token,
            documents,
            status
        });

        res.json(user);
    } catch (error) {

        res.status(500).json({ message: 'Error creating user' });

    }


}


module.exports = {
    createUser
}