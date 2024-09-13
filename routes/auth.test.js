"use strict";
/** Tests for auth routes */

const request = require("supertest");
const app = require("../app");

const {
    commonBeforeEach,
    commonAfterEach,
    commonAfterAll,
} = require("./_testCommon");

// Common test functions
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

/** POST /auth/login ---------- */
describe("POST /auth/login", () => {
    test("works as expected", async () => {
        const resp = await request(app)
                    .post("/auth/login")
                    .send({username: "u1", password: "password1"});
        
        expect(resp.statusCode).toEqual(200);      
        expect(resp.body).toEqual({"token": expect.any(String)});
    });
    test("bad request error for missing data: username", async () => {
        const resp = await request(app)
        .post("/auth/login")
        .send({password: "password1"});

        expect(resp.statusCode).toEqual(400)
    });
    test("bad request error for missing data: password", async () => {
        const resp = await request(app)
        .post("/auth/login")
        .send({username: "u1"});

        expect(resp.statusCode).toEqual(400)
    });
    test("unauth error for non-existing user", async () => {
        const resp = await request(app)
                    .post("/auth/login")
                    .send({username: "nonexisting", password: "password1"});
        
        expect(resp.statusCode).toEqual(401);      
    });
    test("unauth error for wrong credentials", async () => {
        const resp = await request(app)
                    .post("/auth/login")
                    .send({username: "u1", password: "wrongpassword1"});
    
        expect(resp.statusCode).toEqual(401);      
    });
   
});

/** POST /auth/signup ---------- */
describe("POST /auth/signup", () => {
    test("works as expected", async () => {
        const resp = await request(app)
                    .post("/auth/signup")
                    .send({
                        username: "newTestUser",
                        password: "newtestpassword",
                        email: "newtest@email.com",
                        firstName: "newFirstName",
                        lastName: "newLastName"
                    });
        expect(resp.statusCode).toEqual(201);
        expect(resp.body).toEqual({token: expect.any(String)})
    });
    test("bad request error for missing data fields: username", async () => {
        const resp = await request(app)
                    .post("/auth/signup")
                    .send({
                        password: "newtestpassword",
                        email: "newtest@email.com",
                        firstName: "newFirstName",
                        lastName: "newLastName"
                    });

        expect(resp.statusCode).toEqual(400);
    });
    test("bad request error for missing data fields: first/last name", async () => {
        const resp = await request(app)
                    .post("/auth/signup")
                    .send({
                        username: "newTestUser",
                        password: "newtestpassword",
                        email: "newtest@email.com",
                    });

        expect(resp.statusCode).toEqual(400);
    });
    test("bad request error invalid data: password length", async () => {
        const resp = await request(app)
                    .post("/auth/signup")
                    .send({
                        username: "newTestUser",
                        password: "pw",
                        email: "not in email format",
                        firstName: "newFirstName",
                        lastName: "newLastName"
                    });

        expect(resp.statusCode).toEqual(400);
    });
    test("bad request error invalid data: email", async () => {
        const resp = await request(app)
                    .post("/auth/signup")
                    .send({
                        username: "newTestUser",
                        password: "newtestpassword",
                        email: "not in email format",
                        firstName: "newFirstName",
                        lastName: "newLastName"
                    });

        expect(resp.statusCode).toEqual(400);
    });
    test("bad request error if username taken", async () => {
        const resp = await request(app)
                    .post("/auth/signup")
                    .send({
                        username: "u1",
                        password: "newtestpassword",
                        email: "newtest@email.com",
                        firstName: "newFirstName",
                        lastName: "newLastName"
                    });

    expect(resp.statusCode).toEqual(400);
    });
});
