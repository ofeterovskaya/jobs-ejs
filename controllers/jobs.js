const mongoose = require('mongoose');
const Jobs = require('../models/Job');
//const validateId = require('../middleware/validateId');
const handleErrors = require("../utils/parseValidationErrs");
const csrfProtection = require("../middleware/csrfProtection");

// GET a form for adding a new job
const getNewJob = (req, res) => {
    res.render('newJob', { job: null, csrfToken: req.csrfToken() });
};

// GET all Jobs for the current user
const getJobs = async (req, res, next) => {
    try {
        const jobs = await Jobs.find({ createdBy: req.user._id });       
        res.render('jobs', { jobs: jobs, csrfToken: req.csrfToken() });
    } catch (error) {
        handleErrors(error, req, res);
        console.error(error);
        res.status(500).send('An error occurred while fetching jobs');
    }
};

// POST a new Jobs
const addJobs = async (req, res, next) => {
    try {
        await Jobs.create({ ...req.body, createdBy: req.user._id });
        res.redirect('/jobs'); 
    } catch (error) {
        handleErrors(error, req, res);
    }
};

// Edit a job
const editJobs = async (req, res) => {
    const id = req.params.id;// Get job ID from URL parameters
    const updatedJobData = req.body;// Get updated job data from request body
    try {        
        await Job.update(id, updatedJobData);// Update the job with new data
        const job = await Job.findById(req.params.id); // Fetch the updated job details
        //res.render(`/jobs/${id}`, { job: job, csrfToken: req.csrfToken() });// Redirect to the updated job's page
        res.render('job', { job: job, csrfToken: req.csrfToken() });
        res.redirect(`/jobs/${id}`);
    } catch (error) {       
        console.error(error);
        res.status(500).send('An error occurred');
    }
};
// GET a specific jobs for editing
const getEditJob = async (req, res) => {
    try {
        const job = await Jobs.findById(req.params.id);
        if (job) {
            res.render('job', { job: job, csrfToken: req.csrfToken() });
        } else {
            // This else block is implied by the catch block for errors, including "not found"
            throw new Error('Job not found');
        }
    } catch (error) {
        console.error(error);
        res.status(500).send('An error occurred while fetching the job');
    }
};

// POST an updated jobs
const updateJobs = async (req, res, next) => {
    try {
        const updatedJobs = await Jobs.findOneAndUpdate(
            { _id: req.params.id, createdBy: req.user._id },
            req.body,
            { new: true, runValidators: true }
        );
        if (!updatedJobs) {
            res.status(404);
            req.flash('error', 'Job not found');
            return;
        }
        res.redirect('/jobs');
    } catch (error) {
        handleErrors(error, req, res, '/jobs/edit/' + req.params.id);
    }
};

// POST to delete a job
const deleteJobs = async (req, res, next) => {
    try {
        const deletedJobs = await Jobs.findOneAndDelete({ _id: req.params.id, createdBy: req.user._id });
        if (!deletedJobs) {
            res.status(404);
            req.flash('error', 'Job not found');
            return res.redirect('/jobs'); 
        }
        req.flash('success', 'Job was deleted');
        res.redirect('/jobs');
    } catch (error) {
        handleErrors(error, req, res, '/jobs');
    }
};
module.exports = {
  getNewJob,  
  getJobs,  
  addJobs,
  editJobs,
  getEditJob,
  updateJobs,
  deleteJobs
};