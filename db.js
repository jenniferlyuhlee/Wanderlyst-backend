"use strict";
/** Database setup for WanderLyst */

const { Client } = require("pg");
const { getDatabaseURI } = require("./config")

let DB_URI = getDatabaseURI();

let db = new Client({
    connectionString: DB_URI
});

db.connect();

module.exports = db;