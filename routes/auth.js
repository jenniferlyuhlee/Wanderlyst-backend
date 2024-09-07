"use strict";
/** Routes for authentication */

const express = require("express");
const router = new express.Router();

// Schemas for data validation
const jsonschema = require("jsonschema");
const userRegisterSchema = require("../schemas/userRegister.json");
const userAuthSchema = require("../schemas/userAuth.json")

// Model, Error, & token imports
const User = require("../models/user");
const { BadRequestError } = require("../config/expressError");
const { createToken } = require("../helpers/token")


/** POST /login {username, password} => {token}
 * Returns JWT token to authenticate further requests
 * Authorization required: none
 */
router.post("/login", async function (req, res, next){
    try{
        const validator = jsonschema.validate(req.body, userAuthSchema);
        if(!validator.valid){
            const errs = validator.errors.map(e => e.stack);
            throw new BadRequestError(`Fix inputs: ${errs}`);
        }

        const {username, password} = req.body;
        const user = await User.authenticate(username, password);
        const token = createToken(user);
        return res.json({ token });
    }
    catch(err){
        return next(err);
    }
});


/** POST /signup {user} => {token}
 * User: {username, password, email, firstName, lastName}
 * Returns JWT token to authenticate further requests
 * Authorization required: none
 */
router.post("/signup", async function (req, res, next){
    try{
        const validator = jsonschema.validate(req.body, userRegisterSchema);
        if(!validator.valid){
            const errs = validator.errors.map(e => e.stack);
            throw new BadRequestError(`Fix inputs: ${errs}`);
        }
        const newUser = await User.register(req.body);
        const token = createToken(newUser);
        return res.status(201).json({token});
    }
    catch(err){
        return next(err);
    }
});

module.exports = router;