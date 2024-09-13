"use strict";
/** Tests for Itinerary model */

const db = require("../config/db");
const Itinerary = require("./itinerary");
const { NotFoundError, BadRequestError } = require ("../config/expressError");
const {
    commonBeforeEach,
    commonAfterEach,
    commonAfterAll,
} = require("./_testCommon");

// Common test functions
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

let newItinData = {
    username: "u2",
    title: "new itin",
    duration: 1, 
    city: "test city",
    country: "test country",
    lat: 150.0,
    lng: 150.0,
    description: "create new itin test"
};

/** Itinerary.create ---------- */
describe("Itinerary.create", () => {
    test("works as expected", async () => {
        const copiedData = {...newItinData}
        const newItin = await Itinerary.create(copiedData);
        // erase data to expect strings
        delete copiedData.lat;
        delete copiedData.lng;
        expect(newItin).toEqual({
            ...newItinData,
            id: expect.any(Number),
            createdAt: expect.any(Date),
            lat: expect.any(String),
            lng: expect.any(String)
        })
    });
});

/** Itinerary.delete ---------- */
describe("Itinerary.delete", () => {
    test("works as expected", async () => {
        const deleted = await Itinerary.delete(1, "u1");
        const res = await db.query(`SELECT * FROM itineraries
                                    WHERE id = 1`);
        expect(deleted).toEqual({id: 1});
        expect(res.rows.length).toEqual(0);
    });
    test("not found error if itin doesn't exist", async () => {
        try{
            await Itinerary.delete(1100, "u1");
        }catch(err){
            expect(err instanceof NotFoundError).toBeTruthy();
        }
    });
    test("not found error if user doesn't exist", async () => {
        try{
            await Itinerary.delete(1, "noUser");
        }catch(err){
            expect(err instanceof NotFoundError).toBeTruthy();
        }
    });
});

/** Itinerary.getAll ---------- */
describe("Itinerary.getAll", () => {
    test("works as expected: all", async () => {
        const itineraries = await Itinerary.getAll();
        expect(itineraries).toEqual([
            {
                id: 1,
                username: 'u1',
                title: 'testItin',
                duration: 3,
                city: 'testCity',
                country: 'testCountry'
            }
        ]);
    });
    test("works as expected: multiple filters", async () => {
        // add new itinerary to show filtering
        await Itinerary.create(newItinData);
        const itins = await Itinerary.getAll();
        expect(itins.length).toEqual(2);

        const filteredItins = await Itinerary.getAll({title: "itin", duration: 1})
        expect(filteredItins).toEqual([
            {
                id: expect.any(Number),
                username: "u2",
                title: "new itin",
                duration: 1, 
                city: "test city",
                country: "test country",
            }
        ]);
    });
    test("works as expected: title filter", async () => {
        const res1 = await Itinerary.getAll({title: "test"})
        expect(res1.length).toEqual(1);
        const res2 = await Itinerary.getAll({title: "none"})
        expect(res2.length).toEqual(0);
    });
    test("works as expected: country filter", async () => {
        const res1 = await Itinerary.getAll({country: "country"})
        expect(res1.length).toEqual(1);
        const res2 = await Itinerary.getAll({country: "none"})
        expect(res2.length).toEqual(0);
    });
    test("works as expected: duration filter", async () => {
        const res1 = await Itinerary.getAll({duration: 3})
        expect(res1.length).toEqual(1);
        const res2 = await Itinerary.getAll({duration: 2})
        expect(res2.length).toEqual(0);
    });
    test("bad req error: duration < 0", async () => {
        try{
            await Itinerary.getAll({duration: 0});
        }
        catch(err){
            expect(err instanceof BadRequestError).toBeTruthy();
        }
    });
});

/** Itinerary.get ---------- */
describe("Itinerary.get", () => {
    test("works as expected", async () => {
        const itinerary = await Itinerary.get(1);
        expect(itinerary).toEqual({
            id: 1,
            username: 'u1',
            title: 'testItin',
            duration: 3,
            city: 'testCity',
            country: 'testCountry',
            lat: expect.any(String),
            lng: expect.any(String),
            description: 'testDesc',
            createdAt: expect.any(Date),
            likes: "0",
            tags: ['testTag1'],
            places: [{
                name: 'testPlace',
                address: 'testAddress',
                lat: expect.any(String),
                lng: expect.any(String),
                description: 'testDesc',
                seq: 1,
                image: 'image.png'
            }]
        })
    });
    test("not found error if itin doesn't exist", async () => {
        try{
            await Itinerary.get(100);
        }
        catch(err){
            expect(err instanceof NotFoundError).toBeTruthy();
        }
    });
});

/** Itinerary.addTags ---------- */
describe("Itinerary.addTags", () => {
    test("works as expected", async () => {
        await Itinerary.addTags(1, [2, 3]);
        const itin = await Itinerary.get(1);
        expect(itin.tags.length).toEqual(3);
        expect(itin.tags).toEqual([
            "testTag1",
            "testTag2",
            "testTag3"
        ]);
    });
});

