"use strict";
/** Server startup for WanderLyst */

const app = require("./app");

app.listen(3001, function (){
    console.log('Server starting on port 3001');
});