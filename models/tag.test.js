"use strict";
/** Tests for Tag model */

const Tag = require("./tag");
const { NotFoundError } = require ("../config/expressError");
const {
    commonBeforeAll,
    commonBeforeEach,
    commonAfterEach,
    commonAfterAll,
} = require("./_testCommon");

// Common test functions
beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

/** Tag.get */
describe("get", () => {
    test("works as expected", async () => {
        const tag = await Tag.get("testTag1");
        expect(tag).toEqual({
            name: 'testTag1', 
            description: 'testDescription1',
            itineraries: [
                {
                    id: 1,
                    username: "u1",
                    title: 'testItin',
                    duration: 3,
                    city: 'testCity', 
                    country: 'testCountry'
                }
            ]
        })
    });
    test("not found error if tag not found", async () => {
        try{
            await Tag.get("fakeTag");
        }catch(err){
            expect(err instanceof NotFoundError).toBeTruthy();
        }
    });
});