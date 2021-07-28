const Model = require('../models');
const { Op } = require("sequelize");
const user = {};

user.signup = function (req, res, next) {
    if(req.body.firstName == undefined || req.body.lastName == undefined ||
        req.body.email == undefined || req.body.username == undefined ||
        req.body.confirmPassword == undefined || req.body.password == undefined) {
            return next("Empty field");
    }
    if(req.body.password.length < 6) {
        return next('Password is too short');
    }
    if(req.body.password !== req.body.confirmPassword) {
        return next('Passwords do not match');
    }

    Model.users.findOne({
        where: {
            [Op.or]: [{email: req.body.email}, {username: req.body.username}]
        }
    }).then(result => {
        if(result) {
            return next("Username or email in use");
        } else {
            return next();
        }
    }).catch(err => {
        next(err);
    });
}

user.login = function (req, res, next) {
    if(req.body.username == undefined || req.body.password == undefined) {
        return next("Empty field");
    }
    Model.users.findOne({
        where: {
            username: req.body.username
        }
    }).then(user => {
        if(user && user.validPassword(req.body.password)) {
            req.sessionUser = user;
            return next();
        } else {
            return next('Invalid username or password');
        }
    }).catch(err => {
        return next(err);
    });
}

user.logged = function (req, res, next) {
    var err = new Error('You are not logged');
    err.status = 401;

    if(req.headers.token == undefined) {
        return next(err);
    }
    var token = req.headers.token;
    Model.users.findOne({
        where: {
            token: token
        }
    }).then(user => {
        if (user) {
            req.sessionUser = user;
            return next();
        }
        else {
            return next(err);
        }
    }).catch(err => {
        return next(err);
    });
}


user.updatePassword = function (req, res, next) {
    if(req.body.currentPassword == undefined ||
        req.body.newPassword == undefined) {
            return next("Empty field");
    }
    if(!req.sessionUser.validPassword(req.body.currentPassword)) {
        return next("Old password is incorrect");
    }
    if(req.body.newPassword.length < 6) {
        return next('Password is too short');
    }
    next();
}

user.get = function (req, res, next) {
    if(req.sessionUser.role > 0) {
        next();
    } else {
        var err = new Error('You do not have permission');
        err.status = 403;
        next(err);
    }
}

user.getDetails = function (req, res, next) {
    if(req.sessionUser.id == req.params.userId || req.sessionUser.role > 0) {
        next();
    } else {
        var err = new Error('You do not have permission');
        err.status = 403;
        next(err);
    }
}

user.updateDetails = function (req, res, next) {
    if(req.body.firstName == undefined || req.body.lastName == undefined) {
        return next("Empty field");
    }
    if(req.sessionUser.id == req.params.userId || req.sessionUser.role > 0) {
        next();
    } else {
        var err = new Error('You do not have permission');
        err.status = 403;
        next(err);
    }
}

user.updateRole = function (req, res, next) {
    if(req.body.role == undefined) {
        return next("New role is required");
    }
    if(req.params.userId == undefined) {
        return next("User id is missing");
    }
    if(req.sessionUser.role == 2) {
        next();
    } else {
        var err = new Error('You do not have permission');
        err.status = 403;
        next(err);
    }
}

user.delete = function (req, res, next) {
    if(req.sessionUser.role > 0) {
        next();
    } else {
        var err = new Error('You do not have permission');
        err.status = 403;
        next(err);
    }
}

module.exports = user;
