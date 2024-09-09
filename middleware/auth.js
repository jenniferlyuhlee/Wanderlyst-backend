"use strict";
/** Middleware to handle authentication in routes. */

const jwt = require("jsonwebtoken");
const { SECRET_KEY } = require("../config/config");
const { UnauthorizedError } = require("../config/expressError");

/** Authenticate user before every request
 * Verifies token if provided, and stores payload {username, isAdmin}
 * in res.locals
 * DOESN'T respond with error, continues to routes
*/
function authenticateJWT(req, res, next){
    try{
        const authHeader = req.headers && req.headers.authorization;
        if(authHeader){
            const token = authHeader.replace(/^[Bb]earer /, "").trim();
            res.locals.user = jwt.verify(token, SECRET_KEY);
        }
        return next();
    }
    catch(err){
        return next();
    }
}

/** Verify that user is logged in
 *  Throws UnauthorizedError if not logged in
 */
function ensureLoggedIn(req, res, next){
    try{
        if(!res.locals.user) throw new UnauthorizedError("Must be logged in");
        return next();
    }
    catch(err){
        return next(err);
    }
}

/** Verify that user is logged in and appropriate user or admin
 *  Throws Unauthorized Error
 */
function ensureCorrectUserOrAdmin(req, res, next){
    try{
        const user = res.locals.user;
        const { username } = req.params;
        if(!(user && (user.isAdmin || user.username === username))){
            throw new UnauthorizedError("Must be correct user or admin");
        }
    }
    catch(err){
        return next(err);
    }
}

module.exports = {
    authenticateJWT,
    ensureLoggedIn,
    ensureCorrectUserOrAdmin
}