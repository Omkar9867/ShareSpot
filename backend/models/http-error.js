class HttpError extends Error{
    constructor(message, errorcode) {
        super(message) //Will add message property
        this.code = errorcode
    }
}

module.exports = HttpError