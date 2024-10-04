import { describe, it, before, after } from 'mocha';
import { expect } from 'chai';
import request from 'supertest';
import app from '../app.js';
import User from '../models/User.js';

let token;

describe('Routes', function() {

    before(async function() {
        // Register a new user
        await request(app)
            .post('/auth/register')
            .send({ username: 'testuser', password: 'password' });

        // Log in the user to get the token
        const res = await request(app)
            .post('/auth/login')
            .send({ username: 'testuser', password: 'password' });
        token = res.body.token;
    });

    after(async function() {
        // Cleanup: delete all test users
        await User.deleteMany({ username: { $in: ['testuser', 'newuser', 'updateduser'] } });
    });

    describe('POST /auth/register', function() {
        it('should register a new user', async function() {
            const res = await request(app)
                .post('/auth/register')
                .send({ username: 'newuser', password: 'password' });
            expect(res.statusCode).to.equal(201);
            expect(res.text).to.equal('User registered');
        });
    });

    describe('POST /auth/login', function() {
        it('should log in a user', async function() {
            const res = await request(app)
                .post('/auth/login')
                .send({ username: 'testuser', password: 'password' });
            expect(res.statusCode).to.equal(200);
            expect(res.body).to.have.property('token');
        });
    });

    describe('GET /auth/user', function() {
        it('should get user info', async function() {
            const res = await request(app)
                .get('/auth/user')
                .set('Authorization', `Bearer ${token}`);
            expect(res.statusCode).to.equal(200);
            expect(res.body).to.have.property('username', 'testuser');
        });
    });

    describe('PUT /auth/user', function() {
        it('should update user info', async function() {
            const res = await request(app)
                .put('/auth/user')
                .set('Authorization', `Bearer ${token}`)
                .send({ username: 'updateduser' });
            expect(res.statusCode).to.equal(200);
            expect(res.text).to.equal('User info updated');
        });
    });

    describe('POST /auth/refresh-token', function() {
        it('should refresh token', async function() {
            const res = await request(app)
                .post('/auth/refresh-token')
                .send({ token });
            expect(res.statusCode).to.equal(200);
            expect(res.body).to.have.property('token');
        });
    });

    describe('POST /auth/logout', function() {
  it('should log out the user', async function() {
    const res = await request(app)
      .post('/auth/logout')
      .set('Authorization', `Bearer ${token}`);
    expect(res.statusCode).to.equal(200);
    expect(res.text).to.equal('User logged out');
  });
});

describe('DELETE /auth/delete', function() {
  it('should delete a user', async function() {
    const res = await request(app)
      .delete('/auth/delete')
      .send({ username: 'updateduser' });
    expect(res.statusCode).to.equal(200);
    expect(res.text).to.equal('User deleted');
  });
});
});