/* jshint esversion: 6 */
const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');

const userSchema = mongoose.Schema({
    //unique only allows mongodb to optimize, it does not validate
    email: { type: String, required: true },
    password: { type: String, required: true },
});

// THIS validates
userSchema.plugin(uniqueValidator);

// has to start w uppercase char
module.exports = mongoose.model('User', userSchema);