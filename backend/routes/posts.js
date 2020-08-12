/* jshint esversion: 6 */
const express = require("express");
const checkAuth = require("../middleware/check-auth");
const extractFile = require("../middleware/file");

const postController = require("../controllers/posts");

const router = express.Router();




// ADD A NEW POST
// PROTECTED BY CHECKAUTH
router.post("", checkAuth, extractFile, postController.addPost);

// UPDATE POST BY ID
// PROTECTED BY CHECKAUTH
router.put("/:id", checkAuth, extractFile, postController.updatePost);

// GET ALL POSTS
router.get("", postController.getPosts);


// GET POST BY ID
router.get("/:id", postController.getPostById);

// DELETE POST BY ID
router.delete("/:id", checkAuth, postController.deletePost);

module.exports = router;