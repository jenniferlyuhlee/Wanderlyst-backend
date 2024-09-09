"use strict";
/** Tests for updateQueries helper function */

const { sqlForPartialUpdate, buildValuesClause } = require("./sqlHelper")
const { BadRequestError } = require("../config/expressError");

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

describe("buildValuesClause", () => {
    test("works as expected", () => {
        expect(buildValuesClause(1, [1, 2, 3])).toEqual({
            values: [1, 1, 2, 3],
            placeholders: "($1, $2), ($1, $3), ($1, $4)"
        })
    });
});