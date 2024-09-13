"use strict";
/** Utility func getCoords */

const { Client } = require("@googlemaps/google-maps-services-js");
const client = new Client({});
const { API_KEY } = require("../config/config");
const { UnprocessableError }= require("../config/expressError")

/** Fetches coordinates based on address sent to Google Geocoding API
 * @param {String} address   
 * @returns {Object} {lat, lng}
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


/** Modified list of places data to include lat, lng based on address
 * calls the geocode helper function
 * @param {Array} places - Array of place objects
 * @returns {Array} - Array of place objects w/ lat, lng 
 */
async function updatePlacesWithCoords(places){
    const updatedPlaces = await Promise.all(
        places.map(async (p) => {
            let { lat, lng } = await getCoords(p.address);
            return {...p, lat, lng};
        })
    );
    return updatedPlaces;
}

module.exports = { getCoords , updatePlacesWithCoords};

// (async () => {
//     const address = 'Paris, France';
//     const coords = await getCoords(address);
//     console.log(coords); // { latitude: 37.4224764, longitude: -122.0842499 }
// })();

