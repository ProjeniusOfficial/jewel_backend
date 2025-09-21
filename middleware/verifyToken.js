// middleware/verifyToken.js

const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (authHeader) {
        const token = authHeader.split(" ")[1]; // Bearer TOKEN
        jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
            if (err) return res.status(403).json("Token is not valid!");
            req.user = user; // Attaches the user payload (id, role) to the request object
            next(); // Proceeds to the next function in the chain
        });
    } else {
        return res.status(401).json("You are not authenticated!");
    }
};

const verifyTokenAndAdmin = (req, res, next) => {
    verifyToken(req, res, () => {
        if (req.user.role === 'Admin') {
            next(); // If the user is an Admin, proceed
        } else {
            res.status(403).json("You are not allowed to do that!");
        }
    });
};

module.exports = { verifyToken, verifyTokenAndAdmin };