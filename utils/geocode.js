"use strict";
/** Utility func getCoords */

const { Client } = require("@googlemaps/google-maps-services-js");
const client = new Client({});
const { API_KEY } = require("../config/config");
const { UnprocessableError, BadRequestError }= require("../config/expressError")

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
            throw new UnprocessableError(`Input error: ${res.data.status}`);
        };
        // else return coordinates
        return res.data.results[0].geometry.location;
    }
    catch(err){
        throw new BadRequestError(`Error fetching coordinates: invalid city/country.`);
    }
}

/** Modified list of places data to include lat, lng based on address
 * calls the geocode helper function
 * @param {Array} places - Array of place objects
 * @returns {Array} - Array of place objects w/ lat, lng 
 */
async function updatePlacesWithCoords(places){
    try{
        const updatedPlaces = await Promise.all(
            places.map(async (p) => {
                let { lat, lng } = await getCoords(p.address);
                return {...p, lat, lng};
            })
        );
        return updatedPlaces;
    }
    catch(err){
        throw new BadRequestError(`Error fetching coordinates: invalid place address.`, err);
    }

}

module.exports = { getCoords , updatePlacesWithCoords};

