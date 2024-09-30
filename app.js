"use strict";
/** Express app for WanderLyst */

const express = require("express");
const cors = require("cors");

const { NotFoundError } = require("./config/expressError");
const { authenticateJWT } = require("./middleware/auth")

// routing variables
const authRoutes = require("./routes/auth");
const usersRoutes = require("./routes/users");
const tagRoutes = require("./routes/tags");
const itinRoutes = require("./routes/itineraries");

const app = express();
app.use(cors())
app.use(express.json())
// app.use morgan?
app.use(authenticateJWT);

/** Routes */
app.use("/auth", authRoutes);
app.use("/users", usersRoutes);
app.use("/tags", tagRoutes);
app.use("/itineraries", itinRoutes);



/** 404 Error Handler */
app.use(function (req, res, next) {
    return next(new NotFoundError());
});

/** General Error Handler */
app.use(function (err, req, res, next){
    // Default status is 500 Internal Server Error
    const status = err.status || 500;
    const message = err.message
    
    return res.status(status).json({
        error: {message, status}
    });
});


module.exports = app;