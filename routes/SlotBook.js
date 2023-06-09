const express = require('express');
const router = express.Router();
const SlotBooks = require('../models/SlotBook');
const ParkingLots = require('../models/ParkingLot');
const Users = require('../models/Users');
const fetchUser = require('../middleware/fetchUser');
const { body, validationResult } = require('express-validator');


// Route 1: Booking a slot using POST : Login required
router.post('/bookSlot', fetchUser, async (req, res) => {
  try {
    let user = await Users.findById(req.user.id)
    console.log("Booking a slot by user ", user.name, " with parking lot ", req.body)
    const pl = req.body; // destructuring from req.body
    const error = validationResult(req);
    if (!error.isEmpty()) {
      // console.log(error.array);
      return res.status(400).json({ errors: error.array });
    }
    var rand = function () {
      return Math.random().toString(10).substr(2); // remove `0.`
    };

    var token = function () {
      return rand() + rand() + rand() + "-" + rand() + rand() + rand(); // to make it longer
    };
    const SlotBook = new SlotBooks({
      provider: pl.user, renter: req.user.id,pl:pl._id, authToken: token()
    })
    const saveSlotBooks = await SlotBook.save();
    const parkingLot = await ParkingLots.findByIdAndUpdate(pl._id, { $set: {TotalSlots:pl.TotalSlots-1} }, { new: true })
    res.json(saveSlotBooks);

  } catch (error) {
    console.error(error.message);
    res.status(500).send("Internal Server Error");
  }
})


// Route 2: Freeing a slot using POST : Login required
router.post('/freeSlot', fetchUser, async (req, res) => {
  try {
    let user = await Users.findById(req.user.id)
    console.log("Freeing a slot by user ", user.name, " with parking lot ", req.body)
    const data = req.body; // destructuring from req.body
    const error = validationResult(req);
    if (!error.isEmpty()) {
      // console.log(error.array);
      return res.status(400).json({ errors: error.array });
    }
    const pl=await ParkingLots.findById(data.pl);
    const parkingLot = await ParkingLots.findByIdAndUpdate(data.pl, { $set: {TotalSlots:pl.TotalSlots+1} }, { new: true })
    const SlotBook = await SlotBooks.findByIdAndDelete(data._id);
    res.status(200).json({Remark:"Freed successfully"});

  } catch (error) {
    console.error(error.message);
    res.status(500).send("Internal Server Error");
  }
})

module.exports = router;