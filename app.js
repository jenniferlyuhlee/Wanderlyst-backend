"use strict";
/** Express app for WanderLyst */

const express = require("express");

const { NotFoundError } = require("./config/expressError");
const { authenticateJWT } = require("./middleware/auth")

// routing variables
const authRoutes = require("./routes/auth");
const usersRoutes = require("./routes/users");
const tagRoutes = require("./routes/tags");
const itinRoutes = require("./routes/itineraries");

const app = express();

const cors = require("cors");
const allowedOrigins = ['http://localhost:5173', 'https://wanderlyst.onrender.com'];
app.use(cors({
    origin: function (origin, callback) {
        if (!origin || allowedOrigins.includes(origin)) {
          callback(null, true);
        } else {
          callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true
}));

app.use(express.json())
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