
const { createUser, logoutUser } = require('../controllers/UserControllers');
// const {createToken} = require('../controllers/TokenControllers');
const router = require('express').Router();


router.post('/user', createUser);
// router.post('/token', createToken);
router.post('/logoutUser', logoutUser);



module.exports = router;