const Post = require('../models/postModel')
const User = require('../models/userModel')
const path = require('path')
const fs = require('fs')
const {v4:uuid} = require('uuid')
const HttpError = require('../models/errorModel')


//=================================== Create A Post 
//POST : api/posts
//PROTECTED


const createPost = async(req,res,next) => {

    try {
        let {title, category, description} = req.body;
        if(!title || !category || !description || !req.files) {
            return next(new HttpError("Fill in all fields and choose thumpnail", 422))

        }

        const {thumbnail} = req.files;
        // check file size

        if(thumbnail.size > 2000000) {
            return next(new HttpError(""))
        }
    } catch (error) {
        return next(new HttpError(err))
    }


}



//=================================== Get All Posts
//GET : api/posts
//PROTECTED


const getPosts = async(req,res,next) => {

    res.json("Get all Posts")


}



//=================================== Get single post
//GET : api/posts/:id
//PROTECTED


const getPost = async(req,res,next) => {

    res.json("Get single Post")


}



//=================================== Get Posts By Category
//GET : api/posts/category/:categories
//UNPROTECTED


const getCatPosts = async(req,res,next) => {

    res.json("Get Posts by Category")


}



//=================================== Get Author Post
//GET : api/posts/users/:id
//UNPROTECTED


const getUserPosts = async(req,res,next) => {

    res.json("Get User Posts")


}



//=================================== Edit Post
//PATCH : api/posts/:id
//PROTECTED


const editPost = async(req,res,next) => {

    res.json("Edit Post")


}


//=================================== Delete Post
//DELETE : api/posts/:id
//PROTECTED


const deletePost = async(req,res,next) => {

    res.json("Delete Post")


}



module.exports = {createPost, getPosts, getPost, getCatPosts, getUserPosts, editPost, deletePost}