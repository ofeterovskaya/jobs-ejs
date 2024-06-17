require("dotenv").config(); // to load the .env file into the process.env object
require("express-async-errors");// Import the express-async-errors module to handle async errors
const mongoose = require('mongoose');

// Initialize an express application
const express = require('express');
const dbConnect = require('./db/connect');
const session = require("express-session");
const flash = require("connect-flash");
const passport = require("passport");
const passportInit = require("./passport/passportInit");
const bodyParser = require('body-parser');
const cookieParser = require("cookie-parser");
const auth = require('./middleware/auth');
const jobs = require('./routes/jobs');
const Job = require('./models/Job');
const sessionRoutes = require('./routes/sessionRoutes');
const methodOverride = require('method-override');
const secretWordRouter = require("./routes/secretWord");
const csrfProtection = require("./middleware/csrfProtection");
const storeLocals = require("./middleware/storeLocals");

const helmet = require('helmet');
const xssClean = require('xss-clean');
const rateLimit = require('express-rate-limit');
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
app.use(methodOverride('_method'));

// Security middlewares
app.use(helmet());
app.use(xssClean());
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// Add the passport middleware
passportInit();
app.use(passport.initialize());
app.use(passport.session());



// // Middleware to add the CSRF token to the response locals
// app.use((req, res, next) => {
//     res.locals.csrfToken = req.csrfToken();
//     next();
// });

// Middleware to add flash messages to the response locals
app.use((req, res, next) => {
    res.locals.info = req.flash("info");
    res.locals.errors = req.flash("error");
    next();
  });
 
  app.use(storeLocals);  
  app.use("/jobs", jobs);  
  app.use('/sessions', sessionRoutes);
  
  app.get("/", csrfProtection, (req, res) => {
      res.render("index", { csrfToken: req.csrfToken() });
  });

  app.get('/edit', csrfProtection, (req, res) => {
    // Redirect to a job listing page, or handle as needed
    res.render('edit', { csrfToken: req.csrfToken() });
});

//const auth = require("./middleware/auth");
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

// app.get('/multiply', (req, res) => {
//     const first = Number(req.query.first);
//     const second = Number(req.query.second);
//     const result = first * second;
  
//     res.send(`The result is ${result}`);
//   });

const port = process.env.PORT || 3000;

const start = async () => {
    try {
      const url = process.env.NODE_ENV === 'test' ? process.env.MONGO_URI_TEST : process.env.MONGO_URI;
      await dbConnect(url);
      console.log('Database connected successfully');
      const server = app.listen(port, () =>
        console.log(`Server is listening on port ${port}...`),
      );
      return server;
    } catch (error) {
      console.log('Failed to connect to the database', error);
      process.exit(1);
    }
  };
  
  const server = start();

module.exports = { app, server };