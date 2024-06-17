const csrf = require('csurf');

const inProduction = process.env.NODE_ENV === 'production';

const csurfOptions = {
    protected_operations: ["PATCH"],
    protected_content_types: ["application/json"],
    development_mode:  !inProduction,
    cookie: true,
};

const csrfProtection = csrf({
    cookie: true
});

module.exports = csrfProtection;