"use strict";
/** Routes for itineraries */

const express = require("express");
const router = new express.Router();

// Schemas for Data Validation
const jsonschema = require("jsonschema");
const itinCreateSchema = require("../schemas/itinCreate.json");

// Model & Error imports
const Itinerary = require("../models/itinerary");
const { BadRequestError } = require("../expressError");


/** POST/ {itinerary} => {itinerary} 
 * Returns obj with newly inserted itinerary data
 * Authorization required: logged in users
*/
router.post("/", async function (req, res, next){
    try{
        const validator = jsonschema.validate(req.body, itinCreateSchema);
        if(!validator.valid){
            const errs = validator.errors.map(e => e.stack);
            throw new BadRequestError(errs);
        }
        const itinerary = await Itinerary.create(req.body);
        return res.status(201).json({ itinerary })
    }
    catch(err){
        return next(err);
    }
});

/** GET/:id => {itinerary}
* Returns obj with itinerary data
* Authorization required: logged in users
*/
router.get("/:id", async function(req, res, next){
   try{
       const tag = await Itinerary.get(req.params.username);
       return res.json({ tag })
   }
   catch(err){
       return next(err);
   }
});

module.exports = router;
