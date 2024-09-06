"use strict";
/** Routes for users */

const express = require("express");
const router = new express.Router();

// Schemas for Data Validation
const jsonschema = require("jsonschema");
const userUpdateSchema = require("../schemas/userUpdate.json");

// Model & Error imports
const User = require("../models/user");
const { BadRequestError } = require("../expressError");


/** GET/:username => {user}
 * Returns {username, firstName, lastName, email}
 * where itins is {----------------------}
 * Authorization required: logged in users
 */
router.get("/:username", async function(req, res, next){
    try{
        const user = await User.get(req.params.username);
        return res.json({ user })
    }
    catch(err){
        return next(err);
    }
});


/** PATCH/:username {user} => {user}
 * Data can include {firstName, lastName, password, location, bio, profilePic}
 * Authorization required: matching user or admin
*/
router.patch("/:username", async function(req, res, next){
    try{
        const validator = jsonschema.validate(req.body, userUpdateSchema);
        if(!validator.valid){
            const errs = validator.errors.map(e => e.stack);
            throw new BadRequestError(`"Fix inputs: ${errs}`)
        }
        const user = await User.update(req.params.username, req.body);
        return res.json({ user })
    }
    catch(err){
        return next(err);
    }
});


/** DELETE/:username => {user}
 * Returns { deleted: username }
 * Authorization required: matching user or admin
 */
router.delete("/:username", async function(req, res, next){
    try{
        await User.remove(req.params.username);
        return res.json({deleted: req.params.username});
    }
    catch(err){
        return next(err)
    }
});


/** POST /:username/likes/:id => { liked }
 * Toggles like/unlike for an itinerary
 * Returns { message: "liked" / "unliked", id}
 * Authorization required: matching user or admin
 */
router.post("/:username/like/:id", async function(req, res, next){
    try{
        const itinId = +req.params.id;
        const result = await User.toggleLike(req.params.username, itinId);
        return res.json({ message: result.message, id: itinId})
    }
    catch(err){
        return next(err);
    }
});

module.exports = router;


