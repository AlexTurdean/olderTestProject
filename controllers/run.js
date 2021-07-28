const Model = require('../models');
const { Op } = require("sequelize");
const afar = require('afar');
const NodeGeocoder = require('node-geocoder');
const weather = require('openweather-apis');
const parseFilterOptions = require('../actions/parseFilterOptions');
const run = {};

const geocode = NodeGeocoder({
  provider: 'google',
  apiKey: 'AIzaSyBJUtmuabZaMZ3KCrrtTt4Gof1MIWnpGGo',
});
weather.setAPPID('b8735c2d9c98ec30d8c3ec6e0fc51872');
weather.setLang('en');

function calculateDuration(run) {
    return (new Date(run.startedAt).getTime() -
        new Date(run.finishedAt).getTime())/1000/60; //Duration in minutes;
}

run.create = async function(req, res, next) {
    var newRun = {
        distance: 0,
        userId: req.sessionUser.id
    }
    var lat = req.body.lat;
    var lon = req.body.lon;
    var location = await geocode.reverse({ lat: lat, lon: lon });
    newRun.location = location[0].formattedAddress;
    weather.setCoordinate(lat, lon);
    weather.getAllWeather(function(err, response){
        if(err){
            console.log(err);
        } else {
            newRun.weatherDescription = response.weather[0].main;
            newRun.temperature = response.main.temp;
            newRun.humidity = response.main.humidity;
        }
        Model.runs.create(newRun).then(result => {
            Model.runPoints.create({
                lon: lon,
                lat: lat,
                runId: result.id
            });
            result= result.get({plain:true});
            result.duration = calculateDuration(result);
            res.status(200).send(result);
        }).catch(err => {
            next(err);
        });
    });
}

run.update = function(req, res, next) {
    Model.runPoints.findOne({
        where: {
            runId: req.params.runId
        },
        order: [ [ 'createdAt', 'DESC' ]]
    }).then(result => {
        Model.runPoints.create({
            lon: req.body.lon,
            lat: req.body.lat,
            runId: req.run.id
        });
        let distance = afar(result.lat, result.lon, req.body.lat, req.body.lon);
        req.run.updateDistance(distance);
        var response = req.run.get({plain:true});
        response.duration = calculateDuration(response);
        res.status(200).send(response);
    }).catch(err =>{
        next(err);
    });
}

run.get = function(req, res, next) {
    Model.runPoints.findAll({
        where: {
            runId: req.run.id
        },
        order: [ [ 'createdAt', 'DESC']]
    }).then(points => {
        var response = req.run.get({plain:true});
        response.duration = calculateDuration(response);
        response.points = points;
        res.status(200).send(response);
    }).catch(err =>{
        next(err);
    });
}

run.delete = function(req, res, next) {
    Model.runs.destroy({
        where: {
            id: req.params.runId
        }
    }).then(result => {
        res.status(200).end();
    }).catch(err =>{
        next(err);
    });
}

run.getAll = function(req, res, next) {
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
    Model.runs.findAll({
        limit: limit,
        offset: offset,
        where: whereClause
    }).then(result => {
        res.status(200).send(result);
    }).catch(err =>{
        next(err);
    });
}

module.exports = run;
