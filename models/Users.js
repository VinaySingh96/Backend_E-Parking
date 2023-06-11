const mongoose = require('mongoose')
const { Schema } = mongoose;

// creating a schema for notes
const UserSchema = new Schema({
    name: {
        type: String,
        required: true,
        unique: true // so that there is only one user corressponding to one email
    },
    email: {
        type: String,
        required: true,
        unique: true // so that there is only one user corressponding to one email
    },
    password: {
        type: String,
        required: true
    },
    dateCreated: {
        type: Date,
        default: Date.now // to generate date auto while creating the user
    }
})

const User = mongoose.model('User', UserSchema);
// User.createIndexes();// for same email id does not create a user

module.exports = User;