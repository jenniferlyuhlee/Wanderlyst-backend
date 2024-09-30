"use strict";
/** Itinerary Model */

const db = require("../config/db");
const { NotFoundError, 
    BadRequestError } = require("../config/expressError");
const { sqlForPartialUpdate, buildTagsValuesClause } = require("../helpers/sqlHelper");
const Place = require("./place") 

//** Class Itinerary with db query method for all tags. */
class Itinerary{

    /** Creates new itinerary
     * Returns itin obj {id, username, title, duration, city, country, description created_at, 
     * tags: [{tag}, {tag}]}
     */
    static async create({username, title, duration, 
                        city, country, lat, lng, description}){
        const result = await db.query(
            `INSERT INTO itineraries 
                (username,
                title, 
                duration, 
                city,
                country,
                lat,
                lng,
                description)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
             RETURNING id, username, title, duration, 
                            city, country, lat, lng, 
                            description, created_at AS "createdAt"`,
            [username, title, duration, city, country, lat, lng, description]
        );
        const itinerary = result.rows[0];
        return itinerary;
    }

    /** Given an id, deletes itinerary from database.
     * Returns itinerary obj {id}
     * Throws NotFoundError if user not found.
     */
    static async delete(id, username){
        let result = await db.query(
            `DELETE FROM itineraries
            WHERE id = $1
            AND username = $2
            RETURNING id`, [id, username]
        );
        const itinerary = result.rows[0];
        
        if(!itinerary) throw new NotFoundError(`Itinerary with id ${id} doesn't exist`);
        
        return itinerary;
    }


    /** Fetches all itineraries (opetional filter on searchFilters) 
     * searchFilters (optional):
     * - title (will find case-insensitive, partial matches)
     * - country (will find case-insensitive, partial matches)
     * - duration
     * - tagS
     * Returns [{id, username, title, duration, city, country}]
    */
   static async getAll(searchFilters = {}){
    let query = `SELECT DISTINCT i.id, i.username, i.title, i.duration, i.city, i.country, i.description
                FROM itineraries as i`;
    let whereExpressions = [];
    let queryValues = [];

    const { title, country, duration, tags } = searchFilters;

    // Throw an error if invalid duration
    if(duration <= 0) throw new BadRequestError("Duration must be greater than 0");

    // For each possible search term, add to whereExpressions and queryValues so
    // we can generate the right SQL
    if(tags !== undefined && tags.length > 0){
        query += ` LEFT JOIN itin_tags as it ON i.id = it.itin_id
                  LEFT JOIN tags as t ON it.tag_id = t.id`;
    
        queryValues.push(...tags)
        let tagConditions = tags.map((tag, i) => `t.name = $${queryValues.length - tags.length + i + 1}`)
        whereExpressions.push(`(${tagConditions.join(" OR ")})`);
    }
    if(country !== undefined){
        queryValues.push(`%${country}%`);
        whereExpressions.push(`i.country ILIKE $${queryValues.length}`);
    }
    if(duration !== undefined){
        queryValues.push(+duration);
        whereExpressions.push(`i.duration <= $${queryValues.length}`);
    }
    if(title !== undefined){
        queryValues.push(`%${title}%`);
        whereExpressions.push(`i.title ILIKE $${queryValues.length}`);
    }
    // build final WHERE clause if filters passed
    if(whereExpressions.length > 0){
        query += " WHERE " + whereExpressions.join(" AND ");
    }

    // Finalize query to return results
    const itinerariesRes = await db.query(query, queryValues);
    return itinerariesRes.rows;
   }

    /** Fetches details about itinerary
    * Returns itin obj {id, username, title, duration, city, country, created_at, tags: [{tag}, {tag}], likes
    *       where tags is an array of objects holding tag data
    *       likes displays a count
    * Throws NotFoundError if itinerary not found
    */
   static async get(id){
        const result = await db.query(
            `SELECT i.id, i.username, i.title, i.duration, i.city, i.country, 
                    i.lat, i.lng, i.description, i.created_at AS "createdAt",
                    array_agg(t.name) AS tags,
                    (SELECT COUNT(*) FROM likes l WHERE l.itin_id = i.id) AS likes
            FROM itineraries AS i
            LEFT JOIN itin_tags AS it
            ON i.id = it.itin_id
            LEFT JOIN tags AS t
            ON it.tag_id = t.id
            LEFT JOIN likes AS l
            ON i.id = l.itin_id
            WHERE i.id = $1
            GROUP BY i.id`, [id]
        );
        const itinerary = result.rows[0];
        if(!itinerary) throw new NotFoundError(`Itinerary with id ${id} doesn't exist`);

        const places = await Place.getItinPlaces(id);
        itinerary.places = places;
        
        return itinerary;
   };

   static async addTags(id, tags){
        // helps create clause to insert multiple tags in 1 query
        const { values, placeholders } = buildTagsValuesClause(id, tags);
        const query = `INSERT INTO itin_tags (itin_id, tag_id)
                       VALUES ${placeholders}
                       RETURNING tag_id AS "tagId"`;
        
        const result = await db.query(query, values);
        return result.rows;
   };

}

module.exports = Itinerary;