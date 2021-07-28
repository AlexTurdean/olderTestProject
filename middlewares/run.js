const Model = require('../models');
const { Op } = require("sequelize");
const run = {};

run.create = function(req, res, next) {
    if(req.body.lon == undefined || req.body.lat == undefined) {
        return next('Empty field');
    }
    next();
}

run.update = function(req, res, next) {
    if(req.body.lon == undefined || req.body.lat == undefined ||
        req.params.runId == undefined) {
            return next('Empty field');
    }
    Model.runs.findOne({
        where: {
            id: req.params.runId,
            userId: req.sessionUser.id
        }
    }).then(result => {
        if(result) {
            req.run = result;
            next();
        } else {
            next("Run does not exist or it's not your run");
        }
    }).catch(err => {
        next(err);
    });
}

run.get = function(req, res, next) {
    if(req.params.runId == undefined) {
        return next('Run id is required');
    }
    Model.runs.findOne({
        where: {
            id: req.params.runId
        }
    }).then(result => {
        if(result) {
            if(req.sessionUser.role != 2 && req.sessionUser.id != result.userId) {
                err = new Error('You do not have permission');
                err.status = 403;
                return next(err);
            }
            req.run = result;
            next();
        } else {
            next("Run does not exist");
        }
    }).catch(err => {
        next(err);
    });
}

run.delete = function(req, res, next) {
    if(req.params.runId == undefined) {
        return next('Run id is required');
    }
    if(req.sessionUser.role != 2) {
        err = new Error('You do not have permission');
        err.status = 403;
        return next(err);
    }
    next();
}

module.exports = run;
