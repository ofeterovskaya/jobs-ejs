const session = require("express-session");
// Initialize an express application
const express = require('express');

// Import the express-async-errors module to handle async errors
require("express-async-errors");

const app = express();
// Set the view engine to ejs for rendering views
app.set("view engine", "ejs");

// Use body-parser middleware to parse incoming request bodies
app.use(require("body-parser").urlencoded({ extended: true }));

require("dotenv").config(); // to load the .env file into the process.env object

const MongoDBStore = require('connect-mongodb-session')(session);

const url = process.env.MONGO_URI;

// Create a new MongoDBStore instance for storing sessions in MongoDB
const store = new MongoDBStore({    
    uri: url,// The MongoDB connection URI    
    collection: "mySessions",// The name of the collection where sessions will be stored
});
  
  // Log any errors that occur with the store
  store.on("error", function (error) {
    console.log(error);
  });
  
  // the parameters for the session middleware
  const sessionParms = {    
    secret: process.env.SESSION_SECRET,// The secret used to sign the session ID cookie    
    resave: true,// Forces the session to be saved back to the session store, even if the session was never modified during the request
    
    saveUninitialized: true,// Forces a session that is "uninitialized" to be saved to the store
    
    store: store,// The store instance where sessions will be stored
    
    cookie: { secure: false, sameSite: "strict" },// Options for the session ID cookie
  };
  
  // If the application is in production
  if (app.get("env") === "production") {    
    app.set("trust proxy", 1);// Trust the first proxy    
    sessionParms.cookie.secure = true;// Serve secure cookies
  }
  
  // Use the session middleware with the defined parameters
    app.use(session(sessionParms));
  // Add the connect-flash middleware
    app.use(require("connect-flash")());

    app.get("/secretWord", (req, res) => {
        if (!req.session.secretWord) {
          req.session.secretWord = "syzygy";
        }
        res.locals.info = req.flash("info");
        res.locals.errors = req.flash("error");
        res.render("secretWord", { secretWord: req.session.secretWord });
      });

    // Modify the POST route for /secretWord
    app.post("/secretWord", (req, res) => {
    if (req.body.secretWord.toUpperCase()[0] == "P") {
        // Set flash messages if the secret word starts with "P"
        req.flash("error", "That word won't work!");
        req.flash("error", "You can't use words that start with p.");
    } else {
        // Set the secret word in the session and set a flash message
        req.session.secretWord = req.body.secretWord;
        req.flash("info", "The secret word was changed.");
    }
    // Redirect to the /secretWord route
        res.redirect("/secretWord");
    });

    // Define a middleware for handling 404 errors
    app.use((req, res) => {  
        res.status(404).send(`That page (${req.url}) was not found.`);
    });

    // Define a middleware for handling other errors
    app.use((err, req, res, next) => {
        // Send a 500 status code and the error message
        res.status(500).send(err.message); 
        console.log(err);
    });

    const port = process.env.PORT || 3000;

    // Define an async function to start the server
    const start = async () => {
    try {
        // Start the server and log a message to the console
        app.listen(port, () =>
        console.log(`Server is listening on port ${port}...`)
        );
    } catch (error) {   
        console.log(error);
    }
};

start();