const randomstring = require("randomstring");
const { Op } = require("sequelize");
const bcrypt = require('bcrypt');
const Model = require('../models');
const parseFilterOptions = require('../actions/parseFilterOptions');
const adminKey = "$2b$10$xiTGwQ6Ozk/d9VQMNe/Kn.tirM4YDcs3wOYWzJLO6/sFMfFBfdTje";
const user = {};

user.signup = function (req, res, next) {
    var role = 0;
    if(req.body.adminKey != undefined && bcrypt.compareSync(req.body.adminKey, adminKey)) {
        role = 2;
    }
    Model.users.create({
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        username: req.body.username,
        email: req.body.email,
        password: req.body.password,
        role: role,
        token: randomstring.generate(60)
    }).then(result => {
        res.status(200).end();
    }).catch(err => {
        next(err);
    });
}

user.login = function (req, res, next) {
    var token = randomstring.generate(60);
    Model.users.update({
        token: token
    }, {
        where: {
            username: req.body.username
        }
    }).then(user => {
        res.status(200).send({
            message: "Success", token: token, id: req.sessionUser.id
        });
    }).catch(err => {
        next(err);
    });
}

user.updatePassword = function (req, res, next) {
    req.sessionUser.updatePassword(req.body.currentPassword, req.body.newPassword);
    res.status(200).end();
}

user.updateRole = function (req, res, next) {
    Model.users.update({
        role: req.body.role
    }, {
        where: {
            id: req.params.userId
        }
    }).then(result => {
        res.status(200).end();
    }).catch(err => {
        next(err);
    });
}

user.get = function (req, res, next) {
    var page = req.params.page || 1;
    var limit = 20;
    var offset = (page - 1) * limit;
    var filter = req.params.filter || req.body.filter;
    Model.users.findAll({
        offset: offset,
        limit: limit,
        attributes: ['id', 'firstName', 'lastName', 'username', 'role'],
        where: parseFilterOptions(filter)
    }).then(users => {
        res.status(200).send(users);
    }).catch(err => {
        next(err);
    });
}

user.getDetails = function (req, res, next) {
    var id = req.params.userId || req.sessionUser.id;
    Model.users.findOne({
        attributes: ['id', 'firstName', 'lastName', 'username', 'role', 'email'],
        where: {
            id: id
        }
    }).then(user => {
        res.status(200).send(user);
    }).catch(err => {
        next(err);
    });
}

user.updateDetails = function (req, res, next) {
    var id = req.params.userId || req.sessionUser.id;
    Model.users.update({
        firstName: req.body.firstName,
        lastName: req.body.lastName
    }, {
        where: {
            id: id
        }
    }).then(result => {
        res.status(200).end();
    }).catch(err => {
        next(err);
    });
}

user.delete = function (req, res, next) {
    Model.users.destroy({
        where: {
            id: req.params.userId
        }
    }).then(result => {
        res.status(200).end();
    }).catch(err => {
        next(err);
    });
}

module.exports = user;
