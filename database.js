const mongoose = require('mongoose');

// connection string
const mongoURI = "mongodb://localhost:27017/db3?readPreference=primary&appname=MongoDB%20Compass&ssl=false";

const connectToMongoose = () => {
    mongoose.connect(mongoURI, () => {
        console.log("connected to mongoose successfully");
    })
}

module.exports = connectToMongoose;