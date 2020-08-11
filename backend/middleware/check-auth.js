const jwt = require("jsonwebtoken");

// middlewares are functions that do stuff on an incoming request
module.exports = (req, res, next) => {
    try {
        const token = req.headers.authorization.split(" ")[1];
        const dToken = jwt.verify(token, "secret_should_b_longer");
        req.userData =  { email: dToken.email, userId: dToken.userId }
        next();
    } catch (error) {
        res.status(401).json({ message: 'No authentication!' });
    }

}