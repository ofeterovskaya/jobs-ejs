const Jobs = require('../models/Job');
const handleErrors = require("../utils/parseValidationErrs");

// GET all Jobs for the current user
const getJobs = async (req, res, next) => {
    try {
        const jobs = await Jobs.find({ createdBy: req.user._id });
        res.render('jobs', { jobs });
    } catch (error) {
        handleErrors(error, req, res);
    }
};

// POST a new Jobs
const addJobs = async (req, res, next) => {
    try {
        const newJobs = await Jobs.create({ ...req.body, createdBy: req.user._id });
        res.redirect('/jobs'); 
    } catch (error) {
        handleErrors(error, req, res);
    }
};

// GET the form for adding a new jobs
const getNewJobs = async (req, res) => {
    console.log('getNewJobs called');
    try {
        res.render('job', { job: null });
    } catch (error) {
        handleErrors(error, req, res);
    }
};

// GET a specific jobs for editing
const editJobs = async (req, res, next) => {
    try {
        const jobs = await Jobs.findOne({ _id: req.params.id, createdBy: req.user._id });
        if (!jobs) {
            res.status(404);
            req.flash('error', 'Jobs not found');
            return;
        }
        res.render('job', { job: jobs });
    } catch (error) {
        handleErrors(error, req, res); 
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
        handleErrors(error, req, res); 
    }
};

module.exports = {
  getJobs,
  getNewJobs,
  addJobs,
  editJobs,
  updateJobs,
  deleteJobs
};