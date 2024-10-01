"use strict";
/** Routes for itineraries */

const express = require("express");
const router = new express.Router();

// Middleware
const { ensureLoggedIn, ensureCorrectUserOrAdmin } = require("../middleware/auth");

// Schemas for Data Validation
const jsonschema = require("jsonschema");
const itinCreateSchema = require("../schemas/itinCreate.json");
const itinSearchSchema = require("../schemas/itinSearch.json")

// Model & Error imports
const Itinerary = require("../models/itinerary");
const Place = require("../models/place");
const { BadRequestError } = require("../config/expressError");

// Utility functions
const { toMapData } = require("../utils/maps");
const { getCoords, updatePlacesWithCoords } = require("../utils/geocode");
// const { geocode } = require("@googlemaps/google-maps-services-js/dist/geocode/geocode");
// const { promises } = require("supertest/lib/test");


/** POST / {itinerary} => {itinerary} 
 * Returns obj with newly inserted itinerary data
 * Authorization required: logged in users
*/
router.post("/", ensureLoggedIn, async function (req, res, next){
    let itinerary;
    try{
        // validate req.body data
        const validator = jsonschema.validate(req.body, itinCreateSchema);
        if(!validator.valid){
            const errs = validator.errors.map(e => e.stack);
            throw new BadRequestError(errs);
        }

        let { title, duration, city, country, description, tags, places } = req.body;
        let username = res.locals.user.username;
        duration = +duration;

        // returns {lat, lng}
        const { lat, lng } = await getCoords(`${city}, ${country}`)
        // 1: Create itinerary 
        itinerary = await Itinerary.create(
            {username, title, duration, city, country, lat, lng, description}
        );

        // 2: Add tags to itinerary if provided
        if (tags.length > 0) await Itinerary.addTags(itinerary.id, tags);
        
        // 3: Add places to itinerary if present, include lat/lng with geocode func
        if (places.length > 0){
            const updatedPlaces = await updatePlacesWithCoords(places);
            await Place.addPlaces(itinerary.id, updatedPlaces);
        }

        return res.status(201).json({ itinerary })
    }
    catch(err){
        // ensures that places data successfully passed into db
        // if error is caught from server (external API or db insertion error in Places table)
        // if not, cancels entire db insertion to clean up 
        // deletes from itineraries table and its associations (itin_tags) if created
        if(itinerary){
            await Itinerary.delete(itinerary.id);
        }
        return next(err);
    }
});


/** DELETE /:id => {itinerary}
 * Returns { deleted: id }
 * Authorization required: matching user or admin
 */
router.delete("/:id/:username", ensureCorrectUserOrAdmin, async function (req, res, next){
    try{
        await Itinerary.delete(+req.params.id, req.params.username);
        return res.json({
            deleted: +req.params.id, 
            user: req.params.username
        });
    }
    catch(err){
        return next(err);
    }
});


/** GET /itineraries => {itineraries: [{itinerary}]}
 * Can filter on provided search filters: 
 * - title (will find case-insensitive, partial matches)
 * - country (will find case-insensitive, partial matches)
 * - duration
 * - tag
 * 
 * Authorization required: logged in users
*/
router.get("/", ensureLoggedIn, async function (req, res, next){
    const q = req.query;
    // convert string query to integer
    if (q.duration) q.duration = +q.duration;

    try{
        const validator = jsonschema.validate(q, itinSearchSchema);
        if (!validator.valid){
            const errs = validator.errors.map(e => e.stack);
            throw new BadRequestError(errs);
        }

        const itineraries = await Itinerary.getAll(q)
        return res.json({ itineraries });
    }
    catch(err){
        return next(err);
    }
});


/** GET /:id => {itinerary}
* Returns obj with itinerary data
* Authorization required: logged in users
*/
router.get("/:id", ensureLoggedIn, async function(req, res, next){
   try{
       const itinerary = await Itinerary.get(req.params.id);
       return res.json({itinerary});
   }
   catch(err){
       return next(err);
   }
});

module.exports = router;
