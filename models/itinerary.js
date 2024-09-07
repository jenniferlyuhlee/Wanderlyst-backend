"use strict";
/** Itinerary Model */

const db = require("../config/db");
const { NotFoundError, 
    BadRequestError } = require("../config/expressError");
const { sqlForPartialUpdate } = require("../helpers/updateQueries");

//** Class Itinerary with db query method for all tags. */
class Itinerary{

    /** Creates new itinerary
     * Returns itin obj {id, username, title, duration, city, country, description created_at, 
     * tags: [{tag}, {tag}]}
     */
    static async create({username, title, duration, city, country, description}){
        const result = await db.query(
            `INSERT INTO itineraries 
                (username,
                title, 
                duration, 
                city,
                country,
                description)
             VALUES ($1, $2, $3, $4, $5, $6)
             RETURNING username, title, 
                        duration, city, country, description created_at
                first_name AS "firstName",
                last_name AS "lastName",
                is_admin AS "isAdmin"`,
            [username, title, duration, city, country, description]
        );
        const itinerary = result.rows[0];
        return itinerary;
    }

    /** Updates user data through partial update (only fields provided); 
     * Data can include {title, duration, city, country, description}
     * Returns {username, title, duration, city, country, description}
     * Throws NotFoundError if itinerary not found
    */
//    static async update(id, data){

//    }


    /** Fetches details about itinerary
    * Returns itin obj {id, username, title, duration, city, country, created_at, tags: [{tag}, {tag}], likes
    *       where tags is an array of objects holding tag data
    *       likes displays a count
    * Throws NotFoundError if itinerary not found
    */
   static async get(id){
        // // Query 1 to get itinerary details
        // const itinResult = await db.query(
        //     `SELECT id, username, title, 
        //             duration, city, country, 
        //             description, created_at AS "createdAt"
        //     FROM itineraries
        //     WHERE id = $1 `, [id]
        // );
        // const itinerary = itinResult.rows[0];
        // if(!itinerary) throw new NotFoundError(`Itinerary with id ${id} doesn't exist`);

        // // Query 2 to get tags of itinerary
        // const tagsResult = await db.query(
        //     `SELECT name
        //     FROM tags as t
        //     LEFT JOIN itin_tags as it
        //     ON t.id = it.tag_id
        //     WHERE it.id = $1`, [id]
        // );
        // itinerary.tags = tagsResult.rows.map(t => t.name);

        // // Query 3 to get itinerary likes
        // const likesResult = await db.query(
        //     `SELECT COUNT(*)
        //     FROM likes
        //     WHERE itin_id = $1`, [id]
        // )
        // itinerary.likes - likesResult.rows[0]
        const result = await db.query(
            `SELECT i.id, i.username, i.title, i.duration, i.city, 
                    i.country, i.description, i.created_at AS "createdAt,
                    array_agg(t.name) AS tags,
                    COUNT(l.itin_id) AS likes
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

        return itinerary;
   }
}

module.exports = Itinerary;