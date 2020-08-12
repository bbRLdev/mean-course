/*jshint esversion: 6*/
const PostModel = require("../models/post");

exports.addPost = (req, res, next) => {
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
    }).catch(
        error=>{
            res.status(500).json({
                message: 'Post creation failed!'
            });
        }
    );
};

exports.updatePost = (req, res, next) => {
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
    PostModel.updateOne({ _id: req.params.id, creator: req.userData.userId }, post).then(result => {
        if(result.nModified > 0) {
            res.status(201).json({ message: "Update successful"});

        } else {
            res.status(401).json({ message: "User not authorized"});
        }
    }).catch(
        error => {
            res.status(500).json(
                { message: "Something went wrong, post update failed!"}
            );
        }
    );
};

exports.getPostById = (req, res, next) => {
    PostModel.findById(req.params.id).then((post) => {
        if(post) {
            res.status(200).json(post);
        } else {
            res.status(404).json({message: 'Post not found!'});
        }
    }).catch(
        error => {
            res.status(500).json({
                message: "Fetching single post failed!",
            });        
        }
    );
};

exports.getPosts = (req, res, next) => {
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

    }).catch(error => {
        res.status(500).json({
            message: "Fetching posts failed!",
        });
    });

};

exports.deletePost = (req, res, next) => {
    PostModel.deleteOne({ _id: req.params.id, creator: req.userData.userId }).then(result => {
        if(result.n > 0) {
            res.status(201).json({ message: "Update successful"});

        } else {
            res.status(401).json({ message: "User not authorized to delete"});
        }
    }).catch(
        error => {
            res.status(500).json({
                message: "Deleting post failed!",
            });        
        }
    );
};