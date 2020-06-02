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
                // pass the authenticated user ID to the request
                req.authenticatedUserId = user.dataValues.id;
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

// GET /api/users 200
// Returns the currently authenticated user
router.get('/users', asyncHandler(authenticateUser) ,asyncHandler( async (req, res) => {
    const user = await User.findOne({
        where: {
            id: req.authenticatedUserId
        },
        attributes: ['id', 'firstName', 'lastName', 'emailAddress']
    });
    res.status(200).json(user);
}));

// POST /api/users 201
// Creates a user, sets the Location header to "/", and returns no content
router.post('/users', asyncHandler( async (req, res, rext) => {
    // try catch block is nested within the asynchandler block to handle validation errors thrown by sequelize
    try {
        // password hashing is done with sequelize with lifecycle hooks at the user model level with afterValidate callback function
        await User.create(req.body);
        res.status(201).location('/').end();
    } catch(error) {
        //if there was an error check if it is a sequelize error
        if(error.name === 'SequelizeValidationError') {
            const errors = error.errors.map(err => err.message);
            res.status(400).json({ errors });
        }
        //otherwise if the email address is already in use
        else if (error.name === 'SequelizeUniqueConstraintError') {
            error.errors.map( err => {
                if(err.path === 'emailAddress') {
                    res.status(400).json({message: err.message});
                }
            });
        }
        //otherwise through the error to the next catch 
        else {
            throw error;
        }
    } 
}));

// GET /api/courses 200 
// Returns a list of courses (including the user that owns each course)
router.get('/courses', asyncHandler( async (req, res, next) => {
    const courses = await Course.findAll({
        attributes: ['id', 'title', 'description', 'estimatedTime', 'materialsNeeded'],
        include: [{
            model: User,
            // password, updated at and created at were filtered out
            attributes: ['id', 'firstName', 'lastName', 'emailAddress']
        }]
    });
    //if any courses where found
    if(courses.length > 0) {
        res.status(200).json(courses);
    }
    else {
        res.status(404).json({message: "there are currently no courses"});
    }
}));

// GET /api/courses/:id 200
// Returns a course (including the user that owns the course) for the provided course ID
router.get('/courses/:id', asyncHandler( async (req,res,next) => {
    const course = await Course.findByPk(req.params.id, {
        attributes: ['id', 'title', 'description', 'estimatedTime', 'materialsNeeded'],
        include: [{
            model: User,
            // password, updated at and created at were filtered out
            attributes: ['id', 'firstName', 'lastName', 'emailAddress']
        }]
    });
    //if the course was found
    if(course) {
        res.status(200).json(course);        
    }
    else {
        res.status(404).json({message: "requested course not found"});
    }
}));

// POST /api/courses 201
// Creates a course, sets the Location header to the URI for the course, and returns no content
router.post('/courses', asyncHandler(authenticateUser) ,asyncHandler ( async (req,res,next) => {
    //try catch block nested within the asyncHanlder try catch block to validate new course using sequelize validation
    try {
        // course userId passed to the database is the user id of the authenticated user
        req.body.userId = req.authenticatedUserId;
        const newCourse = await Course.create(req.body);    
        res.status(201).location(`/api/courses/${newCourse.id}`).end();
    } catch (error) {
        //if there was an error check if it is a sequelize error
        if(error.name === 'SequelizeValidationError') {
            const errors = error.errors.map(err => err.message);
            res.status(400).json({ errors });
        }
        //else if the course title was not unique 
        else if (error.name === 'SequelizeUniqueConstraintError') {
            error.errors.map( err => {
                if(err.path === 'title') {
                    res.status(400).json({message: err.message});
                }
            });
        }
        //else throw the error to the global error handler
        else {
            throw error;
        }
    }
}));

// PUT /api/courses/:id 204
// Updates a course and returns no content
router.put('/courses/:id', asyncHandler(authenticateUser) , asyncHandler( async (req,res,next) => {
    const title = req.body.title;
    const description = req.body.description;
    console.log(title, description);
    const courseToUpdate = await Course.findByPk(req.params.id);
    // if the course was found
    if (courseToUpdate) {
        // if the authenticated user doesn't own the requested course, return a 403 status code
        if (req.authenticatedUserId !== courseToUpdate.dataValues.userId) {
            res.status(403).json({message: "you can edit only your courses"});
        }
        // if title or description is not provided
        else if(!title || !description) {
            res.status(400).json({message: "both title and description needed"});
        }
        // else update course 
        else {
            //adding a try catch block for validation of course updates through sequelize, like title or description not null
            try {
                await courseToUpdate.update(req.body);
                res.status(204).location('/').end();
            } catch(error) {
                // if there were any validation errors
                if(error.name === 'SequelizeValidationError') {
                    const errors = error.errors.map(err => err.message);
                    res.status(400).json({ errors });
                }
                // else if title of updated course is not unique 
                else if (error.name === 'SequelizeUniqueConstraintError') {
                    error.errors.map( err => {
                        if(err.path === 'title') {
                            res.status(400).json({message: err.message});
                        }
                    });
                }
                else {
                    //throw error to global error handler
                    throw error;
                }
            }
        }  
    }
    // else if course to be updated not found
    else {
        res.status(404).json({message: "indicated course not found"});        
    }
}));

// DELETE /api/courses/:id 204
// Deletes a course and returns no content
router.delete('/courses/:id', asyncHandler(authenticateUser) , asyncHandler( async (req,res,next) => {
    const courseToDelete = await Course.findByPk(req.params.id);
    // if the course was found
    if (courseToDelete) {
        // if the authenticated user doesn't own the course to be deleted, return a 403 status code
        if (req.authenticatedUserId !== courseToDelete.dataValues.userId) {
            res.status(403).json({message: "you can delete only your courses"});
        }
        // else delete course 
        else {
                await courseToDelete.destroy();
                res.status(204).location('/').end();
        }  
    }
    // else if course not found
    else {
        res.status(404).json({message: "indicated course not found"});        
    }    
}));

// export api routes
module.exports = router;