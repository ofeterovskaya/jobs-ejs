const express = require("express");
const router = express.Router();
const Job = require('../models/Job');
const csrfProtection = require('../middleware/csrfProtection');
const auth = require('../middleware/auth');

const {
    getNewJob,
    getJobs,    
    addJobs,
    editJobs, 
    getEditJob,
    updateJobs,
    deleteJobs,    
      
} = require("../controllers/jobs.js");
const validateId = require("../middleware/validateId.js");


router.route("/new")
    .get(auth, csrfProtection, getNewJob)
    .post(auth, csrfProtection, addJobs);

router.route("/")
    .get(auth, csrfProtection, getJobs)
    .post(auth, csrfProtection, addJobs);

router.route("/edit/:id")
    .get(auth, csrfProtection, validateId, getEditJob)
    .post(auth, csrfProtection, validateId, editJobs); 

router.route("/update/:id")
    .post(auth, csrfProtection, validateId, updateJobs); 

router.route("/delete/:id")
    .post(auth, csrfProtection, validateId, deleteJobs);

module.exports = router;