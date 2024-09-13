"use strict";
/** Tests for user routes */

const request = require("supertest");
const app = require("../app");

const {
    commonBeforeEach,
    commonAfterEach,
    commonAfterAll,
    testItins,
    u1Token, u2Token, adminToken
} = require("./_testCommon");

// Common test functions
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

/** GET /users/:username ---------- */
describe("GET /users/:username", () => {
    test("works as expected: same user", async () => {
        const resp = await request(app)
        .get("/users/u1")
        .set("authorization", `Bearer ${u1Token}`);
       
        expect(resp.statusCode).toEqual(200);
        expect(resp.body).toEqual({ user: {
                username: "u1",
                firstName: "u1f",
                lastName: "u1l",
                email: "u1@email.com",
                location: null,
                bio: null,
                profilePic: null, 
                createdAt: expect.any(String),
                isAdmin: false,
                likes: [],
                itineraries: [{
                    id: expect.any(Number),
                    title: "testItin",
                    duration: 3,
                    city: "testCity",
                    country: "testCountry"
                }]
            }
        })
    });
    test("works as expected: other user", async () => {
        const resp = await request(app)
        .get("/users/u1")
        .set("authorization", `Bearer ${u2Token}`);
       
        expect(resp.statusCode).toEqual(200);
    });
    test("works as expected: admin", async () => {
        const resp = await request(app)
        .get("/users/u1")
        .set("authorization", `Bearer ${adminToken}`);
       
        expect(resp.statusCode).toEqual(200);
    });
    test("not found error", async () => {
        const resp = await request(app)
        .get("/users/noUser")
        .set("authorization", `Bearer ${adminToken}`);
       
        expect(resp.statusCode).toEqual(404);
    })
});

/** PATCH /users/:username ---------- */
describe("PATCH /users/:username", () => {
    test("works as expected (password): same user", async () => {
        const resp = await request(app)
        .patch("/users/u2")
        .send({bio: "new bio", password: "newpwu2", location: "CA"})
        .set("authorization", `Bearer ${u2Token}`);
       
        expect(resp.statusCode).toEqual(200);
        expect(resp.body).toEqual({user: {
            username: "u2",
            email: "u2@email.com",
            isAdmin: false,
            firstName: "u2f",
            lastName: "u2l",
            location: "CA",
            bio: "new bio",
            profilePic: null
        }})

        const checkAuth = await request(app)
        .post("/auth/login")
        .send({username: "u2", password: "newpwu2" })

        expect(checkAuth.body).toEqual({token: expect.any(String)});
    });
    test("works as expected: admin", async () => {
        const resp = await request(app)
        .patch("/users/u2")
        .send({firstName: "newu2f", lastName:"newu2l"})
        .set("authorization", `Bearer ${adminToken}`);
       
        expect(resp.statusCode).toEqual(200);
        expect(resp.body).toEqual({user: {
                username: "u2",
                email: "u2@email.com",
                isAdmin: false,
                firstName: "newu2f",
                lastName: "newu2l",
                location: null,
                bio: null,
                profilePic: null
        }})
    });
    test("forbidden error for non-admin wrong user", async() => {
        const resp = await request(app)
        .patch("/users/u2")
        .send({bio: "new bio", password: "newpwu2", location: "CA"})
        .set("authorization", `Bearer ${u1Token}`);
       
        expect(resp.statusCode).toEqual(403);
    });
    test("forbidden error for anon", async() => {
        const resp = await request(app)
        .patch("/users/u2")
        .send({bio: "new bio", profilePic: "http://newPic.com"})
       
        expect(resp.statusCode).toEqual(403);
    });
    test("bad request error for invalid data: isAdmin", async () => {
        const resp = await request(app)
        .patch("/users/u2")
        .send({isAdmin: true})
        .set("authorization", `Bearer ${u2Token}`);

        expect(resp.statusCode).toEqual(400);
    });
    test("bad request error for invalid data format: pic", async () => {
        const resp = await request(app)
        .patch("/users/u2")
        .send({bio: "new bio", profilePic: "not valid pic"})
        .set("authorization", `Bearer ${u2Token}`);

        expect(resp.statusCode).toEqual(400);
    });
    test("bad request error for invalid data: location length", async () => {
        const resp = await request(app)
        .patch("/users/u2")
        .send({location: "i"})
        .set("authorization", `Bearer ${u2Token}`);

        expect(resp.statusCode).toEqual(400);
    });
    test("not found error", async () => {
        const resp = await request(app)
        .patch("/users/noUser")
        .send({bio: "new bio", profilePic: "http://newPic.com"})
        .set("authorization", `Bearer ${adminToken}`);

        expect(resp.statusCode).toEqual(404);
    });
});

/** DELETE /users/:username ---------- */
describe("DELETE /users/:username", () => {
    test("works as expected: same user", async () => {
        const resp = await request(app)
        .delete("/users/u1")
        .set("authorization", `Bearer ${u1Token}`);
       
        expect(resp.statusCode).toEqual(200);
        expect(resp.body).toEqual({deleted: "u1"});
    });
    test("works as expected: admin", async () => {
        const resp = await request(app)
        .delete("/users/u1")
        .set("authorization", `Bearer ${adminToken}`);
       
        expect(resp.statusCode).toEqual(200);
        expect(resp.body).toEqual({deleted: "u1"});
    });
    test("forbidden error for non-admin wrong user", async () => {
        const resp = await request(app)
        .delete("/users/u1")
        .set("authorization", `Bearer ${u2Token}`);
       
        expect(resp.statusCode).toEqual(403);
    });
    test("forbidden unauth error for anon", async () => {
        const resp = await request(app)
        .delete("/users/u1");
       
        expect(resp.statusCode).toEqual(403);
    });
    test("not found error", async () => {
        const resp = await request(app)
        .delete("/users/noUser")
        .set("authorization", `Bearer ${adminToken}`);
       
        expect(resp.statusCode).toEqual(404);
    });
});

/** POST /users/:username/like/:id ---------- */
describe("POST /users/:username/like/:id", () => {
    test("works as expected: same user", async () => {
        // like
        const resp1 = await request(app)
        .post(`/users/u2/like/${testItins[0].id}`)
        .set("authorization", `Bearer ${u2Token}`);
       
        expect(resp1.statusCode).toEqual(200);
        expect(resp1.body).toEqual({message: "liked", id: testItins[0].id});
        
        // unlike
        const resp2 = await request(app)
        .post(`/users/u2/like/${testItins[0].id}`)
        .set("authorization", `Bearer ${u2Token}`);

        expect(resp2.statusCode).toEqual(200);
        expect(resp2.body).toEqual({message: "unliked", id: testItins[0].id});
    });
    test("works as expected: admin", async () => {
        const resp = await request(app)
        .post(`/users/u2/like/${testItins[0].id}`)
        .set("authorization", `Bearer ${adminToken}`);
       
        expect(resp.statusCode).toEqual(200);
    });
    test("forbidden error for non-admin wrong user", async () => {
        const resp = await request(app)
        .post(`/users/u2/like/${testItins[0].id}`)
        .set("authorization", `Bearer ${adminToken}`);
       
        expect(resp.statusCode).toEqual(200);
    });
    test("forbidden unauth error for anon", async () => {
        const resp = await request(app)
        .post(`/users/u2/like/${testItins[0].id}`)
       
        expect(resp.statusCode).toEqual(403);
    });
});
