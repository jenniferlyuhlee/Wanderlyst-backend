"use strict";
/** Routes for users */

const express = require("express");
const router = new express.Router();

// Middleware
const { ensureLoggedIn, ensureCorrectUserOrAdmin } = require("../middleware/auth");

// Schemas for Data Validation
const jsonschema = require("jsonschema");
const userUpdateSchema = require("../schemas/userUpdate.json");

// Model & Error imports
const User = require("../models/user");
const { BadRequestError } = require("../config/expressError");

/** GET/:username => {user}
 * Returns {username, email, firstName, lastName, location,
 * bio, profilePic, createdAt, isAdmin, itineraries, likes }
 *      where itineraries is [{itin}, {itin}]
 *      and likes is [{itin}, {itin}]
 * Authorization required: logged in users
 */
router.get("/:username", ensureLoggedIn, async function(req, res, next){
    try{
        const user = await User.get(req.params.username);
        return res.json({ user })
    }
    catch(err){
        return next(err);
    }
});


/** PATCH/:username {user} => {user}
 * Data can include {username, password, firstName, lastName, location, bio, profilePic}
 * Authorization required: matching user or admin
*/
router.patch("/:username", ensureCorrectUserOrAdmin, async function(req, res, next){
    try{
        // validating header data to prevent updating admin status
        const forbiddenFields = ["isAdmin", "is_admin"]
        forbiddenFields.forEach(field => {
            if(req.body.hasOwnProperty(field)){
                throw new BadRequestError(`Update not allowed for field: ${field}`)
            }
        });
        
        const validator = jsonschema.validate(req.body, userUpdateSchema);
        if(!validator.valid){
            const errs = validator.errors.map(e => e.stack);
            throw new BadRequestError(errs)
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
router.delete("/:username", ensureCorrectUserOrAdmin, async function(req, res, next){
    try{
        await User.delete(req.params.username);
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
router.post("/:username/like/:id", ensureCorrectUserOrAdmin, async function(req, res, next){
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


