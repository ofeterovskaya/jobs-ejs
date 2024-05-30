const mongoose = require('mongoose');

// Define the schema for a job
const JobSchema = new mongoose.Schema({
    company: {
        type: String,
        required: [true, 'Please provide company name'],// Company name is required
        maxlength: 50,//should not exceed 50 characters
    },
    position: {
        type: String,
        required: [true, 'Please provide position'],
        maxlength: 100,
    },
    status: {
        type: String,
        enum: ['interview', 'declined', 'pending'],
        default: 'pending',
    },
    createdBy: {
        type: mongoose.Types.ObjectId,// CreatedBy should be a MongoDB ObjectId
        ref: 'User',// The ObjectId refers to a User document
        required: [true,'Please provide a user ']
    } 
},{timestamps:true}// Enable timestamps
);
// Create a model from the schema and export it
module.exports = mongoose.model('Job', JobSchema);