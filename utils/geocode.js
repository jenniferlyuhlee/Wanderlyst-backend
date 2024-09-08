"use strict";
/** Utility func getCoords */

const { Client } = require("@googlemaps/google-maps-services-js");
const client = new Client({});
const { API_KEY } = require("../config/config");
const { UnprocessableError }= require("../config/expressError")

/** Fetches coordinates based on address sent to Google Geocoding API
 * Returns {lat, lng}
*/
async function getCoords(address) {
    try{
        const res = await client.geocode({
            params:{
                address: address,
                key: API_KEY
            },
            timeout:1000
        });
        // if API doesn't return coordinates
        if (res.data.status !== "OK"){
            throw new UnprocessableError(`Input error: ${res.data.status}`)
        };
        return res.data.results[0].geometry.location;
    }
    catch(err){
        console.error(`Error fetching coordinates: ${err.message}`);
    }
}
// run "node utils/geocode.js"
// console.log(API_KEY)

module.exports = { getCoords };

// (async () => {
//     const address = '1600 Amphitheatre Parkway, Mountain View, CA';
//     const coords = await getCoords(address);
//     console.log(coords); // { latitude: 37.4224764, longitude: -122.0842499 }
// })();

