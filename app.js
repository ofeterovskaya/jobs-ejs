require("dotenv").config(); // to load the .env file into the process.env object
require("express-async-errors");// Import the express-async-errors module to handle async errors

// Initialize an express application
const express = require('express');
const session = require("express-session");
const flash = require("connect-flash");
const passport = require("passport");
const passportInit = require("./passport/passportInit");
const connectDB = require("./db/connect");
const csrf = require('csurf');
const bodyParser = require('body-parser');
const cookieParser = require("cookie-parser");

const app = express();

const MongoDBStore = require('connect-mongodb-session')(session);
const url = process.env.MONGO_URI;

const store = new MongoDBStore({    
    uri: url, 
    collection: "mySessions",
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
    cookie: { sameSite: "strict", secure: inProduction  },// Options for the session ID cookie
};
  
const csrf_options = {
    protected_operations: ["PATCH"],
    protected_content_types: ["application/json"],
    development_mode:  !inProduction,
    cookie: true,
};

// If the application is in production
if (inProduction) {    
    app.set("trust proxy", 1); // trust first proxy       
}
  
// Use the session middleware with the defined parameters
app.use(session(sessionParms));
app.set("view engine", "ejs");// Set the view engine to ejs for rendering views
app.use(bodyParser.urlencoded({ extended: true })); // Use body-parser middleware to parse incoming request bodies
app.use(flash()); // Add the connect-flash middleware
app.use(cookieParser(process.env.SESSION_SECRET));
app.use(express.urlencoded({ extended: false }));

// Add the passport middleware
passportInit();
app.use(passport.initialize());
app.use(passport.session());

app.use(csrf());
// Middleware to add the CSRF token to the response locals
app.use((req, res, next) => {
    res.locals.csrfToken = req.csrfToken();
    next();
});

// Middleware to add flash messages to the response locals
app.use((req, res, next) => {
    res.locals.info = req.flash("info");
    res.locals.errors = req.flash("error");
    next();
  });

const storeLocals = require("./middleware/storeLocals");
app.use(storeLocals);

//Routers
app.get("/", (req, res) => {
    res.render("index", { csrfToken: req.csrfToken() });
});
app.use("/sessions", require("./routes/sessionRoutes"));

const secretWordRouter = require("./routes/secretWord");// Replace the app.get and app.post statements for the "/secretWord" routes

const auth = require("./middleware/auth");
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