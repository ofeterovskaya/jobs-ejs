require("dotenv").config(); // to load the .env file into the process.env object
require("express-async-errors");// Import the express-async-errors module to handle async errors


// Initialize an express application
const express = require('express');
const session = require("express-session");
const passport = require("passport");
const passportInit = require("./passport/passportInit");
const auth = require("./middleware/auth");

const app = express();
// Set the view engine to ejs for rendering views
app.set("view engine", "ejs");

// Use body-parser middleware to parse incoming request bodies
app.use(require("body-parser").urlencoded({ extended: true }));

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
const inProduction = app.get("env") === "production";
const sessionParms = {    
    secret: process.env.SESSION_SECRET,// The secret used to sign the session ID cookie    
    resave: true,// Forces the session to be saved back to the session store, even if the session was never modified during the request
    
    saveUninitialized: true,// Forces a session that is "uninitialized" to be saved to the store
    
    store: store,// The store instance where sessions will be stored
    
    cookie: { secure: false, sameSite: "strict", secure: inProduction  },// Options for the session ID cookie
};
  
// If the application is in production
if (inProduction) {    
    app.set("trust proxy", 1); // trust first proxy       
}
  
// Use the session middleware with the defined parameters
app.use(session(sessionParms));

// Add the passport middleware

passportInit();
app.use(passport.initialize());
app.use(passport.session());

// Add the connect-flash middleware
app.use(require("connect-flash")());

app.use(require("./middleware/storeLocals"));
app.get("/", (req, res) => {
    res.render("index");
});
app.use("/sessions", require("./routes/sessionRoutes"));

// Replace the app.get and app.post statements for the "/secretWord" routes
const secretWordRouter = require("./routes/secretWord");

app.use("/secretWord", auth, secretWordRouter);

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
  await require("./db/connect")(process.env.MONGO_URI);
    // Start the server and log a message to the console
    app.listen(port, () =>
    console.log(`Server is listening on port ${port}...`)
    );
} catch (error) {   
    console.log(error);
}
};

start();