const jwt = require('jsonwebtoken');
const HttpError = require('../models/errorModel');

const authMiddleware = async (req, res, next) => {
    const authorization = req.headers.authorization || req.headers.Authorization;

    if (authorization && authorization.startsWith("Bearer")) {
        const token = authorization.split(' ')[1]
        
        jwt.verify(token, process.env.JWT_SECRET, (err, info) => {
            if (err) {
                return next(new HttpError("Unauthorized. Invalid token", 403));
            }
            
            req.user = info;
            next()
        });
    } else {
        return next(new HttpError("Unauthorized. No token provided", 401));
    }
};

module.exports = authMiddleware
