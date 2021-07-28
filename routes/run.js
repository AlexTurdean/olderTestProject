const Middleware = require('../middlewares');
const Controller = require('../controllers');
const express = require('express');
const router = express.Router();

router.post('/run', Middleware.user.logged, Middleware.run.create, Controller.run.create);
router.put('/run/:runId', Middleware.user.logged, Middleware.run.update, Controller.run.update);
router.get('/run/:runId', Middleware.user.logged, Middleware.run.get, Controller.run.get);
router.delete('/run/:runId', Middleware.user.logged, Middleware.run.delete, Controller.run.delete);
router.get('/runs/:page', Middleware.user.logged, Controller.run.getAll);

module.exports = router;
