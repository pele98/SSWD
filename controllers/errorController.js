const httpStatus = require('http-status-codes');

exports.logErrors = (error, req, res, next) => {
    console.error(error.stack);
    next(error);
}

exports.errorNoResourceFound = (req, res) => {
    let errorCode = httpStatus.NOT_FOUND;
    res.status(errorCode);
    res.render(`./errors/${errorCode}`);
};

exports.errorInternal = (req, res) => {
    let errorCode = httpStatus.INTERNAL_SERVER_ERROR;
    console.log(`ERROR occurred: ${error.stack}`)
    res.status(errorCode);
    res.render(`./errors/${errorCode}`);
};