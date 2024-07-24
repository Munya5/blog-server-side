const { v4: uuid } = require('uuid');
const bcrypt = require('bcryptjs')
const User = require('../models/userModel')
const jwt = require("jsonwebtoken")
const fs = require('fs').promises; // Import fs.promises for async file operations
const path = require('path')

//####################### REGISTER NEW USER #######################//
//POST : api/users/register
//Unprotected

const HttpError = require("../middleware/errorModel")

const registerUser = async (req, res, next) => {
    try {

        const {name, email, password, password2 } = req.body;
        if(!name || !email || !password) {
            return next(new HttpError("Fill in all fields.", 422));
        } 

        const newEmail = email.toLowerCase() 

        const emailExists = await User.findOne({email: newEmail})
        if (emailExists) {
            return next(new HttpError("Email already exists.", 422));
        } 

        if ((password.trim()).length < 6 ) {
            return next(new HttpError("Password should be at least 6 characters.", 422 ));

        }

        if (password != password2) {
            return next(new HttpError("Passwords do not match.", 422 ));
        }

        const salt = await bcrypt.genSalt(10)
        const hashedPass = await bcrypt.hash(password, salt);
        const newUser = await User.create({name, email: newEmail,password: hashedPass})
        res.status(201).json(`New User ${newUser.email} registered`)

    } catch (error)  {
        return next(new HttpError("User registration failed.", 422));
    }


}








//####################### LOGIN USER #######################//
//POST : api/users/login
//UNPROTECTED

const loginUser = async (req, res, next) => {
    try {

        const {email, password} = req.body;
        if (!email || !password ) {
            return next(new HttpError("Fill in all fields",422))
        }

        const newEmail = email.toLowerCase();

        const user = await User.findOne({email:newEmail})
        if (!user)  {
            return next(new HttpError("Invalid credentials",422))
        }

        const comparePass = await bcrypt.compare(password, user.password)
        if (!comparePass)  {
            return next(new HttpError("Invalid credentilas", 422))
        }

        const {_id: id, name} = user;
        const token = jwt.sign({id, name}, process.env.JWT_SECRET,{expiresIn:"1d"})

        res.status(200).json({token, id, name})
        


    } catch (error) {
        return next(new HttpError("Login failed. Please take some time to check your credentials.", 422))
        
    }
  
}








//####################### USER PROFILE #######################//
//POST : api/users/id
//PROTECTED

const getUser = async (req, res, next) => {
    try {

        const {id} = req.params;
        const user = await User.findById(id).select('-password');
        if(!user) {
            return next (new HttpError("User not Found", 404))

        }

        res.status(200).json(user)
        
    } catch (error) {

        return next (new HttpError(error))
        
    }
}







//####################### CHANGE USER AVATAR #######################//
//POST : api/users/change-avatar
//PROTECTED


const changeAvatar = async (req, res, next) => {
    try {
        // Check if avatar file is included in request
        if (!req.files || !req.files.avatar) {
            return next(new HttpError("Please upload an image file.", 422));
        }

        const { avatar } = req.files;

        // Ensure avatar size is within limit (500KB)
        if (avatar.size > 500000) {
            return next(new HttpError('Profile picture size should be less than 500KB.', 422));
        }

        // Find user from database and get current avatar filename
        const user = await User.findById(req.user.id);

        if (!user) {
            return next(new HttpError("User not found.", 404));
        }

        const oldAvatar = user.avatar;

        // Generate new filename with UUID to ensure uniqueness
        const fileExtension = avatar.name.split('.').pop();
        const newFilename = `avatar-${uuid()}.${fileExtension}`;

        // Move avatar file to uploads directory
        const uploadPath = path.join(__dirname, '..', 'uploads', newFilename);
        await avatar.mv(uploadPath);

        // Update user's avatar in the database
        user.avatar = newFilename;
        await user.save();

        // Delete old avatar if it exists
        if (oldAvatar) {
            const avatarPath = path.join(__dirname, '..', 'uploads', oldAvatar);
            await fs.unlink(avatarPath); // Use fs.promises.unlink for async unlink
        }

        // Respond with updated user data
        res.status(200).json({ avatar: newFilename });

    } catch (error) {
        console.error(`Error in changeAvatar: ${error.message}`);
        return next(new HttpError('Failed to change avatar.', 500));
    }
};

module.exports = changeAvatar;





//####################### EDIT USER DETAILS #######################//
//POST : api/users/edit-user
//PROTECTED

const editUser = async (req, res, next) => {
    try {
        const {name, email, currentPassword, newPassword, confirmNewPassword} = req.body;
        if(!name|| !email || !currentPassword || !newPassword ) {
            return next(new HttpError('Fill in all fields', 422))
        }

         //getting user from database

        const user = await User.findById(req.user.id);
        if(!user) {
            return next(new HttpError("User not found.", 403))
        }

        //email doesnt exist


        const emailExist = await User.findOne({email});
        if(emailExist && (emailExist._id != req.user.id)) {
            return next(new HttpError("Email already exists.", 422))
        }


        //comparing pwds


        const validateUserPassword = await bcrypt.compare(currentPassword, user.password)
        if(!validateUserPassword) {
            return next(new HttpError(error))
        }



        //new password comparison

        if(newPassword !== confirmNewPassword)  {
            return next(new HttpError("New passwords do not match.", 422))
        }


        //hash new password

        const salt = await bcrypt.genSalt(10)
        const hash = await bcrypt.hash(newPassword, salt)

        //update into database


        const newInfo = await User.findByIdAndUpdate(req.user.id, {name, email, password:hash}, {new:true})
        res.status(200).json(newInfo)

 

    } catch (error) {
        return next(new HttpError(error))
    }


}




//####################### GET AUTHORS #######################//
//POST : api/users/authors
//UNPROTECTED

const getAuthors = async (req, res, next) => {
    try {

        const authors = await User.find().select('-password');
        res.json(authors);
        
    } catch (error) {

        return next(new HttpError(error))
        
    }
}








module.exports = { registerUser, loginUser, getAuthors, changeAvatar, getUser, editUser,  }