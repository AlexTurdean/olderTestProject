const cors = require('cors');
const express = require('express');
const logger = require('morgan');
const Model = require('./models');
const isDevEnv = (process.env.NODE_ENV != 'test');

const app = express();
app.set('port', 9000);
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(require('./routes'));
app.use(function routeNotFound (req, res, next) {
    res.status(404).send("Page not found!")
});

if(isDevEnv)
    app.use(logger('dev'));

app.use(function errorHandler (err, req, res, next) {
    if(isDevEnv)
        console.log(err);

    if( (typeof err) === 'string' ) {
        res.status(400).send(err);
        return;
    }

    if (err.redirect !== undefined) {
        if(err.redirect.to === undefined || err.redirect.message === undefined) {
            console.log("Redirects require a message and a to link");
            res.status(500).send("Internal error");
        } else {
            res.status(310).send({
                redirect: err.redirect,
                message: err.redirect.message
            });
        }
        return;
    }

    res.status(err.status).send(err.message);
});

Model.sequelize.sync({force: !isDevEnv}).then(function() {
    app.listen(app.get('port'), function() {
        console.log(`Running on port ${app.get('port')}`);
        app.emit('serverStarted');
    });
});

module.exports = app;
