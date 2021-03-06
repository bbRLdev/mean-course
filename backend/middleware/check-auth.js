/* jshint esversion: 6 */
const jwt = require("jsonwebtoken");

// middlewares are functions that do stuff on an incoming request
module.exports = (req, res, next) => {
    try {
        const token = req.headers.authorization.split(" ")[1];
        const dToken = jwt.verify(token, process.env.JWT_KEY);
        req.userData =  { email: dToken.email, userId: dToken.userId };
        next();
    } catch (error) {
        res.status(401).json({ message: 'You lack authentication!' });
    }

};