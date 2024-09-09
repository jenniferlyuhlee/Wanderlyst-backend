"use strict";
/** Tests for middleware */

const jwt = require("jsonwebtoken");
const { UnauthorizedError } = require("../config/expressError");
const {
    authenticateJWT,
    ensureLoggedIn,
    ensureCorrectUserOrAdmin
} = require("./auth")

const { SECRET_KEY } = require("../config/config");
const testJwt = jwt.sign({ username: "test", isAdmin: false}, SECRET_KEY);
const badJwt = jwt.sign({ username: "test", isAdmin: false}, "wrongkey");

/** authenticateJWT
 *  Tests user JWT authentication
 */
describe("authenticateJWT", () => {
    test("works as expected in header", () => {
        const req = { headers: {authorization: `Bearer ${testJwt}`}};
        const res = { locals: {} };
        const next = function(err){
            expect(err).toBeFalsy();
        };
        authenticateJWT(req, res, next);
        expect(res.locals).toEqual({
            user:{
                iat: expect.any(Number),
                username: "test",
                isAdmin: false
            }
        });
    });
    test("works as expected w/o header", () => {
        const req = {};
        const res = { locals: {} };
        const next = function(err){
            expect(err).toBeFalsy();
        };
        authenticateJWT(req, res, next);
        expect(res.locals).toEqual({})
    });
    test("works as expected with invalid token (no error thrown)", () =>{
        const req = { headers: {authorization: `Bearer ${badJwt}`}};
        const res = { locals: {} };
        const next = function(err){
            expect(err).toBeFalsy();
        };
        authenticateJWT(req, res, next);
        expect(res.locals).toEqual({})
    })
});

/** ensureLoggedIn
 * Tests middleware that checks if a user is logged in
 */
describe("ensureLoggedIn", () => {
    test("works as expected", () => {
        const req = {};
        const res = { locals: { user: { username: "test", isAdmin: false } } };
        const next = function (err) {
          expect(err).toBeFalsy();
        };
        expect(ensureLoggedIn(req, res, next)).toEqual(undefined);   
    });
    test("Unauth error if no login state", () => {
        const req = {};
        const res = { locals: {} };
        const next = function (err) {
          expect(err instanceof UnauthorizedError).tobeTruthy();
        };
    });
});

/** ensure CorrectUserOrAdmin
 * Tests middleware that checks if a user is the same as the parameter
 * Or an admin
 */
describe("ensureCorrectUserOrAdmin", () => {
    test("works as expected for correct user", () => {
        const req = { params: { username: "test" } };
        const res = { locals: { user: { username: "test", isAdmin: false } } };
        const next = function (err) {
          expect(err).toBeFalsy();
        };
        expect(ensureCorrectUserOrAdmin(req, res, next)).toEqual(undefined);
    });
    test("works as expected for admin", () => {
        const req = { params: { username: "test" } };
        const res = { locals: { user: { username: "testAdmin", isAdmin: true } } };
        const next = function (err) {
            expect(err).toBeFalsy();
        };
        expect(ensureCorrectUserOrAdmin(req, res, next)).toEqual(undefined);
    });
    test("Unauth error if not user or admin", () => {
        const req = { params : {username: "test" } };
        const res = { locals: { user: { username: "testWrongUser", isAdmin: false } } };
        const next = function(err){
            expect(err instanceof UnauthorizedError).tobeTruthy();
        };
    });
    test("Unauth error if no user", () => {
        const req = { params : {username: "test" } };
        const res = { locals: {} };
        const next = function(err){
            expect(err instanceof UnauthorizedError).tobeTruthy();
        };
    });
});