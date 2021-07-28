const assert = require('assert');
const app = require('../app');
const request = require('supertest');
var user = {};
var admin = {};
var runId = {};
var adminRunId = {};

describe('Run', () => {

    it('should login with user account', () => {
        return request(app).post('/login')
        .send({
            username: 'test',
            password: 'password'
        })
        .expect(200)
        .then(result => {
            user.sessionToken = result.body.token;
            user.id = result.body.id;
        });
    });

    it('should login with admin account', () => {
        return request(app).post('/login')
        .send({
            username: 'admin',
            password: 'adminpass'
        })
        .expect(200)
        .then(result => {
            admin.sessionToken = result.body.token;
            admin.id = result.body.id;
        });
    });

    describe('POST /run', () => {
        it('should create a new run for regular user', () => {
            return request(app).post('/run')
            .set({token: user.sessionToken})
            .send({
                lat: 46.775911,
                lon: 23.5819619
            })
            .expect(200)
            .then(result => {
                runId = result.body.id;
                assert(result.body.location == 'Strada Călărașilor 1, Cluj-Napoca 400000, Romania');
                assert(result.body.weatherDescription != null);
                assert(result.body.humidity != null);
                assert(result.body.temperature != null);
            });
        });
        it('should create a new run for admin', () => {
            return request(app).post('/run')
            .set({token: admin.sessionToken})
            .send({
                lat: 20,
                lon: 20
            })
            .expect(200)
            .then(result => {
                adminRunId = result.body.id;
            });
        });
    });

    describe('PUT /run/:id', () => {
        it('should contiune the run with a new point', () => {
            return request(app).put('/run/' + runId)
            .set({token: user.sessionToken})
            .send({
                lat: 46.775173,
                lon: 23.581868
            })
            .expect(200);
        });
        it('should contiune the run with a new point', () => {
            return request(app).put('/run/' + runId)
            .set({token: user.sessionToken})
            .send({
                lat: 46.774919,
                lon: 23.582074
            })
            .expect(200);
        });
        it('should contiune the run with a new point', () => {
            return request(app).put('/run/' + runId)
            .set({token: user.sessionToken})
            .send({
                lat: 46.774506,
                lon: 23.582271
            })
            .expect(200);
        });
        it('should contiune the run with a new point', () => {
            return request(app).put('/run/' + runId)
            .set({token: user.sessionToken})
            .send({
                lat: 46.774391,
                lon: 23.582504
            })
            .expect(200);
        });
        it("should contiune the admin's run with a new point", () => {
            return request(app).put('/run/' + adminRunId)
            .set({token: admin.sessionToken})
            .send({
                lat: 20,
                lon: 22
            })
            .expect(200);
        });
    });

    describe('GET /run/:id', () => {
        it('should return the run cotaining 5 points', () => {
            return request(app).get('/run/' + runId)
            .set({token: user.sessionToken})
            .expect(200)
            .then(result => {
                assert(result.body.points.length == 5);
                assert((result.body.distance - 0.1848) < 1e-4);
            });
        });
    });

    describe('GET /runs/:page', () => {
        it('should return the first page of run list for regular user', () => {
            return request(app).get('/runs/1')
            .set({token: user.sessionToken})
            .expect(200)
            .then(result => {
                assert(result.body.length == 1);
            });
        });
        it('should return the first page of run list for admin', () => {
            return request(app).get('/runs/1')
            .set({token: admin.sessionToken})
            .expect(200)
            .then(result => {
                assert(result.body.length == 2);
            });
        });
        it('should return the second page of run list for admin', () => {
            return request(app).get('/runs/2')
            .set({token: admin.sessionToken})
            .expect(200)
            .then(result => {
                assert(result.body.length == 0);
            });
        });

        describe('FILTER FUNCTIONALITY', () => {
            it('FILTER#1', () => {
                return request(app).get('/runs/1')
                .set({token: admin.sessionToken})
                .send({
                    filter:'distance gt 208'
                })
                .expect(200)
                .then(result => {
                    assert(result.body.length == 1);
                });
            });
            it('FILTER#2', () => {
                return request(app).get('/runs/1')
                .set({token: admin.sessionToken})
                .send({
                    filter:'(distance gt 208) OR (userId eq ' + user.id + ')'
                })
                .expect(200)
                .then(result => {
                    assert(result.body.length == 2);
                });
            });
            it('FILTER#3', () => {
                return request(app).get('/runs/1')
                .set({token: admin.sessionToken})
                .send({
                    filter:'(distance gt 208) AND ((userId eq ' + admin.id + ') OR (distance gt 300))'
                })
                .expect(200)
                .then(result => {
                    assert(result.body.length == 1);
                });
            });
            it('FILTER#4', () => {
                return request(app).get('/runs/1')
                .set({token: admin.sessionToken})
                .send({
                    filter:'(distance gt 10) OR (distance lt 10)'
                })
                .expect(200)
                .then(result => {
                    assert(result.body.length == 2);
                });
            });
            it('FILTER#5', () => {
                return request(app).get('/runs/1')
                .set({token: admin.sessionToken})
                .send({
                    filter:'startedAt lt ' + new Date().toISOString()
                })
                .expect(200)
                .then(result => {
                    assert(result.body.length == 2);
                });
            });
            it('FILTER#6', () => {
                return request(app).get('/runs/1')
                .set({token: admin.sessionToken})
                .send({
                    filter:'(distance gt 0) AND (startedAt gt ' + new Date().toISOString() + ')'
                })
                .expect(200)
                .then(result => {
                    assert(result.body.length == 0);
                });
            });
            it('FILTER#7', () => {
                return request(app).get('/runs/1')
                .set({token: admin.sessionToken})
                .send({
                    filter:'(distance ne 20) OR (startedAt ne ' + new Date().toISOString() + ')'
                })
                .expect(200)
                .then(result => {
                    assert(result.body.length == 2);
                });
            });
        });
    });

    describe('DELETE /run/:id', async () => {
        var deleteRunId;
        before(done => {
            request(app).post('/run')
            .set({token: user.sessionToken})
            .send({
                lat: 40.21,
                lon: 25.32
            })
            .expect(200)
            .then(result => {
                deleteRunId = result.body.id;
                done();
            });
        });
        it('should trow an error for regular user', () => {
            return request(app).delete('/run/' + deleteRunId)
            .set({token: user.sessionToken})
            .expect(403);
        });
        it('should delete the run for admin', () => {
            return request(app).delete('/run/' + deleteRunId)
            .set({token: admin.sessionToken})
            .expect(200);
        });
    });

});
