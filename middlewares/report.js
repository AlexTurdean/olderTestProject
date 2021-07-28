const Model = require('../models');
const { Op } = require("sequelize");
const report = {};

report.get = function(req, res, next) {
    if(req.params.reportId == undefined) {
        return next('Report id is required');
    }
    Model.reports.findOne({
        where: {
            id: req.params.reportId
        }
    }).then(result => {
        if(result) {
            if(req.sessionUser.role != 2 && req.sessionUser.id != result.userId) {
                err = new Error('You do not have permission');
                err.status = 403;
                return next(err);
            }
            req.report = result;
            next();
        } else {
            next("Report does not exist");
        }
    }).catch(err => {
        next(err);
    });
}

report.delete = function(req, res, next) {
    if(req.sessionUser.role != 2) {
        err = new Error('You do not have permission');
        err.status = 403;
        return next(err);
    }
    if(req.params.reportId == undefined) {
        return next('Report id is required');
    }
    next();
}

module.exports = report;
