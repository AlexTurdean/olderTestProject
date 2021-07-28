const Middleware = require('../middlewares');
const Controller = require('../controllers');
const express = require('express');
const router = express.Router();

router.post('/signup', Middleware.user.signup, Controller.user.signup);
router.post('/login', Middleware.user.login, Controller.user.login);
router.get('/users/:page', Middleware.user.logged, Middleware.user.get, Controller.user.get);
router.get('/user/:userId', Middleware.user.logged, Middleware.user.getDetails, Controller.user.getDetails);
router.put('/user/:userId', Middleware.user.logged, Middleware.user.updateDetails, Controller.user.updateDetails);
router.delete('/user/:userId', Middleware.user.logged, Middleware.user.delete, Controller.user.delete);
router.put('/user/:userId/role', Middleware.user.logged, Middleware.user.updateRole, Controller.user.updateRole);
router.post('/changePassword', Middleware.user.logged, Middleware.user.updatePassword, Controller.user.updatePassword);

module.exports = router;
