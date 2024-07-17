const { Router } = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const {
    registerUser,
    loginUser,
    getAuthors,
    changeAvatar,
    getUser,
    editUser,
} = require('../controllers/userControllers');

const router = Router();

router.post('/register', registerUser); // Route to register a new user
router.post('/login', loginUser); // Route to login a user
router.get('/:id', getUser); // Route to get user details by ID
router.get('/', getAuthors); // Route to get all authors (assuming this endpoint lists all users)
router.post('/change-avatar', authMiddleware, changeAvatar); // Route to change user avatar, protected by authMiddleware
router.patch('/edit-user', authMiddleware, editUser); // Route to edit user details, protected by authMiddleware

module.exports = router;
