"use strict";
/** Tests for updateQueries helper function */

const { sqlForPartialUpdate, 
        buildTagsValuesClause,
        buildPlacesValuesClause } = require("./sqlHelper")
const { BadRequestError } = require("../config/expressError");

/** sqlForPartial Update */
describe("sqlForPartialUpdate", () => {
    test("works as expected", () => {
        const result = sqlForPartialUpdate(
            {field_1: "newVal1", field_2: "newVal2"},
            {field1: "field_1", field2: "field_2"}
        );
        expect(result).toEqual(
            {setCols: `"field_1"=$1, "field_2"=$2`,
            values: ["newVal1", "newVal2"]
            }
        );
    });
    test("Bad req error when no data inputted", () => {
        try{
            sqlForPartialUpdate({}, {field1: "field_1"});
        }
        catch(err){
            expect(err instanceof BadRequestError).toBeTruthy();
        } 
    });
});

/** buildTagsValues clause Update */
describe("buildTagsValuesClause", () => {
    test("works as expected", () => {
        const result = buildTagsValuesClause(1, [1, 2, 3])
        expect(result).toEqual({
            values: [1, 1, 2, 3],
            placeholders: "($1, $2), ($1, $3), ($1, $4)"
        })
    });
    test("Bad req error when tags array is empty", () => {
        try{
            buildTagsValuesClause(1, []);
        }
        catch(err){
            expect(err instanceof BadRequestError).toBeTruthy();
        }
    });
});

/** buildPlacesValuesClause Update */
describe("buildsPlacesValuesClause", () => {
    const placeList = [
        {
            name: "place1",
            address: "address1",
            lat: 1.0,
            lng: 1.0,
            seq: 1, 
            description: "first place",
            image: null
        },
        {
            name: "place2",
            address: "address2",
            lat: 2.0,
            lng: 2.0,
            seq: 2, 
            description: "second place",
            image: "testimage.png"
        }
    ];
    test("works as expected", () => {
        const result = buildPlacesValuesClause(1, placeList)
        expect(result).toEqual({
            values: [1, "place1", "address1", 1.0, 1.0, 1, "first place", null,
                     "place2", "address2", 2.0, 2.0, 2, "second place", "testimage.png"],
            placeholders: `($1, $2, $3, $4, $5, $6, $7, $8), ($1, $9, $10, $11, $12, $13, $14, $15)`
        });
    });
    test("Bad req error when places array is empty", () => {
        try{
            buildPlacesValuesClause(1, placeList);
        }
        catch(err){
            expect(err instanceof BadRequestError).toBeTruthy();
        }
    });
});