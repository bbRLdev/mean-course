const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const UserModel = require("../models/user");
const user = require("../models/user");

const router = express.Router();
router.post("/signup", (req, res, next) => {
    bcrypt.hash(req.body.password, 10).then(hash=> {
        const user = new UserModel({
            email: req.body.email,
            password: hash
        });
        user.save()
            .then(result=>{
                res.status(201).json({
                    message: 'User created!',
                    result: result
                });
            }).catch(err=>{
                res.status(500).json({
                    error: err
                });
            });

    });


});

router.post("/login", (req, res, next) => {
    let fetchedUser;
    UserModel.findOne({email: req.body.email})
        .then(user=> {
            if(!user) {
                return res.status(401).json({ message: 'Email auth failed!' });
            }
            fetchedUser = user;
            return bcrypt.compare(req.body.password, user.password);
        })
        .then(result => {
            if(!result) {
                return res.status(401).json({ message: 'Password auth failed!' });
            }
            const token = jwt.sign(
                { email: fetchedUser.email, userId: fetchedUser._id }, 
                'secret_should_b_longer', 
                { expiresIn: "1h" });
                res.status(200).json({
                    token: token,
                    expiresIn: 3600,
                });
        }).catch(err => {
            return res.status(401).json({ message: 'Auth failed!' });

        });
});


module.exports = router;