"use strict";
/** Shared config for WanderLyst */

require("dotenv").config();
require("colors");

// Retrieve environmental variables
const SECRET_KEY = process.env.SECRET_KEY;
const PORT = +process.env.PORT || 3001;
const API_KEY = process.env.API_KEY;

// Get db uri based on node environment - test or prod/dev
function getDatabaseURI(){
    return (process.env.NODE_ENV === "test") 
        ? "postgresql:///wanderlyst_test"
        : process.env.DATABASE_URI || "postgresql:///wanderlyst";
}

// Reduce work factor to speed up bcrypt in testing
// Algorithm security not being tested
const BCRYPT_WORK_FACTOR = process.env.NODE_ENV === "test" ? 1 : 12;

// Logging configurations
console.log("WanderLyst Config:".green);
console.log("PORT:".green, PORT.toString());
console.log("***********".green)

module.exports = {
    API_KEY,
    SECRET_KEY, 
    PORT, 
    BCRYPT_WORK_FACTOR,
    getDatabaseURI
};