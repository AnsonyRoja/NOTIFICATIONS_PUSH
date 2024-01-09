
const { createUser } = require('../controllers/UserControllers');
// const {createToken} = require('../controllers/TokenControllers');
const router = require('express').Router();


router.post('/user', createUser);
// router.post('/token', createToken);



module.exports = router;