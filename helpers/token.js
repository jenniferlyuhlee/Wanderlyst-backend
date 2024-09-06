"use strict";

const jwt = require("jsonwebtoken")
const { SECRET_KEY } = require("../config")

/** Helper function to create and return signed JWT from user data.
 * @params user
 * @returns token string
 * Payload = username, isAdmin
 */
function createToken(user){
    const payload = {
        username: user.username,
        isAdmin: user.isAdmin || false
    };

    return jwt.sign(payload, SECRET_KEY);
}

module.exports = { createToken };