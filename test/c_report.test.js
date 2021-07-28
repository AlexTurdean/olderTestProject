const assert = require('assert');
const app = require('../app');
const request = require('supertest');
var user = {};
var admin = {};
var userReport;
var adminReport;


describe('Report', () => {

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

    describe('POST /generateReport/:userId', () => {
        it('should generate a report', () => {
            return request(app).post('/generateReport/' + user.id)
            .set({token: user.sessionToken})
            .expect(200)
            .then(result => {
                userReport = result.body;
            });
        });
        it('should generate a report', () => {
            return request(app).post('/generateReport/' + admin.id)
            .set({token: admin.sessionToken})
            .expect(200)
            .then(result => {
                adminReport = result.body;
            });
        });
    });

    describe('GET /report/:id', () => {
        it('should return a report', () => {
            return request(app).get('/report/' + userReport.id)
            .set({token: user.sessionToken})
            .expect(200)
            .then(result => {
                assert((result.body.distance - 0.1848) < 1e-4);
            });
        });
        it("should trow an error for accesing another user's report by a regular user", () => {
            return request(app).get('/report/' + adminReport.id)
            .set({token: user.sessionToken})
            .expect(403);
        });
        it("should return another user's report for admin", () => {
            return request(app).get('/report/' + userReport.id)
            .set({token: admin.sessionToken})
            .expect(200);
        });
    });

    describe('GET /reports/:page', () => {
        it("should return only personal records for regular user", () => {
            return request(app).get('/reports/1')
            .set({token: user.sessionToken})
            .expect(200)
            .then(result => {
                assert(result.body.length == 1);
            });
        });
        it("should return all records for admin", () => {
            return request(app).get('/reports/1')
            .set({token: admin.sessionToken})
            .expect(200)
            .then(result => {
                assert(result.body.length == 2);
            });
        });

    });

    describe('DELETE /report/:id', () => {
        it("should trow an error for regular user", () => {
            return request(app).delete('/report/' + adminReport.id)
            .set({token: user.sessionToken})
            .expect(403);
        });
        it("should delete the report for admin", () => {
            return request(app).get('/report/' + userReport.id)
            .set({token: admin.sessionToken})
            .expect(200);
        });
    });
});
