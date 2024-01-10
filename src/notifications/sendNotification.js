const admin = require('firebase-admin');
const serviceAccount = require('./notificationPush.json'); // Reemplaza con la ubicación de tu archivo de clave privada

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const sendPushNotification = async (numDocument, operationType, tokens) => {
  try {
    // Filtra los tokens válidos para evitar el envío de notificaciones a tokens no registrados
    const validTokens = await Promise.all(tokens.map(async (token) => {
      try {
        await admin.messaging().send({
          token: token,
          data: { test: 'test' },
        });
        return token;
      } catch (error) {
        console.error(`Token inválido: ${token}, error: ${error.message}`);
        return null;
      }
    }));

    // Filtra los tokens válidos antes de enviar notificaciones
    const uniqueValidTokens = [...new Set(validTokens.filter(token => token !== null))];

    // Comprueba si hay al menos un token válido antes de intentar enviar notificaciones
    if (uniqueValidTokens.length > 0) {
      // Envía notificaciones solo a los tokens válidos
      for (const token of uniqueValidTokens) {
        const message = {
          token: token,
          notification: {
            title: operationType,
            body: `Documento: ${numDocument}`,
          },
          data: {
            numDoc: numDocument,
          },
        };

        console.log('Notificación push enviada con éxito para el token:', token);
        await admin.messaging().send(message);
      }
    } else {
      console.log('No hay tokens válidos para enviar notificaciones.');
    }

  } catch (error) {
    console.error('Error al enviar notificación push:', error);
    // Maneja el error según tus necesidades.
  }
};

// Uso de la función
module.exports = sendPushNotification;
