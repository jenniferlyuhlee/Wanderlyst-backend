"use strict";
/** Tag Model */

const db = require("../config/db");
const { NotFoundError } = require("../config/expressError");

//** Class Tag with db query method for all tags. */
class Tag{

    /** Adds new tag
     * Returns tag obj
     */
    static async add({name, description}){
        const result = await db.query(`
            INSERT INTO tags (name, description)
            VALUES ($1, $2)
            RETURNING id`, [name, description]
        );
        const tag = result.rows[0];
        return tag;
    }

    /** Fetches all tags
     * Returns tags: [{tag}, {tag}] 
     * where tags is an array of tag names
     */
    static async getAll(){
        const results = await db.query(`
            SELECT name
            FROM tags
        `);
        const tags = results.rows.map(r => r.name);
        return tags;
    }

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
                LEFT JOIN tags as t
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