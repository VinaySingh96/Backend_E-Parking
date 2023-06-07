const mongoose = require('mongoose')
const { Schema } = mongoose;

// creating a schema for notes
const ParkingLotSchema = new Schema({
    // acting as foreign key so that notes are linked with the user
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    // Parking Lots details
    Email: {
        type: String
    },
    Name: {
        type: String,
        required: true
    },
    WalletAddress: {
        type: String,
        required: true
    },
    Fee: {
        type: Number,
        required: true
    },
    TotalSlots: {
        type: Number,
        required: true
    },
    Lattitude: {
        type: Number,
        required: true
    },
    Longitude: {
        type: Number,
        required: true
    },
    IsApproved:{
        type: Boolean,
        default:false
    },
    Status: {
        type: String,
        enum : ['DELETE','UPDATE','NEW'],
        default: 'NEW'
    },
    date: {
        type: Date,
        default: Date.now
    }
})
const ParkingLot = mongoose.model('Parking Lot', ParkingLotSchema);

module.exports = ParkingLot;