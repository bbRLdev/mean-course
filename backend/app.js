/*jshint esversion: 6*/
const express = require("express");
const path = require("path");
const app = express();
const bodyParser = require("body-parser");
const mongoose = require("mongoose");

const postRoutes = require('./routes/posts');
const userRoutes = require('./routes/user');



const e = require("express");

//REMEMBER TO CHECK YOUR SLASHES OR YOUR ROUTES WILL BE FUCKED

mongoose.connect("mongodb+srv://dbAdmin:" + process.env.MONGO_PASS + "@cluster0.aebj4.mongodb.net/node-angular?retryWrites=true&w=majority", {useNewUrlParser: true, useUnifiedTopology: true})
.then(
    ()=>{
        console.log('Connected');
    }
).catch(
    (error)=>{
        console.log(error);

    }
);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use("/images", express.static(path.join("images")));

app.use(
    (req, res, next) => {
        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("Access-Control-Allow-Headers", 
        "Origin, X-Requested-With, Content-Type, Accept, Authorization"
        );
        res.setHeader("Access-Control-Allow-Methods", 
        "GET, POST, PATCH, PUT, DELETE, OPTIONS"
        );
        next();
    }
);

app.use("/api/posts", postRoutes);
app.use("/api/user", userRoutes);





module.exports = app;