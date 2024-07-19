const Post = require('../models/postModel')
const User = require('../models/userModel')
const path = require('path')
const fs = require('fs')
const {v4:uuid} = require('uuid')
const HttpError = require('../models/errorModel')


//=================================== Create A Post 
//POST : api/posts
//PROTECTED


const createPost = async (req, res, next) => {
    try {
        let { title, category, description } = req.body;

        // Check if all fields are present
        if (!title || !category || !description || !req.files || !req.files.thumbnail) {
            return next(new HttpError("Fill in all fields and choose thumbnail", 422));
        }

        const { thumbnail } = req.files;

        // Check file size
        if (thumbnail.size > 2000000) {
            return next(new HttpError("Thumbnail too big. File should be less than 2mb", 422));
        }

        let fileName = thumbnail.name;
        let splittedFilename = fileName.split('.');
        let newFilename = splittedFilename[0] + uuid() + "." + splittedFilename[splittedFilename.length - 1];

        // Move thumbnail to uploads directory
        thumbnail.mv(path.join(__dirname, '..', 'uploads', newFilename), async (err) => {
            if (err) {
                return next(new HttpError(err));
            }

            try {
                // Create new post
                const newPost = await Post.create({ title, category, description, thumbnail: newFilename, creator: req.user.id });
                if (!newPost) {
                    return next(new HttpError("Post couldn't be created.", 422));
                }

                // Increase post count for the user by 1
                const currentUser = await User.findById(req.user.id);
                const userPostCount = currentUser.posts + 1;
                await User.findByIdAndUpdate(req.user.id, { posts: userPostCount });

                res.status(201).json(newPost);
            } catch (error) {
                return next(new HttpError(error));
            }
        });
    } catch (error) {
        return next(new HttpError(error));
    }
};







//=================================== Get All Posts
//GET : api/posts
//PROTECTED


const getPosts = async(req,res,next) => {

    try {
        posts = await Post.find().sort({updatedAt: -1})
        res.status(200).json(posts)
    } catch (error) {
        return next(new HttpError(error))
    }


}



//=================================== Get single post
//GET : api/posts/:id
//PROTECTED


const getPost = async(req,res,next) => {

    try {

        const postId = req.params.id;
        const post = await Post.findById(postId)
        if (!post) {
            return next(new HttpError("Posts Not Found.", 404))
        }
        res.status(200).json(post)
    } catch (error) {
        return next(new HttpError(error))
    }


}



//=================================== Get Posts By Category
//GET : api/posts/category/:categories
//UNPROTECTED


const getCatPosts = async(req,res,next) => {

    try {
       const {category} = req.params;
       const catPosts = await Post.find({category}).sort({createdAt: -1})
       res.status(200).json(catPosts)
    } catch (error) {
        return next(new HttpError(error))
    }


}



//=================================== Get Author/User Post
//GET : api/posts/users/:id
//UNPROTECTED


const getUserPosts = async(req,res,next) => {

    try {
       const {id} = req.params;
       const posts = await Post.find({creator: id}).sort({createdAt: - 1}) 
       res.status(200).json({posts})
    } catch (error) {
        return next(new HttpError(eroor))
    }


}



//=================================== Edit Post
//PATCH : api/posts/:id
//PROTECTED


const editPost = async (req, res, next) => {
    try {
        const postId = req.params.id;
        let { title, category, description } = req.body;

        // Validation
        if (!title || !category || description.length < 12) {
            return next(new HttpError("Fill in all the fields and ensure description length is at least 12 characters", 422));
        }

        // Retrieve the post by postId
        const post = await Post.findById(postId);

        // Check if the post exists
        if (!post) {
            return next(new HttpError("Post not found", 404));
        }

        // Check if the logged-in user is the creator of the post
        if (post.creator !== req.user.id) {
            return next(new HttpError("Unauthorized to edit this post", 403));
        }

        let updatedPost;

        if (!req.files || Object.keys(req.files).length === 0) {
            // No new thumbnail provided
            updatedPost = await Post.findByIdAndUpdate(postId, { title, category, description }, { new: true });
        } else {
            // New thumbnail provided
            const oldPost = await Post.findById(postId);

            // Delete old thumbnail
            if (oldPost.thumbnail) {
                fs.unlink(path.join(__dirname, 'uploads', oldPost.thumbnail), (err) => {
                    if (err) {
                        console.error("Error deleting old thumbnail:", err);
                        return next(new HttpError(err));
                    }

                    uploadNewThumbnail();
                });
            } else {
                uploadNewThumbnail();
            }

            function uploadNewThumbnail() {
                const { thumbnail } = req.files;

                // Check file size
                if (thumbnail.size > 2000000) {
                    return next(new HttpError("Thumbnail too big. Should be less than 2mb", 422));
                }

                // Generate new filename
                let fileName = thumbnail.name;
                let splittedFilename = fileName.split('.');
                let newFilename = `${splittedFilename[0]}-${uuid()}.${splittedFilename[splittedFilename.length - 1]}`;

                // Move thumbnail to uploads directory
                thumbnail.mv(path.join(__dirname, 'uploads', newFilename), async (err) => {
                    if (err) {
                        return next(new HttpError(err));
                    }

                    // Update post with new data including new thumbnail
                    updatedPost = await Post.findByIdAndUpdate(postId, { title, category, description, thumbnail: newFilename }, { new: true });

                    if (!updatedPost) {
                        return next(new HttpError("Couldn't update post", 404));
                    }

                    res.status(200).json(updatedPost);
                });
            }
        }

        if (!updatedPost) {
            return next(new HttpError("Couldn't update post", 404));
        }

        res.status(200).json(updatedPost);
    } catch (error) {
        return next(new HttpError(error));
    }
};


//=================================== Delete Post
//DELETE : api/posts/:id
//PROTECTED


const deletePost = async (req, res, next) => {
    try {
        const postId = req.params.id;
        
        if (!postId) {
            return next(new HttpError("Post ID is required.", 400));
        }

        const post = await Post.findById(postId);
        if (!post) {
            return next(new HttpError("Post not found.", 404));
        }

        const fileName = post.thumbnail;
        
        if (req.user.id !== String(post.creator)) {
            return next(new HttpError("Unauthorized: You do not have permission to delete this post.", 403));
        }

        // Delete post thumbnail file
        fs.unlink(path.join(__dirname, '..', 'uploads', fileName), async (err) => {
            if (err) {
                return next(new HttpError(err));
            } else {
                // Delete the post document from the database
                await Post.findByIdAndDelete(postId);
                
                // Decrease post count of the user
                const currentUser = await User.findById(req.user.id);
                if (currentUser) {
                    currentUser.posts -= 1;
                    await currentUser.save();
                }
                
                res.json({ message: `Post ${postId} deleted successfully.` });
            }
        });
    } catch (error) {
        return next(new HttpError(error));
    }
};



module.exports = {createPost, getPosts, getPost, getCatPosts, getUserPosts, editPost, deletePost}