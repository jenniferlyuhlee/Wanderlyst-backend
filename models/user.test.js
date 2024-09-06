"use strict";
/** Tests for User model */

const db = require("../db");
const User = require("./user")
const { NotFoundError, 
    BadRequestError, 
    UnauthorizedError
} = require ("../expressError");
const {
    commonBeforeAll,
    commonBeforeEach,
    commonAfterEach,
    commonAfterAll,
} = require("./_testCommon");

// Common test functions
beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

/** User.authenticate ---------- */
describe("authenticate", () => {
    test("works as expected", async () => {
        const user = await User.authenticate("u1", "password1");
        expect(user).toEqual({
            username: "u1",
            firstName: "u1f",
            lastName: "u1l",
            email: "u1@email.com",
            isAdmin: false,
        });
    });
    test("unauth error if no such user", async () => {
        try {
          await User.authenticate("fakeuser", "fakepassword");
        } catch (err) {
          expect(err instanceof UnauthorizedError).toBeTruthy();
        }
    });
    test("unauth error if nonexisting username", async () => {
        try{
            await User.authenticate("user1", "password");
        } catch(err){
            expect(err instanceof UnauthorizedError).toBeTruthy();
        }
    });
    test("unauth error if wrong password", async () => {
        try{
            await User.authenticate("u1", "wrongpw");
        } catch(err){
            expect(err instanceof UnauthorizedError).toBeTruthy();
        }
    });
});

/** User.register ---------- */
describe("register", () => {
    const newUserData = {
        username: "u3",
        password: "password3",
        email: "u3@email.com",
        firstName: "u3f",
        lastName: "u3l"
    };

    test("works as expected", async () => {
        const user = await User.register(newUserData);
        expect(user).toEqual({
            username: "u3",
            firstName: "u3f",
            lastName: "u3l",
            email: "u3@email.com",
            isAdmin: false,
        });

        const found = await db.query(`SELECT * FROM users 
                                    WHERE username = 'u3'`)
        expect(found.rows.length).toEqual(1);
        expect(found.rows[0].is_admin).toEqual(false);
        expect(found.rows[0].password.startsWith("$2b$")).toEqual(true);
        
    });
    test("bad request error with duplicate data", async() => {
        try{
            await User.register(newUserData);
            await User.register(newUserData);
        } catch(err){
            expect(err instanceof BadRequestError).toBeTruthy();
        }
    });
});

/** User.get ---------- */
describe("get", () => {
    test("works as expected", async () => {
        // add like to see in likes array
        await User.toggleLike("u2", 1);
        const user = await User.get("u2");
        expect(user).toEqual({
            username: "u2",
            email: "u2@email.com",
            firstName: "u2f",
            lastName: "u2l",
            bio: null,
            location: null,
            profilePic: null,
            isAdmin: true,
            createdAt: expect.any(Date),
            itineraries: [],
            likes: [
                {
                    id: 1,
                    username: "u1",
                    title: "testItin",
                    duration: 3,
                    city: 'testCity', 
                    country: 'testCountry'
                }
            ]
        });
    });
    test("not found error if user doesn't exist", async () => {
        try{
            await User.get("u4");
        }catch(err){
            expect(err instanceof NotFoundError).toBeTruthy();
        }
    });
});

/** User.update ---------- */
describe("update", () => {
    const updateData = {
        password: "newpassword",
        firstName: "u1Newf",
        lastName: "u1Newl",
        location: "New Location"
    };
    test("works as expected", async () => {
        const updatedUser = await User.update("u1", updateData);
        expect(updatedUser).toEqual({
            username: "u1",
            email: "u1@email.com",
            firstName: "u1Newf",
            lastName: "u1Newl",
            bio: null,
            location: "New Location",
            profilePic: null,
            isAdmin: false,
        });

        // check new password hashing
        const found = await db.query("SELECT password FROM users WHERE username = 'u1'")
        expect(found.rows[0].password.startsWith("$2b$")).toEqual(true);
    });
    test("not found error is user doesn't exist", async () => {
        try{
            await User.update("fakeUser", {firstName: "test"});
        }
        catch(err){
            expect(err instanceof NotFoundError).toBeTruthy();
        }
    });
    test("bad request if no data", async () => {
        try{
            await User.update("u2", {});
        }catch(err){
            expect(err instanceof BadRequestError).toBeTruthy();
        }
    });
});

/** User.delete ---------- */
describe("delete", () => {
    test("works as expected", async () => {
        await User.delete("u1");
        const res = await db.query(`SELECT * FROM users
                                    WHERE username = 'u1'`);
        expect(res.rows.length).toEqual(0);
    });
    test("not found error if user doesn't exist", async () => {
        try{
            await User.delete("u1");
        }catch(err){
            expect(err instanceof NotFoundError).toBeTruthy();
        }
    });
});

/** User.toggleLike ---------- */
describe("toggleLike", () => {
    test("toggling works as expected", async () => {
        // like itin 1
        await User.toggleLike("u2", 1);
        const res1 = await db.query("SELECT * FROM likes WHERE username = 'u2'");
        expect(res1.rows[0]).toEqual({
            itin_id: 1,
            username: "u2"
        });

        // unlike itin 1
        await User.toggleLike("u2", 1);
        const res2 = await db.query("SELECT * FROM likes WHERE username = 'u2'");
        expect(res2.rows.length).toEqual(0);
    });
    test("not found error if user doesn't exist", async () => {
        try{
            await User.toggleLike("u4", 1);
        }catch(err){
            expect(err instanceof NotFoundError).toBeTruthy();
        }
    });
    test("not found error if itinerary doesn't exist", async () => {
        try{
            await User.toggleLike("u2", 2);
        }catch(err){
            expect(err instanceof NotFoundError).toBeTruthy();
        }
    });
});