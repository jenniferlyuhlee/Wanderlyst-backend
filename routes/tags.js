"use strict";
/** Routes for tags */

const express = require("express");
const router = new express.Router();
const Tag = require("../models/tag");
const { ensureLoggedIn } = require("../middleware/auth")

/** GET / => {tags}
 * Returns list of all tags by name
 * Authorization required: logged in users
*/
router.get("/", ensureLoggedIn, async function(req, res, next){
    try{
        const tags = await Tag.getAll();
        return res.json({tags})
    }
    catch(err){
        return next(err);
    }
});


/** GET /:name => {tag}
 * Returns tag obj {name, description, itineraries: [{itin}, {itin}]}
 *      where itineraries is an array of objects holding itinerary data
 * Authorization required: logged in users
 */
router.get("/:name", ensureLoggedIn, async function(req, res, next){
    try{
        const tag = await Tag.get(req.params.name);
        return res.json({ tag })
    }
    catch(err){
        return next(err);
    }
});

module.exports = router;
