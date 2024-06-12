const express = require("express");
const router = express.Router();
const Job = require('../models/Job');

const {
    getJobs,
    addJobs,
    getNewJobs,
    editJobs,
    updateJobs,
    deleteJobs,
} = require("../controllers/jobs.js");

router.get('/jobs', async function(req, res) {
    try {
        // Fetch jobs from the database...
        let jobs = await Job.find(); 
        res.render('jobs', { jobs: jobs, _csrf: req.csrfToken() });
    } catch (error) {
        console.error(error);
        res.status(500).send('An error occurred while fetching jobs');
    }
});

router.get('/jobs/new', function(req, res) {
    res.render('job', { job: null });
});

router.route("/jobs")
    .post(addJobs);
router.route("/jobs/new")
    .get(getNewJobs);
router.route("/jobs/edit/:id")
    .get(editJobs);
router.route("/jobs/update/:id")
    .post(updateJobs);
router.route("/jobs/delete/:id")
    .post(deleteJobs);

module.exports = router;