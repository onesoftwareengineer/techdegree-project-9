# REST API for a school database
The API will provide a way for users to administer a school database containing information about courses: users can interact with the database by retrieving a list of courses, as well as adding, updating and deleting courses in the database. 

Since users need to create an account and log-in to make changes to the database the API provides a route to create a new user and authentication for the existing users.

## Technologies 
JavaScript, Node, Express, Sequelize, SQLite

## Screenshot
![image](https://raw.githubusercontent.com/onesoftwareengineer/techdegree-project-9/master/screenshot1.JPG)
*REST API routes*

## Additional comments and improvements
* there is a custom error message if no courses are found for route // * GET /api/courses 200
* user password field filtered out for route // GET /api/courses/:id 200
* added a constraint for Course model for title to be unique // POST /api/courses 201
* userId for the course to be added is taken from the current authenticated user // POST /api/courses 201

## Overview of the Provided Project Files
* The `seed` folder contains a starting set of data for the database in the form of a JSON file (`data.json`) and a collection of files (`context.js`, `database.js`, and `index.js`) that can be used to create your app's database and populate it with data.
* The `app.js` file configures Express to serve a simple REST API. 
* The `morgan` npm package is also configured to log HTTP requests/responses to the console. 
* The `package.json` file (and the associated `package-lock.json` file) contain the project's npm configuration, which includes the project's dependencies.
* The `RESTAPI.postman_collection.json` file is a collection of Postman requests that can be used to test and explore the REST API.
* A `.gitignore` file is included to ensure that the `node_modules` folder doesn't get pushed to a GitHub repo.

## Getting Started
To get up and running with this project, run the following commands from the root of the folder that contains this README file.

First, install the project's dependencies using `npm`.

```
npm install

```

Second, seed the SQLite database.

```
npm run seed
```

And lastly, start the application.

```
npm start
```
