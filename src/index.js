
const express = require('express');
const { conn } = require('./DB_connection');
const server = express();
const PORT = 3001;
const morgan = require('morgan');
const router = require('./routes/index');
const { listenToPushNotifications } = require('./notifications/notificationPush');
server.use(express.json());

server.use(morgan('dev'));


server.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Credentials', 'true');
    res.header(
        'Access-Control-Allow-Headers',
        'Origin, X-Requested-With, Content-Type, Accept'
    );
    res.header(
        'Access-Control-Allow-Methods',
        'GET, POST, OPTIONS, PUT, DELETE'
    );
    next();
});



server.use('/doc-approved', router);
// conn.sync({ force: true }).then(() => {
conn.sync({ force: true }).then(() => {


    server.listen(PORT,() => {

        console.log(`Server raised in port: ${PORT}`);

    });
    listenToPushNotifications();



    // createUser();

});