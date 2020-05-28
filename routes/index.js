'use strict';

const express = require('express');
// importing library used to parse basic authentication header
const auth = require('basic-auth');
// importing bcrypt for password hashing
const bcrypt = require('bcrypt');
// importing database and destructuring to use model names directly
const { models } = require('../db');
const { User, Course } = models;

// setup api routes router
const router = express.Router();

// asyncHandler used to wrap routes code in try catch code
const asyncHandler = (cb) => {
    return async (req,res,next) => {
        try {
            cb(req, res, next);
        } catch(error) {
            next(error);
        }
    }
};

// authenticateUser middleware added as second parameter to authenticate protected routes
const authenticateUser = async (req, res, next) => {
    // declare message to store authentication errors
    let message = null;
    // parse credentials from authorizatoin header
    const credentials = auth(req);
    // if credentials are available 
    if(credentials) {
        // search username in database, since email is unique findOne is used
        const user = await User.findOne({
            where: {
                emailAddress: credentials.name
            }
        });
        //if user email is valid
        if(user) {
            // compare authentication header hashed password with the users password
            const passwordIsValid =  bcrypt.compareSync(credentials.pass, user.dataValues.password);
            // if passwords are the same
            if (passwordIsValid) {
                // pass the authenticated user to the request
                req.currentUser = user.dataValues;
            } else {
                message = `authentication failed for username ${credentials.name}`;
            }
        } else {
            message = `user for email ${credentials.name} not found`;
        };
    } else {
        message = 'authentication header is missing';
    }
    // if there were errors
    if(message) {
        console.warn(message);
        res.status(401).json({message: 'Access denied.'});
    } else {
        next();
    }
};


/* all /api/user and /api/course routes defined below */

// GET /api/users 200 - Returns the currently authenticated user
router.get('/users', asyncHandler(authenticateUser) ,asyncHandler( async (req, res) => {
    res.status(200).json(req.currentUser);
}));

// export api routes
module.exports = router;