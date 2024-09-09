"use strict";
/** Routes for tags */

const express = require("express");
const router = new express.Router();
const Tag = require("../models/tag");

/** GET/:name => {tag}
 * Returns tag obj {name, description, itineraries: [{itin}, {itin}]}
 *      where itineraries is an array of objects holding itinerary data
 * Authorization required: logged in users
 */
router.get("/:name", async function(req, res, next){
    try{
        const tag = await Tag.get(req.params.name);
        return res.json({ tag })
    }
    catch(err){
        return next(err);
    }
});

module.exports = router;
