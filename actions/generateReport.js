const Model = require('../models');
const { Op } = require('sequelize');
const moment = require('moment');
const schedule = require('node-schedule');

async function generateReport(userId) {
    let runs = await Model.runs.findAll({
        where:{
            userId: userId,
            startedAt: {
                [Op.gte]: moment().subtract(7, 'days').toDate()
            }
        }
    });
    let time = 0;
    let distance = 0;
    runs.forEach(run => {
        time +=(new Date(run.updatedAt).getTime() -
            new Date(run.createdAt).getTime()) / 60; // time in hours
        distance += run.distance;
    });
    return Model.reports.create({
        userId: userId,
        averageSpeed: distance/time || 0,
        distance: distance
    });
}

schedule.scheduleJob('0 0 0 * * 7', function(){
    Model.users.findAll().then(users => {
        users.forEach(user => {
            generateReport(user.id);;
        });
    });
});

module.exports = generateReport;
