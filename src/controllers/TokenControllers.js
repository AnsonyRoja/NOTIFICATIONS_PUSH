const axios = require('axios');
const { Token } = require('../DB_connection');



const createToken = async (req, res) => {
    // Obtener el ID del usuario desde el request (ajusta según tu implementación) 

    const {userId, tokens} = req.body;

    try {

        const existeToken = await Token.findOne({
            where: {
                token: tokens
            }
        });
        if (existeToken) {

            res.status(200).json(existeToken);
            
        }else{

        
        // Crear un nuevo token asociado al usuario
        const token = await Token.create({
            token: tokens, // ajusta según tu implementación
            userId: userId
        });

        res.json(token);
    }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error creating token' });
    }
};




module.exports = {
    createToken
}