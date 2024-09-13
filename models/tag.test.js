"use strict";
/** Tests for Tag model */

const Tag = require("./tag");
const { NotFoundError } = require ("../config/expressError");
const {
    commonBeforeEach,
    commonAfterEach,
    commonAfterAll,
} = require("./_testCommon");

// Common test functions
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

/** Tag.add ---------- */
describe("Tag.add", () => {
    test("works as expected", async () => {
        const tag = await Tag.add({
            name: "newTag", 
            description: "testing add tag"
        });
        expect(tag).toEqual({id: expect.any(Number)});
    });
});

/** Tag.getAll ----------*/
describe("Tag.getAll", () => {
    test("works as expected", async () => {
        const tags = await Tag.getAll();
        expect(tags.length).toEqual(3);
        expect(tags).toEqual(["testTag1", "testTag2", "testTag3",]);
    })
});

/** Tag.get ---------- */
describe("Tag.get", () => {
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