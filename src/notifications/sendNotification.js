

const admin = require('firebase-admin');
const serviceAccount = require('./notificationPush.json'); // Reemplaza con la ubicación de tu archivo de clave privada

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

// const deviceId = 'd9EZiaErTn6TdjVrV4VjK9:APA91bGW3EfCnbI6wATKJlSPHc-YDjDocmVeZTXqRYmfbYAF9Q5WiFUOydAuVMfFMIPRaq0_TqmgvSMwMAUnIh7m1ZJEFs3erCLYQGqy1ENYY6ADum9DXVXm0Bsa_P4yB6nfih9LUYSj'; // Reemplaza con el ID del dispositivo
const deviceId = 'cRQedoZVSDybCjHJG-VNoJ:APA91bGScG0fO_UKjwrhIIUbQHxsTTSunTes8J7e25FYXWoqGgbBdSX9G5Kp7_cX1jqxuJe-zIw7QN4jbS3kEizqsj2XMFJAD4Ic0P_i3FdNKYF4Q9G7jH6PC7g7MPSzOZYMd-RLoVu5';
const data = { comida: 'frito', key2: 'value2', imageUrl: 'https://www.google.com/images/branding/googlelogo/2x/googlelogo_color_92x30dp.png' };


const sendPushNotification = async (numDocument, operationType) => {
  try {
    const message = {
      token: deviceId,
      notification: {
        title: operationType,
        body: `Documento: ${numDocument}`,

      },
      data: {
        comida: numDocument,
      },

    };

    const response = await admin.messaging().send(message);
    console.log('Notificación push enviada con éxito:', response);
  } catch (error) {
    console.error('Error al enviar la notificación push:', error);
  }
};

// Uso de la función

module.exports = sendPushNotification