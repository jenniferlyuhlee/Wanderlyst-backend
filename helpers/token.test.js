"use strict";
/** Tests for token helper function */

const jwt = require("jsonwebtoken");
const { SECRET_KEY } = require("../config");
const { createToken } = require("./token");

describe("createToken", () => {
    test("works as expected, not admin by default", () => {
        const token = createToken({ username: "test" });
        const payload = jwt.verify(token, SECRET_KEY);
        expect(payload).toEqual({
            iat: expect.any(Number),
            username: "test",
            isAdmin: false
        });
    });
    test("works as expected, admin", () => {
        const token = createToken({ username: "test", isAdmin: true});
        const payload = jwt.verify(token, SECRET_KEY);
        expect(payload).toEqual({
            iat: expect.any(Number),
            username: "test",
            isAdmin:true
        });
    });
});