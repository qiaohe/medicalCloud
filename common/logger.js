function logger() {
    function writeLog(req, res, next) {
        console.log(new Date(), req.method, req.url);
        return next();
    }
    return (writeLog);
}
module.exports = logger;