"use strict";
/** Utility func toMapData */

const { getCoords } = require("./geocode")

/** Converts itinerary object data into Google Maps API-compatible data
 * Returns {center: {lat, lng}, placeList: [name, address, {coordinates}]}
 */
async function toMapData(itinerary){
    try{
        const area = `${itinerary.city}, ${itinerary.country}`;
        // returns {lat, lng}
        const center = await getCoords(area)

        const placeList = itinerary.places.map(p => (
            {
                name: p.name,
                address: p.address,
                coordinates: {lat: p.lat, lng: p.lng}  
            }
        ))
        return { center, placeList }
    }
    catch(err){
        console.error(`Error creating map data: ${err.message}`);
    }

}

module.exports = { toMapData };