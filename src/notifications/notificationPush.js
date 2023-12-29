const axios = require('axios');
const https = require('https');
const sendPushNotification = require('./sendNotification');
const { User } = require('../DB_connection');

// Mantén un objeto para almacenar la versión anterior de los documentos
let previousDocuments = [];

const agent = new https.Agent({  
    rejectUnauthorized: false
  });


const listenToPushNotifications = async () => {
    // Configura un temporizador que se ejecute cada X segundos

    const axiosInstance = axios.create({ httpsAgent: agent });
    let response;
  



    setInterval(async () => {
        try {
            const user = await User.findAll({

                attributes: ['id','name','password','client_id', 'org_id', 'approle_id', 'warehouse_id', 'ad_language', 'status'],
                where: {

                    status: true

                }
            });

            await User.update(
                { status: false },
                { where: { status: true } }
            );
         console.log(user)
const MAX_RETRIES = 3;

            user?.forEach(async(user) => {

                console.log(user.dataValues.name);
                for (let retry = 0; retry < MAX_RETRIES; retry++) {

                await new Promise(resolve => setTimeout(resolve, 15000));
                        try {
                            
                        
             response = await axiosInstance.post('https://165.227.197.236:1201/ADInterface/services/rest/model_adservice/query_data', {
                "ModelCRUDRequest": {
                    "ModelCRUD": {
                        "serviceType": "getDocuments",
                        "DataRow": {
                            "field": [
                                {"@column": "Supervisor_ID", "val": user.dataValues.id}
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
        } catch (error) {
            console.error(`Error en la solicitud (Intento ${retry + 1}):`, error.message);
            
        }
      }
        });

        // Con el userId extraigo el token y lo envio en el metodo sendNotification
            const currentDocuments = response?.data.WindowTabData.DataSet.DataRow;
            if(currentDocuments === undefined)return;

            if (currentDocuments.length > previousDocuments.length) {
               
                console.log('¡Hubo un cambio en los documentos! La cantidad de documentos ha aumentado.');
                // Realizar acciones adicionales aquí en respuesta al cambio en la cantidad de documentos
                    
                const nuevoIndice = currentDocuments.findIndex((currentDoc, index) => {
                    const docExistente = previousDocuments[index];
                    return !docExistente || docExistente.field[0].val !== currentDoc.field[0].val;
                });
            
                if (nuevoIndice !== -1) {
                    console.log('Documento Nuevo:', currentDocuments[nuevoIndice].field[2].val);
                    let numDocument = currentDocuments[nuevoIndice].field[2].val;
                    let operationType = currentDocuments[nuevoIndice].field[15].val;
                    // Realiza acciones adicionales con el nuevo documento si es necesario
                    console.log('Tipo de Operacion:', operationType);
                    sendPushNotification(numDocument,operationType);
                }
                // console.log('Documentos anteriores cargados desde', previousDocumentsFromFile);

            }

            // Actualiza la versión anterior con los documentos actuales
            previousDocuments = currentDocuments;


        } catch (error) {
            console.error('Error al obtener documentos:', error);
        }
    }, 5000); // Ejecutar cada 5 segundos (ajusta según tus necesidades)
};




// Inicia la escucha

module.exports = {

    listenToPushNotifications

};