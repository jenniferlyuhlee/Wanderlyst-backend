"use strict";
/** Test functions to run before routes tests */

// Import db & models
const db = require("../config/db");
const User = require("../models/user");
const Itinerary = require("../models/itinerary");
const Place = require("../models/place");
const Tag = require("../models/tag");
const { createToken } = require("../helpers/token");


let tag1, tag2, tag3;
let testItins = [];

async function commonBeforeEach() {
    await db.query("BEGIN");
    await db.query("DELETE FROM users");
    await db.query("DELETE FROM itineraries");
    await db.query("DELETE FROM tags");

    // insert test user data
    await User.register({
        username: "u1",
        password: "password1",
        email: "u1@email.com",
        firstName: "u1f",
        lastName: "u1l"
    });
    await User.register({
        username: "u2",
        password: "password2",
        email: "u2@email.com",
        firstName: "u2f",
        lastName: "u2l"
    });

    // insert test itinerary data with associated places
    testItins[0] = await Itinerary.create({
        username: "u1",
        title: "testItin",
        duration: 3,
        city: "testCity",
        country: "testCountry",
        lat: 1.00000,
        lng: 1.00000,
        description: "testDesc"
    });
    
    // insert test place data
    const itinPlaces = await Place.addPlaces(testItins[0].id, [
        {
            itinId: testItins[0].id,
            name: "testPlace1",
            address: "testAddress1",
            lat: 1.000000,
            lng: 1.000000,
            seq: 1, 
            description: "testDesc1",
            image: "image.png"
        },
        {
            itinId: 1,
            name: "testPlace2",
            address: "testAddress2",
            lat: 2.000000,
            lng: 2.000000,
            seq: 2, 
            description: "testDesc2",
            image: "image.png"
        }
    ]);

    // insert test tag data
    tag1 = await Tag.add({name: 'testTag1', description: 'testDescription1'});
    tag2 = await Tag.add({name: 'testTag2', description: 'testDescription2'});
    tag3 = await Tag.add({name: 'testTag3', description: 'testDescription3'});

    // associate tag with itinerary
    await Itinerary.addTags(testItins[0].id, [tag1.id, tag2.id, tag3.id])
}
  
async function commonAfterEach() {
    await db.query("ROLLBACK");
}
  
async function commonAfterAll() {
    await db.end();
}

    const u1Token = createToken({username: "u1", isAdmin: false});
    const u2Token = createToken({username: "u2", isAdmin: false});
    const adminToken = createToken({username: "admin", isAdmin: true});


module.exports = {
    commonBeforeEach,
    commonAfterEach,
    commonAfterAll,
    tag1, tag2, tag3, testItins,
    u1Token, u2Token, adminToken
};