const admin = require('firebase-admin');
const serviceAccount = require('./notificationPush.json'); // Reemplaza con la ubicación de tu archivo de clave privada

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const sendPushNotification = async (numDocument, operationType, tokens) => {
  try {
    // Filtra los tokens válidos para evitar el envío de notificaciones a tokens no registrados
    const validTokens = [];

    for (const token of tokens) {
      try {
        // Intenta enviar un mensaje de prueba para verificar la validez del token
        await admin.messaging().send({
          token: token,
          data: { test: 'test' },
        });

        // Si no se lanzó ninguna excepción, el token es válido
        validTokens.push(token);
      } catch (error) {
        // Si se lanza una excepción, el token no es válido y se registra el error
        console.error(`Token inválido: ${token}, error: ${error.message}`);
      }
    }

    // Envía notificaciones solo a los tokens válidos
    for (const token of validTokens) {
      const message = {
        token: token,
        notification: {
          title: operationType,
          body: `Documento: ${numDocument}`,
        },
        data: {
          comida: numDocument,
        },
      };

      await admin.messaging().send(message);
      console.log('Notificación push enviada con éxito para el token:', token);
    }
  } catch (error) {
    console.error('Error al enviar notificación push:', error);

    // Aquí puedes decidir cómo manejar el error, ya sea registrándolo, ignorándolo o tomando alguna otra acción necesaria.
    // Puedes agregar lógica adicional según tus requerimientos.
  }
};

// Uso de la función
module.exports = sendPushNotification;
