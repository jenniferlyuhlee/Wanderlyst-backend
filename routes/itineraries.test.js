"use strict";
/** Tests for itinerary routes */

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

/** POST /itineraries ---------- */
describe("POST /itineraries", () => {
    test("bad request error for invalid data: missing places", async () => {
        const resp = await request(app)
        .post("/itineraries")
        .send({
                title: "invalid new itin",
                duration: 4,
                city: "new itin city",
                country: "new itin country",
                description: "won't pass due to insufficient data",
                tags: [1, 2]
            }
        )
        .set("authorization", `Bearer ${adminToken}`);
        
        expect(resp.statusCode).toEqual(400);
    });
    test("bad request error for invalid data: missing tags", async () => {
        const resp = await request(app)
        .post("/itineraries")
        .send({
                title: "invalid new itin",
                duration: 4,
                city: "new itin city",
                country: "new itin country",
                description: "won't pass due to insufficient data",
                tags: [],
                places: [{
                    name: "testPlace",
                    address: "test address",
                    seq: 1,
                    description: "this test will fail",
                    image: null
                }]
            }
        )
        .set("authorization", `Bearer ${adminToken}`);
        
        expect(resp.statusCode).toEqual(400);
    });
    test("unauth error for anon", async () => {
        const resp = await request(app)
        .post("/itineraries")
        .send({
                title: "invalid new itin",
                duration: 4,
                city: "new itin city",
                country: "new itin country",
                description: "won't pass due to insufficient data",
                tags: [1],
                places: [{
                    name: "testPlace",
                    address: "test address",
                    seq: 1,
                    description: "this test will fail",
                    image: null
                }]
            }
        );
        
        expect(resp.statusCode).toEqual(401);
    });
});

/** DELETE /itineraries/:id ---------- */
describe("DELETE /itineraries/:id/:username", () => {
    test("works as expected: correct user", async () => {
        const resp = await request(app)
        .delete(`/itineraries/${testItins[0].id}/u1`)
        .set("authorization", `Bearer ${u1Token}`);

        expect(resp.statusCode).toEqual(200);
        expect(resp.body).toEqual({deleted: testItins[0].id, user:"u1"})
    });
    test("works as expected: admin", async () => {
        const resp = await request(app)
        .delete(`/itineraries/${testItins[0].id}/u1`)
        .set("authorization", `Bearer ${adminToken}`);

        expect(resp.statusCode).toEqual(200);
        expect(resp.body).toEqual({deleted: testItins[0].id, user:"u1"})
    });
    test("forbidden error for non-admin wrong user", async () => {
        const resp = await request(app)
        .delete(`/itineraries/${testItins[0].id}/u1`)
        .set("authorization", `Bearer ${u2Token}`);

        expect(resp.statusCode).toEqual(403);
    });
    test("forbidden unauth error for anon", async () => {
        const resp = await request(app)
        .delete(`/itineraries/${testItins[0].id}/u1`);

        expect(resp.statusCode).toEqual(403);
    });
    test("not found error: no itinerary", async () => {
        const resp = await request(app)
        .delete(`/itineraries/0/u1`)
        .set("authorization", `Bearer ${u1Token}`);

        expect(resp.statusCode).toEqual(404);
    });

});


/** GET /itineraries ---------- */
describe("GET /itineraries", () => {
    test("works as expected: no filters", async () => {
        const resp = await request(app)
        .get("/itineraries")
        .set("authorization", `Bearer ${u1Token}`);

        expect(resp.statusCode).toEqual(200);
        expect(resp.body).toEqual({itineraries: [
            {
                id: expect.any(Number),
                username: 'u1',
                title: 'testItin',
                duration: 3,
                city: 'testCity',
                country: 'testCountry'
            }
        ]});
    });
    test("works as expected: filter country", async () => {
        const resp = await request(app)
        .get("/itineraries")
        .query({country: "none"})
        .set("authorization", `Bearer ${u2Token}`);

        expect(resp.statusCode).toEqual(200);
        expect(resp.body).toEqual({itineraries: []});
    });
    test("works as expected: filter title", async () => {
        const resp = await request(app)
        .get("/itineraries")
        .query({title: "test"})
        .set("authorization", `Bearer ${u2Token}`);

        expect(resp.statusCode).toEqual(200);
        expect(resp.body.itineraries.length).toEqual(1);
    });
    test("works as expected: multiple filters", async () => {
        const resp = await request(app)
        .get("/itineraries")
        .query({title: "test", duration: "2"})
        .set("authorization", `Bearer ${u2Token}`);

        expect(resp.statusCode).toEqual(200);
        expect(resp.body.itineraries.length).toEqual(0);
    });
    test("bad request error: invalid filter keys", async () => {
        const resp = await request(app)
        .get("/itineraries")
        .query({duration: 3, invalidKey: "invalid"})
        .set("authorization", `Bearer ${adminToken}`);

        expect(resp.statusCode).toEqual(400);
    });
    test("unauth error for anon", async () => {
        const resp = await request(app)
        .get("/itineraries");

        expect(resp.statusCode).toEqual(401);
    });
});


/** GET /itineraries/:id ---------- */
describe("GET /itineraries/:id", () => {
    test("works as expected: user", async () => {
        const resp = await request(app)
        .get(`/itineraries/${testItins[0].id}`)
        .set("authorization", `Bearer ${u2Token}`);

        expect(resp.statusCode).toEqual(200);
        expect(resp.body).toEqual({itinerary: {
                id: expect.any(Number),
                username: "u1",
                title: "testItin",
                duration: 3,
                city: "testCity",
                country: "testCountry",
                lat: expect.any(String),
                lng: expect.any(String),
                description: "testDesc",
                createdAt: expect.any(String),
                likes: "0",
                tags: ["testTag1", "testTag2", "testTag3"],
                places: [
                    // {
                    //     name: "testPlace1",
                    //     address: "testAddress1",
                    //     lat: expect.any(String),
                    //     lng: expect.any(String),
                    //     seq: 1, 
                    //     description: "testDesc1",
                    //     image: "image.png"
                    // },
                    // {
                    //     name: "testPlace2",
                    //     address: "testAddress2",
                    //     lat: expect.any(String),
                    //     lng: expect.any(String),
                    //     seq: 2, 
                    //     description: "testDesc2",
                    //     image: "image.png"
                    // }
                ]
            }
        });
    });
    test("works as expected: admin", async () => {
        const resp = await request(app)
        .get(`/itineraries/${testItins[0].id}`)
        .set("authorization", `Bearer ${adminToken}`);

        expect(resp.statusCode).toEqual(200);
    });
    test("no found error", async () => {
        const resp = await request(app)
        .get("/itineraries/0")
        .set("authorization", `Bearer ${adminToken}`);

        expect(resp.statusCode).toEqual(404);
    });
});