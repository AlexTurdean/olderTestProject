const assert = require('assert');
const app = require('../app');
const request = require('supertest');
var user = {};
var manager = {};
var admin = {};

before(done => {
  app.on('serverStarted', () => {
    done();
  });
});

describe('Regular user', () => {

    describe('POST /signup', () => {
        it('should trwon an error for short password', () => {
            return request(app).post('/signup')
            .send({
                username: 'test',
                password: 'pass',
                confirmPassword: 'pass',
                email: 'test@email.com',
                firstName: 'Alex',
                lastName: 'Turdean'
            })
            .expect(400)
            .then(result => {
                assert(result.error.text == 'Password is too short');
            });
        });
        it('should trow an error for mismatched passwords', () => {
            return request(app).post('/signup')
            .send({
                username: 'test',
                password: 'password',
                confirmPassword: 'password2',
                email: 'test@email.com',
                firstName: 'Alex',
                lastName: 'Turdean'
            })
            .expect(400)
            .then(result => {
                assert(result.error.text == 'Passwords do not match');
            });
        });
        it('should create an account', () => {
            return request(app).post('/signup')
            .send({
                username: 'test',
                password: 'password',
                confirmPassword: 'password',
                email: 'test@email.com',
                firstName: 'Alex',
                lastName: 'Turdean'
            })
            .expect(200);
        });
        it('should trow an error for duplicate usernames/emails', () => {
            return request(app).post('/signup')
            .send({
                username: 'test',
                password: 'password',
                confirmPassword: 'password',
                email: 'test@email.com',
                firstName: 'Alex',
                lastName: 'Turdean'
            })
            .expect(400)
            .then(result => {
                assert(result.error.text == 'Username or email in use');
            });
        });
    });

    describe('POST /login', () => {
        it('should trow an error for bad username', () => {
            return request(app).post('/login')
            .send({
                username: 'testt',
                password: 'password'
            })
            .expect(400)
            .then(result => {
                assert(result.error.text == 'Invalid username or password');
            });
        });
        it('should trow an error for bad password', () => {
            return request(app).post('/login')
            .send({
                username: 'test',
                password: 'passwordd'
            })
            .expect(400)
            .then(result => {
                assert(result.error.text == 'Invalid username or password');
            });
        });
        it('should return a session token', () => {
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
    });


    describe('GET /user/:id', () => {
        it('should trow an error for missing session token', () => {
            return request(app).get('/user/' + user.id)
            .expect(401)
            .then(result => {
                assert(result.error.text == 'You are not logged');
            });
        });
        it("should trow an error for accesing another user's details", () => {
            return request(app).get('/users/2')
            .set({token: user.sessionToken})
            .expect(403)
            .then(result => {
                assert(result.error.text == 'You do not have permission');
            });
        });
        it("should return user's own details", () => {
            return request(app).get('/user/' + user.id)
            .set({token: user.sessionToken})
            .expect(200)
            .then(result => {
                assert(result.body.firstName == 'Alex');
                assert(result.body.lastName == 'Turdean');
            });
        });
    });

    describe('POST /changePassword', () => {
        it("should change password", () => {
            return request(app).post('/changePassword')
            .set({token: user.sessionToken})
            .send({
                currentPassword: 'password',
                newPassword: 'password2'
            })
            .expect(200);
        });
    });

    describe('DELETE /user/:id', () => {
        it('should trow an error for deleting an user', () => {
            return request(app).delete('/user/' + user.id)
            .set({token: user.sessionToken})
            .expect(403);
        });
    });
});

describe('Admin', () => {

    describe('POST /signup', () => {
        it('should create an admin account when providing adminKey', () => {
            return request(app).post('/signup')
            .send({
                username: 'admin',
                password: 'adminpass',
                confirmPassword: 'adminpass',
                email: 'admin@email.com',
                firstName: 'admin',
                lastName: 'admin',
                adminKey: 'adminSecretPassword'
            })
            .expect(200);
        });
    });

    describe('POST /login', () => {
        it('should return a session token', () => {
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
    });

    describe('GET /users/1', () => {
        it('should return first page of user list', () => {
            return request(app).get('/users/1')
            .set({token: admin.sessionToken})
            .expect(200)
            .then(result => {
                assert(result.body.length == 2);
            })
        });
        it('should return second page of user list', () => {
            return request(app).get('/users/2')
            .set({token: admin.sessionToken})
            .expect(200)
            .then(result => {
                assert(result.body.length == 0);
            })
        });
    });

    describe('PUT /user/:id', () => {
        it('should edit details of another user', () => {
            return request(app).put('/user/' + user.id)
            .set({token: admin.sessionToken})
            .send({
                firstName: "Alex2",
                lastName: "Turdean2"
            })
            .expect(200);
        });
    });

    describe('PUT /user/:id/role', () => {
        it('should edit role of another user',
            () => {
                return request(app).put('/user/' + user.id + '/role')
                .set({token: admin.sessionToken})
                .send({
                    role: 1
                })
                .expect(200);
        });
    });

    describe('GET /user/:id', () => {
        it('should return details of another user', () => {
            return request(app).get('/user/' + user.id)
            .set({token: admin.sessionToken})
            .expect(200)
            .then(result => {
                assert(result.body.firstName == 'Alex2');
                assert(result.body.lastName == 'Turdean2');
                assert(result.body.role == 1);
            });
        });
    });

    describe('DELETE /user/:id', () => {
        it('should delete an user account', () => {
            return request(app).delete('/user/' + user.id)
            .set({token: admin.sessionToken})
            .expect(200);
        });
        describe('CREATE THE ACCOUNT BACK', () => {
            it('should trow an error for logging in with a deleted account', () => {
                return request(app).post('/login')
                .send({
                    username: 'test',
                    password: 'password2'
                })
                .expect(400);
            });
            it('should create the account back', () => {
                return request(app).post('/signup')
                .send({
                    username: 'test',
                    password: 'password',
                    confirmPassword: 'password',
                    email: 'test@email.com',
                    firstName: 'Alex',
                    lastName: 'Turdean'
                })
                .expect(200);
            });
            it('should login with the new account', () => {
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
        });
    });

    describe('PUT /user/:id/role', () => {
        it('should change regular user to manager', () => {
            return request(app).put('/user/' + user.id + '/role')
            .set({token: admin.sessionToken})
            .send({
                role: 1
            })
            .expect(200);
        });
        it('should change manager to regular user', () => {
            return request(app).put('/user/' + user.id + '/role')
            .set({token: admin.sessionToken})
            .send({
                role: 0
            })
            .expect(200);
        });
    });
});


describe('Manager', () => {

    describe('CREATE MANAGER ACCOUNT', () => {
        it('should create an account', () => {
            return request(app).post('/signup')
            .send({
                username: 'manager',
                password: 'password',
                confirmPassword: 'password',
                email: 'manager@email.com',
                firstName: 'MANAGER',
                lastName: 'MANAGER'
            })
            .expect(200);
        });
        it('should login with the account', () => {
            return request(app).post('/login')
            .send({
                username: 'manager',
                password: 'password'
            })
            .expect(200)
            .then(result => {
                manager.sessionToken = result.body.token;
                manager.id = result.body.id;
            });
        });
        it("should change account's role to manager by an admin", () => {
            return request(app).put('/user/' + manager.id + '/role')
            .set({token: admin.sessionToken})
            .send({
                role: 1
            })
            .expect(200);
        });
    });

    describe('PUT /user/:id/role', () => {
        it('should trow an error for changing a role', () => {
            return request(app).put('/user/' + user.id + '/role')
            .set({token: manager.sessionToken})
            .send({
                role: 1
            })
            .expect(403);
        });
    });

    describe('GET /users/1', () => {
        it('should return first page of user list', () => {
            return request(app).get('/users/1')
            .set({token: manager.sessionToken})
            .expect(200)
            .then(result => {
                assert(result.body.length == 3);
            })
        });
    });

    describe('GET /user/:id', () => {
        it('should return details of another user', () => {
            return request(app).get('/user/' + user.id)
            .set({token: admin.sessionToken})
            .expect(200)
            .then(result => {
                assert(result.body.firstName == 'Alex');
                assert(result.body.lastName == 'Turdean');
                assert(result.body.role == 0);
            });
        });
    });

    describe('DELETE /user/:id', () => {
        it('should delete an user account', () => {
            return request(app).delete('/user/' + manager.id)
            .set({token: manager.sessionToken})
            .expect(200);
        });
    });

});
