"use strict";
/** User Model */

const db = require("../config/db");
const bcrypt = require("bcrypt");

const {BCRYPT_WORK_FACTOR} = require("../config/config");
const { NotFoundError, 
        BadRequestError, 
        UnauthorizedError
} = require ("../config/expressError");
const { sqlForPartialUpdate } = require("../helpers/sqlHelper");

//** Class User with db query methods for all users. */
class User{

    /** Authenticates user username & password
     * Returns user obj {username, firstName, lastName, email, is_admin}
     * Throws UnauthorizedError is user not found or false credentials
     */
    static async authenticate(username, password){
        // find user info
        const result = await db.query(
            `SELECT username,
                    password,
                    first_name AS "firstName",
                    last_name AS "lastName",
                    email,
                    is_admin As "isAdmin"
             FROM users
             WHERE username = $1`, [username]
        );
        const user = result.rows[0];
        
        // compare hashed password to a new hash of password input
        if(user){
            const isValid = await bcrypt.compare(password, user.password);
            if (isValid === true){
                delete user.password;
                return user;
            }
        }

        throw new UnauthorizedError("Invalid username/password")
    }

    /** Registers user with data.
     * Returns user obj {username, firstName, lastName, email, isAdmin}
     * Throws BadRequestError on duplicate usernames
     */
    static async register({username, password, email, firstName, lastName}){
        const usernameCheck = await db.query(
            `SELECT username
             FROM users
             WHERE USERNAME = $1`, [username]
        );

        if (usernameCheck.rows[0]){
            throw new BadRequestError(`Username taken: ${username}`);
        }

        const hashedPassword = await bcrypt.hash(password, BCRYPT_WORK_FACTOR);
        
        const result = await db.query(
            `INSERT INTO users 
                (username, 
                password, 
                email,
                first_name,
                last_name)
             VALUES ($1, $2, $3, $4, $5)
             RETURNING username, email,
                first_name AS "firstName",
                last_name AS "lastName",
                is_admin AS "isAdmin"`,
            [username, hashedPassword, email, firstName, lastName]
        );
        const user = result.rows[0];
        return user;
    }

    /** Given a username, returns data about user.
     * Returns user obj {username, email, first_name, last_name, 
     *                  location, bio, profile_pic, created_at, is_admin
     *                  itineraries}
     *  where itineraries is []
     * Throws NotFoundError if user not found.
     */
    static async get(username){
        const result = await db.query(
            `SELECT username, 
                    email,
                    first_name AS "firstName",
                    last_name AS "lastName",
                    location, 
                    bio,
                    profile_pic AS "profilePic",
                    created_at AS "createdAt",
                    is_admin AS "isAdmin"
             FROM users
             WHERE username = $1`, [username]
        );
        
        const user = result.rows[0];
        if(!user) throw new NotFoundError(`User doesn't exist: ${username}`);

        // user itineraries and likes
        const [userItinsRes, userLikesRes] = await Promise.all([
            db.query(
                `SELECT i.id, i.title, i.duration, i.city, i.country
                FROM itineraries AS i
                WHERE i.username = $1`, [username]
            ),
            db.query(
                `SELECT i.id, i.username, i.title, i.duration, i.city, i.country
                FROM itineraries AS i
                JOIN likes AS l
                ON i.id = l.itin_id
                WHERE l.username = $1`, [username]
            )
        ]);

        user.itineraries = userItinsRes.rows.map(r => ({
            id: r.id,
            title: r.title,
            duration: r.duration,
            city: r.city, 
            country: r.country
        }));
        
        user.likes = userLikesRes.rows.map(r => ({
            id: r.id,
            username: r.username,
            title: r.title,
            duration: r.duration,
            city: r.city, 
            country: r.country
        }));

        return user;
    }

    /** Updates user data through partial update (only fields provided); 
     * Data can include {firstName, lastName, password, location, bio, profilePic}
     * Returns {username, firstName, lastName, email, location, bio, profilePic, isAdmin}
     * Throws NotFoundError if user not found.
    */
   static async update(username, data){
        if(data.password){
            data.password = await bcrypt.hash(data.password, BCRYPT_WORK_FACTOR);
        }
        
        const {setCols, values} = sqlForPartialUpdate(
            data,
            {
                firstName: "first_name",
                lastName: "last_name",
                profilePic: "profile_pic"
            }
        );

        const usernameVarIdx = "$" + (values.length+1);
        const querySql = `UPDATE users
                        SET ${setCols}
                        WHERE username = ${usernameVarIdx}
                        RETURNING username, email,
                                    is_admin AS "isAdmin",
                                    first_name AS "firstName",
                                    last_name AS "lastName",
                                    location,
                                    bio,
                                    profile_pic AS "profilePic"`;
        const result = await db.query(querySql, [...values, username]);
        const user = result.rows[0];

        if (!user) throw new NotFoundError(`User doesn't exist: ${username}`);
        delete user.password;
        return user;
   }

    /** Given a username, deletes given user from database.
     * Returns user obj {username}
     * Throws NotFoundError if user not found.
     */
    static async delete(username){
        let result = await db.query(
            `DELETE FROM users
            WHERE username = $1
            RETURNING username`, [username]
        );
        const user = result.rows[0];
        
        if(!user) throw new NotFoundError(`User doesn't exist: ${username}`);
        
        return user;
    }

    /** Given an itinerary id, adds or removes a user like
     * Returns { message, id}
     * Throws a NotFoundError if the user or itinerary does not exist
     */
    static async toggleLike(username, id){
        // checks if user exists
        // const userCheck = await db.query(
        //     `SELECT username
        //     FROM users
        //     WHERE username = $1`, [username]
        // )
        // if(!userCheck.rows[0]) throw new NotFoundError(`User doesn't exist: ${username}`);

        // checks if itinerary exists
        // const itinCheck = await db.query(
        //     `SELECT id 
        //     FROM itineraries
        //     WHERE id = $1`, [id]
        // );
        // if (!itinCheck.rows[0]) throw new NotFoundError(`Itinerary with id ${id} doesn't exist`)

        // checks if user already liked itinerary
        const likeCheck = await db.query(
            `SELECT username, itin_id AS "itinId"
            FROM likes 
            WHERE username = $1 AND itin_id = $2`, [username, id]
        );

        if(likeCheck.rows.length > 0) {
            // if like exists, removes from db "unlike"
            await db.query(
                `DELETE FROM likes
                WHERE username = $1 AND itin_id = $2`, [username, id]
            )
            return { message: "unliked"}
        }
        else{
            // if no like exists, adds to db "like"
            const result = await db.query(
                `INSERT INTO likes (username, itin_id)
                VALUES ($1, $2)`, [username, id]
            );
            return {message: "liked"}
        }
    }
}

module.exports = User;