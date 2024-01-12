const axios = require('axios');
const https = require('https');
const sendPushNotification = require('./sendNotification');
const { User } = require('../DB_connection');
const Sequelize = require('sequelize');
const isEqual = require('lodash/isEqual');


const agent = new https.Agent({
    rejectUnauthorized: false
});


let flag = false;
let docTwo = false;
const axiosInstance = axios.create({ httpsAgent: agent });

const checkAndNotifyDocumentsForUser = async (user) => {
    console.log(user.dataValues.name);
    const MAX_RETRIES = 3;
    const token = user.dataValues.token;
    console.log(user.dataValues.token);
    // console.log(user.dataValues.url);

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

            // console.log("esta es la respuesta",response?.data.WindowTabData.DataSet.DataRow.field.length, user.documents);
            // console.log("esto es la respuesta", response?.data);
            // console.log('esto es notificacion', user.dataValues.notificacion)
            if(response?.data?.WindowTabData?.RowCount === 0){

                flag = false;
                await User.update(
                    { notificacion: false },
                    { where: { id: user.id } }
                );
                docTwo = false;

            }
            
            const dataRow = response?.data.WindowTabData.DataSet.DataRow;
            if(dataRow === undefined) return;
            let array = Array.isArray(dataRow) ? dataRow : [dataRow]; // Convierte en array si no lo es


                console.log("esto es el array",array);
           

            if(response?.data?.WindowTabData?.RowCount === 1){
                docTwo = false ;
                flag = true;
                await User.update(
                    { documents: array },
                    { where: { id: user.id, status: true } }
                );
            }

            if(response?.data?.WindowTabData?.RowCount === 3){
                docTwo = true;
                flag = true;
            }
           
           


            await User.update(
                { documents: response?.data.WindowTabData.DataSet.DataRow },
                { where: { id: user.id, documents:null } }
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


            console.log( "esto es userwithDocuments ", usersWithDocuments?.documents);

          

            // if (array === undefined) return;

            console.log("Estos son los documentosss", user.dataValues.id, array.length, usersWithDocuments?.documents?.length);

            if(array.length === 1  &&  user?.dataValues?.notificacion === false && flag === false){

                await User.update(
                    { notificacion: true },
                    { where: { id: user.id } }
                );
                const documentoUnico = response?.data.WindowTabData.DataSet.DataRow;
                const numDocument = documentoUnico?.field[2].val;
                const operationType = documentoUnico?.field[15].val;

                sendPushNotification(numDocument, operationType, token);

                flag = true;
           


            }


            if (array.length < usersWithDocuments?.documents?.length) {
                await User.update(
                    { documents: array },
                    { where: { id: user.id, status: true } }
                );

       

            }   


            console.log("esto es userwithdocuments ",usersWithDocuments?.documents);
            if (array.length > usersWithDocuments?.documents?.length) {

                console.log(`¡Hubo un cambio en los documentos para ${user.dataValues.name}! La cantidad de documentos ha cambiado.`);

                console.log('Documentos actuales:', array);

                flag = false;

                const nuevoIndice = array.findIndex((currentDoc, index) => {
                    const docExistente = usersWithDocuments?.documents[index];
                    return !docExistente || docExistente.field[0].val !== currentDoc.field[0].val;
                });



                if (nuevoIndice !== -1) {
                    console.log('Documento Nuevo:', array[nuevoIndice].field[2].val);
                    const numDocument = array[nuevoIndice].field[2].val;
                    const operationType = array[nuevoIndice].field[15].val;
                    console.log('Tipo de Operacion:', operationType);
                    sendPushNotification(numDocument, operationType, token);

                    await User.update(
                        { documents: array },
                        { where: { id: user.id, status: true } }
                    );

                
                }
            } else {
                console.log("no hay cambios en los documentos");
            }

        } catch (error) {
            console.error(`Error al obtener documentos para el usuario ${user.dataValues.name}:`, error);            
        };
    }
    
};

const listenToPushNotifications = async () => {
    try {
        const users = await User.findAll({
            attributes: ['id', 'name', 'password', 'client_id', 'org_id', 'approle_id', 'warehouse_id', 'ad_language', 'url', 'token', 'documents', 'status', 'notificacion'],
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
        setTimeout(listenToPushNotifications, 10000);
    }
};

// Inicia la escucha
module.exports = {
    listenToPushNotifications
};


