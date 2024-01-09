const axios = require('axios');
const https = require('https');
const sendPushNotification = require('./sendNotification');
const { User } = require('../DB_connection');
const Sequelize = require('sequelize');

const agent = new https.Agent({
    rejectUnauthorized: false
});


const axiosInstance = axios.create({ httpsAgent: agent });

const checkAndNotifyDocumentsForUser = async (user) => {
    console.log(user.dataValues.name);
    const MAX_RETRIES = 3;
    const token = user.dataValues.token;
    console.log(user.dataValues.token);
    console.log(user.dataValues.url);

    for (let retry = 0; retry < MAX_RETRIES; retry++) {
        try {
            const response = await axiosInstance.post(`${user.dataValues.url}ADInterface/services/rest/model_adservice/query_data`, {


                "ModelCRUDRequest": {
                    "ModelCRUD": {
                        "serviceType": "getDocuments",
                        "DataRow": {
                            "field": [
                                { "@column": "Supervisor_ID", "val": user.dataValues.id }
                            ]
                        }
                    },
                    "ADLoginRequest": {
                        "user": user.dataValues.name,
                        "pass": user.dataValues.password,
                        "lang": user.dataValues.ad_language,
                        "ClientID": user.dataValues.client_id,
                        "RoleID": user.dataValues.approle_id,
                        "OrgID": user.dataValues.org_id,
                        "WarehouseID": user.dataValues.warehouse_id,
                        "stage": 9
                    }
                }


            });


            await User.update(
                { documents: response?.data.WindowTabData.DataSet.DataRow },
                { where: { id: user.id, documents: null } }
            );




            const usersWithDocuments = await User.findOne({
                attributes: ['id', 'documents'],
                where: {
                    id: user.id,
                    documents: {
                        [Sequelize.Op.not]: null
                    }
                }
            });

            const currentDocuments = response?.data.WindowTabData.DataSet.DataRow;
            if (currentDocuments === undefined) return;
            if (usersWithDocuments === null) return;
            if (usersWithDocuments.documents === null) return;


            if (currentDocuments.length > usersWithDocuments.documents.length) {
                console.log(`¡Hubo un cambio en los documentos para ${user.dataValues.name}! La cantidad de documentos ha cambiado.`);

                const nuevoIndice = currentDocuments.findIndex((currentDoc, index) => {
                    const docExistente = usersWithDocuments?.documents[index];
                    return !docExistente || docExistente.field[0].val !== currentDoc.field[0].val;
                });

                if (nuevoIndice !== -1) {
                    console.log('Documento Nuevo:', currentDocuments[nuevoIndice].field[2].val);
                    const numDocument = currentDocuments[nuevoIndice].field[2].val;
                    const operationType = currentDocuments[nuevoIndice].field[15].val;
                    console.log('Tipo de Operacion:', operationType);
                    sendPushNotification(numDocument, operationType, token);

                    await User.update(
                        { documents: currentDocuments },
                        { where: { id: user.id, status: true } }
                    );
                }
            }

            break; // Sale del bucle de reintento si la solicitud es exitosa
        } catch (error) {
            console.error(`Error en la solicitud para ${user.dataValues.name} (Intento ${retry + 1}):`, error.message);
        }
    }
};

const listenToPushNotifications = async () => {
    try {
        const users = await User.findAll({
            attributes: ['id', 'name', 'password', 'client_id', 'org_id', 'approle_id', 'warehouse_id', 'ad_language', 'url', 'token', 'documents', 'status'],
            where: {
                status: true
            }
        });

        if (users.length === 0) {
            // console.log('No hay usuarios activos.');
            return;
        }

        await User.update(
            { status: true },
            { where: { status: false } }
        );

        for (const user of users) {
            await checkAndNotifyDocumentsForUser(user);
        }
    } catch (error) {
        console.error('Error al obtener documentos:', error);
    } finally {
        // Llamada recursiva después de 5 segundos
        setTimeout(listenToPushNotifications, 15000);
    }
};

// Inicia la escucha
module.exports = {
    listenToPushNotifications
};


