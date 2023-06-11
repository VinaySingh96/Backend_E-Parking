const mongoose = require('mongoose');

// connection string
const mongoURI = `mongodb+srv://vikashdubeyup121:8EnEWJmvCkNpsAJ1@collegeproject.zobq5zn.mongodb.net/?retryWrites=true&w=majority`;

const connectToMongoose = () => {
    mongoose.connect(mongoURI).then(() => {
            console.log('Connected to MongoDB Atlas');
            // Your code logic here
        })
        .catch((error) => {
            console.error('Error connecting to MongoDB Atlas:', error);
        });
}

module.exports = connectToMongoose;