const mongoose = require('mongoose');

const validateId = (req, res, next) => {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
        res.status(400);
        req.flash('error', 'Invalid ID');
        return;
    }
    next();
};

module.exports = validateId;