"use strict";
/** ExpressError class extends normal error.
 *  Error-handling middleware will return appropriate error instances.
 */

class ExpressError extends Error{
    constructor(msg, status){
        super();
        this.msg = msg;
        this.status = status;
    }
}

/** 404 NOT FOUND error */
class NotFoundError extends ExpressError{
    constructor(msg = "Request not found"){
        super(msg, 404);
    }
}

/** 400 BAD REQUEST error */
class BadRequestError extends ExpressError{
    constructor(msg = "Bad request"){
        super(msg, 400);
    }
}

/** 401 UNAUTHORIZED error */
class UnauthorizedError extends ExpressError{
    constructor(msg = "Unauthorized request"){
        super(msg, 401);
    }
}

/** 403 ForbiddenError error */
class ForbiddenError extends ExpressError{
    constructor(msg = "Forbidden request"){
        super(msg, 403)
    }
}

/** 422 Unprocessable error */
class UnprocessableError extends ExpressError{
    constructor(msg = "Inputted content could not be processed"){
        super(msg, 422)
    }
}

module.exports = {
    ExpressError,
    NotFoundError,
    BadRequestError,
    UnauthorizedError,
    ForbiddenError,
    UnprocessableError
};