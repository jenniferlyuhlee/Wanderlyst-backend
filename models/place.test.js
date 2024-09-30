"use strict";
/** Tests for Place model */

const Place = require("./place");
const { NotFoundError } = require ("../config/expressError");
const {
    commonBeforeEach,
    commonAfterEach,
    commonAfterAll,
    itinIds
} = require("./_testCommon");

// Common test functions
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

const data = {
    itinId: 1,
    name: "test place",
    address: "test address",
    lat: 1.0,
    lng: 1.0,
    seq: 2,
    description: "test description"
};

const placeList = [data, {
    itinId: 1,
    name: "test place2",
    address: "test address2",
    lat: 2.0,
    lng: 2.0,
    seq: "2",
    description: "test description2",
    image: "testimage"
}];
console.log(itinIds)

/** Place.add ---------- */
describe("Place.add", () => {
    test("works as expected", async () => {
        const newPlace = await Place.add(data);
        expect(newPlace).toEqual({
            itinId: expect.any(Number),
            name: "test place",
            address: "test address",
            lat: expect.any(String),
            lng: expect.any(String),
            seq: 2,
            description: "test description",
            image: null
        });
    });
});


/** Place.addPlaces ---------- */
describe("Place.addPlaces", () => {
    test("works as expected", async () => {
        const places = await Place.addPlaces(1, placeList);
        expect(places).toEqual([expect.any(Number), expect.any(Number)]);
        
    });
});

/** Place.getItinPlaces ---------- */
describe("Place.getItinPlaces", () => {
    test("works as expected", async () => {
        await Place.add(data);
        const places = await Place.getItinPlaces(1);
        expect(places).toEqual([
            {
                name: "testPlace",
                address: "testAddress",
                lat: expect.any(String),
                lng: expect.any(String),
                seq: 1,
                description: "testDesc",
                image: "image.png"
            },
            {
                name: "test place",
                address: "test address",
                lat: expect.any(String),
                lng: expect.any(String),
                seq: 2,
                description: "test description",
                image: null
             }
        ]);
    });
});