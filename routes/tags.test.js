"use strict";
/** Tests for tags routes */

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

/** GET /tags ---------- */
describe("GET /tags", () => {
    test("works as expected: user", async () => {
        const resp = await request(app)
        .get("/tags")
        .set("authorization", `Bearer ${u2Token}`);

        expect(resp.statusCode).toEqual(200);
        expect(resp.body).toEqual({tags: [
            "testTag1", 
            "testTag2",
            "testTag3"
        ]});
    });
    test("works as expected: admin", async () => {
        const resp = await request(app)
        .get("/tags")
        .set("authorization", `Bearer ${adminToken}`);

        expect(resp.statusCode).toEqual(200);
        expect(resp.body.tags.length).toEqual(3);
    });
    test("unauth error for anon", async () => {
        const resp = await request(app)
        .get("/tags");

        expect(resp.statusCode).toEqual(401);
    });
});


/** GET /tags/:name ---------- */
describe("GET /tags/:name", () => {
    test("works as expected: user", async () => {
        const resp = await request(app)
        .get("/tags/testTag1")
        .set("authorization", `Bearer ${u1Token}`);

        expect(resp.statusCode).toEqual(200);
        expect(resp.body).toEqual({tag: {
                name: 'testTag1',
                description: 'testDescription1',
                itineraries: [{
                    id: expect.any(Number),
                    title: "testItin",
                    duration: 3,
                    city: "testCity",
                    country: "testCountry",
                    username: "u1"
                }]
            }
        })
    });
    test("works as expected: admin", async () => {
        const resp = await request(app)
        .get("/tags/testTag2")
        .set("authorization", `Bearer ${adminToken}`);

        expect(resp.statusCode).toEqual(200);
        expect(resp.body).toEqual({tag: {
                name: 'testTag2',
                description: 'testDescription2',
                itineraries: [{
                    id: expect.any(Number),
                    title: "testItin",
                    duration: 3,
                    city: "testCity",
                    country: "testCountry",
                    username: "u1"
                }]
            }
        })
    });
    test("unauth error for anon", async () => {
        const resp = await request(app)
        .get("/tags/testTag3")

        expect(resp.statusCode).toEqual(401);
    });
    test("not found error", async () => {
        const resp = await request(app)
        .get("/tags/noTag")
        .set("authorization", `Bearer ${adminToken}`);

        expect(resp.statusCode).toEqual(404);
    })
});
