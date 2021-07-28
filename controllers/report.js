const Model = require('../models');
const { Op } = require("sequelize");
const generateReport =require('../actions/generateReport');
const parseFilterOptions = require('../actions/parseFilterOptions');
const report = {};

report.getAll = function(req, res, next) {
    var page = req.params.page || 1;
    var limit = 20;
    var offset = (page - 1) * limit;
    var whereClause;
    var filter = req.params.filter || req.body.filter;
    if(req.sessionUser.role == 2) {
        whereClause = parseFilterOptions(filter);
    } else {
        whereClause = {userId: req.sessionUser.id};
    }
    Model.reports.findAll({
        offset: offset,
        limit: limit,
        where: whereClause
    }).then(result => {
        res.status(200).send(result);
    }).catch(err => {
        next(err);
    });
}

report.get = function(req, res, next) {
    res.status(200).send(req.report);
}

report.delete = function(req, res, next) {
    Model.reports.destroy({
        where: {
            id: req.params.reportId
        }
    }).then(result => {
        res.status(200).end();
    }).catch(err => {
        next(err);
    });
}

report.generate = function(req, res, next) {
    generateReport(req.params.userId).then(result => {
        res.status(200).send(result);
    }).catch(err => {
        next(err);
    });

}

module.exports = report;
