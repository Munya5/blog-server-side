const { Router } = require('express');
const router = Router();
const {
    createPost,
    getPosts,
    getPost,
    getCatPosts,
    getUserPosts,
    editPost,
    deletePost
} = require('../controllers/postControllers');
const authMiddleware = require('../middleware/authMiddleware');


router.post('/', authMiddleware, createPost); // Create a new post
router.get('/', getPosts); // Get all posts
router.get('/:id', getPost); // Get a specific post by ID
router.get('/categories/:category', getCatPosts); // Get posts by category
router.get('/users/:id', getUserPosts); // Get posts by user ID
router.patch('/:id', authMiddleware, editPost); // Update a post by ID
router.delete('/:id', authMiddleware, deletePost); // Delete a post by ID

module.exports = router;
