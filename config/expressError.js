"use strict";
/** ExpressError class extends normal error.
 *  Error-handling middleware will return appropriate error instances.
 */

class ExpressError extends Error{
    constructor(message, status){
        super();
        this.message = message;
        this.status = status;
    }
}

/** 404 NOT FOUND error */
class NotFoundError extends ExpressError{
    constructor(message = "Request not found"){
        super(message, 404);
    }
}

/** 400 BAD REQUEST error */
class BadRequestError extends ExpressError{
    constructor(message = "Bad request"){
        super(message, 400);
    }
}

/** 401 UNAUTHORIZED error */
class UnauthorizedError extends ExpressError{
    constructor(message = "Unauthorized request"){
        super(message, 401);
    }
}

/** 403 ForbiddenError error */
class ForbiddenError extends ExpressError{
    constructor(message = "Forbidden request"){
        super(message, 403)
    }
}

/** 422 Unprocessable error */
class UnprocessableError extends ExpressError{
    constructor(message = "Inputted content could not be processed"){
        super(message, 422)
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