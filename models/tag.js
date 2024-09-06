"use strict";
/** Tag Model */

const db = require("../db");
const { NotFoundError } = require("../expressError");

//** Class Tag with db query method for all tags. */
class Tag{

    /** Fetches details about tag
     * Returns tag obj {name, description, itineraries: [{itin}, {itin}]}
     * where itineraries is an array of objects holding itinerary data
     * Throws NotFoundError if tag not found
     */
    static async get(name){
        // Query 1 to get tag details once
        const tagResult = await db.query(
                `SELECT name, description
                FROM tags
                WHERE name = $1`, [name]
        );
        const tag = tagResult.rows[0];
        if(!tag) throw new NotFoundError(`Tag doesn't exist: ${name}`);

        // Query 2 to get itineraries with the tag
        const itinsResult = await db.query(
                `SELECT i.id, i.username, i.title, i.duration, i.city, i.country
                FROM itineraries as i
                LEFT JOIN itin_tags as it
                ON i.id = it.itin_id
                LEFT JOIN 
                ON it.tag_id = t.id
                WHERE t.name = $1`, [name]
        );

        tag.itineraries = itinsResult.rows.map(r => ({
            id: r.id,
            username: r.username,
            title: r.title,
            duration: r.duration,
            city: r.city, 
            country: r.country
        }));

        return tag;
    }
}

module.exports = Tag;