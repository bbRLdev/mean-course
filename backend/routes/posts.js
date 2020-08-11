const express = require("express");
const PostModel = require("../models/post");
const checkAuth = require("../middleware/check-auth");
const multer = require("multer");

const router = express.Router();

const MIME_TYPE_MAP = {
    'image/png': 'png',
    'image/jpeg': 'jpg',
    'image/jpg': 'jpg',

}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const isValid = MIME_TYPE_MAP[file.mimetype];
        let error = new Error("Invalid mime type");
        if(isValid) {
            error = null;
        }
        cb(error, "backend/images");
    },
    filename: (req, file, cb) => {
        const name = file.originalname.toLowerCase().split(' ').join('-');
        const ext = MIME_TYPE_MAP[file.mimetype];
        cb(null, name+'-'+Date.now() + '.' + ext);
    }
});


// ADD A NEW POST
// PROTECTED BY CHECKAUTH
router.post("", checkAuth, multer({storage: storage}).single("image"), (req, res, next) => {
    const url = req.protocol + '://' + req.get("host");
    const post = new PostModel({
        title: req.body.title,
        content: req.body.content,
        imagePath: url + "/images/" + req.file.filename,
        creator: req.userData.userId,
    });
    post.save().then(result => {
        console.log(post);
        res.status(201).json({
            message: 'Post added',
            post: {
                id: result._id,
                title: result.title,
                content: result.content,
                imagePath: result.imagePath,
            }
        });
    });
});

// UPDATE POST BY ID
// PROTECTED BY CHECKAUTH
router.put("/:id", checkAuth, multer({storage: storage}).single("image"), (req, res, next)=>{
    let imagePath = req.body.imagePath;
    if(req.file) {
        const url = req.protocol + '://' + req.get("host");
        imagePath = url + "/images/" + req.file.filename;
    }
    const post = new PostModel({
        _id: req.body.id,
        title: req.body.title,
        content: req.body.content,
        imagePath: imagePath,
        creator: req.userData.userId
    });
    console.log("!!!!!!!!" + post);
    PostModel.updateOne({ _id: req.params.id, creator: req.userData.userId }, post).then(result => {
        if(result.nModified > 0) {
            res.status(201).json({ message: "Update successful"});

        } else {
            res.status(401).json({ message: "User not authorized"});
        }
    });
});

// GET ALL POSTS
router.get("", (req, res, next) => {
    const pageSize = +req.query.pagesize;
    const currentPage = +req.query.page;
    const postQuery = PostModel.find(); 
    let fetchedPosts;
    if(pageSize && currentPage) {
        postQuery
            .skip(pageSize * (currentPage - 1))
            .limit(pageSize);
    }
    postQuery.then(documents => {
        fetchedPosts = documents;
        return PostModel.count();

    }).then(count => {
        res.status(200).json({
            message: "Posts fetched successfully",
            posts: fetchedPosts,
            maxPosts: count
        });

    });

});


// GET POST BY ID
router.get("/:id", (req, res, next) => {
    PostModel.findById(req.params.id).then((post) => {
        if(post) {
            res.status(200).json(post);
        } else {
            res.status(404).json({message: 'Post not found!'});
        }

    });
});

// DELETE POST BY ID
router.delete("/:id", checkAuth, (req, res, next) => {
    PostModel.deleteOne({ _id: req.params.id, creator: req.userData.userId }).then(result => {
        if(result.n > 0) {
            res.status(201).json({ message: "Update successful"});

        } else {
            res.status(401).json({ message: "User not authorized"});
        }
    });


});

module.exports = router;