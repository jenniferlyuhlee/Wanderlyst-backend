"use strict";
/** Place Model */

const db = require("../config/db");
const {buildPlacesValuesClause} = require("../helpers/sqlHelper")
const { BadRequestError } = require("../config/expressError");

/** Class Place with db query methods for all places. */
class Place{

    /** Adds new location entry
     * Returns place obj
     */
    static async add({itinId, name, address, lat, lng, seq, description, image}){
        const result = await db.query(
            `INSERT INTO places
                (itin_id,
                name, 
                address,
                lat,
                lng,
                seq,
                description,
                image)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
            RETURNING itin_id AS "itinId", name, address, 
                    lat, lng, seq, description, image`,
            [itinId, name, address, lat, lng, seq, description, image]
        );
        const place = result.rows[0];
        return place;
    };

    /** Adds new location entries all at once
     * Accepts array of place objs
     */
    static async addPlaces(itinId, places){
        const { values, placeholders } = buildPlacesValuesClause(itinId, places);
        const query = `INSERT INTO places (itin_id, name, address, lat, lng, seq, description, image)
                        VALUES ${placeholders}
                        RETURNING id`;
        const results = await db.query(query, values);
        return results.rows.map(r => r.id)
    }

    /** Fetches details about all places in itinerary based on itin_id
     * Returns array of place obj [{name, address, lat, lng, seq, description, image},...]
     */
    static async getItinPlaces(itinId){
        const results = await db.query(
            `SELECT 
                name, address, lat, lng,
                seq, description, image
            FROM places
            WHERE itin_id = $1`, [itinId]
        );
        return results.rows;
    }
}

module.exports = Place;