"use strict";
/** Test functions to run before tests */

const bcrypt = require("bcrypt");
const db = require("../db");
const { BCRYPT_WORK_FACTOR } = require("../config");

async function commonBeforeAll(){
    await db.query("DELETE FROM users");
    await db.query("DELETE FROM itineraries");
    await db.query("DELETE FROM tags");
  
    // insert test user data
    await db.query(`
        INSERT INTO USERS(username, 
                            password,
                            email,
                            first_name,
                            last_name,
                            is_admin)
        VALUES ('u1', $1,  'u1@email.com', 'u1f', 'u1l', false),
            ('u2', $2, 'u2@email.com', 'u2f', 'u2l', true)
        RETURNING username`,
        [await bcrypt.hash("password1", BCRYPT_WORK_FACTOR),
        await bcrypt.hash("password2", BCRYPT_WORK_FACTOR)]
    );
    
    // insert test itinerary data
    await db.query(`
        INSERT INTO itineraries(id,
                                username,
                                title,
                                duration,
                                city,
                                country,
                                description)
        VALUES (1, 'u1', 'testItin', 3, 'testCity', 'testCountry','testDesc');
    `);
    
    // insert test tag data
    await db.query(`
        INSERT INTO tags(id, name, description)
        VALUES (1, 'testTag1', 'testDescription1')`)
    // associate with itinerary
    await db.query(`
        INSERT INTO itin_tags(itin_id, tag_id)
        VALUES (1, 1)`)
}

async function commonBeforeEach() {
    await db.query("BEGIN");
  }
  
  async function commonAfterEach() {
    await db.query("ROLLBACK");
  }
  
  async function commonAfterAll() {
    await db.end();
  }
  
  
module.exports = {
    commonBeforeAll,
    commonBeforeEach,
    commonAfterEach,
    commonAfterAll,
};