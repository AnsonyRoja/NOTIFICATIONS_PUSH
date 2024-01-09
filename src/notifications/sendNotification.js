const admin = require('firebase-admin');
const serviceAccount = require('./notificationPush.json'); // Reemplaza con la ubicación de tu archivo de clave privada

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const sendPushNotification = async (numDocument, operationType, tokens) => {
  try {
    for (const token of tokens) {
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
