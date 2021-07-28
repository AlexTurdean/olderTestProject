const Middleware = require('../middlewares');
const Controller = require('../controllers');
const express = require('express');
const router = express.Router();

router.get('/reports/:page', Middleware.user.logged, Controller.report.getAll);
router.get('/report/:reportId', Middleware.user.logged, Middleware.report.get, Controller.report.get);
router.delete('/report/:reportId', Middleware.user.logged, Middleware.report.delete, Controller.report.delete);
router.post('/generateReport/:userId', Middleware.user.logged, Controller.report.generate);

module.exports = router;
